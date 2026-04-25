import React, { useEffect, useState } from 'react';
import './chat.css';
import type { ProjectInfo } from '../../data/types';
import Connections from './connection'

type Message = {
    id: number,
    senderId: number,
    senderMail: string,
    content: any,
    timestamp: Date
}

interface chatProps {
    selectedProject: ProjectInfo | null
}

const chat: React.FC<chatProps> = ({ selectedProject }) => {
    
    const [serverUrl, setServerUrl] = React.useState('https://localhost:5000') // backend:5000
    const [chatHistory, setChatHistory] = React.useState<Array<Message>>([]);
    const [roomId, setRoomId] = React.useState<string>('');

    useEffect(() => {
        let cancelled = false;
        if (selectedProject) {
            (async () => {
                try {
                    const id = await Connections.getRoomId(serverUrl, selectedProject);
                    if (!cancelled) setRoomId(id);
                    // console.log(`PRIMA ${id}`)
                    // if (!cancelled) setRoomId(`proj:7:19`);
                    
                    const data = await Connections.getRoomHistory(serverUrl, id)
                    if (data.count != 0) {
                        const msgs = data.messages
                        setChatHistory(msgs)
                    }
                } catch (e) {
                    console.log(e);
                    if (!cancelled) setRoomId('');
                }
            })();
        }

        return () => { cancelled = true; };
    }, [serverUrl, selectedProject?.id]);

    return (
        <>
            ROOM ID {roomId}
            {chatHistory.map(m => {
                return (<p>`[{m.timestamp}]({m.senderMail}) - {m.content}`</p>)
            })}
        </>
    );
};
export default chat;