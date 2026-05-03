import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';
import Breadcrumb from '@src/components/dom/Breadcrumb';
import { AdminLayout } from '@src/components/admin/layout/admin-layout';
import { uploadFile } from '@src/lib/image-utils';
import { Plus, Image as ImageIcon, Trash2 } from 'lucide-react';
import styles from './categories.module.scss'; // Will create this

export default function AdminCategories() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingCategory, setUploadingCategory] = useState(null);
  const [showAlert] = useStore(useShallow((state) => [state.showAlert]));

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchCategories();
    }
  }, [status, router]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch categories.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailUpload = async (e, categoryName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCategory(categoryName);
    try {
      // 1. Upload to storage
      const url = await uploadFile(file);

      // 2. Save to db
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName, thumbnail: url }),
      });

      if (res.ok) {
        // Update local state
        setCategories(categories.map(c => 
          c.name === categoryName ? { ...c, thumbnail: url } : c
        ));
        showAlert({
          type: 'success',
          title: 'Success',
          message: 'Thumbnail updated successfully.',
        });
      } else {
        throw new Error('Failed to update category');
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to upload thumbnail.',
      });
    } finally {
      setUploadingCategory(null);
    }
  };

  const handleDeleteThumbnail = async (categoryName) => {
    showAlert({
      type: 'confirm',
      title: 'Hapus Thumbnail',
      message: `Anda yakin ingin menghapus thumbnail untuk kategori "${categoryName}"?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      showCancel: true,
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: categoryName, thumbnail: null }),
          });

          if (res.ok) {
            setCategories(categories.map(c => 
              c.name === categoryName ? { ...c, thumbnail: null } : c
            ));
          }
        } catch (error) {
          console.error('Error deleting thumbnail:', error);
        }
      }
    });
  };

  if (status === 'loading' || loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <Breadcrumb items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Kategori', href: null }
          ]} />
          <h1 className={styles.title}>Manajemen Kategori</h1>
          <p className={styles.subtitle}>Atur thumbnail untuk setiap kategori produk yang ada.</p>
        </div>

        <div className={styles.grid}>
          {categories.length === 0 ? (
            <div className={styles.emptyState}>Belum ada kategori yang digunakan di produk.</div>
          ) : (
            categories.map((category) => (
              <div key={category.name} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  <span className={styles.productCount}>
                    {category.productCount} Produk
                  </span>
                </div>
                
                <div className={styles.thumbnailContainer}>
                  {category.thumbnail ? (
                    <div className={styles.thumbnailWrapper}>
                      <Image 
                        src={category.thumbnail} 
                        alt={category.name} 
                        fill 
                        style={{ objectFit: 'cover' }} 
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDeleteThumbnail(category.name)}
                        title="Hapus Thumbnail"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.noThumbnail}>
                      <ImageIcon size={48} className={styles.placeholderIcon} />
                      <p>Belum ada thumbnail</p>
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <label className={styles.uploadButton}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleThumbnailUpload(e, category.name)}
                      disabled={uploadingCategory === category.name}
                      style={{ display: 'none' }}
                    />
                    <Plus size={16} />
                    {uploadingCategory === category.name ? 'Mengunggah...' : 'Pilih Thumbnail'}
                  </label>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
