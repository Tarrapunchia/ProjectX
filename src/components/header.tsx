import './header.css';
import { MOCK_USER, AVATAR } from '../data/mockData';
import type { ProjectInfo } from '../data/types';
import { FiRepeat } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import CONSTS from '../data/consts';

interface HeaderProps {
	setActivePage: (page: string) => void;
	selectedProject: ProjectInfo | null;
}

function Header({ setActivePage, selectedProject }: HeaderProps) {
		const [userInfo, setUserInfo] = useState<{email: string, avatar: string}>({email: MOCK_USER.email, avatar: MOCK_USER.avatar})
		const [infoFetched, setInfoFetched] = useState<boolean>(false)
	
		useEffect(() => {
			(async () => {
				try {
					const res = await fetch(
						`${CONSTS.BE}/api/v1/users/activeUserAvatar`,
						{
							method: 'GET',
							headers: { "Content-Type": 'application/json' },
							credentials: 'include'
						}
					)
					if (res.ok) {
						const user = await res.json()
						setUserInfo(user)
						setInfoFetched(true)
					}
				} catch (error) {
					console.log(error)
					return { success: false, usr: '' }
				}
			})()
			return () => {};
		}, []);
	return (
		<header className="header">
			<span onClick={() => setActivePage('projects')} className="icon">
				<FiRepeat/>
			</span>
			<h1>
				{selectedProject ? selectedProject.name : 'Dashboard'}
			</h1>
			<button onClick={() => setActivePage('profile')}>
				{infoFetched && <img src={`${CONSTS.BE + userInfo.avatar}`} alt="Foto profilo" className="header-avatar"/>}
				{!infoFetched && <img src={MOCK_USER.avatar} alt="Foto profilo" className="header-avatar"/>}
			</button>
		</header>
	);
}

export default Header;