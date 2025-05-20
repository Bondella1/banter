// Listings.tsx (client)
"use client";

import { useState } from "react";
import ListingCard from "./listingCard";
import NewListingModal from "./ListingModal";
import styles from "./Listings.module.css";
import { da } from "date-fns/locale";

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  created_at: string;
  seller:{
    username: string;
    display_name: string;
    profile_image: string;
  };
}

interface Props {
  initialListings: Listing[];
}

export default function Listings({ initialListings }: Props) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async(data: {title:string; description: string; price: string; image:File}) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('image', data.image);

    try {
        const res = await fetch("http://localhost:8000/api/listings/", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            const newListing = await res.json();
            setListings(prev => [newListing, ...prev]);
            setIsModalOpen(false);
        } else {
            throw new Error("Failed to create Listing");
        }
    } catch (error) {
        console.error("Error creating listing:", error);
    }
  };

  return (
    <section className={styles.wrapper}>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}> Add new listing</button>
        <NewListingModal isOpen={isModalOpen} onClose={() =>setIsModalOpen(false)} onSubmit={handleSubmit}/>
        
        <div className={styles.grid}>
            {listings.map((l) => (
                <ListingCard key={l.id} listing={l}/>
            ))}
        </div>
    </section>
  );

  
    
  
}
