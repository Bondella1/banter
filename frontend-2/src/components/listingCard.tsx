// components/ListingCard.tsx
'use client';

import Link from 'next/link';
import styles from './listingCard.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Props {
  listing: {
    id: number;
    title: string;
    price: number;
    image: string |null;
  };
}

export default function ListingCard({ listing }: Props) {

  const raw = typeof listing.image === 'string' ? listing.image.trim() : '';
  const imageSrc = raw ? (raw.startsWith('http') ? raw : `${API}${raw}`) : null;

  const priceNum =
    typeof listing.price === 'number'
      ? listing.price
      : listing.price != null && String(listing.price).trim() !== ''
      ? parseFloat(String(listing.price))
      : NaN;
  
  const priceLabel = Number.isFinite(priceNum) ? `$${priceNum.toFixed(2)}` : '';

  return (
    <Link href={`/listings/${listing.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {imageSrc && (
        <img
          src={imageSrc}
          alt={listing.title}
          className={styles.image}
        />
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{listing.title}</h3>
        <p className={styles.price}>${priceLabel}</p>
      </div>
    </Link>
  );
}
