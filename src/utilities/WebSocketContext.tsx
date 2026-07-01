import React, { createContext, useContext, useEffect, useState, useRef, type ReactNode, useCallback } from 'react';
import consts from '../data/consts';
import helpers from '../utilities/helpers';
import type { CalendarEntries } from "../data/types";

export interface User {
	id: number;
	name: string;
	surname: string;
	email: string;
	phone: string;
	jobQualifier: string;
	isLoggedIn: boolean;
	createdAt: Date;
	updatedAt: Date;
	avatar: string;
	organizations: void;
	projects: void;
	city: string;
	address: string;
	cap: string;
	state: string;
}

export interface Friend {
	id: number;
	name: string;
	surname: string;
	email: string;
	joinedAt: Date|null;
	avatarUrl: string;
	isLoggedIn: boolean;
}

export interface chatRoom {
	id: number;
	key: string;
	type: string;
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
	user: GroupUser;
}

export interface Group {
	id: string;
	name: string;
	description: string;
	createdAt: Date | null;
	closedAt: string | null;
	joinedAt: Date | null;
	participants: Participant[];
	chatRoom: chatRoom;
}

export interface FloatingChatInfo {
	roomId: string;
	roomKey: string|null;
	senderMail: string;
	type: 'private' | 'group';
}

export interface ChatMessage {
	id: number | string;
	senderId: number;
	senderName?: string;
	senderSurname?: string;
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

export interface Project
{
	id: number,
	name: string,
	status: string,
	description: string,
	createdAt: Date,
	closedAt: Date
}

export interface ProjectParticipant {
	user: {
		id: number,
		name: string,
		surname: string,
		email: string
	},
	role: string,
	joinedAt: Date
}

export interface ProjectDetailed extends Project {
	organization: { id: number, name: string },
	participants: ProjectParticipant[]
}

export interface Organization
{
	id: number,
	name: string,
	email: string,
	phone: string,
	city: string,
	address: string,
	cap: string,
	state: string,
	ownerId?: number,
	projects: Project[],
	members: User[]
}

interface WebSocketContextType {
	socket: WebSocket | null;
	isReady: boolean;
	send: (data: any) => void;

	floatingChats: FloatingChatInfo[];
	openFloatingChat: (chat: FloatingChatInfo) => void;
	closeFloatingChat: (roomId: string) => void;
	friends: Friend[];
	loadFriends: () => Promise<void>;
	groups: Group[];
	setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
	loadGroups: () => Promise<void>;

	messages: Record<string, ChatMessage[]>;
	setMessages: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>;
	loadHistory: (roomId: string, friendId: number) => Promise<void>;
	loadGroupHistory: (roomKey: string, roomId: string) => Promise<void>;
	myUserId: number | null;

	pendingRequests: PendingRequest[];
    acceptRequest: (id: number, reqType: 'friend' | 'org') => Promise<void>;
    rejectRequest: (id: number, reqType: 'friend' | 'org') => Promise<void>;

	calendarEntries: CalendarEntries | null;
	loadCalendar: () => Promise<void>;
	alertThreshold: number; // Soglia in ore
  	updateAlertThreshold: (hours: number) => void;
	activeUser: User | null;
	setActiveUser: React.Dispatch<React.SetStateAction<User | null>>;
    refreshUser: () => Promise<void>;

	blockedUsers: Friend[];
    loadBlockedUsers: () => Promise<void>;

	organizations: Organization[];
	setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
	activeOrg: Organization | null;
	setActiveOrg: React.Dispatch<React.SetStateAction<Organization | null>>;

	projects: Project[] | [];
	setProjects: React.Dispatch<React.SetStateAction<Project[] | []>>;
}


const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [floatingChats, setFloatingChats] = useState<FloatingChatInfo[]>([]);
	const [friends, setFriends] = useState<Friend[]>([]);
	const [groups, setGroups] = useState<Group[]>([]);
	const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
	const [activeUser, setActiveUser] = useState<User | null>(null);
	const [myUserId, setMyUserId] = useState<number | null>(null);
	// const [chatNotifications, setChatNotifications] = useState<Record<string, {chatInfo: FloatingChatInfo; count: number}>>({});
	const friendsRef = useRef<Friend[]>([]);
	const groupsRef = useRef<Group[]>([]);
	const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
	const [calendarEntries, setCalendarEntries] = useState<CalendarEntries | null>(null);
	const [blockedUsers, setBlockedUsers] = useState<Friend[]>([]);
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
	const [projects, setProjects] = useState<ProjectDetailed[] | []>([]);

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
			const joinedGroups: Group[] = response.data.groups;
			console.log(joinedGroups);
			setGroups(joinedGroups);
			console.log("load groups response success");
		}
	};

	const loadOrgs = async () => {
		const response = await helpers.getter('/api/v1/organizations', null);
		if (response.success)
			setOrganizations(response.data || []);
		setActiveOrg(null);
	}

	const loadProjects = async () => {
		const response = await helpers.getter('/api/v1/projects', null);
		if (response.success)
			setProjects(response.data || []);
	}

	const loadBlockedUsers = async () => {
        // Presupponendo che la tua API accetti lo status 'BLOCKED' come parametro
        const response = await helpers.getter('/api/v1/friends/BLOCKED', null);
        if (response.success) {
            setBlockedUsers(response.data.friends || response.data.blocked || []);
        }
    };

	const openFloatingChat = (chat: FloatingChatInfo) => {
		console.log(chat);
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
					const joinedGroups: Group[] = groupRes.data.groups;
					setGroups(joinedGroups);
					console.log(groups);
				}

				loadOrgs();
				loadProjects();
			}
		};
		refreshUser();
		fetchMeAndData();
	}, []);

	useEffect(() => {
		friendsRef.current = friends;
	}, [friends]);

	useEffect(() => {
		groupsRef.current = groups;
	}, [groups]);

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

				console.log(messageData.type);
				console.log(JSON.stringify(messageData, null, 2));

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
					const targetUserId = messageData.payload.userId;
					const isConnected = messageData.payload.connected;

					setFriends(prev => prev.map(f =>
						Number(f.id) === Number(targetUserId)
						? { ...f, isLoggedIn: isConnected}
						: f
					));

					setGroups(prev => prev.map(g => {
						const updatedParticipants = g.participants.map(p => {
							if (Number(p.user.id) === Number(targetUserId)) {
								return {
									...p,
									user: {
										...p.user,
										isLoggedIn: isConnected
									}
								};
							}
							return p;
						});
						return {
							...g,
							participants: updatedParticipants
						};
					}));
				}

				if (messageData.type === "group:participant:added" && messageData.addedUserId !== myUserId)
				{
					const { groupId, addedUserId, addedByUserId } = messageData;

					if (groupId && addedUserId) {
						(async () => {
							try {
								const response = await helpers.getter(`/api/v1/users/${addedUserId}/profile`, null);
								if (response && response.success) {
									const userData: User = response.data;

									const newGroupUser: GroupUser = {
										id: userData.id,
										name: userData.name,
										surname: userData.surname,
										email: userData.email,
										avatarUrl: userData.avatar,
										isLoggedIn: userData.isLoggedIn
									};

									const newParticipant: Participant = {
										user: newGroupUser
									};

									const currentGroup = groupsRef.current.find(g => g.id === groupId);
									const adder = currentGroup?.participants.find(p => Number(p.user.id) === Number(addedByUserId));
									setGroups(prevGroups => {
										return prevGroups.map(g => {
											if (g.id === groupId) {
												if (g.participants.some(p => p.user.id === addedUserId))
													return g;
												
												return {
													...g,
													participants: [...g.participants, newParticipant]
												};
											}
											return g;
										});
									});

									if (adder) {
										const newMessage: ChatMessage = {
											id: Date.now(),
											senderId: 0,
											content: `${adder.user.name} ${adder.user.surname.charAt(0)}. ha aggiunto ${newGroupUser.name} ${newGroupUser.surname}`,
											timestamp: Date.now()
										}
										setMessages(prev => ({
											...prev,
											[groupId]: [...(prev[groupId] || []), newMessage]
										}));
									}
								}
							} catch (err) {
								console.error("Error in adding participant via WS", err);
							}
						})();
					}
				}

				if (messageData.type === "group:joined")
				{
					const groupId = messageData.groupId;

					if (groupId) {
						(async () => {
							try {
								const response = await helpers.getter(`/api/v1/groups/${groupId}`, null);

								if (response && response.success) {
									const newGroup: Group = response.data;

									setGroups(prev => {
										if (prev.some(g => g.id === newGroup.id))
											return prev;

										return [...prev, newGroup];
									});
								}
							} catch (err) {
								console.error("Error in adding new group to list", err);
							}
						})();
					}
				}

				if (messageData.type === "group:invitation:leave")
				{
					const { groupId, acceptedByUserId } = messageData;

					if (groupId && acceptedByUserId) {
						(async () => {
							try {
								const targetUser = await helpers.getter(`/api/v1/users/${acceptedByUserId}/profile`, null);
								if (targetUser && targetUser.success) {
									const newMessage: ChatMessage = {
										id: Date.now(),
										senderId: 0,
										content: `${targetUser.data.name} ${targetUser.data.surname} ha lasciato il gruppo`,
										timestamp: Date.now()
									}
									setMessages(prev => ({
										...prev,
										[groupId]: [...(prev[groupId] || []), newMessage]
									}));
								}
							} catch (err) {
								console.error("Error in retrieving user", err);
							}
						})();

						setGroups(prev => {
							return prev.map(g => {
								if (g.id === groupId){
									return {
										...g,
										participants: g.participants.filter(p => Number(p.user.id) !== Number(acceptedByUserId))
									}
								}
								return g;
							})
						});
					}
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
							roomKey: null,
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

				if (messageData.type === "room:message") {
					console.log(messageData)
					const roomKey = messageData.roomId;
					const fromUserId = messageData.fromUserId;

					if (roomKey && fromUserId) {
						const roomId = roomKey.split(":")[1];
						const group = groupsRef.current.find(g => Number(g.id) === Number(roomId));

						(async () => {
							try {
								const response = await helpers.getter(`/api/v1/users/${fromUserId}/profile`, null);

								if (response && response.success && group) {
									const senderUser: User = response.data;

									const newChat: FloatingChatInfo = {
										roomId,
										roomKey,
										senderMail: group.name,
										type: 'group'
									}
									openFloatingChat(newChat);

									const newMessage: ChatMessage = {
										id: Date.now(),
										senderId: senderUser.id,
										content: messageData.payload.text,
										timestamp: messageData.ts,
										senderName: senderUser.name,
										senderSurname: senderUser.surname,
										senderMail: senderUser.email
									}

									setMessages(prev => ({
										...prev,
										[roomId]: [...(prev[roomId] || []), newMessage]
									}));
								}
							} catch (err) {
								console.error("Error in retrieving chat room messages", err);
							}
						})();
					}
				}

				if (messageData.type === "user:blocked") {
					setFriends(prev => prev.filter(f => f.id !== messageData.blockedById));
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

	const loadGroupHistory = async (roomKey: string, roomId: string) => {
		if (!roomId) return;

		const responseHistory = await helpers.getter(`/api/v1/messages/roomHistory?roomKey=${roomKey}`, null);

		console.log(responseHistory);
		if (responseHistory.success && responseHistory.data) {
			const rawMessages: any[] = responseHistory.data.messages || [];

			const currentGroup = groupsRef.current.find(g => Number(g.id) === Number(roomId));
			const participants = currentGroup?.participants || [];

			const formattedMessages: ChatMessage[] = rawMessages.map(msg => {
				const member = participants.find(p => Number(p.user.id) === Number(msg.senderId));

				return {
					id: msg.id,
					senderId: msg.senderId,
					senderMail: msg.senderMail,
					content: msg.content,
					timestamp: msg.timestamp,
					senderName: member ? member.user.name : '',
					senderSurname: member ? member.user.surname : ''
				};
			});

			setMessages(prev => ({
				...prev,
				[roomId]: formattedMessages
			}));
		}
	};

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
		console.log(data);
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
			setGroups,
			loadGroups,
			messages,
			setMessages,
			loadHistory,
			loadGroupHistory,
			myUserId,
            pendingRequests,
            acceptRequest,
            rejectRequest,
			calendarEntries,
			loadCalendar,
			alertThreshold, 
      		updateAlertThreshold,
			activeUser,
			setActiveUser,
            refreshUser,
			blockedUsers,
			loadBlockedUsers,
			organizations,
			setOrganizations,
			activeOrg,
			setActiveOrg,
			loadFriends,
			projects,
			setProjects
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