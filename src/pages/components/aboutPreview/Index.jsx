import { useRef } from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import styles from '@src/pages/components/aboutPreview/styles/aboutPreview.module.scss';

function AboutPreview() {
  const rootRef = useRef();
  const router = useRouter();

  return (
    <section ref={rootRef} className={clsx(styles.root)}>
      <div className={styles.container}>
        <div className={styles.leftCol}>
          <div className={styles.imageBox}>
            <img 
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop" 
              alt="About Eshade" 
              className={styles.image}
            />
          </div>
        </div>
        <div className={styles.rightCol}>
          <h2 className={styles.title}>Tentang Eshade.id</h2>
          <h3 className={styles.subtitle}>Selamat datang di www.eshade.id. Nikmati kemudahan berbelanja bersama kami.</h3>
          <p className={styles.desc}>
            Kami dengan senang hati melayani Anda dalam memenuhi kebutuhan fashion berkualitas. Nikmati kemudahan memilih koleksi terbaik kami secara langsung tanpa perantara.
          </p>
          <button className={styles.readMoreBtn} onClick={() => router.push('/about')}>
            BACA SELENGKAPNYA
          </button>
        </div>
      </div>
    </section>
  );
}

export default AboutPreview;
