// import './header.css';
// import { MOCK_USER } from '../data/mockData';
// import type { ProjectInfo } from '../data/types';
// import { FiRepeat } from 'react-icons/fi';
// import { useEffect, useState } from 'react';
// import CONSTS from '../data/consts';

// interface HeaderProps {
// 	setActivePage: (page: string) => void;
// 	selectedProject: ProjectInfo | null;
// }

// function Header({ setActivePage, selectedProject }: HeaderProps) {
// 		const [userInfo, setUserInfo] = useState<{email: string, avatar: string}>({email: MOCK_USER.email, avatar: MOCK_USER.avatar})
// 		const [infoFetched, setInfoFetched] = useState<boolean>(false)
	
// 		useEffect(() => {
// 			(async () => {
// 				try {
// 					const res = await fetch(
// 						`${CONSTS.BE}/api/v1/users/activeUserAvatar`,
// 						{
// 							method: 'GET',
// 							headers: { "Content-Type": 'application/json' },
// 							credentials: 'include'
// 						}
// 					)
// 					if (res.ok) {
// 						const user = await res.json()
// 						setUserInfo(user)
// 						setInfoFetched(true)
// 					}
// 				} catch (error) {
// 					console.log(error)
// 					return { success: false, usr: '' }
// 				}
// 			})()
// 			return () => {};
// 		}, []);
// 	return (
// 		<header className="header">
// 			<span onClick={() => setActivePage('projects')} className="icon">
// 				<FiRepeat/>
// 			</span>
// 			<h1>
// 				{selectedProject ? selectedProject.name : 'Dashboard'}
// 			</h1>
// 			<button onClick={() => setActivePage('profile')}>
// 				{infoFetched && <img src={`${CONSTS.BE + userInfo.avatar}`} alt="Foto profilo" className="header-avatar"/>}
// 				{!infoFetched && <img src={MOCK_USER.avatar} alt="Foto profilo" className="header-avatar"/>}
// 			</button>
// 		</header>
// 	);
// }

// export default Header;

import { MOCK_USER } from '../data/mockData';
import type { ProjectInfo } from '../data/types';
import { FiRepeat } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import CONSTS from '../data/consts';
import SearchBar from './SearchBar';

interface HeaderProps {
	setActivePage: (page: string) => void;
	selectedProject: ProjectInfo | null;
}

function Header({ setActivePage, selectedProject }: HeaderProps) {
	const [userInfo, setUserInfo] = useState<{ email: string, avatar: string }>({ email: MOCK_USER.email, avatar: MOCK_USER.avatar })
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
	}, []);

	return (
		<header className="bg-[#333] text-white p-[15px_20px] [grid-area:header] flex items-center border-b border-overlay-border-color overflow-hidden">
			<span 
				onClick={() => setActivePage('projects')} 
				className="relative inline-flex items-center justify-center w-[40px] h-[40px] rounded-full border-2 border-white cursor-pointer mr-[15px] ml-[5px] text-[20px] hover:bg-[#3e3e3e] group
				after:content-['Change_Project'] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:mt-[5px]
				after:bg-bg-color after:border after:border-[#333] after:text-white after:py-[5px] after:px-[10px] after:rounded-[4px] after:text-[12px] after:white-space-nowrap
				after:opacity-0 after:invisible after:transition-opacity after:duration-300
				hover:after:opacity-100 hover:after:visible"
			>
				<FiRepeat />
			</span>
			<h1 className="flex-1 min-w-0 truncate m-0 mr-[50px] text-[35px] font-bold leading-tight">
				{selectedProject ? selectedProject.name : 'Dashboard'}
			</h1>
			<SearchBar />
			<button 
				onClick={() => setActivePage('profile')}
				className="ml-auto mr-[20px] !p-0 !bg-transparent !border-none cursor-pointer focus:!outline-none focus:!border-none active:!border-none"
			>
				<img 
					src={infoFetched ? `${CONSTS.BE + userInfo.avatar}` : MOCK_USER.avatar} 
					alt="Foto profilo" 
					className="w-[50px] h-[50px] rounded-full object-cover block"
				/>
			</button>
		</header>
	);
}

export default Header;