import { getServerSession } from 'next-auth/next';
import prisma from '../../../lib/prisma';
import { userAuthOptions } from '../auth/user/[...nextauth].page';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, userAuthOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = parseInt(session.user.id, 10);

  // GET - Get user's profile information
  if (req.method === 'GET') {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          phone: true,
          image: true,
          provider: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ user });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Profile GET] Error:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  // PUT - Update user's profile information
  if (req.method === 'PUT') {
    try {
      const { name, phone, username } = req.body;

      // Validate username if provided
      if (typeof username !== 'undefined' && username !== null) {
        const usernameTrim = String(username).trim().toLowerCase();
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (usernameTrim && !usernameRegex.test(usernameTrim)) {
          return res.status(400).json({ message: 'Username harus 3-20 karakter dan hanya boleh berisi huruf, angka, dan underscore' });
        }

        // Check if another user already uses this username
        if (usernameTrim) {
          const existing = await prisma.users.findUnique({ where: { username: usernameTrim } });
          if (existing && existing.id !== userId) {
            return res.status(400).json({ message: 'Username sudah digunakan' });
          }
        }
      }

      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
          name,
          username: typeof username !== 'undefined' ? (username ? String(username).trim().toLowerCase() : null) : undefined,
          phone,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          phone: true,
          image: true,
        },
      });

      return res.status(200).json({ user: updatedUser, message: 'Profil berhasil diperbarui' });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Profile PUT] Error:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
