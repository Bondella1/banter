import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/header.module.css';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.left} onClick={() => navigate('/')}>
        <span className={styles.logo}>banter</span>
      </div>
      <div className={styles.right}>
        <button className={styles.link} onClick={() => navigate('/login')}>
          Login
        </button>
        <button className={styles.link} onClick={() => navigate('/signup')}>
          Sign Up
        </button>
      </div>
    </header>
  );
};

export default Header;
