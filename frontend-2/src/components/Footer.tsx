// app/components/Footer.tsx
'use client';

import styles from './footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} YourMarketplace. All rights reserved.</p>
    </footer>
  );
}
