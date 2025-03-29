import React, { useEffect, useState } from 'react';
import styles from '../css/listings.module.css';

const ListingsPage = () => {
  const [listings, setListings] = useState([]);

  // Placeholder sample data — will be replaced with real API call
  useEffect(() => {
    const sample = [
      {
        id: 1,
        title: 'Vintage Lamp',
        price: 35.99,
        description: 'Beautiful retro lamp for your cozy corner.',
        image: 'https://via.placeholder.com/300x200.png?text=Vintage+Lamp'
      },
      {
        id: 2,
        title: 'Gaming Keyboard',
        price: 89.99,
        description: 'Mechanical RGB keyboard for pro gamers.',
        image: 'https://via.placeholder.com/300x200.png?text=Keyboard'
      },
      {
        id: 3,
        title: 'Handmade Mug',
        price: 18.5,
        description: 'Ceramic mug made with love.',
        image: 'https://via.placeholder.com/300x200.png?text=Mug'
      }
    ];
    setListings(sample);
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>Explore Listings</h2>
      <div className={styles.grid}>
        {listings.map((item) => (
          <div className={styles.card} key={item.id}>
            <img src={item.image} alt={item.title} className={styles.image} />
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.price}>${item.price}</p>
            <p className={styles.description}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingsPage;
