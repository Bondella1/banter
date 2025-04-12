'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>banter</h1>
        <p className={styles.subtitle}>buy. sell. banter.</p>
      </header>

      <div className={styles.buttonGroup}>
        <button 
          className={`${styles.button} ${styles.primary}`} 
          onClick={() => router.push('/listings')}
        >
          Browse Listings
        </button>
        <button 
          className={`${styles.button} ${styles.secondary}`} 
          onClick={() => router.push('/login')}
        >
          Login
        </button>
        <button 
          className={`${styles.button} ${styles.secondary}`} 
          onClick={() => router.push('/signup')}
        >
          Get Started!
        </button>
      </div>
    </div>
  );
}
