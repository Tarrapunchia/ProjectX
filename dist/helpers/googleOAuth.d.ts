interface GoogleTokensResponse {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
    token_type: string;
    id_token: string;
}
export declare function getGoogleTokens(code: string): Promise<GoogleTokensResponse>;
interface GoogleUserInfo {
    sub: string;
    email: string;
    email_verified: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
}
export declare function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo>;
export declare function verifyGoogleIdTokenWithTokenInfo(idToken: string): Promise<{
    sub: string;
    email: string | undefined;
    email_verified: boolean;
    name: string | undefined;
    given_name: string | undefined;
    family_name: string | undefined;
    picture: string | undefined;
}>;
export {};
//# sourceMappingURL=googleOAuth.d.ts.map