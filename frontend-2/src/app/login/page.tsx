'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`, {
        username: formData.username,
        password: formData.password,
      });

      if (res.data?.token) {
        const campusTag = res.data.user?.campus_tag;
        if (campusTag) {
          router.push(`/hub/${campusTag}`);
        } else {
          router.push(`/setup-campus`);
        }
      }

      const token = res.data.token;
      localStorage.setItem('authToken', token);
      localStorage.setItem('username', formData.username); 

      router.push('/setup-profile');
      window.location.reload();
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleLogin} className={styles.card}>
        <h2 className={styles.title}>Log In</h2>

        {error && <p className={styles.error}>{error}</p>}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <button type="submit" className={styles.button}>Log In</button>
      </form>
    </div>
  );
}
