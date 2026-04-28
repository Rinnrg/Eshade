import { getServerSession } from 'next-auth/next';
import prisma from '../../../lib/prisma';
import { userAuthOptions } from '../auth/user/[...nextauth].page';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, userAuthOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = parseInt(session.user.id, 10);

  if (req.method === 'GET') {
    try {
      const addresses = await prisma.addresses.findMany({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' },
          { updatedAt: 'desc' },
        ],
      });

      return res.status(200).json({ addresses });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Addresses GET] Error:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  if (req.method === 'POST') {
    try {
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

      // Basic validation
      if (!recipientName || !phone || !addressLine1 || !city || !province || !postalCode) {
        return res.status(400).json({ message: 'Field yang diperlukan: recipientName, phone, addressLine1, city, province, postalCode' });
      }

      // If set as default, unset other defaults
      if (isDefault) {
        await prisma.addresses.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
      }

      const created = await prisma.addresses.create({
        data: {
          userId,
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
          isDefault: !!isDefault,
        },
      });

      return res.status(201).json({ address: created });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Addresses POST] Error:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
