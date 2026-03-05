// src/helpers/googleOAuth.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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
  sub: string;          // <- questo è il googleId dell’utente
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

// Scambia il "code" con i token (access_token, id_token, ecc.)
export async function getGoogleTokens(code: string): Promise<GoogleTokensResponse> {
  const params = new URLSearchParams();
  params.append('code', code);
  params.append('client_id', process.env.GOOGLE_CLIENT_ID!);
  params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET!);
  params.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI!);
  params.append('grant_type', 'authorization_code');

  const { data } = await axios.post<GoogleTokensResponse>(
    'https://oauth2.googleapis.com/token',
    params,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return data;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const { data } = await axios.get<GoogleUserInfo>(
    'https://openidconnect.googleapis.com/v1/userinfo',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data;
}

interface GoogleTokenInfo {
  aud: string;
  iss: string;
  sub: string;
  email?: string;
  email_verified?: string; // spesso stringa "true"/"false"
  exp: string;             // epoch seconds, string
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

// Decodifica l'ID token e lo valida e torna il payload (sub, email, name, ecc.)
export async function verifyGoogleIdTokenWithTokenInfo(idToken: string) {
  const { data } = await axios.get<GoogleTokenInfo>(
    "https://oauth2.googleapis.com/tokeninfo",
    { params: { id_token: idToken } }
  );

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
