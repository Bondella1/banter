// app/listings/page.tsx
import styles from './listings.module.css';

interface Listing {
  id: number;
  title: string;
  price: number;
  image?: string;
}

export default async function ListingsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/`, {
    cache: 'no-store',
  });

  const listings: Listing[] = await res.json();

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Browse Listings</h1>

      <div className={styles.grid}>
        {listings.map(listing => (
          <div key={listing.id} className={styles.card}>
            {listing.image && <img src={listing.image} alt={listing.title} className={styles.image} />}
            <h2 className={styles.itemTitle}>{listing.title}</h2>
            <p className={styles.price}>${listing.price}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
 