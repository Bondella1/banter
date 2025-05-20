'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './setupprofile.module.css';

export default function SetupProfile() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  //Fetch profile info on load
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('No access token found, redirecting to login');
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { display_name, bio } = res.data;
        setFormData({
          displayName: display_name || '',
          bio: bio || '',
        });
      } catch (err) {
        console.error('Failed to load profile', err);

        if (axios.isAxiosError(err) && err.response?.status === 401) {
          console.log('Token invalid or expired, redirecting to login');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.push('/login');
          return;
        }

        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');

      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile/`, {
        display_name: formData.displayName,
        bio: formData.bio,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('Profile updated!');
      router.push('/listings');
    } catch (err: any) {
      console.error('Failed to update profile', err);

      if (axios.isAxiosError(err) && err.response?. status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
        return;
      }
      
      setError('Something went wrong. Please try again.');
    }
  };

  if (loading) return <p className={styles.loading}>Loading profile...</p>;

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.card}>
        <h2 className={styles.title}>Complete Your Profile</h2>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <input
          type="text"
          name="displayName"
          placeholder="Display Name"
          value={formData.displayName}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <textarea
          name="bio"
          placeholder="A little about you..."
          value={formData.bio}
          onChange={handleChange}
          className={styles.input}
        />

        <button type="submit" className={styles.button}>Save Profile</button>
      </form>
    </div>
  );
}
