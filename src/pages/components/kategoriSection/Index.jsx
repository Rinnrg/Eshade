import Link from 'next/link';
import Image from 'next/image';
import styles from './styles/kategoriSection.module.scss';

export default function KategoriSection({ categories = [] }) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className={styles.root}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>Kategori</h2>
        </div>

        <div className={styles.grid}>
          {categories.map((cat) => (
            <Link key={cat.name} href={`/produk?kategori=${encodeURIComponent(cat.name)}`} className={styles.card}>
              <div className={styles.imageContainer}>
                {cat.thumbnail ? (
                  <Image
                    src={cat.thumbnail}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.placeholder} />
                )}
                <div className={styles.overlay}>
                  <h3 className={styles.categoryName}>{cat.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
