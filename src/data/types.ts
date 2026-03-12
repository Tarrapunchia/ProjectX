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

type userOrg = {
    id: string,
    name: string,
    email: string,
    memberAt: Date
}

type userProj = {
    id: string,
    name: string,
    orgId: string,
    role: string,
    joinedAt: Date,
	status: 'ACTIVE' | 'COMPLETED' | 'REVIEW' | 'TODO',
	description: string,
	createdAt: Date,
	closedAt: Date | null
}

export type userInfos = {
    id: string,
    name: string,
    surname: string,
    email: string,
    phone: string,

    city: string,
    address: string,
    cap: string,
    state: string,

    jobQualifier: string,

    isLoggedIn: boolean,
    createdAt: Date,
    updatedAt: Date,

    organizations: userOrg[]
    projects: userProj[]
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

export type ProjectTasks = {
	id: string,
	projectId: string,
	name: string,
	status: 'ACTIVE' | 'COMPLETED' | 'REVIEW' | 'TODO',
	description: string,
	priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
	createdAt: Date,
	dueDate: Date | null,
	closedAt: Date | null,
}

export type Organization = {
	id: string,
	name: string,
	email: string,
	phone: string,
	city: string,
	address: string,
	cap: string,
	state: string,
	ownerId: string,
	projects: ProjectInfo[]
}

export interface Friend {
	id: string;
	name: string;
	avatar: string;
	status: 'online' | 'offline' | 'away';
}