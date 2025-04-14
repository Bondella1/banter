// app/components/Footer.tsx
'use client';

import styles from './footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} bant3er. All rights reserved.</p>
    </footer>
  );
}
