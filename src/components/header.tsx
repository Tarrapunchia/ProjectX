import './header.css';
import { MOCK_USER } from '../data/mockData';

interface HeaderProps {
	setActivePage: (page: string) => void;
}

function Header({ setActivePage }: HeaderProps) {
	return (
		<header className="header">
			<h1>WIP</h1>
			<button onClick={() => setActivePage('profile')}>
				<img src={MOCK_USER.avatar} alt="Foto profilo" className="header-avatar"/>
			</button>
		</header>
	);
}

export default Header;