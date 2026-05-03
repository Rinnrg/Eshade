import CustomHead from '@src/components/dom/CustomHead';
import Link from 'next/link';
import { useRouter } from 'next/router';
import prisma from '@src/lib/db';
import { Check } from 'lucide-react';

const seo = {
  title: 'Eshade - Paket Promo',
  description: 'Pilih paket keanggotaan gym Eshade yang sesuai dengan kebutuhan Anda. Tersedia paket harian, bulanan, dan tahunan dengan fasilitas lengkap.',
  keywords: ['Paket Gym', 'Membership Eshade', 'Harga Gym', 'Gym Harian', 'Gym Bulanan'],
};

export default function PaketPromoIndexPage({ packages = [] }) {
  const router = useRouter();

  // If we want to highlight the middle card or specific card
  // For now, let's highlight the one with billingCycle === '/month' as per screenshot
  const getHighlightClass = (pkg) => {
    return pkg.billingCycle === '/month';
  };

  return (
    <>
      <CustomHead {...seo} />
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '6rem 1rem 4rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem',
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '1rem',
          }}>
            Pilih Paket Anda
          </h1>
          <p style={{ color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
            Temukan paket yang paling cocok untuk perjalanan fitness Anda bersama Eshade.
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '2rem',
          maxWidth: '1200px',
          width: '100%',
        }}>
          {packages.length > 0 ? packages.map((pkg) => {
            const isHighlighted = getHighlightClass(pkg);
            
            return (
              <div
                key={pkg.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '1rem',
                  padding: '2.5rem 2rem',
                  width: '100%',
                  maxWidth: '350px',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isHighlighted ? '2px solid #e31e24' : '1px solid #e5e7eb',
                  boxShadow: isHighlighted ? '0 20px 25px -5px rgba(227, 30, 36, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}
              >
                {/* Title & Desc */}
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '0.75rem',
                  }}>
                    {pkg.name}
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.5' }}>
                    {pkg.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.'}
                  </p>
                </div>

                <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '1.5rem 0' }} />

                {/* Features */}
                <div style={{ flex: 1, marginBottom: '2.5rem' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pkg.features && pkg.features.map((feature, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{
                          backgroundColor: '#fee2e2',
                          borderRadius: '50%',
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Check style={{ width: '0.75rem', height: '0.75rem', color: '#e31e24' }} strokeWidth={3} />
                        </div>
                        <span style={{ color: '#374151', fontSize: '0.875rem', fontWeight: '500' }}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>$</span>
                    <span style={{ fontSize: '3rem', fontWeight: '900', color: '#111827', lineHeight: '1' }}>
                      {pkg.price}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '1rem', fontWeight: '500' }}>
                      {pkg.billingCycle}
                    </span>
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    Bill will be charged {pkg.billingCycle === '/day' ? 'daily' : pkg.billingCycle === '/month' ? 'monthly' : 'yearly'}, taxes incl.
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => router.push(`/paket-promo/${pkg.id}`)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: isHighlighted ? '#e31e24' : 'transparent',
                    color: isHighlighted ? '#ffffff' : '#e31e24',
                    border: isHighlighted ? 'none' : '1px solid #e31e24',
                  }}
                  onMouseEnter={(e) => {
                    if (!isHighlighted) {
                      e.currentTarget.style.backgroundColor = '#fff0f0';
                    } else {
                      e.currentTarget.style.backgroundColor = '#b91c1c';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isHighlighted) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    } else {
                      e.currentTarget.style.backgroundColor = '#e31e24';
                    }
                  }}
                >
                  GET STARTED
                </button>
              </div>
            );
          }) : (
            <div style={{ color: '#6b7280', textAlign: 'center', width: '100%' }}>
              Belum ada paket promo yang aktif saat ini.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const packages = await prisma.paketPromo.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        price: 'asc', // Order by price ascending to match daily -> monthly -> yearly
      },
    });

    const serializedPackages = packages.map((pkg) => ({
      ...pkg,
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
    }));

    return {
      props: {
        packages: serializedPackages,
      },
    };
  } catch (error) {
    console.error('[Paket Promo Page] Error fetching packages:', error);
    return {
      props: {
        packages: [],
      },
    };
  }
}
