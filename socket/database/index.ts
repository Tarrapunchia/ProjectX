import { User } from './types'

const users: User[] = [
	{ id: '1', username: 'alice', password: 'password123', email: 'alice@tin.it', createdAt: new Date() }
];

// Per /api/login in server.ts ( istanza globale ) 
export const db = {
	users: {
		async findByUsername(username: string): Promise<User | null> { 
			return users.find(u => u.username === username) || null;
		},

		async findById(id: string): Promise<User | null> {
			return users.find(u => u.id === id ) || null;
		}
	}
};