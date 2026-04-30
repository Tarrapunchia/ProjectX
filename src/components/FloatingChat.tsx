import React, { useState, useRef, useEffect } from 'react';
import { FiPlus, FiUsers } from 'react-icons/fi';
import { useWebSocket } from '../utilities/WebSocketContext';

interface FloatingChatProps {
	myMail: string;
}

function FloatingChat() {
	const [isOpen, setIsOpen] = useState(false);
	const [pos, setPos] = useState({ x: 50, y: 50 });
	const [isDragging, setIsDragging] = useState(false);
	const offset = useRef({ x: 0, y: 0});
	const hasMoved = useRef(false);
	const startPos = useRef({ x: 0, y: 0 });

	const menuSize = { x: 288, y: 320};

	const openLeft = pos.x + (menuSize.x + 4) > window.innerWidth;
	const openDown = pos.y - (menuSize.y + 4) < 0;

	const horizontalClass = openLeft ? 'right-16' : 'left-16';
	const verticalClass = openDown ? 'top-0' : 'bottom-0';
	const originClass = `origin-${openDown ? 'top' : 'bottom'}-${openLeft ? 'right' : 'left'}`;

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isDragging) return;

			const rawX = e.clientX - offset.current.x;
			const rawY = e.clientY - offset.current.y;

			const maxX = window.innerWidth - 60;
			const maxY = window.innerHeight - 60;

			const clampedX = Math.max(4, Math.min(rawX, maxX));
			const clampedY = Math.max(4, Math.min(rawY, maxY));
			setPos({ x: clampedX, y: clampedY });

			if (Math.abs(e.clientX - startPos.current.x) > 3 ||  Math.abs(e.clientY - startPos.current.y) > 3)
				hasMoved.current = true;
		};

		const handleMouseUp = () => {
			setIsDragging(false);
		};

		if (isDragging) {
			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('mouseup', handleMouseUp);
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging]);

	return (
		<div className="fixed select-none z-50"
			style={{ left: pos.x, top: pos.y }}
			onMouseDown={ (e) => {
				setIsDragging(true);
				hasMoved.current = false;

				startPos.current = {
					x: e.clientX,
					y: e.clientY
				};

				offset.current = {
					x: e.clientX - pos.x,
					y: e.clientY - pos.y
				};
			}}
			onMouseUp={ () => setIsDragging(false) }>
			<button className="flex items-center justify-center w-14 h-14 rounded-full bg-bg-color text-white shadow-lg hover:scale-110 active:scale-95 transition-transform focus:outline-none border border-overlay-border-color cursor-pointer"
				onClick={ () => {
					if (!hasMoved.current)
						setIsOpen(!isOpen)
				}}
			>
				<FiPlus size={26}
						className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
				/>
			</button>
			<div className={`absolute w-72 h-80 rounded-md bg-bg-color border border-overlay-border-color transition-transform duration-400
							${horizontalClass}
							${verticalClass}
							${originClass}
							${isOpen && !isDragging ? 'scale-100 shadow-xl' : 'scale-0'}`}>
				Div Test
			</div>
		</div>
	);

}

export default FloatingChat;