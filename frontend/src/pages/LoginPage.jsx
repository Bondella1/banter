import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styles from '../css/login.module.css'; // 👈 CSS Module import

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('auth/login/', {
        username,
        password
      });

      const token = response.data.token;
      localStorage.setItem('authToken', token);
      navigate('/listings');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleLogin} className={styles.card}>
        <h2 className={styles.title}>Login</h2>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          className={styles.input}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          className={styles.input}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className={styles.button}>Login</button>

        <p className='text-sm text-center text-gray-500 mt-6'>
            Don't have an acount?{" "}
            <span 
                className='text-indigo-600 cursor-pointer hover:underline'
                onClick={() => navigate('/signup')}>
                    Sign up
                </span>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
