'use client';

import { useEffect, useState, use, useRef } from 'react';
import axios from 'axios';
import { Star, Mail, MapPin, Share, Camera, Edit, Settings } from 'lucide-react';
import styles from './profile.module.css';

export default function UserProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('listings');
  const [isOwner, setIsOwner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, listingsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/?seller=${username}`)
        ]);
        setUserInfo(userRes.data);
        setListings(listingsRes.data);
        const currentUser = localStorage.getItem('username');
        setIsOwner(currentUser === username);
      } catch (err) {
        setError('Could not load profile.');
      }
    };
    fetchData();
  }, [username]);

  const handleProfileImageClick = () => {
    if (isOwner && fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append('profile_image', e.target.files[0]);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/profile-image/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setUserInfo({ ...userInfo, profile_image: res.data.profile_image });
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  if (error) return <p className={styles.errorMessage}>{error}</p>;
  if (!userInfo) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.coverImage} />
        <div className={styles.profileHeader}>
          <div className={`${styles.profileImageWrapper} ${isOwner ? styles.profileImageOwner : ''}`} onClick={handleProfileImageClick}>
            <img src={userInfo.profile_image || '/default-avatar.jpg'} alt="Profile" className={styles.profileImage} />
            {isOwner && (
              <div className={styles.cameraIcon}>
                <Camera size={20} />
              </div>
            )}
            <input type="file" ref={fileInputRef} className={styles.hiddenInput} onChange={handleImageChange} />
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.profileMeta}>
              <div>
                <h1 className={styles.profileName}>{userInfo.display_name || userInfo.username}</h1>
                {userInfo.location && (
                  <div className={styles.location}>
                    <MapPin size={16} className={styles.icon} />
                    <span>{userInfo.location}</span>
                  </div>
                )}
              </div>
              <div className={styles.profileActions}>
                {isOwner ? (
                  <>
                    <button className={styles.editButton}><Edit size={16} /> Edit</button>
                    <button className={styles.settingsButton}><Settings size={16} /></button>
                  </>
                ) : (
                  <>
                    <button className={styles.messageButton}><Mail size={16} /> Message</button>
                    <button className={styles.shareButton}><Share size={16} /></button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{listings.length}</div>
            <div className={styles.statLabel}>Listings</div>
          </div>
          <div className={`${styles.statItem} ${styles.statItemBorder}`}>
            <div className={styles.statValue}>{userInfo.sales_count || 0}</div>
            <div className={styles.statLabel}>Sales</div>
          </div>
        </div>
      </div>

      <div className={styles.tabContainer}>
        <div className={styles.tabNav}>
          <button className={`${styles.tabButton} ${activeTab === 'listings' ? styles.tabButtonActive : ''}`} onClick={() => setActiveTab('listings')}>Listings</button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'listings' && (
            <div className={styles.listingsContainer}>
              <div className={styles.listingsHeader}>
                <h2 className={styles.sectionTitle}>Active Listings ({listings.length})</h2>
              </div>

              <div>
                {listings.map(item => (
                  <div key={item.id}>
                    <p>{item.title}</p>
                    <p>${item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}