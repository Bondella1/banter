// components/ListingCard.tsx
'use client';

import Link from 'next/link';
import styles from './listingCard.module.css';

interface Props {
  listing: {
    id: number;
    title: string;
    price: number;
    image: string;
  };
}

export default function ListingCard({ listing }: Props) {
  return (
    <Link href={`/listings/${listing.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={listing.image}
          alt={listing.title}
          className={styles.image}
        />
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{listing.title}</h3>
        <p className={styles.price}>${listing.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
