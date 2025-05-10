'use client';

import { useState } from "react";
import styles from './dropmenu.module.css'
import { useRouter } from "next/navigation";
import Link from 'next/link';

interface Dropmenuprops {
    username: string | null;
    handleLogout: () => void;
}

export default function Dropmenu({username, handleLogout}: Dropmenuprops) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const navigate = (path: string) => {
        router.push(path);
        setOpen(false);
    };

    return (
        <div className={styles.dropdown}>
            <button className={styles.dropbtn} onClick={() => setOpen(!open)}>
                Menu
            </button>
            {open && (
                <div className={styles.menu}>
                    {username && (
                        <button onClick={() => navigate(`/profile/${username}`)}
                        className={styles.item}>
                            Profile ({username})
                        </button>
                    )}
                    <button onClick={() => navigate('/settings')}
                        className={styles.item}>
                            Settings
                        </button>

                    <button onClick={() => {handleLogout(); setOpen(false);}} className={styles.item}>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
