
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
	owner: string;
	name: string;
	description: string;
	createdAt: string;
	completedAt: string;
	status: string;
}

export type ProjectInfo = {
	id: string,
	name: string,
	status: 'ACTIVE' | 'COMPLETED' | 'REVIEW' | 'TODO',
	description: string,
	createdAt: Date,
	closedAt: Date | null
}

export interface Friend {
	id: string;
	name: string;
	avatar: string;
	status: 'online' | 'offline' | 'away';
}