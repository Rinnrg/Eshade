import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth].page';
import { executePrismaQuery } from '@src/lib/prisma';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user?.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const paketPromo = await executePrismaQuery(async (prisma) => {
        return await prisma.paketPromo.findUnique({
          where: { id },
        });
      });

      if (!paketPromo) {
        return res.status(404).json({ error: 'Paket Promo not found' });
      }

      return res.status(200).json({ success: true, paketPromo });
    } catch (error) {
      console.error('Error fetching paket promo:', error);
      return res.status(500).json({ error: 'Failed to fetch paket promo' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const {
        name,
        description,
        features,
        price,
        billingCycle,
        isActive,
      } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (features !== undefined) updateData.features = features;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (billingCycle !== undefined) updateData.billingCycle = billingCycle;
      if (isActive !== undefined) updateData.isActive = isActive;

      const paketPromo = await executePrismaQuery(async (prisma) => {
        return await prisma.paketPromo.update({
          where: { id },
          data: updateData,
        });
      });

      return res.status(200).json({
        success: true,
        message: 'Paket Promo updated successfully',
        paketPromo,
      });
    } catch (error) {
      console.error('Error updating paket promo:', error);
      return res.status(500).json({ error: 'Failed to update paket promo' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await executePrismaQuery(async (prisma) => {
        await prisma.paketPromo.delete({
          where: { id },
        });
      });

      return res.status(200).json({ success: true, message: 'Paket Promo deleted successfully' });
    } catch (error) {
      console.error('Error deleting paket promo:', error);
      return res.status(500).json({ error: 'Failed to delete paket promo' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
