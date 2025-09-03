import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./listings.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Listing = {
  id: number;
  title: string;
  description: string;
  price: number | string;
  image: string | null;
  created_at: string;
  seller: {
    username: string;
    display_name: string | null;
    profile_image: string | null;
  };
};

type PageProps = {
  params: Promise<{ id: string }>;
}

export default async function ListingPage({ params }: PageProps) {
  const { id } = await params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}/`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return notFound();

  const listing: Listing = await res.json();

  const toAbs = (v: unknown) => {
    const s = typeof v === "string" ? v.trim() : "";
    if (!s) return null;
    return s.startsWith("http") ? s : `${API}${s}`;
  };
  const toNumber = (v: unknown) => {
    if (typeof v === "number") return v;
    const n = parseFloat(String(v ?? ""));
    return Number.isFinite(n) ? n : NaN;
  };
  const priceNum = toNumber(listing.price);
  const imageSrc = toAbs(listing.image);
  const sellerImg = toAbs(listing.seller?.profile_image);
  const priceLabel = Number.isFinite(priceNum) ? `$${priceNum.toFixed(2)}` : "";

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

      {imageSrc && (
      <img
        src={imageSrc}
        alt={listing.title}
        className={styles.image}
      />
      )}

      <p className={styles.price}>${priceLabel}</p>

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
            alt={listing.seller.display_name || listing.seller.username}
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
