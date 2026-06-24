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

export interface GroupUser {
	id: number;
	name: string;
	surname: string;
	email: string;
	avatarUrl: string;
	isLoggedIn: boolean;
}

export interface Participant {
	userId: number;
	groupId: number;
	createdAt: string;
	user: GroupUser;
}

export interface Group {
	id: string;
	name: string;
	description: string;
	createdAt: Date;
	closedAt: string | null;
	participants: Participant[];
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

export interface PendingRequest 
{
    id: number;
    reqType: 'friend' | 'org';
    senderId: number;
    sender: {
        name: string;
        surname: string;
        email: string;
    };
    createdAt: string;
    // Campi esclusivi per gli inviti org
    organization?: {
        id: number;
        name: string;
    };
}

interface WebSocketContextType {
	socket: WebSocket | null;
	isReady: boolean;
	send: (data: any) => void;

	floatingChats: FloatingChatInfo[];
	openFloatingChat: (chat: FloatingChatInfo) => void;
	closeFloatingChat: (roomId: string) => void;
	friends: Friend[];
	groups: Group[];
	loadGroups: () => Promise<void>;

	messages: Record<string, ChatMessage[]>;
	setMessages: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>;
	loadHistory: (roomId: string, friendId: number) => Promise<void>;
	myUserId: number | null;

	pendingRequests: PendingRequest[];
    acceptRequest: (id: number, reqType: 'friend' | 'org') => Promise<void>;
    rejectRequest: (id: number, reqType: 'friend' | 'org') => Promise<void>;

	calendarEntries: CalendarEntries | null;
	loadCalendar: () => Promise<void>;
	alertThreshold: number; // Soglia in ore
  	updateAlertThreshold: (hours: number) => void;
	activeUser: any | null; // L'oggetto profilo completo
    refreshUser: () => Promise<void>;

	blockedUsers: Friend[]; // <--- NUOVO
    loadBlockedUsers: () => Promise<void>;
}


const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [floatingChats, setFloatingChats] = useState<FloatingChatInfo[]>([]);
	const [friends, setFriends] = useState<Friend[]>([]);
	const [groups, setGroups] = useState<Group[]>([]);
	const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
	const [activeUser, setActiveUser] = useState<any | null>(null);
	const [myUserId, setMyUserId] = useState<number | null>(null);
	const friendsRef = useRef<Friend[]>([]);
	const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
	const [calendarEntries, setCalendarEntries] = useState<CalendarEntries | null>(null);
	const [blockedUsers, setBlockedUsers] = useState<Friend[]>([]);

	const refreshUser = useCallback(async () => {
        const res = await helpers.getter('/api/v1/users/activeUser', null);
        if (res.success) {
            setMyUserId(res.data.id);
            setActiveUser(res.data);
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

	const loadPending = async () => 
	{
        const [friendsRes, orgsRes] = await Promise.all([
            helpers.getter('/api/v1/friends/requests/pending', null),
            helpers.getter('/api/v1/organizations/invitations/pending', null)
        ]);

        let combined: PendingRequest[] = [];

        if (friendsRes.success) {
            const friends = friendsRes.data.requests.map((r: any) => ({
                ...r,
                reqType: 'friend'
            }));
            combined = [...combined, ...friends];
        }

        if (orgsRes.success) {
            const orgs = orgsRes.data.invitations.map((i: any) => ({
                ...i,
                reqType: 'org'
            }));
            combined = [...combined, ...orgs];
        }

        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPendingRequests(combined);
    };

	const acceptRequest = async (requestId: number, reqType: 'friend' | 'org') => 
	{
        setPendingRequests(prev => prev.filter(r => !(r.id === requestId && r.reqType === reqType)));

        if (reqType === 'friend') {
            const res = await helpers.poster(`/api/v1/friends/requests/${requestId}/accept`, {});
            if (res.success) loadFriends();
        } else {
            const res = await helpers.poster(`/api/v1/organizations/10/invitations/${requestId}/accept`, {});
            if (res.success) loadGroups();
        }
    };

	const rejectRequest = async (requestId: number, reqType: 'friend' | 'org') => 
	{
        setPendingRequests(prev => prev.filter(r => !(r.id === requestId && r.reqType === reqType)));

        if (reqType === 'friend')
            await helpers.poster(`/api/v1/friends/requests/${requestId}/reject`, {});
        else
            await helpers.poster(`/api/v1/invitations/${requestId}/reject`, {});
    };

	const loadFriends = async () => {
		const response = await helpers.getter('/api/v1/friends/ACCEPTED', null);
		if (response.success)
			setFriends(response.data.friends);
	};

	const loadGroups = async () => {
		const response = await helpers.getter('/api/v1/groups/joined', null);
		if (response.success) {
			const joinedGroups: Group[] = response.data.groups.map((item: any) => item.group);
			setGroups(joinedGroups);
		}
	};

	const loadBlockedUsers = async () => {
        // Presupponendo che la tua API accetti lo status 'BLOCKED' come parametro
        const response = await helpers.getter('/api/v1/friends/BLOCKED', null);
        if (response.success) {
            setBlockedUsers(response.data.friends || response.data.blocked || []);
        }
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

	useEffect(() => {
		const fetchMeAndData = async () => {
			const res = await helpers.getter('/api/v1/users/activeUser', null);
			if (res.success) {
				setMyUserId(res.data.id);

				const friendsRes = await helpers.getter('/api/v1/friends/ACCEPTED', null);
				if (friendsRes.success) setFriends(friendsRes.data.friends);

				const blockedRes = await helpers.getter('/api/v1/friends/BLOCKED', null);
                if (blockedRes.success) {
                    // Dipende da come l'API chiama l'array nel JSON, adatta se serve
                    setBlockedUsers(blockedRes.data.friends || blockedRes.data.blocked || []); 
                }

				const groupRes = await helpers.getter('/api/v1/groups/joined', null);
				if (groupRes.success) {
					const joinedGroups: Group[] = groupRes.data.groups.map((item: any) => item.group);
					setGroups(joinedGroups);
				}
			}
		};
		refreshUser();
		fetchMeAndData();
	}, []);

	useEffect(() => {
		friendsRef.current = friends;
	}, [friends]);

	useEffect(() => {
		if (myUserId === null) return;

		const ws = new WebSocket(consts.WS);

		loadCalendar();
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
                    const newRequest = { ...messageData.payload, reqType: 'friend' as const };
                    
                    setPendingRequests(prev => {
                        if (prev.find(r => r.id === newRequest.id && r.reqType === 'friend')) return prev;
                        return [newRequest, ...prev];
                    });
                }

                if (messageData.type === "organization:invitation")
				{ 
                    const newInvite = { ...messageData.payload, reqType: 'org' as const };
                    
                    setPendingRequests(prev => {
                        if (prev.find(r => r.id === newInvite.id && r.reqType === 'org')) return prev;
                        return [newInvite, ...prev];
                    });
                }

				if (messageData.type === "friend:request:accepted") 
				{
					console.log(messageData)
					setPendingRequests(prev => prev.filter(r => r.id !== messageData.requestId));
					loadFriends();
				}

                if (messageData.type === "friend:request:rejected")
                    setPendingRequests(prev => prev.filter(r => r.id !== messageData.requestId));
				
				if (messageData.type === "presence") {
					setFriends(prev => prev.map(f =>
						f.id === messageData.payload.userId
						? { ...f, isLoggedIn: messageData.payload.connected}
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

	const send = (data: any) => {
		if (socket && socket.readyState === WebSocket.OPEN)
			socket.send(JSON.stringify(data));
		else
			console.error("WS not ready. State", socket?.readyState);
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
			groups,
			loadGroups,
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
			blockedUsers,
			loadBlockedUsers,
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