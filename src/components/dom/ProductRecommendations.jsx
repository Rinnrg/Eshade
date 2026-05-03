import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import styles from './ProductRecommendations.module.scss';

function ProductRecommendations({ kategori, currentProdukId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!kategori) return;

      try {
        const res = await fetch(`/api/produk?kategori=${encodeURIComponent(kategori)}&limit=10`);
        const data = await res.json();

        if (Array.isArray(data)) {
          // Filter out current product and take only 4
          const filtered = data
            .filter((item) => item.id !== currentProdukId)
            .slice(0, 4);
          setRecommendations(filtered);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [kategori, currentProdukId]);

  if (isLoading || recommendations.length === 0) {
    return null;
  }

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Rekomendasi Produk</h2>
      <div className={styles.grid}>
        {recommendations.map((item) => {
          const finalPrice = item.diskon > 0
            ? item.harga * (1 - item.diskon / 100)
            : item.harga;

          return (
            <Link
              key={item.id}
              href={`/produk/${item.id}`}
              className={styles.card}
            >
              <div className={styles.imageContainer}>
                <Image
                  src={item.gambar?.[0] || '/logo/logo 1 black.svg'}
                  alt={item.nama}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.productName}>{item.nama}</h3>
                <div className={styles.priceContainer}>
                  <span className={clsx(styles.currentPrice, { [styles.discountedPrice]: item.diskon > 0 })}>
                    Rp {finalPrice.toLocaleString('id-ID')}
                  </span>
                  {item.diskon > 0 && (
                    <>
                      <span className={styles.originalPrice}>
                        Rp {item.harga.toLocaleString('id-ID')}
                      </span>
                      <span className={styles.discountBadge}>-{item.diskon}%</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default ProductRecommendations;
