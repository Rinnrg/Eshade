import prisma from '@src/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { page } = req.query;

    if (page) {
      const setting = await prisma.maintenanceSetting.findUnique({ where: { page } });
      if (!setting) return res.status(200).json({ active: false });

      return res.status(200).json({ active: !!setting.active, message: setting.message || 'halaman ini sedang dalam perbaikan', page: setting.page });
    }

    // Return all active settings
    const active = await prisma.maintenanceSetting.findMany({ where: { active: true } });
    return res.status(200).json({ success: true, settings: active });
  } catch (error) {
    console.error('[Public Maintenance API] Error:', error);
    return res.status(500).json({ error: 'Gagal mengambil data maintenance' });
  }
}
