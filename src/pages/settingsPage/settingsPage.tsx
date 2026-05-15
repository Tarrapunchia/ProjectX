// SettingsPage.tsx
import React, { useEffect, useRef, useState } from "react";
import helpers from "../../utilities/helpers";
import CONSTS from "../../data/consts";

type ProfileData = {
  id?: string;
  name?: string;
  surname?: string;
  email?: string;
  jobQualifier?: string;
  phone?: string;
  city?: string;
  address?: string;
  cap?: string;
  state?: string;
  avatar?: string;
};

type LocalPrefs = {
  theme: "system" | "light" | "dark";
  defaultView: "list" | "board" | "calendar";
  language: string;
  timezone: string;
};

type LocalNotifs = {
  email: boolean;
  push: boolean;
  digest: "daily" | "weekly" | "off";
};

const PREFS_LS = "settings_prefs_v1";
const NOTIFS_LS = "settings_notifs_v1";

/**
 * SettingsPage - corrected:
 * - containers: hover-only border (no focus border)
 * - inputs: show border on focus (focus:border-overlay-border-color)
 * - inputs rounded-lg
 * - buttons use exact class provided
 * - change avatar via overlay button on photo
 */
export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    surname: "",
    email: "",
    jobQualifier: "",
    phone: "",
    city: "",
    address: "",
    cap: "",
    state: "",
    avatar: "",
  });

  const [prefs, setPrefs] = useState<LocalPrefs>({
    theme: "system",
    defaultView: "list",
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  });

  const [notifs, setNotifs] = useState<LocalNotifs>({
    email: true,
    push: false,
    digest: "daily",
  });

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const res = await helpers.getter(`${CONSTS.BE}/api/v1/users/activeUser`, null);
        if (res?.success && res.data) {
          setProfile((p) => ({ ...p, ...(res.data as Partial<ProfileData>) }));
          setAvatarPreview((res.data as any)?.avatar ?? undefined);
        }
      } catch (e) {
        console.warn("Could not fetch profile", e);
      } finally {
        try {
          const rawPrefs = localStorage.getItem(PREFS_LS);
          const rawNotifs = localStorage.getItem(NOTIFS_LS);
          if (rawPrefs) setPrefs((prev) => ({ ...prev, ...(JSON.parse(rawPrefs) as Partial<LocalPrefs>) }));
          if (rawNotifs) setNotifs((prev) => ({ ...prev, ...(JSON.parse(rawNotifs) as Partial<LocalNotifs>) }));
        } catch (e) {
          console.warn("Could not parse local settings", e);
        }
        setLoading(false);
      }
    })();
  }, []);

  const handleProfileChange = (k: keyof ProfileData, v: any) => {
    setProfile((p) => ({ ...(p ?? {}), [k]: v }));
  };

  const handleAvatarFile = (f?: File | null) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarPreview(url);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const payload: Partial<ProfileData> = {
        name: profile.name,
        surname: profile.surname,
        jobQualifier: profile.jobQualifier,
        phone: profile.phone,
        city: profile.city,
        address: profile.address,
        cap: profile.cap,
        state: profile.state,
      };

      const res = await helpers.putter("/api/v1/users/modifyUserProfile", payload);
      if (res?.success) {
        setProfile((p) => ({ ...(p ?? {}), ...(payload as any) }));
      } else {
        console.error("Save failed", res);
      }
      return res;
    } catch (e) {
      console.error("Error saving profile", e);
      return { success: false, error: e };
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePrefsLocal = (next: Partial<LocalPrefs>) => {
    const merged = { ...prefs, ...(next as LocalPrefs) };
    setPrefs(merged);
    try {
      localStorage.setItem(PREFS_LS, JSON.stringify(merged));
    } catch (e) {
      console.warn("Could not save prefs", e);
    }
  };

  const handleSaveNotifsLocal = (next: Partial<LocalNotifs>) => {
    const merged = { ...notifs, ...(next as LocalNotifs) };
    setNotifs(merged);
    try {
      localStorage.setItem(NOTIFS_LS, JSON.stringify(merged));
    } catch (e) {
      console.warn("Could not save notifs", e);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-sm text-text-main">Loading settings…</span>
      </div>
    );
  }

  // classes
  const inputClass =
    "flex-1 p-2 rounded-lg bg-bg-color text-text-main border border-transparent hover:border-overlay-border-color transition-colors focus:outline-none focus:border-text-main";
  const smallInputClass =
    "w-24 p-2 rounded-lg bg-bg-color text-text-main border border-transparent hover:border-overlay-border-color transition-colors focus:outline-none focus:border-text-main";
  const btnClass =
    "border border-category-bg-color bg-side-bg-color rounded-xl p-2 !text-text-main cursor-pointer hover:scale-105 hover:border-text-main";

  return (
    <div className="p-4 w-full h-full">
      <h2 className="text-2xl font-semibold text-text-main ml-2 mb-4">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-6">
          
          <div className="rounded-lg p-5 bg-side-bg-color shadow-sm hover:border hover:border-overlay-border-color">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-text-main">Profile settings</h3>

              {/* avatar container with overlay button */}
              <div className="relative w-10 h-10">
                <img src={avatarPreview ?? profile.avatar ?? "/placeholder-avatar.png"} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 text-white opacity-0 hover:opacity-100 transition-opacity"
                  aria-label="Change avatar"
                >
                  ✎
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAvatarFile(f);
                  }}
                />
              </div>
            </div>

            <div className="space-y-3 felex flex-col">
              {/* Row: name / surname */}
              <div className="flex flex-col md:flex-row gap-3">
                <input className={inputClass} placeholder="Name" value={profile.name ?? ""} onChange={(e) => handleProfileChange("name", e.target.value)} />
                <input className={inputClass} placeholder="Surname" value={profile.surname ?? ""} onChange={(e) => handleProfileChange("surname", e.target.value)} />
              </div>

              {/* Row: email (readonly) / profession */}
              <div className="flex flex-col md:flex-row gap-3">
                <input className={inputClass} placeholder="Email" value={profile.email ?? ""} readOnly />
                <input className={inputClass} placeholder="Profession" value={profile.jobQualifier ?? ""} onChange={(e) => handleProfileChange("jobQualifier", e.target.value)} />
              </div>

              {/* Row: phone / city */}
              <div className="flex flex-col md:flex-row gap-3">
                <input className={inputClass} placeholder="Phone" value={profile.phone ?? ""} onChange={(e) => handleProfileChange("phone", e.target.value)} />
                <input className={inputClass} placeholder="City" value={profile.city ?? ""} onChange={(e) => handleProfileChange("city", e.target.value)} />
              </div>

              {/* Row: address */}
              <div className="flex gap-3">
                <input className={inputClass} placeholder="Address" value={profile.address ?? ""} onChange={(e) => handleProfileChange("address", e.target.value)} />
              </div>

              {/* Row: cap / state */}
              <div className="flex flex-col md:flex-row gap-3">
                <input className={smallInputClass} placeholder="CAP" value={profile.cap ?? ""} onChange={(e) => handleProfileChange("cap", e.target.value)} />
                <input className={inputClass} placeholder="State" value={profile.state ?? ""} onChange={(e) => handleProfileChange("state", e.target.value)} />
                <div />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-2">
                <button onClick={handleSaveProfile} disabled={savingProfile} className={btnClass}>
                  {savingProfile ? "Saving…" : "Save profile"}
                </button>

                <button
                  onClick={async () => {
                    try {
                      const res = await helpers.getter(`${CONSTS.BE}/api/v1/users/activeUser`, null);
                      if (res?.success) {
                        setProfile((p) => ({ ...(p ?? {}), ...(res.data as Partial<ProfileData>) }));
                        setAvatarPreview((res.data as any)?.avatar ?? undefined);
                      }
                    } catch (e) {
                      console.warn(e);
                    }
                  }}
                  className={btnClass}
                >
                  Reset to server
                </button>
              </div>
            </div>
          </div>

          {/* General settings (local) */}
          <div className="rounded-lg p-5 bg-side-bg-color shadow-sm hover:border hover:border-overlay-border-color ">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-text-main">General settings</h3>
              <span className="text-xs text-zinc-500">local</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col text-sm">
                Theme
                <select
                  value={prefs.theme}
                  onChange={(e) => setPrefs((p) => ({ ...p, theme: e.target.value as LocalPrefs["theme"] }))}
                  className="mt-1 p-2 rounded-lg bg-bg-color text-text-main border border-transparent hover:border-overlay-border-color transition-colors focus:outline-none focus:border-overlay-border-color"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>

              <label className="flex flex-col text-sm">
                Default view
                <select
                  value={prefs.defaultView}
                  onChange={(e) => setPrefs((p) => ({ ...p, defaultView: e.target.value as LocalPrefs["defaultView"] }))}
                  className="mt-1 p-2 rounded-lg bg-bg-color text-text-main border border-transparent hover:border-overlay-border-color transition-colors focus:outline-none focus:border-overlay-border-color"
                >
                  <option value="list">List</option>
                  <option value="board">Board</option>
                  <option value="calendar">Calendar</option>
                </select>
              </label>

              <label className="flex flex-col text-sm">
                Language
                <select
                  value={prefs.language}
                  onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
                  className="mt-1 p-2 rounded-lg bg-bg-color text-text-main border border-transparent hover:border-overlay-border-color transition-colors focus:outline-none focus:border-overlay-border-color"
                >
                  <option value="en">English</option>
                  <option value="it">Italiano</option>
                </select>
              </label>

              <label className="flex flex-col text-sm">
                Timezone
                <input
                  value={prefs.timezone}
                  onChange={(e) => setPrefs((p) => ({ ...p, timezone: e.target.value }))}
                  className="mt-1 p-2 rounded-lg bg-bg-color text-text-main border border-transparent hover:border-overlay-border-color transition-colors focus:outline-none focus:border-overlay-border-color"
                />
              </label>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => handleSavePrefsLocal(prefs)} className={btnClass}>
                Save preferences (local)
              </button>
              <button
                onClick={() => {
                  const raw = localStorage.getItem(PREFS_LS);
                  if (raw) setPrefs(JSON.parse(raw));
                  else setPrefs({ theme: "system", defaultView: "list", language: "en", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" });
                }}
                className={btnClass}
              >
                Load saved
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="rounded-lg p-5 bg-side-bg-color shadow-sm hover:border hover:border-overlay-border-color focus:outline-none">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-text-main">Notifications</h3>
              <span className="text-xs text-zinc-500">local</span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm">Email notifications</span>
                <input type="checkbox" checked={notifs.email} onChange={(e) => setNotifs((n) => ({ ...n, email: e.target.checked }))} />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm">Push notifications</span>
                <input type="checkbox" checked={notifs.push} onChange={(e) => setNotifs((n) => ({ ...n, push: e.target.checked }))} />
              </label>

              <label className="flex flex-col text-sm">
                Digest frequency
                <select
                  value={notifs.digest}
                  onChange={(e) => setNotifs((n) => ({ ...n, digest: e.target.value as LocalNotifs["digest"] }))}
                  className="mt-1 p-2 rounded-lg bg-bg-color text-text-main border border-transparent hover:border-overlay-border-color transition-colors focus:outline-none focus:border-overlay-border-color"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="off">Off</option>
                </select>
              </label>

              <div className="flex gap-2 mt-3">
                <button onClick={() => handleSaveNotifsLocal(notifs)} className={btnClass}>
                  Save notifications (local)
                </button>
                <button
                  onClick={() => {
                    const raw = localStorage.getItem(NOTIFS_LS);
                    if (raw) setNotifs(JSON.parse(raw));
                    else setNotifs({ email: true, push: false, digest: "daily" });
                  }}
                  className={btnClass}
                >
                  Load saved
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg p-5 bg-side-bg-color shadow-sm hover:border hover:border-overlay-border-color">
            <h3 className="text-lg font-medium text-text-main mb-3">Danger Zone</h3>
            <p className="text-sm text-slate-400 mb-3">Irreversible actions. Minimal stub.</p>
            <DangerZoneStub />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Minimal DangerZone stub */
function DangerZoneStub() {
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm !== "DELETE") return;
    setLoading(true);
    try {
      setTimeout(() => {
        setLoading(false);
        alert("Account deletion flow (stub).");
      }, 700);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder='Type "DELETE" to confirm'
        className="w-full p-2 rounded-lg bg-bg-color text-text-main border border-transparent hover:border-overlay-border-color focus:outline-none focus:border-overlay-border-color"
      />
      <div className="flex gap-2">
        <button onClick={handleDelete} disabled={confirm !== "DELETE" || loading} className="px-4 py-2 bg-red-600 text-white rounded">
          {loading ? "Deleting…" : "Delete account"}
        </button>
      </div>
    </div>
  );
}
