'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CreditCard,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Check,
  Camera,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import styles from './settings.module.css';

interface UserSettings {
  username: string;
  email: string;
  phone?: string;
  display_name?: string;
  bio?: string;
  location?: string;
  profile_image?: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    showProfile: boolean;
    showActivity: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  
  const [settings, setSettings] = useState<UserSettings>({
    username: '',
    email: '',
    phone: '',
    display_name: '',
    bio: '',
    location: '',
    profile_image: '',
    notifications: {
      email: true,
      push: true,
      marketing: false
    },
    privacy: {
      showProfile: true,
      showActivity: true
    },
    theme: 'system',
    language: 'en'
  });

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      const username = localStorage.getItem('username');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/settings/`
      );
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = <K extends keyof UserSettings>(
    parent: K,
    field: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          profile_image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = async () => {
    try {
      setSaveStatus('saving');
      const username = localStorage.getItem('username');
      
      // If there's a new profile image, upload it first
      if (profileImageFile) {
        const formData = new FormData();
        formData.append('profile_image', profileImageFile);
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/profile-image/`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }
      
      // Save other settings
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/settings/`,
        settings
      );
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('idle');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    router.push('/login');
  };

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'language', label: 'Language & Region', icon: Globe },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <button 
          className={`${styles.saveButton} ${saveStatus === 'saved' ? styles.saved : ''}`}
          onClick={saveSettings}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' && <div className={styles.buttonSpinner}></div>}
          {saveStatus === 'saved' && <Check size={16} />}
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save Changes'}
        </button>
      </div>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`${styles.navItem} ${activeSection === item.id ? styles.active : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                <ChevronRight size={16} className={styles.chevron} />
              </button>
            ))}
          </nav>
          
          <button className={styles.logoutButton} onClick={handleLogout}>
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </aside>

        <main className={styles.main}>
          {activeSection === 'profile' && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Profile Information</h2>
              
              <div className={styles.profileImageSection}>
                <div className={styles.profileImageContainer}>
                  <img 
                    src={settings.profile_image || '/default-avatar.jpg'} 
                    alt="Profile" 
                    className={styles.profileImage}
                  />
                  <label className={styles.imageUploadLabel}>
                    <Camera size={20} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className={styles.hiddenInput}
                    />
                  </label>
                </div>
                <div className={styles.imageInfo}>
                  <h3>Profile Photo</h3>
                  <p>Upload a new photo to change your profile picture</p>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Username</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={settings.username}
                  disabled
                />
                <p className={styles.helpText}>Username cannot be changed</p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Display Name</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={settings.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="Enter your display name"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Mail size={16} />
                  Email
                </label>
                <input 
                  type="email" 
                  className={styles.input} 
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Phone size={16} />
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  className={styles.input} 
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <MapPin size={16} />
                  Location
                </label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={settings.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, Country"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Bio</label>
                <textarea 
                  className={styles.textarea} 
                  value={settings.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>
            </section>
          )}

          {activeSection === 'notifications' && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Notification Preferences</h2>
              
              <div className={styles.toggleGroup}>
                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <h3>Email Notifications</h3>
                    <p>Receive notifications via email</p>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={settings.notifications.email}
                      onChange={(e) => handleNestedChange('notifications', 'email', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <h3>Push Notifications</h3>
                    <p>Receive push notifications on your devices</p>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={settings.notifications.push}
                      onChange={(e) => handleNestedChange('notifications', 'push', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <h3>Marketing Emails</h3>
                    <p>Receive updates about new features and offers</p>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={settings.notifications.marketing}
                      onChange={(e) => handleNestedChange('notifications', 'marketing', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'privacy' && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Privacy & Security</h2>
              
              <div className={styles.toggleGroup}>
                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <h3>Public Profile</h3>
                    <p>Make your profile visible to other users</p>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={settings.privacy.showProfile}
                      onChange={(e) => handleNestedChange('privacy', 'showProfile', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <h3>Show Activity</h3>
                    <p>Display your recent activity on your profile</p>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={settings.privacy.showActivity}
                      onChange={(e) => handleNestedChange('privacy', 'showActivity', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.dangerZone}>
                <h3 className={styles.dangerTitle}>Danger Zone</h3>
                <div className={styles.dangerItem}>
                  <div>
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and all associated data</p>
                  </div>
                  <button className={styles.dangerButton}>Delete Account</button>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'appearance' && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Appearance</h2>
              
              <div className={styles.themeSelector}>
                <h3>Theme</h3>
                <div className={styles.themeOptions}>
                  <label className={`${styles.themeOption} ${settings.theme === 'light' ? styles.selected : ''}`}>
                    <input 
                      type="radio" 
                      name="theme" 
                      value="light"
                      checked={settings.theme === 'light'}
                      onChange={(e) => handleInputChange('theme', e.target.value)}
                    />
                    <Sun size={20} />
                    <span>Light</span>
                  </label>
                  
                  <label className={`${styles.themeOption} ${settings.theme === 'dark' ? styles.selected : ''}`}>
                    <input 
                      type="radio" 
                      name="theme" 
                      value="dark"
                      checked={settings.theme === 'dark'}
                      onChange={(e) => handleInputChange('theme', e.target.value)}
                    />
                    <Moon size={20} />
                    <span>Dark</span>
                  </label>
                  
                  <label className={`${styles.themeOption} ${settings.theme === 'system' ? styles.selected : ''}`}>
                    <input 
                      type="radio" 
                      name="theme" 
                      value="system"
                      checked={settings.theme === 'system'}
                      onChange={(e) => handleInputChange('theme', e.target.value)}
                    />
                    <Globe size={20} />
                    <span>System</span>
                  </label>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'language' && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Language & Region</h2>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Language</label>
                <select 
                  className={styles.select}
                  value={settings.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
            </section>
          )}

          {activeSection === 'billing' && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Billing & Subscription</h2>
              
              <div className={styles.billingInfo}>
                <div className={styles.planCard}>
                  <h3>Current Plan</h3>
                  <div className={styles.planDetails}>
                    <h4>Free Plan</h4>
                    <p>Basic features with limited storage</p>
                  </div>
                  <button className={styles.upgradeButton}>Upgrade to Pro</button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}