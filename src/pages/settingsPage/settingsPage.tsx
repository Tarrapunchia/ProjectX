import { useEffect, useRef, useState } from "react";
import helpers from "../../utilities/helpers";
import { useWebSocket } from "../../utilities/WebSocketContext";
import { Bell, User, ShieldAlert, CheckCircle } from "lucide-react";
import CONSTS from '../../data/consts';

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

export default function SettingsPage() 
{
    const { activeUser, alertThreshold, updateAlertThreshold } = useWebSocket();
    const [savingProfile, setSavingProfile] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
	const fileRef = useRef<HTMLInputElement | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | undefined>(activeUser?.avatar);
	const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);

    const [profile, setProfile] = useState<ProfileData>({
        name: activeUser?.name || "",
        surname: activeUser?.surname || "",
        email: activeUser?.email || "",
        jobQualifier: activeUser?.jobQualifier || "",
        phone: activeUser?.phone || "",
        city: activeUser?.city || "",
        address: activeUser?.address || "",
        cap: activeUser?.cap || "",
        state: activeUser?.state || "",
        avatar: activeUser?.avatar || "",
    });

    useEffect(() =>
	{
        if (activeUser) 
        {
            setProfile({
                name: activeUser.name,
                surname: activeUser.surname,
                email: activeUser.email,
                jobQualifier: activeUser.jobQualifier || "",
                phone: activeUser.phone || "",
                city: activeUser.city || "",
                address: activeUser.address || "",
                cap: activeUser.cap || "",
                state: activeUser.state || "",
                avatar: activeUser.avatar || "",
            });
            setAvatarPreview(`${CONSTS.BE}/api/v1/users/${activeUser.id}/avatar`);
        }
    }, [activeUser]);

    const handleProfileChange = (k: keyof ProfileData, v: any) => 
    {
        setProfile((p) => ({ ...p, [k]: v }));
    };

    const handleAvatarFile = (f?: File | null) => 
    {
        if (!f) return;

        const url = URL.createObjectURL(f);
        setAvatarPreview(url);
        
        setSelectedAvatarFile(f);
    };

    const handleSaveProfile = async () => 
    {
        setSavingProfile(true);
        try 
        {
            if (selectedAvatarFile) 
            {
                const formData = new FormData();
                formData.append("file", selectedAvatarFile);

                const avatarRes = await helpers.uploadFile("/api/v1/files/avatar", formData);

                if (avatarRes.success) {
                    console.log("Upload avatar riuscito:", avatarRes.data);
                } else {
                    console.error("Upload avatar fallito", avatarRes.data);
                    setAvatarPreview(activeUser?.avatar ? `${CONSTS.BE}${activeUser.avatar}` : undefined);
                }
            }

            const res = await helpers.putter("/api/v1/users/modifyUserProfile", profile);
            
            if (res?.success) 
            {
                setSaveSuccess(true);
                setSelectedAvatarFile(null);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } 
        catch (e) 
        {
            console.error("Error saving profile", e);
        } 
        finally
        {
            setSavingProfile(false);
        }
    };

    const inputClass = "flex-1 p-2 rounded-lg bg-bg-color text-text-main border border-transparent hover:border-overlay-border-color transition-colors focus:outline-none focus:border-text-main text-sm shadow-sm";
    const smallInputClass = "w-24 p-2 rounded-lg bg-bg-color text-text-main border border-transparent hover:border-overlay-border-color transition-colors focus:outline-none focus:border-text-main text-sm shadow-sm";
    const btnClass = "border border-category-bg-color bg-side-bg-color rounded-xl p-2 px-4 text-sm text-text-main cursor-pointer hover:scale-105 hover:border-text-main transition-all flex items-center gap-2 shadow-sm";

    return (
        <div className="p-6 w-full h-full custom-scrollbar overflow-y-auto">
            <h2 className="text-2xl font-semibold text-text-main mb-6">Account Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                
                <div className="space-y-6">
                <div className="rounded-2xl p-6 bg-side-bg-color border border-transparent hover:border-overlay-border-color transition-all shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <User size={20} className="text-owner-color" />
                        <h3 className="text-lg font-medium text-text-main">Profile Information</h3>
                    </div>

                    <div className="relative w-16 h-16 group">
                        <img 
                            src={avatarPreview || "/placeholder-avatar.png"}
                            alt="avatar" 
                            className="w-16 h-16 rounded-full object-cover border-2 border-overlay-border-color" 
                        />
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-xs font-bold text-white">Edit</span>
                        </button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleAvatarFile(e.target.files?.[0])}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex flex-col gap-1">
                            <label className="text-[10px] uppercase text-text-main font-bold ml-1">First Name</label>
                            <input className={inputClass} value={profile.name} onChange={(e) => handleProfileChange("name", e.target.value)} autoComplete="off"/>
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <label className="text-[10px] uppercase text-text-main font-bold ml-1">Last Name</label>
                            <input className={inputClass} value={profile.surname} onChange={(e) => handleProfileChange("surname", e.target.value)} autoComplete="off"/>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex flex-col gap-1">
                            <label className="text-[10px] uppercase text-text-main font-bold ml-1">Email </label>
                            <input className={inputClass} value={profile.email} readOnly disabled />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <label className="text-[10px] uppercase text-text-main font-bold ml-1">Profession</label>
                            <input className={inputClass} value={profile.jobQualifier} onChange={(e) => handleProfileChange("jobQualifier", e.target.value)} autoComplete="off"/>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[10px] uppercase text-text-main font-bold ml-1">Phone</label>
                        <input className={inputClass} value={profile.phone} onChange={(e) => handleProfileChange("phone", e.target.value)} autoComplete="off"/>
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[10px] uppercase text-text-main font-bold ml-1">City</label>
                        <input className={inputClass} value={profile.city} onChange={(e) => handleProfileChange("city", e.target.value)} autoComplete="off"/>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase text-text-main font-bold ml-1">Address</label>
                        <input className={inputClass} value={profile.address} onChange={(e) => handleProfileChange("address", e.target.value)} autoComplete="off"/>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex flex-col gap-1">
							<label className="text-[10px] uppercase text-text-main font-bold ml-1">Zip Code</label>
							<input className={smallInputClass} value={profile.cap} onChange={(e) => handleProfileChange("cap", e.target.value)} autoComplete="off"/>
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
							<label className="text-[10px] uppercase text-text-main font-bold ml-1">Country/State</label>
							<input className={inputClass} value={profile.state} onChange={(e) => handleProfileChange("state", e.target.value)} autoComplete="off"/>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <button onClick={handleSaveProfile} disabled={savingProfile} className={btnClass}>
                        {savingProfile ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
                        {saveSuccess && <CheckCircle size={16} className="text-green-500" />}
                        </button>
                    </div>
                    </div>
                </div>
                </div>

            	<div className="space-y-6">
					{/* Notifiche con Alert Threshold */}
					<div className="rounded-2xl p-6 bg-side-bg-color border border-transparent hover:border-overlay-border-color transition-all shadow-sm">
						<div className="flex items-center gap-2 mb-4">
						<Bell size={20} className="text-orange-500" />
						<h3 className="text-lg font-medium text-text-main">Notification Alerts</h3>
						</div>
						
						<p className="text-xs text-zinc-400 mb-6">
						Choose how early you want to be notified about upcoming deadlines and events.
						</p>

						<div className="space-y-4">
							<div className="flex flex-col gap-2">
								<label className="text-sm font-medium">Alert Threshold</label>
								<select
									value={alertThreshold}
									onChange={(e) => updateAlertThreshold(Number(e.target.value))}
									className="w-full p-2 rounded-lg bg-bg-color text-text-main border border-transparent hover:border-overlay-border-color transition-colors focus:outline-none focus:border-text-main text-sm cursor-pointer shadow-sm"
								>
								<option value={12}>12 hours before</option>
								<option value={24}>24 hours before</option>
								<option value={48}>48 hours before</option>
								<option value={72}>72 hours before</option>
								</select>
							</div>
							
							<div className="p-3 bg-main-bg-color/50 rounded-lg border border-dashed border-overlay-border-color">
								<p className="text-[10px] text-text-main leading-relaxed italic">
								* Currently applying locally. Changes affect the Notifications Center and Sidebar alerts instantly.
								</p>
							</div>
						</div>
					</div>

					{/* Danger Zone */}
					<div className="rounded-2xl p-6 bg-side-bg-color border border-transparent hover:border-red-900/30 transition-all shadow-sm">
						<div className="flex items-center gap-2 mb-4">
							<ShieldAlert size={20} className="text-red-400" />
							<h3 className="text-lg font-medium text-text-main">Danger Zone</h3>
						</div>
						<p className="text-xs text-slate-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
						<DangerZoneStub userEmail={activeUser?.email} />
					</div>
                </div>
            </div>
        </div>
    );
}

function DangerZoneStub({ userEmail }: { userEmail?: string }) 
{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleDelete = async () => {
        if (!email || !password) {
            setErrorMsg("Both email and password are required.");
            return;
        }

        if (email !== userEmail) {
            setErrorMsg("The email does not match your account.");
            return;
        }
        
        setLoading(true);
        setErrorMsg("");

        try 
		{
            const res = await helpers.deleter("/api/v1/users/delete", { password });
            
            if (res.success) {
                window.location.href = "/";
            } else {
                setErrorMsg(res.data?.error || "Failed to delete account. Please try again.");
            }
        } catch (error) {
            console.error("Deletion error:", error);
            setErrorMsg("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <input
                type="email"
                autoComplete="username email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg("");
                }}
                placeholder="Confirm your email"
                className="w-full p-2 rounded-lg bg-bg-color text-text-main border border-transparent hover:border-red-900/50 focus:outline-none focus:border-red-600 text-sm shadow-sm"
            />

            <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg("");
                }}
                placeholder="Enter your password"
                className="w-full p-2 rounded-lg bg-bg-color text-text-main border border-transparent hover:border-red-900/50 focus:outline-none focus:border-red-600 text-sm shadow-sm"
            />
            
            {errorMsg && (
                <p className="text-red-500 text-xs font-medium px-1">{errorMsg}</p>
            )}

            <button 
                onClick={handleDelete} 
                disabled={!email || !password || loading} 
                className="w-full px-4 py-2 bg-transparent text-text-main border border-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
                {loading ? "Processing..." : "Permanently Delete Account"}
            </button>
        </div>
    );
}