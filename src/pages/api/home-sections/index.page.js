import prisma from '@src/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const sections = await prisma.homeSection.findMany({
        orderBy: {
          order: 'asc',
        },
      });

      const mapped = sections.map((s) => ({
        ...s,
        judul: s.title,
        gambar: s.images,
        urutan: s.order,
        createdAt: s.createdAt ? s.createdAt.toISOString() : null,
        updatedAt: s.updatedAt ? s.updatedAt.toISOString() : null,
      }));

      return res.status(200).json({ success: true, sections: mapped });
    } catch (error) {
      console.error('Error fetching home sections:', error);
      return res.status(500).json({ error: 'Failed to fetch home sections' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { judul, gambar, urutan, title, images, order } = req.body;

      const finalTitle = judul || title;
      const finalImages = gambar || images || [];
      const finalOrder = urutan ?? order ?? 0;

      if (!finalTitle || !finalImages || !Array.isArray(finalImages) || finalImages.length === 0) {
        return res.status(400).json({ error: 'Judul dan gambar harus diisi' });
      }

      const section = await prisma.homeSection.create({
        data: {
          title: finalTitle,
          images: finalImages,
          order: finalOrder,
        },
      });

      const mapped = {
        ...section,
        judul: section.title,
        gambar: section.images,
        urutan: section.order,
        createdAt: section.createdAt ? section.createdAt.toISOString() : null,
        updatedAt: section.updatedAt ? section.updatedAt.toISOString() : null,
      };

      return res.status(201).json(mapped);
    } catch (error) {
      console.error('Error creating home section:', error);
      return res.status(500).json({ error: 'Failed to create home section' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
