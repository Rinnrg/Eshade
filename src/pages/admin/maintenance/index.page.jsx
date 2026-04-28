import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { AdminLayout } from '@src/components/admin/layout/admin-layout';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';

const PAGES = [
  { key: 'home', label: 'Home' },
  { key: 'produk', label: 'Produk' },
  { key: 'produk-detail', label: 'Detail Produk' },
  { key: 'profil', label: 'Profil' },
  { key: 'cart', label: 'Keranjang' },
  { key: 'wishlist', label: 'Wishlist' },
  { key: 'pembayaran', label: 'Checkout' },
  { key: 'about', label: 'About' },
  { key: 'contact', label: 'Contact' },
];

export default function MaintenanceAdminPage() {
  const router = useRouter();
  const { status } = useSession();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert] = useStore(useShallow((state) => [state.showAlert]));

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/maintenance?admin=true');
      const data = await res.json();
      setSettings(data.settings || []);
    } catch (err) {
      console.error('Error fetching maintenance settings:', err);
      showAlert({ type: 'error', title: 'Error', message: 'Gagal memuat data maintenance' });
    } finally {
      setLoading(false);
    }
  };

  const getSettingFor = (key) => settings.find((s) => s.page === key) || null;

  const toggle = async (key, value) => {
    try {
      const payload = { page: key, active: value };
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings((prev) => {
          const others = prev.filter((p) => p.page !== key);
          return [...others, data.setting];
        });
        showAlert({ type: 'success', title: 'Berhasil', message: `Maintenance untuk ${key} telah ${value ? 'diaktifkan' : 'dinonaktifkan'}` });
      } else {
        showAlert({ type: 'error', title: 'Gagal', message: data.error || 'Gagal memperbarui setting' });
      }
    } catch (err) {
      console.error('Error toggling maintenance:', err);
      showAlert({ type: 'error', title: 'Terjadi Kesalahan', message: 'Gagal memperbarui setting' });
    }
  };

  const saveMessage = async (key, message) => {
    try {
      const payload = { page: key, message };
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings((prev) => {
          const others = prev.filter((p) => p.page !== key);
          return [...others, data.setting];
        });
        showAlert({ type: 'success', title: 'Berhasil', message: 'Pesan berhasil disimpan' });
      } else {
        showAlert({ type: 'error', title: 'Gagal', message: data.error || 'Gagal menyimpan pesan' });
      }
    } catch (err) {
      console.error('Error saving message:', err);
      showAlert({ type: 'error', title: 'Terjadi Kesalahan', message: 'Gagal menyimpan pesan' });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>Maintenance Pages</h1>
        <p style={{ color: '#6b7280' }}>Daftar halaman yang bisa diaktifkan maintenance nya.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {PAGES.map((p) => {
            const s = getSettingFor(p.key);
            return (
              <div key={p.key} style={{ background: '#fff', borderRadius: 8, padding: '1rem', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.label}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{s && s.active ? 'Aktif' : 'Nonaktif'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        role="switch"
                        tabIndex={0}
                        aria-checked={s && s.active}
                        onClick={() => toggle(p.key, !(s && s.active))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggle(p.key, !(s && s.active));
                          }
                        }}
                        style={{
                          width: 42,
                          height: 24,
                          borderRadius: 9999,
                          backgroundColor: s && s.active ? '#34d399' : '#e5e7eb',
                          position: 'relative',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '0.125rem',
                          left: s && s.active ? '50%' : '0.125rem',
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: '#fff',
                          transition: 'left 0.15s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }} />
                      </div>
                    </label>
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#374151' }}>Pesan</label>
                  <textarea
                    defaultValue={s ? s.message : 'halaman ini sedang dalam perbaikan'}
                    onBlur={(e) => saveMessage(p.key, e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
