import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { AdminLayout } from '@src/components/admin/layout/admin-layout';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';

export default function PaketPromoPage() {
  const router = useRouter();
  const { status } = useSession();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlert] = useStore(useShallow((state) => [state.showAlert]));

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchPackages();
    }
  }, [status, router]);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/paket-promo');
      const data = await response.json();
      setPackages(data.paketPromos || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    showAlert({
      type: 'confirm',
      title: 'Hapus Paket Promo',
      message: 'Apakah Anda yakin ingin menghapus paket promo ini?',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      showCancel: true,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/paket-promo/${id}`, { method: 'DELETE' });
          if (response.ok) {
            setPackages(packages.filter((p) => p.id !== id));
            showAlert({ type: 'success', title: 'Berhasil', message: 'Paket promo berhasil dihapus' });
          } else {
            showAlert({ type: 'error', title: 'Gagal', message: 'Gagal menghapus paket promo' });
          }
        } catch (error) {
          console.error('Error deleting package:', error);
          showAlert({ type: 'error', title: 'Terjadi Kesalahan', message: 'Gagal menghapus paket promo' });
        }
      }
    });
  };

  const filteredPackages = packages.filter((pkg) =>
    pkg.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#111827',
          }}>Paket Promo</h1>
          <Link
            href="/admin/paket-promo/tambah"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              backgroundColor: '#e31e24',
              color: '#ffffff',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#e31e24';
            }}
          >
            <Plus style={{ width: '1rem', height: '1rem' }} />
            Tambah Paket
          </Link>
        </div>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          maxWidth: '400px',
        }}>
          <Search style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '1.25rem',
            height: '1.25rem',
            color: '#9ca3af',
          }} />
          <input
            type="text"
            placeholder="Cari paket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 1rem 0.625rem 2.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Packages Table */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead style={{
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
              }}>
                <tr>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Nama Paket
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Harga
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Siklus
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'right',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{
                        fontWeight: '500',
                        color: '#111827',
                        fontSize: '0.875rem',
                      }}>
                        {pkg.name}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginTop: '0.125rem',
                        maxWidth: '200px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {pkg.description}
                      </div>
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      fontWeight: '500',
                    }}>
                      Rp {pkg.price?.toLocaleString('id-ID') || '0'}
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                    }}>
                      {pkg.billingCycle}
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'center',
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.125rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: pkg.isActive ? '#dcfce7' : '#fee2e2',
                        color: pkg.isActive ? '#166534' : '#991b1b',
                      }}>
                        {pkg.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      whiteSpace: 'nowrap',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '0.25rem',
                      }}>
                        <Link
                          href={`/admin/paket-promo/edit/${pkg.id}`}
                          style={{
                            padding: '0.375rem',
                            color: '#6b7280',
                            borderRadius: '0.375rem',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                            e.currentTarget.style.color = '#e31e24';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#6b7280';
                          }}
                        >
                          <Edit style={{ width: '1rem', height: '1rem' }} />
                        </Link>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          style={{
                            padding: '0.375rem',
                            color: '#6b7280',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fee2e2';
                            e.currentTarget.style.color = '#dc2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#6b7280';
                          }}
                        >
                          <Trash2 style={{ width: '1rem', height: '1rem' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPackages.length === 0 && (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#6b7280',
              backgroundColor: '#ffffff',
            }}>
              {searchQuery ? 'Tidak ada paket yang cocok dengan pencarian.' : 'Belum ada paket promo. Tambahkan paket pertama Anda!'}
            </div>
          )}
        </div>

        {/* Stats */}
        {filteredPackages.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
            color: '#6b7280',
          }}>
            <div>
              Menampilkan {filteredPackages.length} dari {packages.length} paket
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
