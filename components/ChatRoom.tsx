
import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';

interface ChatRoomProps {
  currentUser: User;
}

const INITIAL_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'u2', senderName: 'Sarah', content: 'Hey everyone, check the new documentation for the API!', timestamp: '10:05 AM' },
  { id: 'm2', senderId: 'u3', senderName: 'Mike', content: 'Looks great! I will start the integration today.', timestamp: '10:12 AM' },
];

const ChatRoom: React.FC<ChatRoomProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
    setInput('');

    // Mock auto-reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'bot',
        senderName: 'Assistant',
        content: 'Acknowledged! I will record that in the task board.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">#</div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">#engineering-general</h3>
            <p className="text-[10px] text-slate-500">12 members online</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.senderId === currentUser.id ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
              msg.senderId === 'bot' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'
            }`}>
              {msg.senderName.charAt(0)}
            </div>
            <div className={`max-w-[70%] ${msg.senderId === currentUser.id ? 'items-end' : ''}`}>
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[11px] font-bold text-slate-700">{msg.senderName}</span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
              </div>
              <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                msg.senderId === currentUser.id 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-700 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm">
          <button className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
          <input 
            type="text" 
            placeholder="Send a message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 outline-none text-sm bg-transparent h-10"
          />
          <button 
            onClick={handleSend}
            className="text-indigo-600 font-bold text-sm hover:text-indigo-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
