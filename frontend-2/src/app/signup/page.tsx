'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios'; 
import styles from './signup.module.css';
import { FaEye, FaRegEyeSlash } from "react-icons/fa";

const passwordRules = [
  {label: 'At least 8 characters', test: (p:string) => p.length >= 8},
  {label: '1 uppercase letter (A-Z)', test: (p: string) => /[A-Z]/.test(p)},
  {label:  '1 lowercase letter (a-z', test: (p:string) => /[a-z]/.test(p)},
  {label: '1 number (0-9)', test: (p: string) => /\d/.test(p)},
  {label: '1 special character (!@#$...', test: (p:string) => /[\W_]/.test(p)},
]

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [isEduEmail, setIsEduEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const[showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'email') {
      setIsEduEmail(value.trim().toLowerCase().endsWith('.edu'));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!strongPasswordRegex.test(formData.password)) {
      setError(
        'Password must be at least 8 charatcers and include uppercase, lowercase, number and special characters.'
      );
      return;
    }

    if (formData.password !== formData.password2) {
      setError('Passwords do not match.');
      return;
    }

    const email = formData.email.trim().toLowerCase();
    if (!email.endsWith('.edu')) {
      setError('Only .edu email addresses are allowed.');
      return;
    }

    try {
      const res = await axios.post(`{$process.env.NEXT_PUBLIC_API_URL}/api/auth/regiser`, formData);
      const campusName = res.data.campus
      router.push(`/verify-email-sent?email=${encodeURIComponent(campusName || '')}`);

    } catch (err: any) {
      console.error('Signup error:', err);

      let message = 'Something went wrong. Please check your input.';
      if (err.response) {
        if (err.response.data.detail) {
          message = err.response.data.detail;
        } else if (err.response.data.message) {
          message = err.response.data.message;
        } else if (err.response.data) {
          message = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSignup} className={styles.card}>
        <h2 className={styles.title}>Create Account</h2>

        {error && <div className={styles.error}>{error}</div>}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className={styles.input}
          required
          minLength={3}
        />

        <div className={styles.emailContainer}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
          />
          {isEduEmail && (
            <span className={styles.checkmark} title="Valid .edu email">
              ✓
            </span>
          )}
        </div>
        <p className={styles.eduNote}>Please use a <strong>.edu</strong> email to sign up.</p>

        <div className={styles.passwordwrap}>
        <input
          type={showPassword? 'text': 'password'}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className={styles.input}
          required
          minLength={6}
        />
        <span
        className={styles.eyeIcon}
        onClick={() => setShowPassword(prev=>!prev)}
        role="button"
        title={showPassword?'Hide password':'Show Password'}>
          {showPassword?<FaRegEyeSlash/>:<FaEye/>}
        </span>
        </div>

        <div className={styles.passwordwrap}>
        <input
          type={showConfirmPassword? 'text': 'password'}
          name="password2"
          placeholder="Confirm Password"
          value={formData.password2}
          onChange={handleChange}
          className={styles.input}
          required
          minLength={6}
        />
        <span
        className={styles.eyeIcon}
        onClick={() => setShowConfirmPassword(prev=>!prev)}
        role="button"
        title={showConfirmPassword?'Hide password':'Show Password'}>
          {showConfirmPassword?<FaRegEyeSlash/>:<FaEye/>}
        </span>
        </div>

        <div className={styles.passwordChecklist}>
          {passwordRules.map((rule, index) => {
            const passed = rule.test(formData.password);
            return (
              <div key={index} className={passed ? styles.rulePass : styles.ruleFail}>
                {passed ? '✅':'❌'} {rule.label}
              </div>
            );
          })}
        </div>

        <button type="submit" className={styles.button}>
          Create an account
        </button>
      </form>
    </div>
  );
}