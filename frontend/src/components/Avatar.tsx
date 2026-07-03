import { useState, useEffect } from 'react';

interface AvatarProps {
	src?: string | null;
	alt?: string;
	className?: string;
}

const PLACEHOLDER = '/placeholder-avatar.png';

export function Avatar({ src, alt = 'Avatar', className }: AvatarProps) {
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		setFailed(false);
	}, [src]);

	const resolvedSrc = !failed && src ? src : PLACEHOLDER;

	return (
		<img
			src={resolvedSrc}
			alt={alt}
			className={className}
			onError={() => setFailed(true)}
		/>
	);
}