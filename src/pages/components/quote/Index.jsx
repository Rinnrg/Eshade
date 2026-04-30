import { useRef } from 'react';
import clsx from 'clsx';
import { Shield, Sparkles, Award, Cloud, Tag, CheckCircle } from 'lucide-react';
import styles from '@src/pages/components/quote/styles/quote.module.scss';

const advantages = [
  { id: 1, title: 'Bahan Kokoh', icon: <Shield size={24} />, desc: 'Menggunakan material pilihan berkualitas tinggi yang menjamin kekuatan dan ketahanan produk.' },
  { id: 2, title: 'Desain Modern', icon: <Sparkles size={24} />, desc: 'Tampilan minimalis dan modern yang dirancang untuk mendukung performa serta gaya Anda.' },
  { id: 3, title: 'Kualitas Premium', icon: <Award size={24} />, desc: 'Standar kontrol kualitas tinggi untuk memastikan setiap detail produk sempurna.' },
  { id: 4, title: 'Nyaman Digunakan', icon: <Cloud size={24} />, desc: 'Bahan yang lembut di kulit dan fleksibel, memberikan kenyamanan maksimal saat bergerak.' },
  { id: 5, title: 'Harga Kompetitif', icon: <Tag size={24} />, desc: 'Penawaran harga terbaik untuk kualitas produk yang tidak perlu diragukan lagi.' },
  { id: 6, title: 'Garansi Produk', icon: <CheckCircle size={24} />, desc: 'Jaminan kualitas dengan layanan pelanggan yang responsif untuk kenyamanan berbelanja Anda.' },
];

function Quote() {
  const rootRef = useRef();

  return (
    <section ref={rootRef} className={clsx(styles.root)}>
      <h2 className={styles.sectionTitle}>Keunggulan Produk</h2>
      <div className={styles.grid}>
        {advantages.map(advantage => (
          <div key={advantage.id} className={styles.card}>
            <div className={styles.iconWrapper}>
              <div className={styles.iconInner}>{advantage.icon}</div>
            </div>
            <h3 className={styles.title}>{advantage.title}</h3>
            <p className={styles.desc}>{advantage.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Quote;

