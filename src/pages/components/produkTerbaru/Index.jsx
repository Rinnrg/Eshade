import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useStore } from '@src/store';
import { useShallow } from 'zustand/react/shallow';
import styles from './styles/produkTerbaru.module.scss';

export default function ProdukTerbaru({ produk = [] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [wishlist, setWishlist, showAlert] = useStore(
    useShallow((state) => [state.wishlist, state.setWishlist, state.showAlert])
  );

  if (!produk || produk.length === 0) {
    return null;
  }

  // Handle wishlist toggle
  const handleWishlistToggle = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      showAlert({
        type: 'warning',
        title: 'Login Diperlukan',
        message: 'Anda harus login terlebih dahulu untuk menambahkan produk ke wishlist.',
        confirmText: 'Login Sekarang',
        showCancel: true,
        onConfirm: () => {
          router.push('/login');
        },
      });
      return;
    }

    const isLiked = wishlist.some((item) => item.produkId === productId);

    try {
      if (isLiked) {
        await fetch('/api/user/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ produkId: productId }),
        });
        setWishlist(wishlist.filter((item) => item.produkId !== productId));
      } else {
        const res = await fetch('/api/user/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ produkId: productId }),
        });
        const data = await res.json();
        if (data.wishlistItem) {
          setWishlist([...wishlist, data.wishlistItem]);
        }
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
    }
  };

  return (
    <section className={styles.root}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>Produk Terbaru</h2>
          <Link href="/produk" className={styles.viewAllBtn}>
            Lihat Semua Produk
          </Link>
        </div>

        <div className={styles.grid}>
          {produk.slice(0, 4).map((item) => {
            const isLiked = wishlist.some((w) => w.produkId === item.id);
            const finalPrice = item.diskon > 0
              ? item.harga * (1 - item.diskon / 100)
              : item.harga;

            return (
              <Link key={item.id} href={`/produk/${item.id}`} className={styles.card}>
                <div className={styles.imageContainer}>
                  <Image
                    src={item.gambar?.[0] || '/logo/logo 1 black.svg'}
                    alt={item.nama}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className={styles.image}
                  />
                  {item.diskon > 0 && (
                    <div className={styles.discountBadge}>-{item.diskon}%</div>
                  )}
                  <button
                    type="button"
                    className={clsx(styles.wishlistBtn, { [styles.active]: isLiked })}
                    onClick={(e) => handleWishlistToggle(e, item.id)}
                    aria-label={isLiked ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
                  >
                    {isLiked ? '♥' : '♡'}
                  </button>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.category}>{item.kategori}</div>
                  <h3 className={styles.productName}>{item.nama}</h3>
                  <div className={styles.priceContainer}>
                    <span className={clsx(styles.currentPrice, { [styles.discountedPrice]: item.diskon > 0 })}>
                      Rp {finalPrice.toLocaleString('id-ID')}
                    </span>
                    {item.diskon > 0 && (
                      <span className={styles.originalPrice}>
                        Rp {item.harga.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
