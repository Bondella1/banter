'use client';

import { useRouter } from 'next/navigation';
import styles from './header.module.css';
import { useEffect, useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    setIsAuthenticated(!!token);
    setUsername(storedUsername);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    router.push('/');
    window.location.reload(); // Refresh to update UI
  };

  return (
    <header className={styles.header}>
      <div
        className={styles.left}
        onClick={() => router.push(isAuthenticated ? '/listings' : '/')}
      >
        <span className={styles.logo}>banter</span>
      </div>

      <div className={styles.right}>
        {isAuthenticated ? (
          <div className={styles.authContainer}>
            {username && (
              <button
                className={styles.link}
                onClick={() => router.push(`/profile/${username}`)}
              >
                {username}
              </button>
            )}
            <button className={styles.link} onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <>
            <button className={styles.link} onClick={() => router.push('/login')}>
              Login
            </button>
            <button className={styles.link} onClick={() => router.push('/signup')}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
}