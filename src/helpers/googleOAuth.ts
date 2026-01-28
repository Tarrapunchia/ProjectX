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

// Decodifica l'ID token (JWT) e torna il payload (sub, email, name, ecc.)
export function decodeGoogleIdToken(idToken: string): GoogleIdTokenPayload {
  return jwtDecode<GoogleIdTokenPayload>(idToken);
}
