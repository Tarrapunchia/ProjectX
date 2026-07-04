import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSend, FiPaperclip } from 'react-icons/fi';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
    const { t } = useTranslation();
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(text);
            setText('');
        }
    };

    return (
        <div className="p-4 bg-bg-color border-t border-overlay-border-color">
            <div className="flex items-center space-x-2 bg-overlay-bg-color rounded-lg border border-overlay-border-color p-2 focus-within:border-owner-color transition-colors">
                <button className="!p-2 text-gray-400 hover:text-white transition-colors !bg-transparent !border-none">
                    <FiPaperclip size={20} />
                </button>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t('chat_input.placeholder')}
                    className="flex-1 bg-transparent border-none outline-none text-text-main placeholder-gray-600 text-sm"
                />
                <button
                    onClick={handleSend}
                    className="!p-2 !bg-owner-color text-white rounded-md hover:opacity-90 transition-opacity !border-none cursor-pointer"
                >
                    <FiSend size={18} />
                </button>
            </div>
        </div>
    );
};