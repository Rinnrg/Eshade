import prisma from '../../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth].page';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      // 1. Get unique categories from products
      const products = await prisma.produk.findMany({
        select: {
          kategori: true,
        },
      });

      const categoryMap = new Map();
      products.forEach((product) => {
        const category = product.kategori;
        if (category && category.trim() !== '') {
          if (categoryMap.has(category)) {
            categoryMap.set(category, categoryMap.get(category) + 1);
          } else {
            categoryMap.set(category, 1);
          }
        }
      });

      // 2. Get categories from Category model
      const dbCategories = await prisma.category.findMany();
      const dbCategoriesMap = new Map();
      dbCategories.forEach(cat => {
        dbCategoriesMap.set(cat.name, cat);
      });

      // 3. Merge them
      const mergedCategories = new Map();
      
      // Add from products first
      categoryMap.forEach((count, name) => {
        mergedCategories.set(name, {
          id: dbCategoriesMap.has(name) ? dbCategoriesMap.get(name).id : null,
          name,
          thumbnail: dbCategoriesMap.has(name) ? dbCategoriesMap.get(name).thumbnail : null,
          productCount: count,
        });
      });

      // Add from DB if not in products
      dbCategories.forEach(cat => {
        if (!mergedCategories.has(cat.name)) {
          mergedCategories.set(cat.name, {
            id: cat.id,
            name: cat.name,
            thumbnail: cat.thumbnail,
            productCount: 0,
          });
        }
      });

      const categories = Array.from(mergedCategories.values());

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, thumbnail } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Upsert category
      const category = await prisma.category.upsert({
        where: { name },
        update: { thumbnail },
        create: { name, thumbnail },
      });

      return res.status(200).json({ success: true, data: category });
    } catch (error) {
      console.error('Error saving category:', error);
      return res.status(500).json({ error: 'Failed to save category' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
