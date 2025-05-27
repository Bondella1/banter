'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { MapPin, Camera} from 'lucide-react';
import styles from './profile.module.css';
import NewListingModal from '@/components/ListingModal';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { Listing } from '@/components/Listings';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
interface UserProfileClientProps {
    username: string;
}

interface UserInfo{
  username: string;
  display_name?: string;
  profile_image?: string;
  sales_count?: number;
}

interface Purchase {
  id: number;
  purchase_date: string;
  listing: Listing;
}

const queryClient = new QueryClient();

export default function RootLayout({ children}: {children: React.ReactNode}) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false}/>
    </QueryClientProvider>
  )
}

const fetchUserInfo = async (username: string) => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/`);
  return response.data;
};

const fetchUserListings = async (username: string) => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/?seller=${username}`);
  return response.data;
}

export default function UserProfile({ username }: UserProfileClientProps) {
  const queryClient = useQueryClient();
  const{
    data: userInfo,
    isLoading: userLoading,
    error: userError
  } = useQuery({
    queryKey: ['user', username],
    queryFn: ()=>fetchUserInfo(username),
    staleTime: 5*60*1000,
  });

  const {
    data: listings = [],
    isLoading: listingsLoading,
    error: listingsError,
  } = useQuery({
    queryKey: ['listings', username],
    queryFn: ()=>fetchUserListings(username),
    staleTime: 2*60*1000,
  })

  const [isOwner, setIsOwner] = useState(false);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('listings');
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(()=> {
    const currentUser = localStorage.getItem('username');
    setIsOwner(currentUser=== username);
  },[username]);
  
  if (userLoading || listingsLoading) {
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
  );
 }
 if (userError || listingsError) {
  return <p className={styles.errorMessage}>Could not load profile data</p>;
}
  
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
      queryClient.setQueryData(['user', username], (oldData:any) => {
        return {...oldData, profile_image: res.data.profile_image};
      })
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };
  
  const handleListingUploadClick = () => {
    if (isOwner) setIsModalOpen(true);
  };

  const handleSubmitListing = async(listingData: {
    title: string;
    description: string;
    price: string;
    image: File;
  }) => {
    const { title, description, price, image } = listingData;
    
    const formData = new FormData();
    formData.append('listing_image', image);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);

    try{
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings/create/`,
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}}
      );
      queryClient.setQueryData(['listings', username], (oldData:Listing[] = [])=> {
        return [res.data, ...oldData];
      });
      setIsModalOpen(false);

    } catch (err) {
      console.error('Upload failed:', err)
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
                  listings.map((item:Listing) => (
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
                  purchases.map((item:Purchase) => (
                    <div key={item.id} className={styles.purchaseCard}>
                      {item.listing.image && (
                        <div className={styles.purchaseImageContainer}>
                          <img src={item.listing.image} alt={item.listing.title} className={styles.purchaseImage}/>
                        </div>
                      )}
                      <div className={styles.purchaseDetails}>
                        <h3 className={styles.purchaseTitle}>{item.listing.title}</h3>
                        <p className={styles.purchasePrice}>${item.listing.price}</p>
                        <p className={styles.purchaseDate}>Purchased on {new Date(item.purchase_date).toLocaleDateString()}</p>
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

      {/* Using the extracted NewListingModal component */}
      <NewListingModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitListing}
      />
    </div>
  );
}