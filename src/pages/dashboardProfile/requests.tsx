import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "../../utilities/WebSocketContext";
import { Bell, UserPlus, Clock, Calendar as CalendarIcon, AlertCircle } from "lucide-react";

export default function NotificationsCenter() 
{
    const { t } = useTranslation();
    const { pendingRequests, calendarEntries, alertThreshold, acceptRequest, rejectRequest } = useWebSocket();

    const alerts = useMemo(() => {
        if (!calendarEntries) return [];

        const now = new Date();
        const limitDate = new Date(now.getTime() + alertThreshold * 60 * 60 * 1000);
        const list: any[] = [];

        calendarEntries.tasks?.forEach(task => {
            if (task.dueDate && task.status !== "COMPLETED") {
                const d = new Date(task.dueDate);
                if (d >= now && d <= limitDate) {
                    list.push({
                        id: `task-${task.id}`,
                        type: "deadline",
                        title: t("notifications.deadline_title"),
                        message: t("notifications.deadline_msg", { name: task.name }),
                        color: "text-orange-500"
                    });
                }
            }
        });

        calendarEntries.events?.forEach(event => {
            const d = new Date(event.dueDate);
            if (d >= now && d <= limitDate) {
                list.push({
                    id: `event-${event.id}`,
                    type: "event",
                    title: t("notifications.event_title"),
                    message: t("notifications.event_msg", { name: event.name }),
                    color: "text-blue-500"
                });
            }
        });

        return list;
    }, [calendarEntries, alertThreshold, t]);

    return (
        <div className="flex flex-col h-full overflow-hidden p-4">
            <h2 className="text-lg text-text-main font-semibold mb-6 flex items-center gap-2 shrink-0">
                <Bell size={18} /> {t("notifications.title")}
            </h2>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
                
                {pendingRequests.length > 0 && 
                (
                    <section>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <UserPlus size={12} /> {t("notifications.requests")}
                        </h3>
                        <div className="space-y-2">
                            {pendingRequests.map((req) => (
                                <div key={`${req.reqType}-${req.id}`} className="p-3 rounded-xl bg-side-bg-color border border-overlay-border-color shadow-sm">
                                    
                                    <p className="text-text-main text-xs font-medium mb-2">
                                        {req.reqType === 'friend' 
                                            ? t("notifications.friend_request", { 
                                                name: req.sender?.name || t("notifications.someone"), 
                                                surname: req.sender?.surname || "" 
                                              })
                                            : t("notifications.org_invite", { 
                                                name: req.sender?.name || t("notifications.someone"), 
                                                surname: req.sender?.surname || "",
                                                orgName: req.organization?.name || t("notifications.an_org")
                                              })
                                        }
                                    </p>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => acceptRequest(req.id, req.reqType)}
                                            className="flex-1 py-1.5 text-[10px] bg-green-600/10 text-green-500 border border-green-600/20 rounded-lg hover:bg-green-600 hover:text-white transition cursor-pointer"
                                        >
                                            {t("notifications.accept")}
                                        </button>
                                        <button 
                                            onClick={() => rejectRequest(req.id, req.reqType)}
                                            className="flex-1 py-1.5 text-[10px] bg-red-600/10 text-red-500 border border-red-600/20 rounded-lg hover:bg-red-600 hover:text-white transition cursor-pointer"
                                        >
                                            {t("notifications.decline")}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Clock size={12} /> {t("notifications.activity")}
                    </h3>
                    <div className="space-y-3">
                        {alerts.length > 0 ? (
                            alerts.map((n) => (
                                <div key={n.id} className="flex gap-3 p-3 rounded-xl border border-overlay-border-color shadow-sm group">
                                    <div className={`mt-0.5 shrink-0 ${n.color}`}>
                                        {n.type === 'deadline' ? <AlertCircle size={16} /> : <CalendarIcon size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-text-main truncate">{n.title}</p>
                                        <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{n.message}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 text-[11px] py-10 italic">
                                {t("notifications.no_alerts")}
                            </p>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
}