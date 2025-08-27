"use client";

import React, { useState } from "react";
import styles from "./cart.module.css";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([
    { id: 1, name: "Product A", price: 20, quantity: 1 },
    { id: 2, name: "Product B", price: 35, quantity: 2 },
  ]);

  const updateQuantity = (id: number, qty: number) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity: qty } : item
    ));
  };

  const removeItem = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Cart</h1>
      
      {cart.length === 0 ? (
        <p className={styles.empty}>Your cart is empty</p>
      ) : (
        <div>
          <ul className={styles.list}>
            {cart.map(item => (
              <li key={item.id} className={styles.item}>
                <span>{item.name}</span>
                <span>${item.price}</span>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                  className={styles.qty}
                />
                <button 
                  onClick={() => removeItem(item.id)}
                  className={styles.remove}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.total}>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
