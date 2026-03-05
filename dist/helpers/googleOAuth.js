// src/helpers/googleOAuth.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
// Scambia il "code" con i token (access_token, id_token, ecc.)
export async function getGoogleTokens(code) {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', process.env.GOOGLE_CLIENT_ID);
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
    params.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI);
    params.append('grant_type', 'authorization_code');
    const { data } = await axios.post('https://oauth2.googleapis.com/token', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return data;
}
export async function getGoogleUserInfo(accessToken) {
    const { data } = await axios.get('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } });
    return data;
}
// Decodifica l'ID token e lo valida e torna il payload (sub, email, name, ecc.)
export async function verifyGoogleIdTokenWithTokenInfo(idToken) {
    const { data } = await axios.get("https://oauth2.googleapis.com/tokeninfo", { params: { id_token: idToken } });
    // controlli MINIMI (importantissimi)
    if (data.aud !== process.env.GOOGLE_CLIENT_ID) {
        throw new Error("Invalid audience (aud)");
    }
    // Issuer validi: accounts.google.com o https://accounts.google.com
    if (data.iss !== "accounts.google.com" && data.iss !== "https://accounts.google.com") {
        throw new Error("Invalid issuer (iss)");
    }
    const expMs = Number(data.exp) * 1000;
    if (!Number.isFinite(expMs) || Date.now() > expMs) {
        throw new Error("Token expired");
    }
    return {
        sub: data.sub,
        email: data.email,
        email_verified: data.email_verified === "true",
        name: data.name,
        given_name: data.given_name,
        family_name: data.family_name,
        picture: data.picture,
    };
}
// // Decodifica l'ID token (JWT) e torna il payload (sub, email, name, ecc.)
// export function decodeGoogleIdToken(idToken: string): GoogleIdTokenPayload {
//   return jwtDecode<GoogleIdTokenPayload>(idToken);
// }
//# sourceMappingURL=googleOAuth.js.map