import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth].page';
import { executePrismaQuery } from '@src/lib/prisma';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Check authentication
  if (!session || session.user?.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const paketPromos = await executePrismaQuery(async (prisma) => {
        return await prisma.paketPromo.findMany({
          orderBy: {
            createdAt: 'desc',
          },
        });
      });

      return res.status(200).json({ 
        success: true,
        paketPromos,
        total: paketPromos.length,
      });
    } catch (error) {
      console.error('Error fetching paket promo:', error);
      return res.status(500).json({ error: 'Failed to fetch paket promo' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        name,
        description,
        features = [],
        price,
        billingCycle,
        isActive = true,
      } = req.body;

      if (!name || price === undefined || !billingCycle) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const paketPromo = await executePrismaQuery(async (prisma) => {
        return await prisma.paketPromo.create({
          data: {
            name,
            description: description || '',
            features,
            price: parseFloat(price),
            billingCycle,
            isActive,
          },
        });
      });

      return res.status(201).json({ 
        success: true,
        message: 'Paket Promo created successfully',
        paketPromo,
      });
    } catch (error) {
      console.error('Error creating paket promo:', error);
      return res.status(500).json({ error: 'Failed to create paket promo' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
