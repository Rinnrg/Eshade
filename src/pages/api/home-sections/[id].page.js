import prisma from '@src/lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const section = await prisma.homeSection.findUnique({
        where: { id },
      });

      if (!section) {
        return res.status(404).json({ error: 'Home section not found' });
      }

      const mapped = {
        ...section,
        judul: section.title,
        gambar: section.images,
        urutan: section.order,
        createdAt: section.createdAt ? section.createdAt.toISOString() : null,
        updatedAt: section.updatedAt ? section.updatedAt.toISOString() : null,
      };

      return res.status(200).json(mapped);
    } catch (error) {
      console.error('Error fetching home section:', error);
      return res.status(500).json({ error: 'Failed to fetch home section' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { judul, gambar, urutan, title, images, order } = req.body;

      const finalTitle = judul || title;
      const finalImages = gambar || images || [];
      const finalOrder = urutan ?? order ?? 0;

      if (!finalTitle || !finalImages || !Array.isArray(finalImages)) {
        return res.status(400).json({ error: 'Judul dan gambar harus diisi' });
      }

      const section = await prisma.homeSection.update({
        where: { id },
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

      return res.status(200).json(mapped);
    } catch (error) {
      console.error('Error updating home section:', error);
      return res.status(500).json({ error: 'Failed to update home section' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.homeSection.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Home section deleted successfully' });
    } catch (error) {
      console.error('Error deleting home section:', error);
      return res.status(500).json({ error: 'Failed to delete home section' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
