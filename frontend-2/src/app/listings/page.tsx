// app/listings/page.tsx
import ListingCard from '@/components/listingCard';
import styles from './browse.module.css';

type Listing = {
  id: number;
  title: string;
  price: number;
  image: string;
};

export default async function ListingsPage() {
  // Fetch all listings
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/listings/`,
    { next: { revalidate: 60 } }
  );
  const listings: Listing[] = await res.json();

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>Browse Listings</h1>
      <div className={styles.grid}>
        {listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </main>
  );
}
