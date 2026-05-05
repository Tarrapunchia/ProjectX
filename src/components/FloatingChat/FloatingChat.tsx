import React, { useState, useRef, useEffect } from 'react';
import { ChatButton } from './ChatButton';
import { ChatMenu } from './ChatMenu';

interface FloatingChatProps {
	myMail: string;
}

function FloatingChat() {
	const [isOpen, setIsOpen] = useState(false);
	const [pos, setPos] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 120 });
	const [isDragging, setIsDragging] = useState(false);
	
	const offset = useRef({ x: 0, y: 0});
	const hasMoved = useRef(false);
	const startPos = useRef({ x: 0, y: 0 });

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

	useEffect(() => {
		const handleResize = () => {
			setPos(prevPos => ({
				x: Math.min(prevPos.x, window.innerWidth - 60),
				y: Math.min(prevPos.y, window.innerHeight - 60)
			}));
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

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
			{/* <div className="flex items-center justify-center w-14 h-14 rounded-full bg-bg-color text-color-main shadow-lg hover:scale-110 active:scale-95 transition-transform focus:outline-none border border-overlay-border-color cursor-pointer"
				onClick={ () => {
					if (!hasMoved.current)
						setIsOpen(!isOpen)
				}}
			> */}
			<ChatButton
				isOpen={isOpen}
				onClick={() => !hasMoved.current && setIsOpen(!isOpen)}
			/>
			<ChatMenu
				isOpen={isOpen}
				isDragging={isDragging}
				pos={pos}
			/>
			{/* </div> */}
		</div>
	);
}

export default FloatingChat;