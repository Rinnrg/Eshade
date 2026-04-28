import { getServerSession } from 'next-auth/next';
import prisma from '../../../../lib/prisma';
import { userAuthOptions } from '../../auth/user/[...nextauth].page';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, userAuthOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = parseInt(session.user.id, 10);
  const { id } = req.query;
  const addressId = parseInt(id, 10);

  if (Number.isNaN(addressId)) {
    return res.status(400).json({ message: 'Invalid address id' });
  }

  if (req.method === 'GET') {
    try {
      const address = await prisma.addresses.findUnique({ where: { id: addressId } });
      if (!address || address.userId !== userId) {
        return res.status(404).json({ message: 'Address not found' });
      }

      return res.status(200).json({ address });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Address GET] Error:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const existing = await prisma.addresses.findUnique({ where: { id: addressId } });
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: 'Address not found' });
      }

      const {
        label,
        recipientName,
        phone,
        addressLine1,
        addressLine2,
        city,
        province,
        district,
        postalCode,
        latitude,
        longitude,
        isDefault,
      } = req.body;

      if (isDefault) {
        await prisma.addresses.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
      }

      const updated = await prisma.addresses.update({
        where: { id: addressId },
        data: {
          label,
          recipientName,
          phone,
          addressLine1,
          addressLine2,
          city,
          province,
          district,
          postalCode,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          isDefault: typeof isDefault === 'boolean' ? isDefault : existing.isDefault,
          updatedAt: new Date(),
        },
      });

      return res.status(200).json({ address: updated });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Address PUT] Error:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const existing = await prisma.addresses.findUnique({ where: { id: addressId } });
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: 'Address not found' });
      }

      await prisma.addresses.delete({ where: { id: addressId } });

      return res.status(200).json({ message: 'Address deleted' });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Address DELETE] Error:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
