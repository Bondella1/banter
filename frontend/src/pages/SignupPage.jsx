import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styles from '../css/login.module.css'; 

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle form submit
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('auth/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Redirect to login after successful signup
      navigate('/login');
    } catch (err) {
      setError('Something went wrong. Please check your input.');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSignup} className={styles.card}>
        <h2 className={styles.title}>Create Account</h2>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

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
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
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

        <button type="submit" className={styles.button}>Sign Up</button>
      </form>
    </div>
  );
};

export default SignupPage;
