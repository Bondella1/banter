 // /app/settings/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios, {AxiosError} from "axios";
import styles from "./settings.module.css"

interface UserSettings {
  username: string;
  display_name: string;
  bio: string;
  location: string;
  phone: string;
  profile_image: string;
  email_notifications: boolean;
  push_notifications: boolean;
  theme: "light" | "dark";
  language: string;
  timezone: string;
  privacy_public_profile: boolean;
  privacy_show_email: boolean;
}

export default function SettingsPage() {
  const [form, setForm] = useState<UserSettings>({
    username: "",
    display_name: "",
    bio: "",
    location: "",
    phone: "",
    profile_image: "",
    email_notifications: true,
    push_notifications: true,
    theme: "light",
    language: "en",
    timezone: "UTC",
    privacy_public_profile: true,
    privacy_show_email: false,
  })
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [meRes, sRes] = await Promise.all ([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me/`, { withCredentials: true}),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/settings/`, { withCredentials: true }),
        ]);
        if (!mounted) return;
        const me = meRes.data || {};
        const s = sRes.data || {};
        setForm((p) => ({
          ...p,
          username: me.username || "",
          display_name: s.display_name ?? me.display_name ?? "",
          bio: s.bio ?? me.bio ?? "",
          location: s.location ?? "",
          phone: s.phone ?? "",
          profile_image: s.profile_image ?? me.profile_image ?? "",
          email_notifications: s.email_notifications ?? true,
          push_notifications: s.push_notifications ?? true,
          theme: s.theme === "dark" ? "dark" : "light",
          language: s.language || "en",
          timezone: s.timezone || "UTC",
          privacy_public_profile: s.privacy_public_profile ?? true,
          privacy_show_email: s.privacy_show_email ?? false,
        }));
      } catch (e: any) {
        setError(e?.response?.data?.detail || e?.message || "Failed to load settings");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onChange = (k: keyof UserSettings, v:any) => setForm((p) => ({...p, [k]:v}));
  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/settings/`,
        {
          display_name: form.display_name,
          bio: form.bio,
          location: form.location,
          phone: form.phone,
          profile_image: form.profile_image || null,
          email_notifications: form.email_notifications,
          push_notifications: form.push_notifications,
          theme: form.theme,
          language: form.language,               // only "en" will be enabled in UI
          timezone: form.timezone,
          privacy_public_profile: form.privacy_public_profile,
          privacy_show_email: form.privacy_show_email,
        },
        { withCredentials: true }
      );
      setSavedAt(new Date());
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };


    return (
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Settings</h1>
        {error && <p className={styles.error}>{error}</p>}

        {/*Profile*/}
        <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <div className={styles.sectionContent}>
          <div>
            <label className={styles.label}>Username</label>
            <input className={styles.input} value={form.username} disabled readOnly />
          </div>
          <div>
            <label className={styles.label}>Display name</label>
            <input
              className={styles.input}
              value={form.display_name}
              onChange={(e) => onChange("display_name", e.target.value)}
              maxLength={100}
            />
          </div>
          <div className={styles.fullWidth}>
            <label className={styles.label}>Bio</label>
            <textarea
              className={styles.input}
              rows={4}
              value={form.bio}
              onChange={(e) => onChange("bio", e.target.value)}
            />
          </div>
          <div>
            <label className={styles.label}>Location</label>
            <input
              className={styles.input}
              value={form.location}
              onChange={(e) => onChange("location", e.target.value)}
            />
          </div>
          <div>
            <label className={styles.label}>Phone</label>
            <input
              className={styles.input}
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />
          </div>
          <div className={styles.fullWidth}>
            <label className={styles.label}>Profile image URL</label>
            <input
              className={styles.input}
              value={form.profile_image}
              onChange={(e) => onChange("profile_image", e.target.value)}
              inputMode="url"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/*Preferences*/}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Preferences</h2>
        <div className={styles.sectionContent}>
          <div>
            <label className={styles.label}>Theme</label>
            <select
              className={styles.select}
              value={form.theme}
              onChange={(e) => onChange("theme", e.target.value as UserSettings["theme"])}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div>
            <label className={styles.label}>Language</label>
            <select
              className={styles.select}
              value={form.language}
              onChange={(e) => onChange("language", e.target.value)}
            >
              <option value="en">English</option>
              <option value="es" disabled>Español — coming soon</option>
              <option value="fr" disabled>Français — coming soon</option>
              <option value="de" disabled>Deutsch — coming soon</option>
              <option value="zh" disabled>中文 — coming soon</option>
              <option value="ar" disabled>العربية — coming soon</option>
            </select>
            <p className={styles.note}>Only English is selectable.</p>
          </div>
          <div>
            <label className={styles.label}>Timezone</label>
            <input
              className={styles.input}
              value={form.timezone}
              onChange={(e) => onChange("timezone", e.target.value)}
              placeholder="e.g. UTC, America/New_York"
            />
          </div>
        </div>
      </div>
      {/*Notifications*/}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Notifications</h2>
        <div className={styles.sectionContent}>
          <label className={styles.fullWidth + " flex items-center gap-3"}>
            <input
              type="checkbox"
              checked={form.email_notifications}
              onChange={(e) => onChange("email_notifications", e.target.checked)}
            />
            <span>Email notifications</span>
          </label>
          <label className={styles.fullWidth + " flex items-center gap-3"}>
            <input
              type="checkbox"
              checked={form.push_notifications}
              onChange={(e) => onChange("push_notifications", e.target.checked)}
            />
            <span>Push notifications</span>
          </label>
        </div>
      </div>

      {/*Privacy*/}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Privacy</h2>
        <div className={styles.sectionContent}>
          <label className={styles.fullWidth + " flex items-center gap-3"}>
            <input
              type="checkbox"
              checked={form.privacy_public_profile}
              onChange={(e) => onChange("privacy_public_profile", e.target.checked)}
            />
            <span>Public profile</span>
          </label>
          <label className={styles.fullWidth + " flex items-center gap-3"}>
            <input
              type="checkbox"
              checked={form.privacy_show_email}
              onChange={(e) => onChange("privacy_show_email", e.target.checked)}
            />
            <span>Show email on profile</span>
          </label>
        </div>
      </div>

      <div className={styles.saveRow}>
        <button className={styles.button} onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
        {savedAt && <span className={styles.savedAt}>Saved {savedAt.toLocaleTimeString()}</span>}
      </div>


      </div>
    );
  }
  
  