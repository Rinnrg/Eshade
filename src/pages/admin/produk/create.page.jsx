import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';
// eslint-disable-next-line import/extensions
import MultipleImageUpload from '@src/components/admin/MultipleImageUpload';
import SectionsEditor from '@src/components/admin/SectionsEditor';
import Breadcrumb from '@src/components/dom/Breadcrumb';
import styles from './form.module.scss';
import { uploadFile } from '@src/lib/image-utils';

export default function CreateProduk() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    sections: [],
    kategori: '',
    harga: '',
    diskon: '0',
    stok: '999999',
    berat: '0',
    thumbnail: '',
    images: [],
    videos: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [productImages, setProductImages] = useState({
    thumbnail: null,
    gallery: [],
    allImages: []
  });
  const [videoFiles, setVideoFiles] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showAlert] = useStore(useShallow((state) => [state.showAlert]));

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagesChange = (imageData) => {
    setProductImages(imageData);
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    setVideoFiles(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setVideoPreviews(previews);
  };

  const removeNewVideo = (index) => {
    showAlert({
      type: 'confirm',
      title: 'Hapus Video',
      message: 'Apakah Anda yakin ingin menghapus video ini dari preview? Perubahan ini belum disimpan.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      showCancel: true,
      onConfirm: () => {
        const newFiles = videoFiles.filter((_, i) => i !== index);
        const newPreviews = videoPreviews.filter((_, i) => i !== index);

        if (videoPreviews[index]?.startsWith('blob:')) {
          URL.revokeObjectURL(videoPreviews[index]);
        }

        setVideoFiles(newFiles);
        setVideoPreviews(newPreviews);
      }
    });
  };

  const getRemainingStock = () => {
    return 999999;
  };

  const uploadImages = async () => {
    const newImages = productImages.allImages
      .filter(img => img.isNew && img.file)
      .map(img => img.file);

    if (newImages.length === 0) return [];

    setIsUploading(true);

    try {
      const uploadPromises = newImages.map(async (file) => {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (response.ok) {
          const data = await response.json();
          return data.url;
        }
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        // eslint-disable-next-line no-console
        console.error('Upload failed:', errorData);
        throw new Error(errorData.message || 'Failed to upload image');
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      return uploadedUrls;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error uploading images:', err);
      throw new Error(`Error uploading images: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadVideos = async () => {
    if (videoFiles.length === 0) return [];

    try {
      const uploadPromises = videoFiles.map(async (file) => {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (response.ok) {
          const data = await response.json();
          return data.url;
        }
        throw new Error('Failed to upload video');
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      return uploadedUrls;
    } catch (err) {
      throw new Error('Error uploading videos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.nama || !formData.kategori || !formData.harga) {
      setError('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }

    // Validate sections: each section must have a title
    if (formData.sections && formData.sections.some((s) => !s.judul || !String(s.judul).trim())) {
      setError('Setiap section harus memiliki judul');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images and videos
      const uploadedImageUrls = await uploadImages();
      const uploadedVideoUrls = await uploadVideos();

      // Upload section images (if any new uploads) and normalize sections
      let processedSections = formData.sections || [];
      try {
        processedSections = await Promise.all((formData.sections || []).map(async (section) => {
          // New format: section.gambar may be an array
          if (Array.isArray(section.gambar) && section.gambar.length > 0) {
            const newGambar = await Promise.all(section.gambar.map(async (g) => {
              if (g && g.file) {
                const url = await uploadFile(g.file);
                return { url, caption: g.caption || '' };
              }
              if (g && g.url) {
                return { url: g.url, caption: g.caption || '' };
              }
              return null;
            }));

            return { ...section, gambar: newGambar.filter(Boolean) };
          }

          // Backwards compatibility: single object or string
          if (section.gambar && typeof section.gambar === 'object' && section.gambar.file) {
            const url = await uploadFile(section.gambar.file);
            return { ...section, gambar: [{ url, caption: section.gambar.caption || '' }] };
          }
          if (section.gambar && typeof section.gambar === 'object' && section.gambar.url) {
            return { ...section, gambar: [{ url: section.gambar.url, caption: section.gambar.caption || '' }] };
          }
          if (section.gambar && typeof section.gambar === 'string') {
            return { ...section, gambar: [{ url: section.gambar, caption: '' }] };
          }

          return { ...section, gambar: [] };
        }));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error uploading section images:', err);
        throw new Error('Error uploading section images');
      }

      // Determine thumbnail URL
      let thumbnailUrl = '';
      if (productImages.allImages && productImages.allImages.length > 0) {
        const thumbnailImage = productImages.allImages.find(img => img.isThumbnail);
        if (thumbnailImage) {
          if (thumbnailImage.isNew) {
            const newImages = productImages.allImages.filter(img => img.isNew);
            const thumbnailIndexInNew = newImages.findIndex(img => img === thumbnailImage);
            if (thumbnailIndexInNew !== -1 && uploadedImageUrls[thumbnailIndexInNew]) {
              thumbnailUrl = uploadedImageUrls[thumbnailIndexInNew];
            }
          } else {
            thumbnailUrl = thumbnailImage.url;
          }
        } else if (uploadedImageUrls.length > 0) {
          thumbnailUrl = uploadedImageUrls[0];
        }
      }

      const dataToSubmit = {
        nama: formData.nama,
        deskripsi: formData.deskripsi || '',
        sections: processedSections,
        kategori: formData.kategori,
        harga: parseFloat(formData.harga),
        diskon: parseFloat(formData.diskon) || 0,
        stok: parseInt(formData.stok, 10),
        berat: parseFloat(formData.berat),
        ukuran: [],
        warna: [],
        gambar: uploadedImageUrls,
        thumbnail: thumbnailUrl,
        video: uploadedVideoUrls,
        produkUnggulan: false,
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        router.push('/admin/produk');
      } else {
        const data = await response.json();
        setError(data.error || 'Error membuat produk');
      }
    } catch (err) {
      setError(err.message || 'Error membuat produk');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Breadcrumb items={[
        { label: 'Admin', href: '/admin' },
        { label: 'Tambah Produk', href: null }
      ]} />
      <div className={styles.header}>
        <button type="button" onClick={() => showAlert({ type: 'confirm', title: 'Kembali', message: 'Apakah Anda yakin ingin kembali dan membatalkan perubahan? Semua perubahan belum disimpan akan hilang.', confirmText: 'Ya, Kembali', cancelText: 'Tetap di sini', showCancel: true, onConfirm: () => router.push('/admin') })} className={styles.backButton}>
          Kembali ke Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        {/* Basic Information Section */}
        <div className={styles.formGroup}>
          <h3 className={styles.sectionHeader}>📝 Informasi Dasar</h3>
          <label htmlFor="nama" className={styles.label}>
            Nama Produk *
            <input id="nama" name="nama" type="text" value={formData.nama} onChange={handleChange} className={styles.input} placeholder="Masukkan nama produk" required />
          </label>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="kategori" className={styles.label}>
            Kategori *
            <select id="kategori" name="kategori" value={formData.kategori} onChange={handleChange} className={styles.input} required>
              <option value="">Pilih Kategori</option>
              <option value="kardio">kardio</option>
              <option value="vol.1">vol.1</option>
              <option value="vol.2">vol.2</option>
              <option value="vol.3">vol.3</option>
              <option value="vol.4">vol.4</option>
              <option value="vol.5">vol.5</option>
              <option value="vol.6">vol.6</option>
              <option value="vol.7">vol.7</option>
              <option value="phase-1">phase-1</option>
              <option value="phase-2">phase-2</option>
              <option value="phase-3">phase-3</option>
              <option value="phase-4">phase-4</option>
              <option value="phase-5">phase-5</option>
              <option value="pilates">pilates</option>
              <option value="multi rain">multi rain</option>
            </select>
          </label>
        </div>

          <div className={styles.formGroup}>
            <label htmlFor="berat" className={styles.label}>
              Berat (kg)
              <input id="berat" name="berat" type="number" step="0.1" value={formData.berat} onChange={handleChange} className={styles.input} placeholder="Contoh: 0.5" />
            </label>
          </div>

        {/* Description Section */}
        <div className={styles.formGroup}>
          <h3 className={styles.sectionHeader}>📄 Deskripsi Produk</h3>
          <label className={styles.label}>
            Deskripsi / Product Sections
            <span className={styles.helpText}>
              Sections akan ditampilkan sebagai detail produk di bawah gallery foto. Deskripsi tiap section bersifat opsional.
            </span>
          </label>
          <SectionsEditor
            sections={formData.sections}
            onChange={(newSections) => setFormData({ ...formData, sections: newSections })}
          />
        </div>

        {/* Pricing Section - Moved and modified */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <h3 className={styles.sectionHeader}>💰 Harga</h3>
            <label htmlFor="harga" className={styles.label}>
              Harga (Rp) *
              <input id="harga" name="harga" type="number" step="1" value={formData.harga} onChange={handleChange} className={styles.input} placeholder="Contoh: 200000" required />
            </label>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="diskon" className={styles.label}>
              Diskon (%)
              <input id="diskon" name="diskon" type="number" step="1" min="0" max="100" value={formData.diskon} onChange={handleChange} className={styles.input} placeholder="Contoh: 20" />
            </label>
          </div>
        </div>

        {/* Images Section */}
        <div className={styles.formGroup}>
          <h3 className={styles.sectionHeader}>📸 Foto Produk</h3>
          <label className={styles.label}>
            Upload Foto Produk
            <span className={styles.helpText}>
              Foto pertama akan menjadi thumbnail, semua foto akan ditampilkan di gallery produk
            </span>
          </label>
          <MultipleImageUpload
            images={productImages.allImages}
            thumbnail={productImages.thumbnail}
            onChange={handleImagesChange}
          />
        </div>

        {/* Video Section */}
        <div className={styles.formGroup}>
          <h3 className={styles.sectionHeader}>🎥 Video Produk</h3>
          <label htmlFor="videos" className={styles.label}>
            Upload Video (opsional)
            <input id="videos" name="videos" type="file" accept="video/*" multiple onChange={handleVideoChange} className={styles.fileInput} />
          </label>

          {/* Video Previews */}
          {videoPreviews.length > 0 && (
            <>
              <p className={styles.sectionLabel}>Preview Video:</p>
              <div className={styles.videoPreviewContainer}>
                {videoPreviews.map((preview, index) => (
                  <div key={preview} className={styles.videoPreview}>
                    <video src={preview} controls className={styles.videoElement}>
                      <track kind="captions" />
                    </video>
                    <button type="button" onClick={() => removeNewVideo(index)} className={styles.removeVideoButton}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className={styles.formActions}>
          <button type="button" onClick={() => showAlert({ type: 'confirm', title: 'Batal', message: 'Apakah Anda yakin ingin membatalkan pembuatan produk? Semua perubahan belum disimpan akan hilang.', confirmText: 'Ya, Batal', cancelText: 'Kembali', showCancel: true, onConfirm: () => router.push('/admin/produk') })} className={styles.cancelButton} disabled={isSubmitting}>
            Batal
          </button>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting || isUploading}>
            {(() => {
              if (isUploading) return '⏳ Mengupload Gambar...';
              if (isSubmitting) return '⏳ Membuat Produk...';
              return '✅ Buat Produk';
            })()}
          </button>
        </div>
      </form>
    </div>
  );
}
