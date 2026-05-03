import { useRef } from 'react';
import clsx from 'clsx';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import styles from '@src/pages/components/homeSections/styles/homeSections.module.scss';

function HomeSections({ sections }) {
  const rootRef = useRef();

  if (!sections || sections.length === 0) {
    return null;
  }

  // Generate generic trainer placeholders for gym theme regardless of gym gear images
  const trainerImages = [
    "https://images.unsplash.com/photo-1567013127596-3e8e19e7a7da?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop"
  ];

  return (
    <div ref={rootRef} className={clsx(styles.root)}>
      <h2 className={styles.sectionTitle}>Our Trainers</h2>
      <div className={styles.imageGrid}>
        {trainerImages.map((image, index) => (
          <div key={index} className={styles.trainerCard}>
            <div className={styles.imageWrapper}>
              <img
                src={image}
                alt={`Trainer ${index + 1}`}
                className={styles.trainerImage}
              />
            </div>
            <div className={styles.infoBox}>
              <h3 className={styles.trainerName}>Trainer {index + 1}</h3>
              <p className={styles.trainerRole}>Fitness Coach</p>
              <div className={styles.socialIcons}>
                <Instagram size={18} />
                <Facebook size={18} />
                <Twitter size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeSections;
