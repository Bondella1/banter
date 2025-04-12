'use client';

import { useSearchParams } from "next/navigation";
import styles from './verifyemailsent.module.css';

export default function VerifyEmailSentPage() {
    const SearchParams = useSearchParams();
    const email = SearchParams.get('email');

    return (
        <div className={styles.container}>
          <div className={styles.card}>
            <h2 className={styles.heading}>Verify Your Email</h2>
            <p className={styles.message}>
              Please check your inbox and click the link to verify your account.
            </p>
      
            {/* Example conditional rendering */}
            <p className={styles.success}>Email successfully verified ✅</p>
            <p className={styles.error}>Invalid or expired link ❌</p>
      
            {/* Optional Spinner */}
            <div className={styles.spinner}></div>
          </div>
        </div>
      );
}