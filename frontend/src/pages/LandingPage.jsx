import React from "react";
import { useNavigate } from 'react-router-dom';
import styles from '../css/landing.module.css';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>banter</h1>
                <p className={styles.subtitle}>buy. sell. banter.</p>
            </header>

            <div className={styles.buttonGroup}>
                <button 
                    className={`${styles.button} ${styles.primary}`} 
                    onClick={() => navigate('/listings')}
                >
                    Browse Listings
                </button>
                <button 
                    className={`${styles.button} ${styles.secondary}`} 
                    onClick={() => navigate('/login')}
                >
                    Login
                </button>
                <button 
                    className={`${styles.button} ${styles.secondary}`} 
                    onClick={() => navigate('/signup')}
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
};

export default LandingPage;