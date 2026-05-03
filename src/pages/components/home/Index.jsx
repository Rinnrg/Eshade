import { useRef } from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import styles from '@src/pages/components/home/styles/home.module.scss';
import { useIsomorphicLayoutEffect } from '@src/hooks/useIsomorphicLayoutEffect';

function Home() {
  const rootRef = useRef();
  const router = useRouter();

  return (
    <section ref={rootRef} className={clsx(styles.root)}>
      <div className={styles.container}>
        <div className={styles.leftCol}>
          <h1 className={styles.title}>
            Commit to your body & Care your Gym
          </h1>
          <p className={styles.subtitle}>
            Koleksi gym premium yang dirancang untuk mendukung gaya hidup sehat Anda dengan kenyamanan maksimal.
          </p>
          <button type="button" className={styles.primaryButton} onClick={() => router.push('/produk')}>
            SHOP NOW
          </button>

          {/* <div className={styles.sponsors}>
            <div className={styles.sponsorItem}>ULTRA<br/>★★★★★</div>
            <div className={styles.sponsorItem}>POWER<br/>MODULE</div>
            <div className={styles.sponsorItem}>LOGO</div>
            <div className={styles.sponsorItem}>logoIpsum</div>
          </div> */}
        </div>

        <div className={styles.rightCol}>
          <div className={styles.imageArchWrapper}>
            <img
              src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop"
              alt="Gym Man"
              className={styles.heroImage}
            />
            {/* <div className={styles.playButtonWrapper}>
              <div className={styles.circularText}></div>
              <button className={styles.playButton} aria-label="Play Intro">
                <span className={styles.playIcon}>▶</span>
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
