'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './header.module.css';
import { useCallback, useEffect, useState } from 'react';
import { ShoppingBag, User, Heart } from 'lucide-react';
import dynamic from 'next/dynamic';

const rotwords = ['listings', 'users', 'trends', 'styles'];
const Dropmenu = dynamic(() =>import('./Dropmenu'), {ssr:false});

export default function Header() {
  const [typedText, setTypedText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  //typewriter effect
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
  
  //Auth check
  useEffect(() => {
    console.log("All localStorage keys:", Object.keys(localStorage));

    const checkAuthStatus = () => {
      const token = localStorage.getItem('accessToken');
      const storedUsername = localStorage.getItem('username');
      setIsAuthenticated(!!token);
      setUsername(storedUsername);
    };
    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);
    window.addEventListener('auth-change', checkAuthStatus);

    return() => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('auth-change', checkAuthStatus);
    };
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  }, [router]);

  const handleProfileClick = useCallback(()=> {
    if (username) {
      router.push(`/profile/${username}`);
    } else {
      console.error('No username available for nav');
      router.push('/login');
    }
  }, [router, username]);

  const handleLogoClick = useCallback(() => {
    router.push(isAuthenticated? '/listings': '/');
  }, [router, isAuthenticated]);

  const handleCartClick = useCallback(() => {
    router.push('/cart');
  }, [router]);

  const handleFaveClick = useCallback(() => {
    router.push('/favorites');
  }, [router]);

  return (
    <header className={styles.header} role="banner">
      <div
        className={styles.left}
        onClick={handleLogoClick}
        role='button'
        tabIndex={0}
        aria-label='go home'
      >
        <span className={styles.logo}>bart<span className={styles.logoDigit}>3</span>r</span>
      </div>
      {/*search bar*/}
      <form className={styles.searchbar} onSubmit={(e) => e.preventDefault()} role='search' aria-label='search listings'>
        <input
          type='text'
          placeholder={`Search ${typedText}|...`}
          className={styles.searchInput}
        />
        <button type='submit' className={styles.searchbutton}>Search</button>
      </form>
      {/*navbar*/}
      <div className={styles.right}>
        {isAuthenticated ? (
          <nav className={styles.navMenu}>
            <button 
              className={styles.iconButton}
              onClick={handleFaveClick}>
                <Heart size={24}/>
              </button>
              <button
                className={styles.iconButton}
                onClick={handleCartClick}>
                  <ShoppingBag size={24}/>
                </button>
            <button 
              className={styles.iconButton} 
              onClick={handleProfileClick}
              aria-label="Go to your profile"
            >
              <User size={24}/>
            </button>
            <Dropmenu username={username} handleLogout={handleLogout} />
          </nav>
        ) : (
          <>
            <Link href="/login" className={styles.link}>
              Login
            </Link>
            <Link href="/signup" className={styles.link}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}