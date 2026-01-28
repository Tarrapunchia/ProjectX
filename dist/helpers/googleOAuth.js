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
// Decodifica l'ID token (JWT) e torna il payload (sub, email, name, ecc.)
export function decodeGoogleIdToken(idToken) {
    return jwtDecode(idToken);
}
//# sourceMappingURL=googleOAuth.js.map