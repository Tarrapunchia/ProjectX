import React, { useEffect } from 'react';
import './chat.css';
import Connections from './connection'
import consts from '../../data/consts';
import type { ProjectDetailed } from '../../utilities/WebSocketContext';

type Message = {
    id: number,
    senderId: number,
    senderMail: string,
    content: any,
    timestamp: Date
}

interface chatProps {
    selectedProject: ProjectDetailed | null
}

const chat: React.FC<chatProps> = ({ selectedProject }) => {
    
    const [chatHistory, setChatHistory] = React.useState<Array<Message>>([]);
    const [roomId, setRoomId] = React.useState<string>('');

    useEffect(() => {
        let cancelled = false;
        if (selectedProject) {
            (async () => {
                try {
                    const id = await Connections.getRoomId(consts.BE, selectedProject);
                    if (!cancelled) setRoomId(id);
                    
                    const data = await Connections.getRoomHistory(consts.BE, id)
                    if (data.count != 0) {
                        const msgs = data.messages
                        setChatHistory(msgs)
                    }
                } catch (e) {
                    console.error(e);
                    if (!cancelled) setRoomId('');
                }
            })();
        }

        return () => { cancelled = true; };
    }, [consts.BE, selectedProject?.id]);

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