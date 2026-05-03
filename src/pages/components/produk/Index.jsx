import { useRouter } from 'next/router';
import { Check } from 'lucide-react';
import clsx from 'clsx';
import styles from '@src/pages/components/produk/styles/produk.module.scss';

function Produk({ paketPromo = [] }) {
  const router = useRouter();
  
  if (!paketPromo || paketPromo.length === 0) {
    return null;
  }
  
  return (
    <section className={clsx(styles.root)}>
      <h2 className={styles.sectionTitle}>Paket Promo</h2>
      <div className={styles.productGrid}>
        {paketPromo.map((pkg) => (
          <div key={pkg.id} className={styles.pricingCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.packageName}>{pkg.name}</h3>
              <p className={styles.packageDesc}>{pkg.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.'}</p>
            </div>
            
            <ul className={styles.featuresList}>
              {pkg.features && pkg.features.map((feature, idx) => (
                <li key={idx}><div className={styles.iconBox}><Check size={14} /></div> {feature}</li>
              ))}
            </ul>
            
            <div className={styles.priceContainer}>
              <span className={styles.currency}>Rp</span>
              <span className={styles.price}>{pkg.price.toLocaleString('id-ID')}</span>
              <span className={styles.period}>{pkg.billingCycle}</span>
            </div>
            <p className={styles.priceNote}>Bill will be charged {pkg.billingCycle === '/day' ? 'daily' : pkg.billingCycle === '/month' ? 'monthly' : 'yearly'}, taxes incl.</p>
            
            <button className={styles.getStartedBtn} onClick={() => router.push(`/paket-promo/${pkg.id}`)}>
              GET STARTED
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Produk;
