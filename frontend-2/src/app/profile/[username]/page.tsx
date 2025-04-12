'use client';

import { useEffect, useState, use } from 'react';
import axios from 'axios';
import styles from './profile.module.css';

export default function UserProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  console.log('Loaded profile for:', username)
  const [userInfo, setUserInfo] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, listingsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/?seller=${username}`)
        ]);
        setUserInfo(userRes.data);
        setListings(listingsRes.data);
      } catch (err) {
        console.error(err);
        setError('Could not load profile.');
      }
    };

    fetchData();
  }, [username]);

  if (error) return <p>{error}</p>;
  if (!userInfo) return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarSkeleton}></div>
        <div className={styles.userInfo}>
          <div className={styles.textSkeleton} style={{width: '150px'}}></div>
          <div className={styles.textSkeleton} style={{width: '100px'}}></div>
        </div>
      </div>

      <h2 className={styles.subheading}>Listings</h2>
      <div className={styles.grid}>
        {Array.from({length: 6}).map((_, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.imageSkeleton}></div>
            <div className={styles.textSkeleton} style={{width: '80%'}}></div>
            <div className={styles.textSkeleton} style={{width: '50%'}}></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <img src={userInfo.profile_image || '/default-avatar.jpg'} alt="avatar" className={styles.avatar} />
        <div className={styles.userInfo}>
          <h1 className={styles.username}>
            {userInfo.display_name || userInfo.username}
          </h1>
          {userInfo.bio && <p className={styles.bio}></p>}
        </div>
      </div>

      <h2 className={styles.subheading}>Listings</h2>
      <div className={styles.grid}>
        {listings.map(item => (
          <div key={item.id} className={styles.card}>
            <img src={item.image} alt={item.title} className={styles.itemImage} />
            <p className={styles.itemTitle}>{item.title}</p>
            <p className={styles.itemPrice}>${item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
