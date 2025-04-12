import styles from './PostCard.module.css';

type PostCardProps = {
  name: string;
  time: string;
  imageUrl: string;
  caption: string;
};

export default function PostCard({ name, time, imageUrl, caption }: PostCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.name}>{name}</span>
        <span className={styles.time}>{time}</span>
      </div>
      <img src={imageUrl} alt="Post" className={styles.image} />
      <p className={styles.caption}>{caption}</p>
    </div>
  );
}
