import React, { useState, useEffect, useRef } from 'react';
import type { ProjectInfo } from "../../data/types"
import Connections from './connection';
import { MessageBubble } from './messageBubble';
import { ChatInput } from './chatInput';
import { ws } from '../loginPage/login';
import consts from '../../data/consts';
import helpers from '../../utilities/helpers';

interface ChatPageProps {
    selectedProject: ProjectInfo | null
}

const ChatPage: React.FC<ChatPageProps> = ({ selectedProject }) => {
    const [serverUrl] = useState(consts.BE);
	const [chatHistory, setChatHistory] = useState<any[]>([]);
	const [roomId, setRoomId] = useState<string>('');
	const [myMail, setMyMail] = useState<string>('');
	const scrollRef = useRef<HTMLDivElement>(null);
	
	useEffect(() => {
		let cancelled = false;
		if (selectedProject) {
			(async () => {
				try {
					const id = await Connections.getRoomId(serverUrl, selectedProject);
					if (!cancelled) setRoomId(id);
					
					if (!ws || ws.readyState  !== WebSocket.OPEN) return;
					
					ws.send(JSON.stringify({ type:"room:join", roomId:id}))
					const userData = await helpers.getter('/api/v1/users/activeUser', null);
					if (!cancelled) setMyMail(userData.data.email);

					const data = await Connections.getRoomHistory(serverUrl, id);
					if (data?.messages && !cancelled) setChatHistory(data.messages);

					ws.onmessage = (e: MessageEvent) => {
						try {
							const messageData = JSON.parse(e.data);

							if (messageData.type === "room:message" && messageData.roomId === id) {
								const newMessage = {
									id: messageData.payload.id || Date.now(),
									senderMail: messageData.payload.senderMail,
									content: messageData.payload.text,
									timestamp: messageData.payload.timestamp || new Date().toISOString()
								};

								if (!cancelled)
									setChatHistory((prev) => [...prev, newMessage]);
							}
						} catch (err) {
							console.error("WebSocket message parsing error:", err);
						}
					};
				} catch (e) {
					console.error(e)
				}
			})();
		}
		return () => { 
			cancelled = true;
			if (ws) ws.onmessage = null;
		};
	}, [selectedProject?.id, serverUrl]);

	useEffect(() => {
		if (scrollRef.current)
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
	}, [chatHistory]);

	const handleSendMessage = (content: string) => {
		if (!ws || ws.readyState !== WebSocket.OPEN) return;

		const newMessage = {
			id: Date.now(),
			senderMail: myMail,
			content: content,
			timestamp: new Date().toISOString()
		};

		setChatHistory((prev) => [...prev, newMessage]);

		ws.send(JSON.stringify({ type:"room:message", roomId:roomId, payload:{ text:content } }))
		console.log("Sending to backend", content);
	};

	if (!selectedProject)
		return <div className="flex h-full items-center justify-center text-gray-500">Select a project.</div>

	return (
		<div className="flex flex-col h-full bg-bg-color overflow-hidden">
			{/* Header */}
			<div className="p-4 border-b border-overlay-border-color bg-overlay-bg-color">
				<h2 className="text-xl font-bold text-white uppercase tracking-tight">Team Chat</h2>
				<p className="text-xs text-owner-color font-mono">ID: {roomId}</p>
			</div>
			{/* Message List */}
			<div ref={scrollRef} className="flex-1 overflow-y-auto p-6 scrollbar-thin">
				{chatHistory.map((m) => (
					<MessageBubble
						key={m.id}
						content={m.content}
						senderMail={m.senderMail}
						isMe={m.senderMail === myMail}
						timestamp={m.timestamp}
					/>
				))}
			</div>
			{/* Input */}
			<ChatInput onSendMessage={handleSendMessage}/>
		</div>
	);
};

export default ChatPage;