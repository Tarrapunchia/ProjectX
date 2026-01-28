interface GoogleTokensResponse {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
    token_type: string;
    id_token: string;
}
interface GoogleIdTokenPayload {
    iss: string;
    sub: string;
    email: string;
    email_verified: boolean;
    name?: string;
    picture?: string;
}
export declare function getGoogleTokens(code: string): Promise<GoogleTokensResponse>;
export declare function decodeGoogleIdToken(idToken: string): GoogleIdTokenPayload;
export {};
//# sourceMappingURL=googleOAuth.d.ts.map