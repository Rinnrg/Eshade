let activeUsers = new Map();

export default function handler(req, res) {
  const now = Date.now();

  if (req.method === 'POST') {
    const { sessionId } = req.body;
    if (sessionId) {
      activeUsers.set(sessionId, now);
    }
  }

  // Cleanup old sessions (older than 30 seconds of inactivity)
  // We use a shorter window for a more "live" feel
  for (const [id, lastSeen] of activeUsers.entries()) {
    if (now - lastSeen > 45000) {
      activeUsers.delete(id);
    }
  }

  res.status(200).json({ count: activeUsers.size || 1 }); // Fallback to 1 (the current user)
}
