/* eslint-disable react/jsx-props-no-spreading */
import Home from '@src/pages/components/home/Index';
import AboutPreview from '@src/pages/components/aboutPreview/Index';
import HomeSections from '@src/pages/components/homeSections/Index';
import Quote from '@src/pages/components/quote/Index';
import Produk from '@src/pages/components/produk/Index';
import CustomHead from '@src/components/dom/CustomHead';
import { executePrismaQuery } from '@src/lib/prisma';
import Maintenance from '@src/components/dom/Maintenance';

const seo = {
  title: 'eshade',
  description: 'Eshade adalah toko clothing online yang menyediakan berbagai produk fashion berkualitas tinggi. Temukan koleksi pakaian terbaru dengan desain menarik dan harga terjangkau.',
  keywords: [
    'Eshade',
    'Clothing Store',
    'Fashion',
    'Online Shop',
    'Toko Baju Online',
    'Pakaian',
    'Fashion Indonesia',
    'Streetwear',
    'T-Shirt',
    'Hoodie',
    'Jacket',
    'Pakaian Pria',
    'Pakaian Wanita',
    'Fashion Modern',
    'Baju Keren',
    'Toko Fashion',
    'E-commerce',
    'Belanja Online',
  ],
};

function Page({ produk, homeSections, maintenance }) {
  if (maintenance && maintenance.active) {
    return <Maintenance message={maintenance.message} />;
  }

  return (
    <>
      <CustomHead {...seo} />
      <Home />
      <AboutPreview />
      <Quote />
      <HomeSections sections={homeSections} />
      <Produk produk={produk} />
    </>
  );
}

export async function getServerSideProps({ res }) {
  // Set cache control headers to prevent stale data
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  );

  try {
    // Check maintenance for home page first
    const homeMaintenance = await executePrismaQuery((prisma) => prisma.maintenanceSetting.findUnique({ where: { page: 'home' } }));

    if (homeMaintenance && homeMaintenance.active) {
      return {
        props: {
          produk: [],
          homeSections: [],
          maintenance: { active: true, message: homeMaintenance.message || 'halaman ini sedang dalam perbaikan' },
        },
      };
    }

    // Fetch data using the helper to manage connections better
    const [produk, homeSections] = await Promise.all([
      // Fetch latest products for "Koleksi Terbaru" section
      executePrismaQuery((prisma) => prisma.produk.findMany({
        select: {
          id: true,
          nama: true,
          kategori: true,
          harga: true,
          diskon: true,
          stok: true,
          gambar: true,
          produkUnggulan: true,
          urutanTampilan: true,
          jumlahTerjual: true,
          tanggalDibuat: true,
          tanggalDiubah: true,
        },
        orderBy: { tanggalDibuat: 'desc' },
        take: 8, // Get 8 latest products, component will show 4
      })),
      // Fetch home sections
      executePrismaQuery((prisma) => prisma.homeSection.findMany({
        orderBy: {
          order: 'asc',
        },
      })),
    ]);

    // Serialize dates for products
    const serializedProduk = produk.map((item) => ({
      ...item,
      tanggalDibuat: item.tanggalDibuat.toISOString(),
      tanggalDiubah: item.tanggalDiubah.toISOString(),
    }));

    // Serialize dates for home sections and map to legacy keys
    const serializedHomeSections = homeSections.map((item) => ({
      ...item,
      judul: item.title,
      gambar: item.images || [],
      urutan: item.order,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
    }));

    return {
      props: {
        produk: serializedProduk,
        homeSections: serializedHomeSections,
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching data:', error);
    return {
      props: {
        produk: [],
        homeSections: [],
      },
    };
  }
}

export default Page;
