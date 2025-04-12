'use client';

import { useEffect, useState } from "react";
import type { JSX } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import styles from './verifyemail.module.css';

interface VerifyEmailPageProps {
    params: {
        uidb64: string;
        token: string;
    };
}

type VerificationStatus = 'loading' | 'success' | 'error' | 'idle' | 'resend';

export default function VerifyEmailPage({ params }: VerifyEmailPageProps): JSX.Element {
    const { uidb64, token } = useParams() as {uidb64:string; token:string};
    const router = useRouter();
    const [status, setStatus] = useState<VerificationStatus>('loading');
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState(3); 
    const [FormData, setFormData] = useState ({
        email: '',
    });

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email/${uidb64}/${token}/`
                );
                
                if (res.data.token) {
                    localStorage.setItem('authToken', res.data.token);
                }

                setStatus('success');
                setMessage(res.data.message || 'Email successfully verified!');
            } catch (err: any) {
                console.error('Verification error:', err);
                setStatus('error');
                setMessage(
                    err?.response?.data?.error || 
                    'The verification link is invalid or has expired. Please request a new one.'
                );
            }
        };

        verifyEmail();
    }, [uidb64, token]);

    // Countdown and redirect on success
    useEffect(() => {
        if (status === 'success') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        router.push('/profile');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [status, router]);

    const handleResend = async () => {
        setStatus('loading');
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification/`, {
                email: FormData.email
            });
            setStatus('success');
            setMessage('New verification link sent! Check your email.');
        } catch (err: any) {
            setStatus('error');
            setMessage(
                err?.response?.data?.error || 
                'Failed to resend verification email. Please try again later.'
            );
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.heading}>Email Verification</h2>
                
                {status === 'loading' && (
                    <>
                        <p className={styles.message}>Verifying your email address...</p>
                        <div className={styles.spinner}></div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <p className={styles.success}>{message} ✅</p>
                        <p className={styles.message}>
                            Redirecting to profile in {countdown} second{countdown !== 1 ? 's' : ''}...
                        </p>
                        <button 
                            onClick={() => router.push('/profile')}
                            className={styles.button}
                        >
                            Go to Profile Now
                        </button>
                    </>
                )}

                {(status === 'error' || status === 'resend' || status === 'idle' || status === 'loading') && (
                    <>
                        <p className={styles.error}>{message} ❌</p>
                        <div className={styles.actions}>
                            <button 
                                onClick={handleResend}
                                className={styles.button}
                                disabled={status === 'loading' || status ==='resend'}
                            >
                                Resend Verification Email
                            </button>
                            <button 
                                onClick={() => router.push('/login')}
                                className={`${styles.button} ${styles.secondary}`}
                            >
                                Back to Login
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}