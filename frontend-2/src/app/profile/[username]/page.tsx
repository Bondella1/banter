'use client';

import React, { useEffect, useState, use, useRef } from 'react';
import axios from 'axios';
import { Star, Mail, MapPin, Share, Camera, Edit, Settings } from 'lucide-react';
import styles from './profile.module.css';

export default function UserProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('listings');
  const [isOwner, setIsOwner] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const listingImageInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setisModalOpen] = useState(false);
  const [listingTitle, setListingTitle] = useState('');
  const [listingDesc, setListingDesc] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [listingImage, setListingImage] = useState<File |null>(null);

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
        setPurchases([]);

      } catch (err) {
        setError('Could not load profile.');
      }
    };
    fetchData();
  }, [username]);
  
  const handleProfileImageClick = () => {
    if (isOwner && profileImageInputRef.current) profileImageInputRef.current.click();
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
  
  //start of modal
  const handleListingUploadClick = () => {
    if (isOwner) setisModalOpen(true);
  };

  const handleListingImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setListingImage(e.target.files[0]);
  };

  const handleSubmitListing = async() => {
    if (!listingTitle || !listingDesc || !listingPrice || !listingImage) {
      console.error("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append('listing_image', listingImage);
    formData.append('title', listingTitle);
    formData.append('description', listingDesc);
    formData.append('price', listingPrice);

    try{
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${username}/upload/`,
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}}
      );
      setListings([...listings, res.data]);
      //reset form fields
      setListingTitle('');
      setListingDesc('');
      setListingPrice('');
      setListingImage(null);
      setisModalOpen(false);

    } catch (err) {
      console.error('Upload failed:', err)
    }
  };

  const closeModal = ()=> {
    setisModalOpen(false);
  };

  if (error) return <p className={styles.errorMessage}>{error}</p>;
  if (!userInfo) {
    return(
      <div className={styles.skeletonWrapper}>
        <div className={styles.skeletonCover}></div>
        <div className={styles.skeletonProfile}>
          <div className={styles.skeletonAvatar}></div>
          <div className={styles.skeletonText}></div>
          <div className={styles.skeletonTextSmall}></div>
        </div>
        <div className={styles.skeletonGrid}>
          {Array.from({length:6}).map((_, i) => (
            <div key={i} className={styles.skeletonCard}></div>
          ))}
        </div>
      </div>
    )
  };

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
            <input type="file" ref={profileImageInputRef} className={styles.hiddenInput} onChange={handleImageChange} accept="image/*" />
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
          <button className={`${styles.tabButton} ${activeTab === 'purchases' ? styles.tabButtonActive : ''}`} onClick={() => setActiveTab('purchases')}>Purchases</button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'listings' && (
            <div className={styles.listingsContainer}>
              <div className={styles.listingsHeader}>
                <h2 className={styles.sectionTitle}>Active Listings ({listings.length})</h2>
                {isOwner && (
                  <button className={styles.uploadButton} onClick={handleListingUploadClick}>
                    Upload New Listing
                  </button>
                )}
              </div>

              <div className={styles.listingsGrid}>
                {listings.length > 0 ?(
                  listings.map(item => (
                    <div key={item.id} className={styles.listingCard}>
                      {item.image && (
                        <div className={styles.listingImageContainer}>
                          <img src={item.image} alt={item.title} className={styles.listingImage}/>
                        </div>
                      )}
                      <div className={styles.listingDetails}>
                        <h3 className={styles.listingTitle}>{item.title}</h3>
                        <p className={styles.listingPrice}>${item.price}</p>
                      </div>
                    </div>
                  ))
                ):(
                  <p className={styles.emptyMessage}>No listings available</p>
                )}
              </div>
            </div>
          )}
          {activeTab === 'purchases' && (
            <div className={styles.purchasesContainer}>
              <h2 className={styles.sectionTitle}>My Purchases ({purchases.length})</h2>
              <div className={styles.purchasesGrid}>
                {purchases.length > 0? (
                  purchases.map(item => (
                    <div key={item.id} className={styles.purchaseCard}>
                      {item.listing.image && (
                        <div className={styles.purchaseImageContainer}>
                          <img src={item.listing.image} alt={item.listing.title} className={styles.purchaseImage}/>
                        </div>
                      )}
                      <div className={styles.purchaseDetails}>
                        <h3 className={styles.purchaseTitle}>{item.listing.title}</h3>
                        <p className={styles.purchasePrice}>${item.listing.price}</p>
                        <p className={styles.purchaseDate}>Purchased  on {new Date(item.purchase_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ):(
                  <p className={styles.emptyMessage}>No purchase history</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/*New listing modal*/}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Create New Listing</h2>
              <button className={styles.closeButton} onClick={closeModal}>x</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label htmlFor="listingTitle">Title</label>
                <input
                type="text"
                id="listingTitle"
                value={listingTitle}
                onChange={(e) => setListingTitle(e.target.value)}
                className={styles.formInput}/>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="listingDesc">Desciption</label>
                <textarea
                id="listingdesc"
                value={listingDesc}
                onChange={(e) => setListingDesc(e.target.value)}
                className={styles.formTextarea}></textarea>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="listingPrice">Price ($)</label>
                <input
                type="number"
                id="listingPrice"
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
                className={styles.formInput}/>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="listingImage">Image</label>
                <div className={styles.fileInputWrapper}>
                  <button
                  type="button"
                  className={styles.fileSelectButton}
                  onClick={() => listingImageInputRef.current?.click()}>
                    Select Image
                  </button>
                  <span className={styles.fileName}>
                    {listingImage? listingImage.name:'No file selected'}
                  </span>
                </div>
                <input 
                type="file"
                id="listingImage"
                ref={listingImageInputRef}
                className={styles.hiddenInput}
                onChange={handleListingImageChange}
                accept="image/*"/>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={closeModal}>Cancel</button>
              <button className={styles.submitButton} onClick={handleSubmitListing}>Create Listing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}