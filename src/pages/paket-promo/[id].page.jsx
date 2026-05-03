/* eslint-disable react/jsx-props-no-spreading */
import { useMemo, useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';
import CustomHead from '@src/components/dom/CustomHead';
import Breadcrumb from '@src/components/dom/Breadcrumb';
import styles from '@src/pages/produk/produkDetail.module.scss';
import prisma from '@src/lib/db';
import { Check } from 'lucide-react';

function PaketPromoDetailPage({ paketPromo, error }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [cart, setCart, showAlert] = useStore(
    useShallow((state) => [state.cart, state.setCart, state.showAlert]),
  );

  const [expandedSections, setExpandedSections] = useState({
    description: true,
    features: true,
  });

  // Native scroll handler
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isMobile || isTouch) {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.documentElement.style.overflow = 'auto';
    }

    return () => {
      if (isMobile || isTouch) {
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.documentElement.style.overflow = '';
      }
    };
  }, []);

  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const handleBuyNow = useCallback(async () => {
    if (!session?.user) {
      showAlert({
        type: 'warning',
        title: 'Login Diperlukan',
        message: 'Anda harus login terlebih dahulu untuk membeli paket.',
        confirmText: 'Login Sekarang',
        showCancel: true,
        onConfirm: () => {
          router.push('/login');
        },
      });
      return;
    }

    // Adapt structure to mimic product checkout
    const checkoutItem = {
      produkId: paketPromo.id, // Using paket ID
      isPaketPromo: true,      // Flag to distinguish from regular products
      quantity: 1,
      ukuran: null,
      warna: null,
      produk: {
        id: paketPromo.id,
        nama: paketPromo.name,
        harga: paketPromo.price,
        diskon: 0,
        gambar: ['/logo/logo 1 black.svg'], // Placeholder image
      },
    };

    localStorage.setItem('checkoutItems', JSON.stringify([checkoutItem]));
    router.push('/pembayaran');
  }, [session, paketPromo, router, showAlert]);

  const seo = useMemo(
    () => ({
      title: `${paketPromo?.name || 'Paket Promo'} - Eshade`,
      description: paketPromo?.description || `Beli ${paketPromo?.name} di Eshade`,
      keywords: [paketPromo?.name, 'Paket Gym', 'Eshade', 'Membership'],
      image: '/logo/logo 1 black.svg',
    }),
    [paketPromo]
  );

  if (error || !paketPromo) {
    return (
      <>
        <CustomHead {...seo} />
        <div className={styles.root}>
          <div className={styles.container}>
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <h1>Paket tidak ditemukan</h1>
              <p>{error || 'Paket yang Anda cari tidak tersedia.'}</p>
              <button 
                type="button" 
                onClick={() => router.push('/paket-promo')}
                style={{ 
                  marginTop: '1rem', 
                  padding: '0.75rem 2rem',
                  backgroundColor: '#e31e24',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                Kembali ke Paket Promo
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CustomHead {...seo} />
      <div className={styles.root}>
        <div className={styles.container}>
          {/* Breadcrumb */}
          <Breadcrumb items={[
            { label: 'Paket Promo', href: '/paket-promo' },
            { label: paketPromo.name, href: null }
          ]} />

          {/* Main Layout */}
          <div className={styles.productLayout} style={{ marginTop: '2rem' }}>
            
            {/* Left Column: Info card mimicking image */}
            <div className={styles.imageGallery} style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
               <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '1rem',
                  padding: '3rem 2rem',
                  width: '100%',
                  maxWidth: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '2px solid #e31e24',
                  boxShadow: '0 20px 25px -5px rgba(227, 30, 36, 0.1)',
                  textAlign: 'center'
                }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                    {paketPromo.name}
                  </h2>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e31e24' }}>$</span>
                    <span style={{ fontSize: '4rem', fontWeight: '900', color: '#e31e24', lineHeight: '1' }}>
                      {paketPromo.price}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '1.25rem', fontWeight: '500' }}>
                      {paketPromo.billingCycle}
                    </span>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '1rem' }}>
                    {paketPromo.description}
                  </p>
               </div>
            </div>

            {/* Right Column: Product Info */}
            <div className={styles.productInfo}>
              <div className={styles.productHeader}>
                <h1 className={styles.productName}>{paketPromo.name}</h1>
              </div>

              <div className={styles.priceSection}>
                <div className={styles.priceContainer}>
                  <span className={styles.currentPrice}>
                    Rp {paketPromo.price.toLocaleString('id-ID')} {paketPromo.billingCycle}
                  </span>
                </div>
              </div>

              {/* Quantity & Buy Button Row */}
              <div className={styles.quantityBuyRow} style={{ marginTop: '2rem' }}>
                <button
                  type="button"
                  className={styles.buyNowButton}
                  onClick={handleBuyNow}
                  style={{ width: '100%', maxWidth: '300px' }}
                >
                  Beli Sekarang
                </button>
              </div>

              {/* Details Sections */}
              <div className={styles.productDetails} style={{ marginTop: '3rem' }}>
                {/* Description */}
                <div className={styles.detailSection}>
                  <div 
                    className={styles.detailHeader} 
                    onClick={() => toggleSection('description')}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                  >
                    <h3>Deskripsi Paket</h3>
                    <span>{expandedSections.description ? '▼' : '▶'}</span>
                  </div>
                  {expandedSections.description && (
                    <div className={styles.detailContent} style={{ display: 'block', padding: '1rem 0' }}>
                      <p>{paketPromo.description || 'Tidak ada deskripsi tersedia.'}</p>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className={styles.detailSection}>
                  <div 
                    className={styles.detailHeader} 
                    onClick={() => toggleSection('features')}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                  >
                    <h3>Fitur & Fasilitas</h3>
                    <span>{expandedSections.features ? '▼' : '▶'}</span>
                  </div>
                  {expandedSections.features && (
                    <div className={styles.detailContent} style={{ display: 'block', padding: '1rem 0' }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {paketPromo.features && paketPromo.features.map((feature, idx) => (
                          <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Check style={{ color: '#e31e24', width: '1rem', height: '1rem' }} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const paketPromo = await prisma.paketPromo.findUnique({
      where: { id },
    });

    if (!paketPromo || !paketPromo.isActive) {
      return {
        props: {
          paketPromo: null,
          error: 'Paket Promo tidak ditemukan',
        },
      };
    }

    const serializedPaket = {
      ...paketPromo,
      createdAt: paketPromo.createdAt.toISOString(),
      updatedAt: paketPromo.updatedAt.toISOString(),
    };

    return {
      props: {
        paketPromo: serializedPaket,
        error: null,
      },
    };
  } catch (error) {
    console.error('[Paket Promo Detail] Error:', error);
    return {
      props: {
        paketPromo: null,
        error: 'Terjadi kesalahan saat memuat paket',
      },
    };
  }
}

export default PaketPromoDetailPage;
