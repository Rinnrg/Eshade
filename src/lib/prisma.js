import { PrismaClient } from '@prisma/client';
import { URL } from 'url';

/**
 * PrismaClient is attached to the `global` object in development to prevent
 * exhausting your database connection limit.
 * Learn more: https://pris.ly/d/help/next-js-best-practices
 */

const globalForPrisma = global;

// Helper to get a list of candidate DB URLs (dedupe and prefer explicit env vars)
function getCandidateDbUrls() {
  const urls = [
    process.env.SESSION_DATABASE_URL,
    process.env.TRANSACTION_DATABASE_URL,
    process.env.DIRECT_DATABASE_URL,
    process.env.DATABASE_URL,
    process.env.DIRECT_URL,
  ].filter(Boolean);

  // Deduplicate while preserving order
  const seen = new Set();
  return urls.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
}

// Configure base Prisma Client options (logging, etc.)
const prismaClientOptionsBase = {
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
};

// Create or reuse a PrismaClient for a specific URL (store in global to avoid multiple clients)
function getOrCreateClientForUrl(dbUrl) {
  if (!dbUrl) return null;
  if (!globalForPrisma._prismaClients) globalForPrisma._prismaClients = {};
  if (globalForPrisma._prismaClients[dbUrl]) return globalForPrisma._prismaClients[dbUrl];

  const options = {
    ...prismaClientOptionsBase,
    datasources: { db: { url: dbUrl } },
  };

  const client = new PrismaClient(options);
  // graceful disconnect handling
  if (typeof window === 'undefined') {
    const cleanup = async () => {
      try {
        await client.$disconnect();
      } catch (err) {
        // ignore
      }
    };
    process.on('beforeExit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('SIGUSR2', cleanup);
  }

  globalForPrisma._prismaClients[dbUrl] = client;
  return client;
}

// Pick a list of clients based on env candidates (first is preferred)
const candidateUrls = getCandidateDbUrls();
const prismaClients = candidateUrls.map((u) => ({ url: u, client: getOrCreateClientForUrl(u) }));

// Track active URL for debugging
if (!globalForPrisma.activeDbUrl) globalForPrisma.activeDbUrl = candidateUrls[0] || process.env.DATABASE_URL || null;

// Lightweight concurrency limiter (same as before)
const PRISMA_MAX_CONCURRENT = Math.max(0, parseInt(process.env.PRISMA_MAX_CONCURRENT || '5', 10));
const PRISMA_MAX_PENDING = Math.max(0, parseInt(process.env.PRISMA_MAX_PENDING || '500', 10));
let _activeCount = 0;
const _queue = [];
function acquire() {
  if (PRISMA_MAX_CONCURRENT <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    const tryAcquire = () => {
      if (_activeCount < PRISMA_MAX_CONCURRENT) {
        _activeCount += 1;
        resolve();
      } else {
        _queue.push(tryAcquire);
      }
    };
    tryAcquire();
  });
}
function release() {
  if (PRISMA_MAX_CONCURRENT <= 0) return;
  _activeCount = Math.max(0, _activeCount - 1);
  if (_queue.length) {
    const next = _queue.shift();
    process.nextTick(next);
  }
}
function getPrismaQueueStats() {
  return { active: _activeCount, pending: _queue.length, maxConcurrent: PRISMA_MAX_CONCURRENT };
}

// Detect Neon hint (unchanged)
if (typeof process !== 'undefined' && process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  if (url.includes('neon') || url.includes('neondb') || url.includes('neontech')) {
    console.warn('Detected Neon DB in DATABASE_URL. Neon uses session pooling; consider using Prisma Data Platform (Data Proxy) or configure connection limits to avoid MaxClientsInSessionMode errors.');
  }
}

function isConnectionError(error) {
  const msg = (error && error.message) || '';
  const checks = [
    "Can't reach database server",
    'connect ECONNREFUSED',
    'getaddrinfo ENOTFOUND',
    'connect ETIMEDOUT',
    'Timeout',
    'Connection terminated',
    'closed the connection unexpectedly',
  ];
  return checks.some((c) => msg.includes(c));
}

/**
 * Try executing queryFn against candidate Prisma clients in order.
 * If one fails due to connectivity, try the next one.
 */
export async function executePrismaQuery(queryFn) {
  const MAX_ATTEMPTS = Math.max(1, parseInt(process.env.PRISMA_QUERY_RETRIES || '3', 10));
  let lastError = null;

  // Iterate attempts - each attempt will try clients in order
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    for (let i = 0; i < prismaClients.length; i += 1) {
      const { url, client } = prismaClients[i];
      if (!client) continue;

      try {
        await acquire();
        try {
          const result = await queryFn(client);
          // Mark this url as the active one
          globalForPrisma.activeDbUrl = url;
          release();
          return result;
        } finally {
          release();
        }
      } catch (error) {
        lastError = error;
        console.warn(`[Prisma] attempt ${attempt} using ${url} failed:`, error.message || error);
        // If connection error, try next client. For other errors, throw immediately
        if (isConnectionError(error) || error?.message?.includes('max clients') || error?.message?.includes('MaxClientsInSessionMode')) {
          // try the next client after short backoff
          const backoff = Math.min(1000, 100 * (2 ** (attempt - 1)));
          await new Promise((r) => { setTimeout(r, backoff); });
          continue;
        }
        // Non-connection error - not retryable here
        throw error;
      }
    }
    // If we reach here, none of the clients succeeded in this attempt; wait a bit before next attempt
    const attemptBackoff = Math.min(1000, 100 * (2 ** (attempt - 1)));
    await new Promise((r) => { setTimeout(r, attemptBackoff); });
  }

  // If we exit attempts loop, throw last error
  throw lastError;
}

/**
 * Middleware wrapper for API routes to ensure proper connection handling
 */
export function withPrisma(handler) {
  return async (req, res) => {
    if (_queue.length >= PRISMA_MAX_PENDING) {
      console.error('Prisma queue overloaded, returning 503');
      return res.status(503).json({ error: 'Server busy. Please try again.' });
    }

    try {
      // Pass a client bound to active URL (if available)
      const activeUrl = globalForPrisma.activeDbUrl || (prismaClients[0] && prismaClients[0].url) || process.env.DATABASE_URL;
      const activeClient = prismaClients.find((p) => p.url === activeUrl)?.client || (prismaClients[0] && prismaClients[0].client);
      return await handler(req, res, activeClient);
    } catch (error) {
      if (error.message?.includes('max clients') || error.message?.includes('MaxClientsInSessionMode')) {
        console.error('Database connection pool exhausted');
        return res.status(503).json({ error: 'Database temporarily unavailable. Please try again.' });
      }
      throw error;
    }
  };
}

// Register a lightweight middleware for each client to ensure concurrency limiting
try {
  prismaClients.forEach(({ client }) => {
    if (client && typeof client.$use === 'function') {
      client.$use(async (params, next) => {
        await acquire();
        try {
          return await next(params);
        } finally {
          release();
        }
      });
    }
  });
} catch (e) {
  // ignore
}

export { getPrismaQueueStats };

export function getActiveDbUrl() {
  return globalForPrisma.activeDbUrl || null;
}

// For convenience, export the default client (first candidate) as 'prisma' for existing imports
const defaultClient = prismaClients[0] ? prismaClients[0].client : null;
export { defaultClient as prisma };
export default defaultClient;
