import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import consts from '../data/consts';
import helpers from '../utilities/helpers';

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

interface WebSocketContextType {
	socket: WebSocket | null;
	isReady: boolean;
	send: (data: any) => void;

	floatingChats: FloatingChatInfo[];
	openFloatingChat: (chat: FloatingChatInfo) => void;
	closeFloatingChat: (roomId: string) => void;
	friends: Friend[];
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [floatingChats, setFloatingChats] = useState<FloatingChatInfo[]>([]);
	const [friends, setFriends] = useState<Friend[]>([]);

	useEffect(() => {
		const ws = new WebSocket(consts.WS);

		loadFriends();

		ws.onopen = () => {
			console.log("WS connected via Context");
			setIsReady(true);
		};

		ws.onmessage = (event) => {
			try {
				const messageData = JSON.parse(event.data);

				if (messageData.type === "presence:update") {
					setFriends(prev => prev.map(f =>
						f.email === messageData.payload.email
						? { ...f, online: messageData.payload.online }
						: f
					));
				}
			} catch (err) {
				console.error("Ws message error:", err);
			}
		}

		ws.onclose = () => {
			console.log("WS closed");
			setIsReady(false);
		};

		setSocket(ws);

		return() => {
			ws.close();
		};
	}, []);

	const loadFriends = async () => {
		const response = await helpers.getter('/api/v1/friends/ACCEPTED', null);
		if (response.success)
			setFriends(response.data.friends);
	}

	const send = (data: any) => {
		if (socket && socket.readyState === WebSocket.OPEN)
			socket.send(JSON.stringify(data));
	};

	const openFloatingChat = (chat: FloatingChatInfo) => {
		setFloatingChats(prev => {
			if (prev.find(c => c.roomId === chat.roomId))
				return prev;

			return [...prev, chat];
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
			friends
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