
// User data type
export interface ProfileUser {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	avatar: string;
	description: string;
}

// User's completed projects type
export interface CompletedProject {
	id: string;
	name: string;
	completedDate: string;
	role: string;
}

export interface Friend {
	id: string;
	name: string;
	avatar: string;
	status: 'online' | 'offline' | 'away';
}