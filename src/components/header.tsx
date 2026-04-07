import './header.css';
import { MOCK_USER, AVATAR } from '../data/mockData';
import type { ProjectInfo } from '../data/types';
import { FiRepeat } from 'react-icons/fi';

interface HeaderProps {
	setActivePage: (page: string) => void;
	selectedProject: ProjectInfo | null;
}

function Header({ setActivePage, selectedProject }: HeaderProps) {
	return (
		<header className="header">
			<span onClick={() => setActivePage('projects')} className="icon">
				<FiRepeat/>
			</span>
			<h1>
				{selectedProject ? selectedProject.name : 'Dashboard'}
			</h1>
			<button onClick={() => setActivePage('profile')}>
				{/* <img src={MOCK_USER.avatar} alt="Foto profilo" className="header-avatar"/> */}
				<img src={AVATAR} alt="Foto profilo" className="header-avatar"/>
			</button>
		</header>
	);
}

export default Header;