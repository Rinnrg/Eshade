import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { AdminLayout } from '@src/components/admin/layout/admin-layout';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';

export default function EditPaketPromoPage() {
  const router = useRouter();
  const { id } = router.query;
  const { status } = useSession();
  const [showAlert] = useStore(useShallow((state) => [state.showAlert]));

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    billingCycle: '/month',
    isActive: true,
    features: [''],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && id) {
      fetchPackage();
    }
  }, [status, router, id]);

  const fetchPackage = async () => {
    try {
      const response = await fetch(`/api/admin/paket-promo/${id}`);
      const data = await response.json();

      if (response.ok) {
        const pkg = data.paketPromo;
        setFormData({
          name: pkg.name || '',
          description: pkg.description || '',
          price: pkg.price || '',
          billingCycle: pkg.billingCycle || '/month',
          isActive: pkg.isActive ?? true,
          features: pkg.features && pkg.features.length > 0 ? pkg.features : [''],
        });
      } else {
        showAlert({ type: 'error', title: 'Error', message: 'Paket Promo tidak ditemukan' });
        router.push('/admin/paket-promo');
      }
    } catch (error) {
      console.error('Error fetching package:', error);
      showAlert({ type: 'error', title: 'Error', message: 'Gagal mengambil data paket' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures.length ? newFeatures : [''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty features
      const filteredFeatures = formData.features.filter(f => f.trim() !== '');

      const response = await fetch(`/api/admin/paket-promo/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          features: filteredFeatures,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert({ type: 'success', title: 'Berhasil', message: 'Paket Promo berhasil diperbarui' });
        router.push('/admin/paket-promo');
      } else {
        showAlert({ type: 'error', title: 'Gagal', message: data.error || 'Terjadi kesalahan' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showAlert({ type: 'error', title: 'Gagal', message: 'Terjadi kesalahan pada server' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <AdminLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <Link
            href="/admin/paket-promo"
            style={{
              padding: '0.5rem',
              color: '#6b7280',
              borderRadius: '0.375rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#111827';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
          </Link>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#111827',
          }}>Edit Paket Promo</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
              Nama Paket <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Contoh: Monthly Package"
              style={{
                padding: '0.625rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
              Deskripsi Singkat
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Contoh: Lorem ipsum dolor sit amet..."
              rows={3}
              style={{
                padding: '0.625rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Harga <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '0.875rem' }}>Rp</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.625rem 0.625rem 2rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Siklus Penagihan <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
                required
                style={{
                  padding: '0.625rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="/day">Per Hari (/day)</option>
                <option value="/month">Per Bulan (/month)</option>
                <option value="/year">Per Tahun (/year)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Daftar Fitur
              </label>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {formData.features.map((feature, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="Contoh: All instrument access"
                    style={{
                      flex: 1,
                      padding: '0.625rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    style={{
                      padding: '0.625rem',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 style={{ width: '1rem', height: '1rem' }} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFeature}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px dashed #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                marginTop: '0.5rem',
                alignSelf: 'flex-start',
              }}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Tambah Fitur
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              style={{ width: '1rem', height: '1rem' }}
            />
            <label htmlFor="isActive" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', cursor: 'pointer' }}>
              Paket Aktif (tampilkan di website)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => router.push('/admin/paket-promo')}
              style={{
                padding: '0.625rem 1.5rem',
                backgroundColor: '#ffffff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.5rem',
                backgroundColor: '#e31e24',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <Save style={{ width: '1rem', height: '1rem' }} />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
