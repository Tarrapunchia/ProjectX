import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "../../utilities/WebSocketContext";
import helpers from "../../utilities/helpers";
import { X, Search } from "lucide-react";
import CONSTS from '../../data/consts';

// Import per DatePicker
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { it, enGB as en, es } from 'date-fns/locale';

registerLocale('it', it);
registerLocale('en', en);
registerLocale('es', es);

export default function CreateEventModal({ onClose }: { onClose: () => void }) 
{
    const { t, i18n } = useTranslation();
    const { loadCalendar, friends } = useWebSocket();
    const [loading, setLoading] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(new Date());

    const [formData, setFormData] = useState({
        name: "",
        type: "None",
        description: "",
    });

    const searchResults = useMemo(() => 
    {
        if (!searchTerm.trim()) return [];
        return friends.filter(f => 
            (f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             f.surname.toLowerCase().includes(searchTerm.toLowerCase())) &&
            !selectedFriends.includes(f.id)
        );
    }, [friends, searchTerm, selectedFriends]);

    const addFriend = (id: number) => 
    {
        if (!selectedFriends.includes(id))
            setSelectedFriends([...selectedFriends, id]);
        setSearchTerm("");
    };

    const removeFriend = (id: number) => {
        setSelectedFriends(selectedFriends.filter(fid => fid !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => 
    {
        e.preventDefault();
        if (!startDate) return;
        setLoading(true);

        const payload = {
            name: formData.name,
            type: formData.type,
            message: formData.description,
            dueDate: startDate.toISOString(),
            participants: selectedFriends
        };

        const res = await helpers.poster("/api/v1/events/create", payload);

        if (res?.success) {
            await loadCalendar();
            onClose();
        } else {
            alert(t("create_event_modal.error") + res);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-side-bg-color border border-overlay-border-color w-full max-w-md rounded-2xl shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-text-main">{t("create_event_modal.title")}</h3>
                    <button onClick={onClose} className="text-text-main rounded-full hover:scale-105 hover:border hover:border-text-main cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Event Details */}
                    <div className="space-y-3">
                        <input 
                            required
                            placeholder={t("create_event_modal.placeholder_title")}
                            className="w-full p-3 rounded-xl bg-bg-color border border-transparent focus:border-owner-color outline-none transition-all shadow-sm"
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                            <select 
                                value={formData.type}
                                className="p-3 rounded-xl bg-bg-color border border-transparent outline-none text-text-main cursor-pointer shadow-sm"
                                onChange={e => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="NONE">{t("create_event_modal.type_none")}</option>
                                <option value="MEETING">{t("create_event_modal.type_meeting")}</option>
                                <option value="CALL">{t("create_event_modal.type_call")}</option>
                                <option value="CONFERENCE">{t("create_event_modal.type_conference")}</option>
                                <option value="GENERIC">{t("create_event_modal.type_generic")}</option>
                            </select>

                            <DatePicker
                                selected={startDate}
                                onChange={(date: Date | null) => setStartDate(date)}
                                showTimeSelect
                                dateFormat="Pp"
                                locale={i18n.language}
                                className="w-full p-3 rounded-xl bg-bg-color border border-transparent outline-none cursor-pointer shadow-sm text-text-main"
                                placeholderText={t("create_event_modal.select_date")}
                            />
                        </div>

                        <textarea 
                            placeholder={t("create_event_modal.description")}
                            className="w-full p-3 rounded-xl bg-bg-color border border-transparent outline-none h-20 resize-none shadow-sm"
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    {/* FRIENDS SELECTION */}
                    <div className="flex flex-col gap-2 mt-2">
                        <div className="relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                <input 
                                    type="text"
                                    placeholder={t("create_event_modal.search_friend")}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-color border border-transparent focus:border-owner-color outline-none text-sm transition-all shadow-inner shadow-sm"
                                />
                            </div>

                            {searchTerm && (
                                <div className="absolute top-full left-0 w-full mt-1 bg-side-bg-color border border-overlay-border-color rounded-xl shadow-2xl z-50 overflow-hidden max-h-40 overflow-y-auto custom-scrollbar">
                                    {searchResults.length > 0 ? (
                                        searchResults.map(friend => (
                                            <div 
                                                key={friend.id}
                                                onClick={() => addFriend(friend.id)}
                                                className="p-3 hover:bg-owner-color/10 cursor-pointer text-xs text-text-main flex justify-between items-center border-b border-overlay-border-color last:border-none"
                                            >
                                                <span className="font-medium">{friend.name} {friend.surname}</span>
                                                <span className="text-[9px] text-zinc-500 uppercase bg-bg-color px-2 py-0.5 rounded-md border border-overlay-border-color">Invite +</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-[10px] text-zinc-500 italic">{t("create_event_modal.no_friends")}</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* SEZIONE PARTECIPANTI */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1 tracking-widest">
                                {t("create_event_modal.participants", { count: selectedFriends.length })}
                            </label>
                            
                            <div className="min-h-[50px] p-2 rounded-xl bg-main-bg-color/30 border border-dashed border-overlay-border-color flex flex-wrap gap-2 items-center">
                                {selectedFriends.length === 0 ? (
                                    <span className="text-[10px] text-zinc-600 italic ml-2">{t("create_event_modal.no_participants")}</span>
                                ) : (
                                    selectedFriends.map(id => {
                                        const friend = friends.find(f => f.id === id);
                                        return (
                                            <div key={id} className="flex items-center gap-2 bg-owner-color/20 border border-owner-color/30 pl-1 pr-2 py-1 rounded-lg animate-in fade-in zoom-in duration-200">
                                                <div className="w-8 h-8 rounded-full bg-side-bg-color overflow-hidden shrink-0 border border-overlay-border-color">
                                                    <img 
                                                        src={`${CONSTS.BE}/api/v1/users/${friend?.id}/avatar`} 
                                                        alt={`${friend?.name} avatar`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <span className="text-[11px] text-text-main font-medium">{friend?.name}</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeFriend(id)}
                                                    className="text-zinc-500 hover:text-red-500 transition-colors cursor-pointer ml-1">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <button 
                            disabled={loading}
                            className="w-[50%] py-2 bg-owner-color text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:hover:scale-105 cursor-pointer"
                        >
                            {loading ? t("create_event_modal.creating") : t("create_event_modal.create")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}