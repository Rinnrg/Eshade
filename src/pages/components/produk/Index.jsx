import { useRouter } from 'next/router';
import { Check } from 'lucide-react';
import clsx from 'clsx';
import styles from '@src/pages/components/produk/styles/produk.module.scss';

function Produk({ produk = [] }) {
  const router = useRouter();
  
  // Create 3 placeholder packages for the Gym theme
  const packages = [
    { id: 'daily', name: 'Daily Package', price: 10, period: 'day' },
    { id: 'monthly', name: 'Monthly Package', price: 100, period: 'month' },
    { id: 'annual', name: 'Annual Package', price: 1000, period: 'year' }
  ];
  
  return (
    <section className={clsx(styles.root)}>
      <h2 className={styles.sectionTitle}>Our Packages</h2>
      <div className={styles.productGrid}>
        {packages.map((pkg, idx) => (
          <div key={pkg.id} className={styles.pricingCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.packageName}>{pkg.name}</h3>
              <p className={styles.packageDesc}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.</p>
            </div>
            
            <ul className={styles.featuresList}>
              <li><div className={styles.iconBox}><Check size={14} /></div> All instrument access</li>
              <li><div className={styles.iconBox}><Check size={14} /></div> Shower facility</li>
              <li><div className={styles.iconBox}><Check size={14} /></div> Nutrition Plan</li>
              <li><div className={styles.iconBox}><Check size={14} /></div> Personal locker</li>
              <li><div className={styles.iconBox}><Check size={14} /></div> Personal trainer</li>
            </ul>
            
            <div className={styles.priceContainer}>
              <span className={styles.currency}>$</span>
              <span className={styles.price}>{pkg.price}</span>
              <span className={styles.period}>/{pkg.period}</span>
            </div>
            <p className={styles.priceNote}>Bill will be charged {pkg.period}ly, taxes incl.</p>
            
            <button className={styles.getStartedBtn} onClick={() => router.push('/produk')}>
              GET STARTED
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Produk;
