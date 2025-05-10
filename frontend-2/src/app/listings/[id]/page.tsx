// app/listings/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

type Listing = {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  created_at: string;
  seller: {
    username: string;
    display_name: string;
    profile_image: string;
  };
};

export default async function ListingPage({
  params,
}: {
  params: { id: string };
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${params.id}/`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return notFound();

  const listing: Listing = await res.json();

  // format date with native API
  const postedDate = new Date(listing.created_at);
  const formatted = postedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{listing.title}</h1>

      <img
        src={listing.image}
        alt={listing.title}
        className={styles.image}
      />

      <p className={styles.price}>${listing.price.toFixed(2)}</p>

      <div className={styles.section}>
        <h2>Description</h2>
        <p>{listing.description}</p>
      </div>

      <div className={styles.section}>
        <h2>Seller</h2>
        <Link
          href={`/profile/${listing.seller.username}`}
          className={styles.sellerLink}
        >
          <img
            src={listing.seller.profile_image || "/default-avatar.jpg"}
            alt={listing.seller.display_name}
            className={styles.sellerAvatar}
          />
          <span>
            {listing.seller.display_name || listing.seller.username}
          </span>
        </Link>
      </div>

      <div className={styles.postedOn}>Posted on {formatted}</div>

      {/* TODO: Add “Add to Cart” or “Buy Now” button here */}
    </div>
  );
}
