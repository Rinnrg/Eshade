/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */

import CustomHead from '@src/components/dom/CustomHead';
import ProdukGrid from '@src/pages/produk/components/produkGrid/ProdukGrid';
import prisma from '@src/lib/db';
import Maintenance from '@src/components/dom/Maintenance';

const seo = {
  title: 'Eshade - Produk',
  description: 'Jelajahi koleksi produk clothing Eshade. Temukan berbagai pilihan pakaian berkualitas dengan desain menarik dan harga terjangkau.',
  keywords: [
    'Eshade Produk',
    'Clothing Store',
    'Fashion Store',
    'Pakaian Pria',
    'Pakaian Wanita',
    'T-Shirt',
    'Hoodie',
    'Jacket',
    'Streetwear',
    'Fashion Indonesia',
    'Online Clothing Store',
    'Toko Baju Online',
  ],
};

function Page({ produk = [], kategori = null, error = null, maintenance }) {
  if (maintenance && maintenance.active) return <Maintenance message={maintenance.message} />;

  const title = kategori ? `Eshade - ${kategori}` : 'Eshade - Produk';
  const description = kategori
    ? `Jelajahi koleksi ${kategori} Eshade. Temukan berbagai pilihan ${kategori} berkualitas dengan desain menarik dan harga terjangkau.`
    : 'Jelajahi koleksi produk clothing Eshade. Temukan berbagai pilihan pakaian berkualitas dengan desain menarik dan harga terjangkau.';

  return (
    <>
      <CustomHead {...seo} title={title} description={description} />
      <ProdukGrid produk={produk} kategori={kategori} error={error} />
    </>
  );
}

export async function getServerSideProps(context) {
  const { kategori } = context.query;

  try {
    // Check maintenance for produk listing
    const produkMaintenance = await prisma.maintenanceSetting.findUnique({ where: { page: 'produk' } });

    if (produkMaintenance && produkMaintenance.active) {
      return {
        props: {
          produk: [],
          kategori: kategori || null,
          maintenance: { active: true, message: produkMaintenance.message || 'halaman ini sedang dalam perbaikan' },
        },
      };
    }

    const whereClause = { ...(kategori ? { kategori } : {}) };

    console.log('[Produk Page] Fetching products with whereClause:', whereClause);
    console.log('[Produk Page] Database URL exists:', !!process.env.DATABASE_URL);

    const produk = await prisma.produk.findMany({
      where: whereClause,
      select: {
        id: true,
        nama: true,
        kategori: true,
        harga: true,
        diskon: true,
        stok: true,
        gambar: true,
        ukuran: true,
        warna: true,
        deskripsi: true,
        video: true,
        produkUnggulan: true,
        urutanTampilan: true,
        tanggalDibuat: true,
        tanggalDiubah: true,
      },
      orderBy: [{ produkUnggulan: 'desc' }, { urutanTampilan: 'asc' }, { tanggalDibuat: 'desc' }],
    });

    console.log(`[Produk Page] Found ${produk.length} products`);

    const serializedProduk = produk.map((item) => ({
      ...item,
      tanggalDibuat: item.tanggalDibuat.toISOString(),
      tanggalDiubah: item.tanggalDiubah.toISOString(),
    }));

    return {
      props: {
        produk: serializedProduk,
        kategori: kategori || null,
      },
    };
  } catch (error) {
    console.error('[Produk Page] Error fetching produk:', error);
    console.error('[Produk Page] Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return {
      props: {
        produk: [],
        kategori: kategori || null,
        error: error.message || 'Failed to fetch products',
      },
    };
  }
}

export default Page;
