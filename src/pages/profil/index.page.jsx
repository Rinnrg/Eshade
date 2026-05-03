import { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';
import CustomHead from '@src/components/dom/CustomHead';
import Breadcrumb from '@src/components/dom/Breadcrumb';
import LoadingSpinner from '@src/components/dom/LoadingSpinner';
import { Edit2, Trash2, Check, Plus } from 'lucide-react';
import Maintenance from '@src/components/dom/Maintenance';
import styles from './profil.module.scss';

function ProfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAlert, setIsAuthModalOpen] = useStore(
    useShallow((state) => [state.showAlert, state.setIsAuthModalOpen])
  );

  const [activeTab, setActiveTab] = useState('profil');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    cart: 0,
  });

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    image: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Addresses / Location state
  const [addresses, setAddresses] = useState([]);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: '',
    recipientName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    district: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    isDefault: false,
  });

  const [maintenance, setMaintenance] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsAuthModalOpen(true);
      router.push('/');
    }
  }, [status, router, setIsAuthModalOpen]);

  useEffect(() => {
    let mounted = true;

    const checkMaintenanceAndLoad = async () => {
      try {
        const res = await fetch('/api/maintenance?page=profil');
        if (res.ok) {
          const data = await res.json();
          if (data.active) {
            if (mounted) setMaintenance(data);
            return; // skip loading profile data
          }
        }
      } catch (err) {
        console.error('Error checking maintenance:', err);
      }

      // If not in maintenance, proceed to load profile data
      if (session?.user) {
        // Fetch user profile
        fetch('/api/user/profile')
          .then((res) => res.json())
          .then((data) => {
            if (data.user) {
              setFormData({
                name: data.user.name || '',
                username: data.user.username || '',
                email: data.user.email || '',
                phone: data.user.phone || '',
                image: data.user.image || '',
              });
            }
          })
          .catch(console.error);

        // Fetch stats
        fetchStats();
        // Fetch addresses
        fetchAddresses();
      }
    };

    checkMaintenanceAndLoad();

    return () => { mounted = false; };
  }, [session, fetchStats, fetchAddresses]);

  const fetchStats = useCallback(async () => {
    try {
      const [ordersRes, wishlistRes, cartRes] = await Promise.all([
        fetch('/api/user/orders'),
        fetch('/api/user/wishlist'),
        fetch('/api/user/cart'),
      ]);

      const [ordersData, wishlistData, cartData] = await Promise.all([
        ordersRes.json(),
        wishlistRes.json(),
        cartRes.json(),
      ]);

      setStats({
        orders: ordersData.orders?.length || 0,
        wishlist: wishlistData.wishlist?.length || 0,
        cart: cartData.cart?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch('/api/user/addresses');
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAddressInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setAddressForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setAddressForm((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleUpdateProfile = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Client-side validation for username
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (formData.username && !usernameRegex.test(formData.username)) {
      setIsLoading(false);
      showAlert({ type: 'error', title: 'Username Tidak Valid', message: 'Username harus 3-20 karakter dan hanya boleh berisi huruf, angka, dan underscore.' });
      return;
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showAlert({
          type: 'success',
          title: 'Profil Diperbarui',
          message: 'Profil Anda berhasil diperbarui.',
        });
        // Update local form with returned user (normalize username etc)
        if (data.user) {
          setFormData((prev) => ({ ...prev, name: data.user.name || '', username: data.user.username || '', phone: data.user.phone || '', image: data.user.image || '' }));
        }
        setIsEditing(false);
      } else {
        showAlert({
          type: 'error',
          title: 'Gagal Memperbarui',
          message: data.message || 'Terjadi kesalahan saat memperbarui profil.',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert({
        type: 'error',
        title: 'Terjadi Kesalahan',
        message: 'Gagal memperbarui profil. Silakan coba lagi.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, showAlert]);

  const handleChangePassword = useCallback(async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert({
        type: 'error',
        title: 'Password Tidak Cocok',
        message: 'Password baru dan konfirmasi password tidak cocok.',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showAlert({
        type: 'error',
        title: 'Password Terlalu Pendek',
        message: 'Password minimal 6 karakter.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showAlert({
          type: 'success',
          title: 'Password Diubah',
          message: 'Password Anda berhasil diubah.',
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        showAlert({
          type: 'error',
          title: 'Gagal Mengubah Password',
          message: data.message || 'Terjadi kesalahan saat mengubah password.',
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showAlert({
        type: 'error',
        title: 'Terjadi Kesalahan',
        message: 'Gagal mengubah password. Silakan coba lagi.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [passwordData, showAlert]);

  const handleLogout = useCallback(() => {
    showAlert({
      type: 'confirm',
      title: 'Keluar dari Akun',
      message: 'Apakah Anda yakin ingin keluar dari akun?',
      confirmText: 'Keluar',
      showCancel: true,
      onConfirm: () => {
        signOut({ callbackUrl: '/' });
      },
    });
  }, [showAlert]);

  const handleSaveAddress = useCallback(async (e) => {
    e.preventDefault();
    setIsAddressLoading(true);
    try {
      const payload = { ...addressForm };
      const method = editingAddressId ? 'PUT' : 'POST';
      const endpoint = editingAddressId ? `/api/user/addresses/${editingAddressId}` : '/api/user/addresses';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showAlert({ type: 'success', title: editingAddressId ? 'Alamat Diperbarui' : 'Alamat Ditambahkan', message: data.message || 'Lokasi berhasil disimpan.' });
        setIsAddressFormOpen(false);
        setEditingAddressId(null);
        setAddressForm({
          label: '', recipientName: '', phone: '', addressLine1: '', addressLine2: '', city: '', province: '', district: '', postalCode: '', latitude: '', longitude: '', isDefault: false,
        });
        fetchAddresses();
      } else {
        showAlert({ type: 'error', title: 'Gagal', message: data.message || 'Gagal menyimpan alamat.' });
      }
    } catch (error) {
      console.error('Error saving address:', error);
      showAlert({ type: 'error', title: 'Terjadi Kesalahan', message: 'Gagal menyimpan alamat. Silakan coba lagi.' });
    } finally {
      setIsAddressLoading(false);
    }
  }, [addressForm, editingAddressId, fetchAddresses, showAlert]);

  const handleEditAddress = useCallback((address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label || '',
      recipientName: address.recipientName || '',
      phone: address.phone || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      province: address.province || '',
      district: address.district || '',
      postalCode: address.postalCode || '',
      latitude: address.latitude || '',
      longitude: address.longitude || '',
      isDefault: !!address.isDefault,
    });
    setIsAddressFormOpen(true);
  }, []);

  const handleDeleteAddress = useCallback((addressId) => {
    showAlert({
      type: 'confirm',
      title: 'Hapus Lokasi',
      message: 'Apakah Anda yakin ingin menghapus lokasi ini?',
      confirmText: 'Hapus',
      showCancel: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/user/addresses/${addressId}`, { method: 'DELETE' });
          const data = await res.json();
          if (res.ok) {
            showAlert({ type: 'success', title: 'Dihapus', message: 'Lokasi berhasil dihapus.' });
            fetchAddresses();
          } else {
            showAlert({ type: 'error', title: 'Gagal', message: data.message || 'Gagal menghapus lokasi.' });
          }
        } catch (error) {
          console.error('Error deleting address:', error);
          showAlert({ type: 'error', title: 'Terjadi Kesalahan', message: 'Gagal menghapus lokasi.' });
        }
      },
    });
  }, [showAlert, fetchAddresses]);

  const handleSetDefaultAddress = useCallback(async (addressId) => {
    try {
      const res = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (res.ok) {
        showAlert({ type: 'success', title: 'Berhasil', message: 'Alamat utama berhasil diatur.' });
        fetchAddresses();
      } else {
        showAlert({ type: 'error', title: 'Gagal', message: data.message || 'Gagal mengatur alamat utama.' });
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      showAlert({ type: 'error', title: 'Terjadi Kesalahan', message: 'Gagal mengatur alamat utama.' });
    }
  }, [fetchAddresses, showAlert]);

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      showAlert({ type: 'error', title: 'Tidak Didukung', message: 'Geolocation tidak didukung pada browser ini.' });
      return;
    }

    setIsAddressLoading(true);

    const getPosition = () => new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
    });

    try {
      const pos = await getPosition();
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      // Save coordinates first
      setAddressForm((prev) => ({ ...prev, latitude: lat, longitude: lon }));

      // Try reverse-geocoding via Nominatim (OpenStreetMap)
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

          setAddressForm((prev) => ({
            ...prev,
            addressLine1: prev.addressLine1 || addressLine1 || 'Lokasi saat ini',
            city: prev.city || city,
            province: prev.province || province,
            postalCode: prev.postalCode || postalCode,
            latitude: lat,
            longitude: lon,
          }));

          showAlert({ type: 'success', title: 'Lokasi Ditemukan', message: 'Alamat berhasil diisi dari lokasi Anda.' });
        } else {
          setAddressForm((prev) => ({ ...prev, addressLine1: prev.addressLine1 || 'Lokasi saat ini', latitude: lat, longitude: lon }));
          showAlert({ type: 'warning', title: 'Lokasi Tersimpan', message: 'Koordinat telah tersimpan, namun alamat lengkap tidak ditemukan.' });
        }
      } catch (geoError) {
        console.error('Reverse geocoding error:', geoError);
        setAddressForm((prev) => ({ ...prev, addressLine1: prev.addressLine1 || 'Lokasi saat ini', latitude: lat, longitude: lon }));
        showAlert({ type: 'warning', title: 'Lokasi Ditemukan', message: 'Koordinat tersimpan, tetapi gagal mengambil alamat lengkap.' });
      }
    } catch (err) {
      console.error('Geolocation error:', err);
      showAlert({ type: 'error', title: 'Gagal', message: 'Tidak dapat mengambil lokasi saat ini.' });
    } finally {
      setIsAddressLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className={styles.loading}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (maintenance && maintenance.active) {
    return <Maintenance message={maintenance.message} />;
  }

  return (
    <>
      <CustomHead title="Profil Saya - Eshade" description="Kelola profil dan akun Anda" />
      <main className={styles.container}>
        <Breadcrumb items={[{ label: 'Profil', href: null }]} />

        <div className={styles.content}>
          {/* Sidebar Menu */}
          <nav className={styles.sidebar}>
            <button
              type="button"
              className={`${styles.menuItem} ${activeTab === 'profil' ? styles.active : ''}`}
              onClick={() => setActiveTab('profil')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Profil
            </button>

            <Link href="/pesanan" className={styles.menuItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Pesanan Saya
              {stats.orders > 0 && <span className={styles.menuBadge}>{stats.orders}</span>}
            </Link>

            <Link href="/wishlist" className={styles.menuItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Wishlist
              {stats.wishlist > 0 && <span className={styles.menuBadge}>{stats.wishlist}</span>}
            </Link>

            <Link href="/cart" className={styles.menuItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Keranjang
              {stats.cart > 0 && <span className={styles.menuBadge}>{stats.cart}</span>}
            </Link>

            <div className={styles.menuDivider} />

            <button
              type="button"
              className={`${styles.menuItem} ${activeTab === 'keamanan' ? styles.active : ''}`}
              onClick={() => setActiveTab('keamanan')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Keamanan
            </button>

            <button type="button" className={styles.menuItem} onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Keluar
            </button>
          </nav>

          {/* Main Content */}
          <div className={styles.main}>
            {activeTab === 'profil' && (
              <>
                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                  <Link href="/pesanan" className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className={styles.statValue}>{stats.orders}</div>
                    <div className={styles.statLabel}>Pesanan</div>
                  </Link>

                  <Link href="/wishlist" className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className={styles.statValue}>{stats.wishlist}</div>
                    <div className={styles.statLabel}>Wishlist</div>
                  </Link>

                  <Link href="/cart" className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                        <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                        <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className={styles.statValue}>{stats.cart}</div>
                    <div className={styles.statLabel}>Keranjang</div>
                  </Link>


                </div>

                {/* Profile Card */}
                <div className={styles.profileCard}>
                  <div className={styles.profileHeader}>
                    <div className={styles.avatar}>
                      {formData.image ? (
                        <Image
                          src={formData.image}
                          alt={formData.name || 'Avatar'}
                          fill
                          className={styles.avatarImage}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {getInitials(formData.name || session.user.name)}
                        </div>
                      )}
                      <button type="button" className={styles.avatarEdit} aria-label="Ubah foto">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                    <div className={styles.profileInfo}>
                      <h2 className={styles.profileName}>{formData.name || 'Pengguna'}</h2>
                      <p className={styles.profileEmail}>{formData.email}</p>
                      {/* Default Shipping Address (if any) */}
                      {addresses?.length > 0 && (
                        (() => {
                          const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
                          return (
                            <div className={styles.profileAddress}>
                              <div className={styles.addressLabel} style={{ marginTop: '0.5rem', fontWeight: 600 }}>{defaultAddr.label || 'Alamat Utama'}</div>
                              <div className={styles.addressText} style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                                {defaultAddr.recipientName} • {defaultAddr.phone}
                                <div>{defaultAddr.addressLine1}{defaultAddr.addressLine2 ? `, ${defaultAddr.addressLine2}` : ''}</div>
                                <div>{defaultAddr.city}, {defaultAddr.province} {defaultAddr.postalCode}</div>
                              </div>
                            </div>
                          )
                        })()
                      )}
                      <span className={styles.profileBadge}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Terverifikasi
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile}>
                    <div className={styles.formSection} id="lokasi-section">
                      <div className={styles.formSectionHeader}>
                        <h3 className={styles.formSectionTitle}>Lokasi Pengiriman</h3>
                        <button
                          type="button"
                          className={styles.addAddressIcon}
                          aria-label="Tambah Alamat"
                          onClick={() => setIsAddressFormOpen(true)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                       <div className={styles.formGrid}>
                         {addresses.length === 0 && (
                           <div className={styles.emptyState}>
                             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                               <path d="M3 3H21V21H3V3Z" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                               <path d="M8 2V22M16 2V22" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                               <path d="M2 8H22" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                               <path d="M2 16H22" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                             </svg>
                             <p className={styles.emptyText}>Belum ada alamat yang disimpan</p>
                             <button type="button" className={styles.btnPrimary} onClick={() => setIsAddressFormOpen(true)}>
                               Tambah Alamat
                             </button>
                           </div>
                         )}
                         {addresses.length > 0 && (
                           <>
                             {addresses.map((address) => (
                               <div key={address.id} className={styles.addressCard} onClick={() => {
                                showAlert({
                                  title: address.label || 'Alamat',
                                  message: (
                                    <dl>
                                      <dt>Nama penerima:</dt>
                                      <dd>{address.recipientName}</dd>
                                      <dt>Alamat:</dt>
                                      <dd>{`${address.addressLine1}${address.addressLine2 ? `, ${address.addressLine2}` : ''}, ${address.city}, ${address.province} ${address.postalCode}`}</dd>
                                      <dt>No telepon:</dt>
                                      <dd>{address.phone}</dd>
                                      {address.latitude != null && address.longitude != null && (
                                        <>
                                          <dt>Koordinat:</dt>
                                          <dd>{`${Number(address.latitude).toFixed(6)}, ${Number(address.longitude).toFixed(6)}`}</dd>
                                        </>
                                      )}
                                    </dl>
                                  ),
                                  hideIcon: true,
                                  type: 'info',
                                  confirmText: 'Ubah',
                                  showCancel: true,
                                  onConfirm: () => { router.push(`/alamat?edit=${address.id}&returnTo=${encodeURIComponent('/profil')}`); },
                                });
                                }} style={{ cursor: 'pointer' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div className={styles.addressLabel}>{address.label || 'Alamat'}</div>
                                    {address.isDefault && (
                                      <span className={styles.defaultDot} title="Alamat utama">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      </span>
                                    )}
                                  </div>
                                  <div className={styles.addressText}>{address.recipientName} • {address.phone}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {!address.isDefault && (
                                    <button
                                      type="button"
                                      className={styles.iconBtn}
                                      aria-label="Jadikan alamat utama"
                                      onClick={(e) => { e.stopPropagation(); handleSetDefaultAddress(address.id); }}
                                    >
                                      <Check size={16} />
                                    </button>
                                  )}
                                  <button type="button" className={styles.iconBtn} onClick={(e) => { e.stopPropagation(); router.push(`/alamat?edit=${address.id}&returnTo=${encodeURIComponent('/profil')}`); }}>
                                    <Edit2 size={16} />
                                  </button>
                                  <button type="button" className={styles.iconBtnDanger} onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address.id); }}>
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                               </div>
                             ))}
                           </>
                         )}
                       </div>
                     </div>

                    <div className={styles.formSection}>
                      <h3 className={styles.formSectionTitle}>Informasi Pribadi</h3>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label htmlFor="name" className={styles.formLabel}>Nama Lengkap</label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={styles.formInput}
                            placeholder="Masukkan nama lengkap"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="username" className={styles.formLabel}>Username</label>
                          <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={styles.formInput}
                            placeholder="Masukkan username"
                          />
                          <span className={styles.formHint}>Username 3-20 karakter, huruf/angka/underscore</span>
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="email" className={styles.formLabel}>Email</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className={styles.formInput}
                          />
                          <span className={styles.formHint}>Email tidak dapat diubah</span>
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="phone" className={styles.formLabel}>Nomor Telepon</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={styles.formInput}
                            placeholder="Masukkan nomor telepon"
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      {isEditing ? (
                        <>
                          <button type="button" className={styles.btnPrimary} disabled={isLoading} onClick={handleUpdateProfile}>
                            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                          </button>
                          <button type="button" className={styles.btnSecondary} onClick={() => setIsEditing(false)}>
                            Batal
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className={styles.btnPrimary}
                          onClick={(e) => { e.preventDefault(); /* delay to avoid immediate submit on re-render */ setTimeout(() => setIsEditing(true), 0); }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Edit Profil
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Quick Links */}
                <div className={styles.quickLinks}>
                  <h3 className={styles.quickLinksTitle}>Pintasan</h3>
                  <div className={styles.quickLinksList}>
                    <Link href="/pesanan" className={styles.quickLink}>
                      <div className={styles.quickLinkInfo}>
                        <div className={styles.quickLinkIcon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className={styles.quickLinkText}>
                          <h4>Pesanan Saya</h4>
                          <p>Lihat riwayat dan status pesanan</p>
                        </div>
                      </div>
                      <svg className={styles.quickLinkArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>

                    <Link href="/wishlist" className={styles.quickLink}>
                      <div className={styles.quickLinkInfo}>
                        <div className={styles.quickLinkIcon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className={styles.quickLinkText}>
                          <h4>Wishlist</h4>
                          <p>Produk yang Anda sukai</p>
                        </div>
                      </div>
                      <svg className={styles.quickLinkArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>

                    <Link href="/produk" className={styles.quickLink}>
                      <div className={styles.quickLinkInfo}>
                        <div className={styles.quickLinkIcon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="9" y1="21" x2="9" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className={styles.quickLinkText}>
                          <h4>Katalog Produk</h4>
                          <p>Jelajahi koleksi produk kami</p>
                        </div>
                      </div>
                      <svg className={styles.quickLinkArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'keamanan' && (
              <div className={styles.securityCard}>
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}>Ubah Password</h3>
                  <form onSubmit={handleChangePassword}>
                    <div className={styles.formGrid}>
                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="currentPassword" className={styles.formLabel}>Password Saat Ini</label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={styles.formInput}
                          placeholder="Masukkan password saat ini"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="newPassword" className={styles.formLabel}>Password Baru</label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className={styles.formInput}
                          placeholder="Masukkan password baru"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword" className={styles.formLabel}>Konfirmasi Password</label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={styles.formInput}
                          placeholder="Konfirmasi password baru"
                        />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
                        {isLoading ? 'Menyimpan...' : 'Ubah Password'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}>Pengaturan Akun</h3>
                  <div className={styles.securityItem}>
                    <div className={styles.securityInfo}>
                      <h4>Verifikasi Dua Langkah</h4>
                      <p>Tambahkan lapisan keamanan ekstra untuk akun Anda</p>
                    </div>
                    <button type="button" className={styles.securityAction}>Aktifkan</button>
                  </div>
                  <div className={styles.securityItem}>
                    <div className={styles.securityInfo}>
                      <h4>Sesi Aktif</h4>
                      <p>Kelola perangkat yang sedang login</p>
                    </div>
                    <button type="button" className={styles.securityAction}>Lihat</button>
                  </div>
                  <div className={styles.securityItem}>
                    <div className={styles.securityInfo}>
                      <h4>Hapus Akun</h4>
                      <p>Hapus akun dan semua data Anda secara permanen</p>
                    </div>
                    <button type="button" className={styles.btnDanger}>Hapus Akun</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Using global AlertDialog via showAlert for address details */}
    </>
  );
}

export default ProfilPage;
