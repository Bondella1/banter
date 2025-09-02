// /app/settings/page.tsx — minimal version
"use client";

import React, { useEffect, useState } from "react";
import  {api, attachAuthFromStorage} from "../../../lib/auth";
import styles from "./settings.module.css";

interface UserSettings {
  username: string;
  display_name: string;
  bio: string;
  theme: "light" | "dark";
}

export default function SettingsPage() {
  const [form, setForm] = useState<UserSettings>({
    username: "",
    display_name: "",
    bio: "",
    theme: "light",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [meRes, sRes] = await Promise.all([
          api.get(`/api/auth/me/`),
          api.get(`/api/auth/settings/`),
        ]);
        if (!mounted) return;
        const me = meRes.data || {};
        const s = sRes.data || {};
        setForm({
          username: me.username || "",
          display_name: s.display_name ?? me.display_name ?? "",
          bio: s.bio ?? me.bio ?? "",
          theme: s.theme === "dark" ? "dark" : "light",
        });
      } catch (e: any) {
        setError(e?.response?.data?.detail || e?.message || "Failed to load settings");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onChange = (k: keyof UserSettings, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/api/auth/settings/`,{
        display_name: form.display_name, 
        bio: form.bio, 
        theme: form.theme ,
      });
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

      {/* Profile (minimal) */}
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
        </div>
      </div>

      {/* Preferences (only theme) */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Preferences</h2>
        <div className={styles.sectionContent}>
          <div>
            <label className={styles.label}>Theme</label>
            <select
              className={styles.select}
              value={form.theme}
              onChange={(e) => onChange("theme", e.target.value as UserSettings["theme"]) }
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
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
