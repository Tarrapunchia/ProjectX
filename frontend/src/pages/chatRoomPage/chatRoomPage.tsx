import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Connections from './connection';
import { MessageBubble } from './messageBubble';
import { ChatInput } from './chatInput';
import { useWebSocket, type ProjectDetailed } from '../../utilities/WebSocketContext';
import consts from '../../data/consts';
import helpers from '../../utilities/helpers';

interface ChatPageProps {
    selectedProject: ProjectDetailed | null
}

const ChatPage: React.FC<ChatPageProps> = ({ selectedProject }) => {
    const { t } = useTranslation();
    const [serverUrl] = useState(consts.BE);
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [roomId, setRoomId] = useState<string>('');
    const [myMail, setMyMail] = useState<string>('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const { socket, isReady, send } = useWebSocket();
    
    useEffect(() => {
        let cancelled = false;
        if (selectedProject && isReady) {
            (async () => {
                try {
                    const id = await Connections.getRoomId(serverUrl, selectedProject);
                    if (!cancelled) setRoomId(id);
                    
                    send({ type: "room:join", roomId: id});

                    const userData = await helpers.getter('/api/v1/users/activeUser', null);
                    if (!cancelled) setMyMail(userData.data.email);

                    const data = await Connections.getRoomHistory(serverUrl, id);
                    if (data?.messages && !cancelled) setChatHistory(data.messages);

                    const handleIncomingMessage = (e: MessageEvent) => {
                        try {
                            const messageData = JSON.parse(e.data);

                            if (messageData.type === "room:message" && messageData.roomId === id) {
                                const senderId = messageData.fromUserId;
                                (async () => {
                                    try {
                                        const response = await helpers.getter(`/api/v1/users/${senderId}/profile`, null);
                                        
                                        if (response.success) {
                                            console.log("SENDER DATA", response.data);
                                            const newMessage = {
                                                id: Date.now(),
                                                senderMail: response.data.email,
                                                content: messageData.payload.text,
                                                timestamp: messageData.payload.timestamp || new Date().toISOString()
                                            };
    
                                            if (!cancelled) setChatHistory((prev) => [...prev, newMessage]);
                                        } else {
                                            console.log("FAILED");
                                        }

                                    } catch (err) {
                                        console.error("Websocket senderUser error", err);
                                    }
                                })();
                            }
                        } catch (err) {
                            console.error("WebSocket message parsing error:", err);
                        }
                    };

                    socket?.addEventListener('message', handleIncomingMessage);

                    return () => {
                        socket?.removeEventListener('message', handleIncomingMessage);
                    }
                } catch (e) {
                    console.error(e)
                }
            })();
        }
        return () => { cancelled = true; };
    }, [selectedProject?.id, serverUrl, isReady, socket, myMail]);

    useEffect(() => {
        if (scrollRef.current)
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chatHistory]);

    const handleSendMessage = (content: string) => {
        if (!isReady) return;

        const newMessage = {
            id: Date.now(),
            senderMail: myMail,
            content: content,
            timestamp: new Date().toISOString()
        };

        setChatHistory((prev) => [...prev, newMessage]);

        send({ type:"room:message", roomId:roomId, payload:{ text:content } });
        console.log("Sending to backend", content);
    };

    if (!selectedProject)
        return <div className="flex h-full items-center justify-center text-gray-500">{t('chat_page.select_project')}</div>

    return (
        <div className="flex flex-col h-full bg-bg-color overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-overlay-border-color bg-bg-color">
                <h2 className="text-xl font-bold text-text-main uppercase tracking-tight">{t('chat_page.team_chat')}</h2>
                <p className="mt-1 text-xs text-owner-color font-semibold tracking-wider">{selectedProject?.name || t('chat_page.loading')}</p>
            </div>
            {/* Message List */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 no-scrollbar">
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