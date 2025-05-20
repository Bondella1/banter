'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import styles from './login.module.css';

const API = process.env.NEXT_PUBLIC_API_URL!;

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
      console.log("Login attempt with username:", formData.username);

      // 1) Call the JWT obtain endpoint (no "auth" prefix, no trailing slash)
      const { data } = await axios.post(
        `${API}/api/token`,
        {
          username: formData.username,
          password: formData.password,
        }
      );

      // 2) Store tokens under the keys your AxiosProvider looks for
      localStorage.setItem('accessToken',  data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('username', formData.username);

      // 3) Prime axios with the access token immediately
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
      window.dispatchEvent(new Event('auth-change'));

      // 4) Redirect the user (for example, to their profile setup)
      router.push('/setup-profile');
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

//if (res.data?.token) {
        //const campusTag = res.data.user?.campus_tag;
        //if (campusTag) {
          //router.push(`/hub/${campusTag}`);
        //} else {
          //router.push(`/setup-campus`);
        //}
      //}