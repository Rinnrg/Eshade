import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import CustomHead from '@src/components/dom/CustomHead';
import Breadcrumb from '@src/components/dom/Breadcrumb';
import LoadingSpinner from '@src/components/dom/LoadingSpinner';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';
import styles from './alamat.module.scss';

export default function AlamatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAlert] = useStore(useShallow((s) => [s.showAlert]));

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    label: '', recipientName: '', phone: '', addressLine1: '', addressLine2: '', city: '', province: '', district: '', postalCode: '', latitude: '', longitude: '', isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  const returnTo = router.query.returnTo || null;
  const editId = router.query.edit || null;

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/addresses');
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAddresses();
    }
  }, [status, fetchAddresses]);

  useEffect(() => {
    if (editId) {
      // Load address for editing
      (async () => {
        try {
          const res = await fetch(`/api/user/addresses/${editId}`);
          const data = await res.json();
          if (res.ok && data.address) {
            const a = data.address;
            setEditingId(a.id);
            setForm({
              label: a.label || '', recipientName: a.recipientName || '', phone: a.phone || '', addressLine1: a.addressLine1 || '', addressLine2: a.addressLine2 || '', city: a.city || '', province: a.province || '', district: a.district || '', postalCode: a.postalCode || '', latitude: a.latitude || '', longitude: a.longitude || '', isDefault: !!a.isDefault,
            });
          } else {
            showAlert({ type: 'error', title: 'Gagal', message: data.message || 'Alamat tidak ditemukan' });
            router.replace('/alamat');
          }
        } catch (error) {
          console.error('Error loading address:', error);
          showAlert({ type: 'error', title: 'Terjadi Kesalahan', message: 'Gagal memuat data alamat.' });
        }
      })();
    }
  }, [editId, router, showAlert]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((p) => ({ ...p, [name]: checked }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/api/user/addresses/${editingId}` : '/api/user/addresses';
      const res = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) {
        // If returnTo provided, redirect back with selectedAddress
        const created = data.address || null;
        await fetchAddresses();
        showAlert({ type: 'success', title: 'Berhasil', message: editingId ? 'Alamat diperbarui' : 'Alamat ditambahkan' });
        if (returnTo && created) {
          // go back and indicate which address was created/edited
          router.push(`${returnTo}?selectedAddress=${created.id}`);
        } else {
          // clear form
          setEditingId(null);
          setForm({ label: '', recipientName: '', phone: '', addressLine1: '', addressLine2: '', city: '', province: '', district: '', postalCode: '', latitude: '', longitude: '', isDefault: false });
        }
      } else {
        showAlert({ type: 'error', title: 'Gagal', message: data.message || 'Gagal menyimpan alamat' });
      }
    } catch (err) {
      console.error('Error saving address:', err);
      showAlert({ type: 'error', title: 'Terjadi Kesalahan', message: 'Gagal menyimpan alamat.' });
    } finally {
      setSaving(false);
    }
  }, [form, editingId, router, returnTo, fetchAddresses, showAlert]);

  const handleDelete = useCallback((id) => {
    showAlert({
      type: 'confirm',
      title: 'Hapus Alamat',
      message: 'Apakah Anda yakin ingin menghapus alamat ini?',
      confirmText: 'Hapus',
      showCancel: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (res.ok) {
            showAlert({ type: 'success', title: 'Dihapus', message: 'Alamat berhasil dihapus.' });
            fetchAddresses();
          } else {
            showAlert({ type: 'error', title: 'Gagal', message: data.message || 'Gagal menghapus alamat.' });
          }
        } catch (error) {
          console.error('Error deleting address:', error);
          showAlert({ type: 'error', title: 'Terjadi Kesalahan', message: 'Gagal menghapus alamat.' });
        }
      }
    })
  }, [fetchAddresses, showAlert]);

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      showAlert({ type: 'error', title: 'Tidak Didukung', message: 'Geolocation tidak didukung pada browser ini.' });
      return;
    }

    try {
      const pos = await new Promise((resolve, reject) => { navigator.geolocation.getCurrentPosition(resolve, reject); });
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setForm((p) => ({ ...p, latitude: lat, longitude: lon }));
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
        if (geoRes.ok) {
          const geo = await geoRes.json();
          const a = geo.address || {};
          const lineParts = [a.house_number, a.road, a.neighbourhood, a.suburb].filter(Boolean);
          const addressLine1 = lineParts.join(' ') || '';
          const city = a.city || a.town || a.village || a.county || '';
          const province = a.state || '';
          const postalCode = a.postcode || '';
          setForm((p) => ({ ...p, addressLine1: p.addressLine1 || addressLine1 || 'Lokasi saat ini', city: p.city || city, province: p.province || province, postalCode: p.postalCode || postalCode, latitude: lat, longitude: lon }));
          showAlert({ type: 'success', title: 'Lokasi Ditemukan', message: 'Alamat berhasil diisi dari lokasi Anda.' });
        } else {
          setForm((p) => ({ ...p, addressLine1: p.addressLine1 || 'Lokasi saat ini', latitude: lat, longitude: lon }));
          showAlert({ type: 'warning', title: 'Lokasi Tersimpan', message: 'Koordinat telah tersimpan, namun alamat lengkap tidak ditemukan.' });
        }
      } catch (geoError) {
        console.error('Reverse geocoding error:', geoError);
        setForm((p) => ({ ...p, addressLine1: p.addressLine1 || 'Lokasi saat ini', latitude: lat, longitude: lon }));
        showAlert({ type: 'warning', title: 'Lokasi Ditemukan', message: 'Koordinat tersimpan, tetapi gagal mengambil alamat lengkap.' });
      }
    } catch (err) {
      console.error('Geolocation error:', err);
      showAlert({ type: 'error', title: 'Gagal', message: 'Tidak dapat mengambil lokasi saat ini.' });
    }
  }

  if (status === 'loading' || loading) {
    return (
      <>
        <CustomHead title="Alamat - Eshade" />
        <LoadingSpinner fullscreen />
      </>
    )
  }

  if (!session?.user) return null;

  return (
    <>
      <CustomHead title="Alamat Saya - Eshade" />
      <main style={{ padding: '2rem' }}>
        <Breadcrumb items={[{ label: 'Alamat', href: null }]} />

        <div style={{ maxWidth: '900px', margin: '1.5rem auto 4rem', display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2>Alamat Pengiriman</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => { setEditingId(null); setForm({ label: '', recipientName: '', phone: '', addressLine1: '', addressLine2: '', city: '', province: '', district: '', postalCode: '', latitude: '', longitude: '', isDefault: false }); }} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>Reset</button>
              <button onClick={handleSave} style={{ padding: '0.5rem 0.75rem', background: '#000', color: '#fff', borderRadius: '0.375rem' }} disabled={saving}>{saving ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Tambah Alamat')}</button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #eef2f7' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Label (mis. Rumah/Kantor)</label>
                  <input name="label" value={form.label} onChange={handleChange} style={{ padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Nama Penerima</label>
                  <input name="recipientName" value={form.recipientName} onChange={handleChange} style={{ padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Nomor Telepon</label>
                  <input name="phone" value={form.phone} onChange={handleChange} style={{ padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Alamat</label>
                  <input name="addressLine1" value={form.addressLine1} onChange={handleChange} style={{ padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }} />
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button type="button" onClick={handleUseCurrentLocation} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>Gunakan Lokasi Saat Ini</button>
                {form.latitude && (
                  <div style={{ color: '#6b7280' }}>Koordinat: {Number(form.latitude).toFixed(6)}, {Number(form.longitude).toFixed(6)}</div>
                )}
              </div>
            </div>

            <div style={{ background: '#fff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #eef2f7' }}>
              <h3 style={{ marginTop: 0 }}>Daftar Alamat</h3>
              <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
                {addresses.map((addr) => (
                  <div key={addr.id} style={{ borderRadius: '0.5rem', padding: '0.75rem', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{addr.label || 'Alamat'}</div>
                      <div style={{ color: '#6b7280' }}>{addr.recipientName} • {addr.phone}</div>
                      <div style={{ color: '#6b7280' }}>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</div>
                      <div style={{ color: '#6b7280' }}>{addr.city}, {addr.province} {addr.postalCode}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/alamat?edit=${addr.id}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>Edit</Link>
                      <button onClick={() => handleDelete(addr.id)} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #fee2e2', background: '#fff', color: '#dc2626', cursor: 'pointer' }}>Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
