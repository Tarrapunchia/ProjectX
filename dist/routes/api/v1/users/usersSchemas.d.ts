type Schema = Record<string, any>;
export declare const userSchemas: {
    getAllUsers: Schema;
    getUserProfile: Schema;
    getUserFriends: Schema;
    createUser: Schema;
    modUser: Schema;
    modPassword: Schema;
    login: Schema;
    logout: Schema;
    seed: Schema;
    userResponse: {
        id: {
            type: string;
        };
        name: {
            type: string;
        };
        surname: {
            type: string;
        };
        email: {
            type: string;
            format: string;
        };
        phone: {
            type: string;
        };
        city: {
            type: string;
            nullable: boolean;
        };
        address: {
            type: string;
            nullable: boolean;
        };
        cap: {
            type: string;
            nullable: boolean;
        };
        state: {
            type: string;
            nullable: boolean;
        };
        jobQualifier: {
            type: string;
        };
        hashedPw: {
            type: string;
            nullable: boolean;
        };
        googleId: {
            type: string;
            nullable: boolean;
        };
        googleSecret: {
            type: string;
            nullable: boolean;
        };
        isLoggedIn: {
            type: string;
        };
        createdAt: {
            type: string;
            format: string;
        };
        updatedAt: {
            type: string;
            format: string;
        };
    };
};
export {};
//# sourceMappingURL=usersSchemas.d.ts.map