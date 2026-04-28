import prisma from '@src/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth].page';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Public GET - return active maintenance entries
  if (req.method === 'GET' && !req.query.admin) {
    try {
      const active = await prisma.maintenanceSetting.findMany({ where: { active: true } });
      return res.status(200).json({ success: true, settings: active });
    } catch (error) {
      console.error('[Maintenance GET public] Error:', error);
      return res.status(500).json({ error: 'Gagal mengambil data maintenance' });
    }
  }

  // Protected admin routes
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const settings = await prisma.maintenanceSetting.findMany({ orderBy: { page: 'asc' } });
      return res.status(200).json({ success: true, settings });
    } catch (error) {
      console.error('[Maintenance GET admin] Error:', error);
      return res.status(500).json({ error: 'Gagal mengambil data maintenance' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { page, active, message, title } = req.body;
      if (!page) return res.status(400).json({ error: 'Field "page" diperlukan' });

      const existing = await prisma.maintenanceSetting.findUnique({ where: { page } });

      if (existing) {
        const updated = await prisma.maintenanceSetting.update({
          where: { page },
          data: {
            active: !!active,
            message: typeof message !== 'undefined' ? message : existing.message,
            title: typeof title !== 'undefined' ? title : existing.title,
          },
        });
        return res.status(200).json({ success: true, setting: updated });
      }

      const created = await prisma.maintenanceSetting.create({
        data: {
          page,
          active: !!active,
          message: message || 'halaman ini sedang dalam perbaikan',
          title: title || null,
        },
      });

      return res.status(201).json({ success: true, setting: created });
    } catch (error) {
      console.error('[Maintenance POST] Error:', error);
      return res.status(500).json({ error: 'Gagal memperbarui data maintenance' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { page } = req.query;
      if (!page) return res.status(400).json({ error: 'Query "page" diperlukan' });
      const existing = await prisma.maintenanceSetting.findUnique({ where: { page } });
      if (!existing) return res.status(404).json({ error: 'Setting tidak ditemukan' });

      await prisma.maintenanceSetting.delete({ where: { page } });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('[Maintenance DELETE] Error:', error);
      return res.status(500).json({ error: 'Gagal menghapus setting maintenance' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
