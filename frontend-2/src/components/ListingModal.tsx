'use client';

import React, { useRef, useState } from 'react';
import styles from './ListingModal.module.css';
import { resolve } from 'path';

interface ListingData {
  title: string;
  description: string;
  price: string;
  image: File;
}

interface NewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ListingData) => Promise<void>;
}

const validateFile = (file: File): {isValid: boolean; error?: string} => {
  const maxSize = 10* 1024 *1024;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (file.size > maxSize) {
    return {isValid: false, error: 'File size must be less than 10mb'};
  }

  if (!allowedTypes.includes(file.type)) {
    return {isValid: false, error: 'only JPEG, PNG, WebP, and GIF images are allowed '};
  }
  return {isValid: true};
};

const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () =>{
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob){
          const compressedFile = new File([blob], file.name, {
            type :file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, file.type, quality);
    };
    img.src = URL.createObjectURL(file);
  });
};

export default function NewListingModal({ 
  isOpen, 
  onClose, 
  onSubmit 
}: NewListingModalProps) {
  const [listingTitle, setListingTitle] = useState<string>('');
  const [listingDesc, setListingDesc] = useState<string>('');
  const [listingPrice, setListingPrice] = useState<string>('');
  const [listingImage, setListingImage] = useState<File | null>(null);
  const listingImageInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleListingImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setListingImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!listingTitle || !listingDesc || !listingPrice || !listingImage) {
      console.error("All fields are required");
      return;
    }

    setError(null);
    setIsLoading(true);

    try{
        await onSubmit({
            title: listingTitle,
            description: listingDesc,
            price: listingPrice,
            image: listingImage
        });

        // Reset form fields if successful
        setListingTitle('');
        setListingDesc('');
        setListingPrice('');
        setListingImage(null);
        onClose();
    } catch (err) {
        setError("Failed to create listing");
    } finally {
        setIsLoading(false);
    }};

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Create New Listing</h2>
          <button className={styles.closeButton} onClick={onClose}>x</button>
        </div>
        <div className={styles.modalBody}>
            {error && <div className={styles.error}>{error}</div>}

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
            <label htmlFor="listingDesc">Description</label>
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
                {listingImage ? listingImage.name : 'No file selected'}
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
          <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
          <button className={styles.submitButton} onClick={handleSubmit}>Create Listing</button>
        </div>
      </div>
    </div>
  );
}