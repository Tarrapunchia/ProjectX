import { useEffect, useState, useCallback } from "react";
import { useWebSocket } from "../../utilities/WebSocketContext";
import helpers from '../../utilities/helpers';

interface NotificationItem {
    id: number;
    color: string;
    message: string;
    time: string;
    type: "info" | "request";
}

export default function Notification() {
    const { socket } = useWebSocket();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    // Usiamo useCallback per evitare che la funzione venga ricreata inutilmente
    const loadPending = useCallback(async () => {
        const res = await helpers.getter('/api/v1/friends/requests/pending', null);

        if (res.success && res.data?.requests) {
            const latestRequests = res.data.requests.map((r: any) => ({
                id: r.id,
                color: "text-blue-500",
                message: `Friend request from ${r.sender.name} ${r.sender.surname}`,
                time: r.createdAt,
                type: "request",
                senderId: r.senderId
            }));

            setNotifications(latestRequests);
        }
    }, []);

    const handleDecline = async (requestId: number) => 
	{
        if (!requestId) return;

        setNotifications(prev => prev.filter(n => n.id !== requestId));

        const res = await helpers.poster(`/api/v1/friends/requests/${requestId}/reject`, {});

        if (!res.success) {
            console.error("Failed to reject request");
            loadPending();
        }
    };

    const handleAccept = async (requestId: number) => {
        if (!requestId) return;

        setNotifications(prev => prev.filter(n => n.id !== requestId));

        const res = await helpers.poster(`/api/v1/friends/requests/${requestId}/accept`, {});

        if (!res.success) {
            console.error("Failed to accept request");
            loadPending();
        }
    };

    useEffect(() => {
        loadPending();
    }, [loadPending]);

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data);
                if (["friend:request", "friend:request:accepted", "friend:request:rejected"].includes(data.type)) {
                    loadPending();
                }
            } catch (err) {
                console.error("WS notification error:", err);
            }
        };

        socket.addEventListener("message", handleNotification);
        return () => socket.removeEventListener("message", handleNotification);
    }, [socket, loadPending]);

    function renderNotification(n: NotificationItem) {
        return (
            <div
                key={n.id}
                className="flex items-start gap-2 p-2 mt-2 rounded-lg cursor-pointer transition-colors shadow-sm border border-overlay-border-color hover:border-text-main w-[98%] shrink-0"
            >
                <span className={`${n.color} text-s leading-none`}>•</span>

                <div className="flex-1">
                    <p className="text-text-main text-sm">{n.message}</p>
                    <p className="text-gray-400 text-xs">{n.time}</p>
                </div>

                {n.type === "request" && (
                    <div className="flex gap-2 shrink-0">
                        <button 
                            className="px-2 py-1 cursor-pointer text-xs text-text-main rounded-lg border border-green-600 hover:border-green-500 hover:scale-105 transition"
                            onClick={(e) => { e.stopPropagation(); handleAccept(n.id); }}
                        > 
                            Accept
                        </button>
                        <button 
                            className="px-2 py-1 cursor-pointer text-xs text-text-main rounded-lg border border-red-600 hover:border-red-500 hover:scale-105 transition"
                            onClick={(e) => { e.stopPropagation(); handleDecline(n.id); }}
                        > 
                            Decline
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <h2 className="text-lg text-text-main font-semibold mb-6 flex justify-center shrink-0">
                Requests
            </h2>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {notifications.length > 0 ? (
                    notifications.map(renderNotification)
                ) : (
                    <p className="text-center text-gray-500 text-sm mt-10">No pending requests.</p>
                )}
            </div>
        </div>
    );
}