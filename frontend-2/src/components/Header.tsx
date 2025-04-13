'use client';

import { useRouter } from 'next/navigation';
import styles from './header.module.css';
import { useEffect, useState } from 'react';

const rotwords = ['listings', 'users', 'trends', 'styles'];

export default function Header() {
  const [typedText, setTypedText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const currWord = rotwords[wordIndex];

    if (charIndex <= currWord.length) {
      const typing = setTimeout(() => {
        setTypedText(currWord.slice(0, charIndex));
        setCharIndex(charIndex + 1);
      }, 100);
      return () => clearTimeout(typing);
    } else {
      const hold = setTimeout(() => {
        setCharIndex(0);
        setWordIndex((wordIndex + 1) % rotwords.length);
      }, 1200);
      return () => clearTimeout(hold);
    }
  }, [charIndex, wordIndex]); 
  
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

      <form className={styles.searchbar} onSubmit={(e) => e.preventDefault()}>
        <input
          type='text'
          placeholder={`Search ${typedText}|...`}
          className={styles.searchInput}
        />
        <button type='submit' className={styles.searchbutton}>Search</button>
      </form>

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
