import React, { createContext, useContext, useEffect, useState, useRef, type ReactNode, useCallback } from 'react';
import consts from '../data/consts';
import helpers from '../utilities/helpers';
import type { CalendarEntries } from "../data/types";

export interface Friend {
	id: number;
	name: string;
	surname: string;
	email: string;
	jobQualifier: string;
	isLoggedIn: boolean;
	avatarUrl: string;
}

export interface FloatingChatInfo {
	roomId: string;
	senderMail: string;
	type: 'private' | 'group';
}

export interface ChatMessage {
	id: number | string;
	senderId: number;
	senderMail?: string;
	content: string;
	timestamp: string | number;
}

export interface FriendRequest 
{
	id: number;
	senderId: number;
	sender: {
		name: string;
		surname: string;
		email: string;
	};
	createdAt: string;
}

interface WebSocketContextType {
	socket: WebSocket | null;
	isReady: boolean;
	send: (data: any) => void;

	floatingChats: FloatingChatInfo[];
	openFloatingChat: (chat: FloatingChatInfo) => void;
	closeFloatingChat: (roomId: string) => void;
	friends: Friend[];

	messages: Record<string, ChatMessage[]>;
	setMessages: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>;
	loadHistory: (roomId: string, friendId: number) => Promise<void>;
	myUserId: number | null;

	pendingRequests: FriendRequest[]; // Nuova lista
    acceptRequest: (id: number) => Promise<void>;
    rejectRequest: (id: number) => Promise<void>;

	calendarEntries: CalendarEntries | null;
	loadCalendar: () => Promise<void>;
	alertThreshold: number; // Soglia in ore
  	updateAlertThreshold: (hours: number) => void;
	activeUser: any | null; // L'oggetto profilo completo
    refreshUser: () => Promise<void>;
}


const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [floatingChats, setFloatingChats] = useState<FloatingChatInfo[]>([]);
	const [friends, setFriends] = useState<Friend[]>([]);
	const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
	const [activeUser, setActiveUser] = useState<any | null>(null);
	const [myUserId, setMyUserId] = useState<number | null>(null);
	const friendsRef = useRef<Friend[]>([]);
	const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
	const [calendarEntries, setCalendarEntries] = useState<CalendarEntries | null>(null);

	const refreshUser = useCallback(async () => {
        const res = await helpers.getter('/api/v1/users/activeUser', null);
        if (res.success) {
            setMyUserId(res.data.id);
            setActiveUser(res.data); // Salva tutto l'oggetto qui!
        }
    }, []);

	const [alertThreshold, setAlertThreshold] = useState<number>(() => 
	{
		const saved = localStorage.getItem("projectx_alert_threshold");
		return saved ? parseInt(saved, 10) : 24;
  	});

	const updateAlertThreshold = (hours: number) => 
	{
		setAlertThreshold(hours);
		localStorage.setItem("projectx_alert_threshold", hours.toString());
  	};

	const loadCalendar = useCallback(async () => 
	{
		try {
			const res = await helpers.getter("/api/v1/users/calendarEntries", null);
			if (res?.success) {
				setCalendarEntries(res.data);
			}
		} catch (e) {
			console.error("Errore rinfresco calendario:", e);
		}
	}, []);

	const loadPending = async () => {
        const res = await helpers.getter('/api/v1/friends/requests/pending', null);
        if (res.success) setPendingRequests(res.data.requests);
    };

	const acceptRequest = async (requestId: number) => 
	{
        const res = await helpers.poster(`/api/v1/friends/requests/${requestId}/accept`, {});
        if (res.success) 
		{
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
            loadFriends();
        }
    };

    const rejectRequest = async (requestId: number) => {
        const res = await helpers.poster(`/api/v1/friends/requests/${requestId}/reject`, {});
        if (res.success) {
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        }
    };

	useEffect(() => {
		const fetchMe = async () => {
			const res = await helpers.getter('/api/v1/users/activeUser', null);
			if (res.success) setMyUserId(res.data.id);
		};
		refreshUser();
		fetchMe();
	}, []);

	useEffect(() => {
		friendsRef.current = friends;
	}, [friends]);

	useEffect(() =>
	{
		if (myUserId === null) return;

		const ws = new WebSocket(consts.WS);

		loadCalendar();
		loadFriends();
		loadPending();

		ws.onopen = () => {
			console.log("WS connected via Context");
			setIsReady(true);
		};

		ws.onmessage = (event) => {
			try 
			{
				const messageData = JSON.parse(event.data);

				if (["task:updated", "task:created", "event:updated", "event:created"].includes(messageData.type)) 
				{
        			loadCalendar();
    			}

				if (messageData.type === "friend:request") 
				{
					const newRequest = messageData.payload;
					setPendingRequests(prev =>
					{
						if (prev.find(r => r.id === newRequest.id)) return prev;
						return [newRequest, ...prev];
					});
				}

				if (messageData.type === "friend:request:accepted") 
				{
					console.log(messageData)
					loadFriends();
					setPendingRequests(prev => prev.filter(r => r.id !== messageData.requestId));
				}

                if (messageData.type === "friend:request:rejected")
                    setPendingRequests(prev => prev.filter(r => r.id !== messageData.requestId));

				if (messageData.type === "presence:update") {
					setFriends(prev => prev.map(f =>
						f.email === messageData.payload.email
						? { ...f, isLoggedIn: messageData.payload.online }
						: f
					));
				}

				if (messageData.type === "chat:message") {
					const friendId = messageData.fromUserId;
					const roomId = `private-${friendId}`;
					const friend = friendsRef.current.find(f => f.id === friendId);

					let finalContent = messageData.text;

					if (typeof finalContent === 'string' && finalContent.startsWith('{')) {
						const parsed = JSON.parse(finalContent);
						if (parsed.text) finalContent = parsed.text;
					}

					if (friend) {
						openFloatingChat({
							roomId,
							senderMail: friend.email,
							type: 'private'
						});
					}

					const newMessage: ChatMessage = {
						id: Date.now(),
						senderId: messageData.fromUserId,
						content: finalContent,
						timestamp: messageData.ts
					}

					setMessages(prev => ({
						...prev,
						[roomId]: [...(prev[roomId] || []), newMessage]
					}));
				}

			} catch (err) {
				console.error("ws message error:", err);
			}
		};

		ws.onclose = () => {
			console.log("WS closed");
			setIsReady(false);
		};

		setSocket(ws);

		return() => {
			if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
				ws.close();
		};
	}, [myUserId]);

	const loadHistory = async (roomId: string, friendId: number) => {
		if (!myUserId) return;

		const a = Math.min(myUserId, friendId);
		const b = Math.max(myUserId, friendId);
		
		const response = await helpers.getter(`/api/v1/messages/pvtHistory?userA=${a}&userB=${b}`, null);

		if (response.success) {
			setMessages(prev => ({
				...prev,
				[roomId]: response.data.messages
			}));
		}
	};

	const loadFriends = async () => {
		const response = await helpers.getter('/api/v1/friends/ACCEPTED', null);
		if (response.success)
			setFriends(response.data.friends);
	}

	const send = (data: any) => {
		if (socket && socket.readyState === WebSocket.OPEN)
			socket.send(JSON.stringify(data));
		else
			console.error("WS not ready. State", socket?.readyState);
	};

	const openFloatingChat = (chat: FloatingChatInfo) => {
		setFloatingChats(prev => {
			if (prev.find(c => c.roomId === chat.roomId)) {
				prev = prev.filter(c => c.roomId !== chat.roomId)
				return [chat, ...prev];
			}

			return [chat, ...prev];
		});
	};

	const closeFloatingChat = (roomId: string) => {
		setFloatingChats(prev => prev.filter(chat => chat.roomId !== roomId));
	};

	return (
		<WebSocketContext.Provider value={{
			socket,
			isReady,
			send,
			floatingChats,
			openFloatingChat,
			closeFloatingChat,
			friends,
			messages,
			setMessages,
			loadHistory,
			myUserId,
            pendingRequests,
            acceptRequest,
            rejectRequest,
			calendarEntries,
			loadCalendar,
			alertThreshold, 
      		updateAlertThreshold,
			activeUser,
            refreshUser,
			}}
		>
			{children}
		</WebSocketContext.Provider>
	)
};

export const useWebSocket = () => {
	const context = useContext(WebSocketContext);
	if (!context)
		throw new Error("useWebSocket must be used inside of a WebSocketProvider");
	return context;
}