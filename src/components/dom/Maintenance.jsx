import React from 'react';
import styles from './Maintenance.module.scss';
import { useRouter } from 'next/router';

export default function Maintenance({ message = 'halaman ini sedang dalam perbaikan' }) {
  const router = useRouter();

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <h1 className={styles.title}>{message}</h1>
        <p className={styles.desc}>Mohon maaf atas ketidaknyamanan ini. Silakan kembali nanti.</p>

        <div className={styles.actions}>
          <button type="button" className={styles.btnPrimary} onClick={() => router.back()}>Kembali</button>
        </div>
      </div>
    </div>
  );
}
