import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';
import MultipleImageUpload from '@src/components/admin/MultipleImageUpload';
import Breadcrumb from '@src/components/dom/Breadcrumb';
import styles from '../../produk/form.module.scss';

export default function EditHomeSection() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAlert] = useStore(useShallow((state) => [state.showAlert]));
  const { id } = router.query;
  const [formData, setFormData] = useState({
    page: 'home',
    urutan: 0,
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSection = async () => {
    try {
      const response = await fetch(`/api/admin/home-sections?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        const section = data.section || data;
        setFormData({
          page: section.page || 'home',
          urutan: section.urutan || section.order || 0,
        });
        setExistingImages(section.gambar || section.images || []);
      } else {
        setError('Section tidak ditemukan');
      }
    } catch (err) {
      setError('Gagal memuat data section');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (id && status === 'authenticated') {
      fetchSection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagesChange = (imageData) => {
    setImages(imageData.allImages || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const newFiles = images.filter((img) => img && img.file).map((img) => img.file);
      const totalImagesCount = existingImages.length + newFiles.length;

      if (totalImagesCount === 0) {
        setError('Minimal satu gambar harus diupload');
        setIsSubmitting(false);
        return;
      }

      // Build FormData
      const fd = new FormData();
      fd.append('page', formData.page || 'home');
      fd.append('order', parseInt(formData.urutan, 10) || 0);
      fd.append('layoutType', 'slider');
      fd.append('columns', '3');
      fd.append('autoplay', 'true');
      fd.append('interval', '3000');
      fd.append('isActive', 'true');

      // Existing images to keep
      if (existingImages && existingImages.length > 0) {
        fd.append('existingImages', JSON.stringify(existingImages));
      }

      // Append new files
      newFiles.forEach((file) => fd.append('images', file, file.name));

      const response = await fetch(`/api/admin/home-sections?id=${id}`, {
        method: 'PUT',
        body: fd,
      });

      if (response.ok) {
        router.push('/admin');
      } else {
        const data = await response.json();
        setError(data.error || 'Gagal mengupdate section');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat mengupdate section');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Breadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Home Sections', href: null },
            { label: 'Edit Section', href: null },
          ]}
        />
        <h1 className={styles.title}>Edit Home Section</h1>
      </header>

      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="page" className={styles.label}>
              Halaman Tujuan *
            </label>
            <select
              id="page"
              name="page"
              value={formData.page}
              onChange={handleChange}
              className={styles.input}
              required
            >
              <option value="home">Beranda (Home)</option>
              <option value="produk">Produk</option>
              <option value="about">Tentang Kami</option>
              <option value="contact">Kontak</option>
              <option value="promo">Promo</option>
            </select>
            <small className={styles.hint}>Pilih halaman dimana section ini akan ditampilkan</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="urutan" className={styles.label}>
              Urutan Tampilan
            </label>
            <input
              type="number"
              id="urutan"
              name="urutan"
              value={formData.urutan}
              onChange={handleChange}
              className={styles.input}
              placeholder="0"
              min="0"
            />
            <small className={styles.hint}>Urutan tampilan section (0 = paling atas)</small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Gambar Section *</label>
            {existingImages.length > 0 && (
              <div className={styles.existingImages}>
                <p>Gambar yang sudah ada:</p>
                <div className={styles.imageGrid}>
                  {existingImages.map((img, index) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={index} src={img} alt={`Existing ${index}`} className={styles.thumbnail} />
                  ))}
                </div>
              </div>
            )}
            <MultipleImageUpload
              onChange={handleImagesChange}
              maxImages={10}
              label="Upload Gambar Baru (Max 10)"
            />
            <small className={styles.hint}>
              Upload gambar baru untuk mengganti yang lama, atau biarkan kosong untuk tetap menggunakan gambar yang ada
            </small>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => showAlert({ type: 'confirm', title: 'Batal', message: 'Apakah Anda yakin ingin membatalkan? Semua perubahan belum disimpan akan hilang.', confirmText: 'Ya, Batal', cancelText: 'Kembali', showCancel: true, onConfirm: () => router.push('/admin') })}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Update Section'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
