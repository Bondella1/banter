'use client';

import { useSearchParams } from "next/navigation";
import styles from './verifyemailsent.module.css';
import { useRouter } from "next/router";

export default function VerifyEmailSentPage() {
    const SearchParams = useSearchParams();
    const router = useRouter();
    const {email, campus} = router.query;

    return (
        <div className={styles.container}>
          <div className={styles.card}>
            <h2 className={styles.heading}>Verify Your Email</h2>
            <p className={styles.message}>
              Please check your inbox and click the link to verify your account.
            </p>
            {campus && <p>You are regisering with <strong>{campus}</strong>.</p>}
      
            {/* Example conditional rendering */}
            <p className={styles.success}>Email successfully verified ✅</p>
            <p className={styles.error}>Invalid or expired link ❌</p>
      
            {/* Optional Spinner */}
            <div className={styles.spinner}></div>
          </div>
        </div>
      );
}