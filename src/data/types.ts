
// User data type
export interface ProfileUser {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	avatar: string;
	description: string;
}

// User's completed projects type
export interface Projects {
	id: string;
	leader: string;
	name: string;
	startDate: string;
	completed: boolean;
	completedDate: string;
	role: string;
}

export interface Friend {
	id: string;
	name: string;
	avatar: string;
	status: 'online' | 'offline' | 'away';
}