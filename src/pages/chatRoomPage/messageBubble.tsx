import React from 'react';
import type { MessageBubbleProps } from '../../data/types';

export const MessageBubble: React.FC<MessageBubbleProps> = ({ content, senderMail, isMe, timestamp }) => {
	const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});

	console.log(isMe);

	return (
		<div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-6`}>
			<div className="flex items-center space-x-2 mb-1">
				{!isMe && <span className="text-xs font-bold text-owner-color">{senderMail}</span>}
				<span className="text-[10px] text-gray-500">{time}</span>
			</div>
			<div className={`max-w-[80%] p-3 rounded-xl text-sm wrap-break-word shadow-sm ${
					isMe ? 'bg-owner-color text-white rounded-tr-none'
					: 'bg-category-bg-color text-main rounded-tl-none'
			}`}>
				{content}
			</div>
		</div>
	);
}