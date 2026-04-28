import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import consts from '../data/consts';

interface WebSocketContextType {
	socket: WebSocket | null;
	isReady: boolean;
	send: (data: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const ws = new WebSocket(consts.WS);

		ws.onopen = () => {
			console.log("WS connected via Context");
			setIsReady(true);
		};

		ws.onclose = () => {
			console.log("WS closed");
			setIsReady(false);
		};

		setSocket(ws);

		return() => {
			ws.close();
		};
	}, []);

	const send = (data: any) => {
		if (socket && socket.readyState === WebSocket.OPEN)
			socket.send(JSON.stringify(data));
	};

	return (
		<WebSocketContext.Provider value={{ socket, isReady, send}}>
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