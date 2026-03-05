import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { getGoogleTokens, verifyGoogleIdTokenWithTokenInfo, getGoogleUserInfo } from "../../helpers/googleOAuth.js";
import { googleSchemas } from "./schemas.js";
import { setAuthCookie } from "../../helpers/cookies.js";

const AuthGoogle: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // Redirect to google
    fastify.get('/google',
        { schema: googleSchemas.redirect },
        async (req, res) => {
        const ROOT_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
        fastify.log.info('uri: ' + process.env.GOOGLE_REDIRECT_URI)
        const options = {
            redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: [
                'openid',
                'email',
                'profile',
            ].join(' '),
        };

        const qs = new URLSearchParams(options).toString();
        const url = `${ROOT_URL}?${qs}`;

        return res.redirect(url);
    })

    // 2) Callback di Google
    fastify.get('/google/callback',
        { schema: googleSchemas.callback },
        async (req, res) => {
        const { code } = req.query as { code?: string };

        if (!code) {
            res.code(400);
            return { error: 'Missing code parameter' };
        }

        try {
            // Scambiamo il code con i token
            const tokens = await getGoogleTokens(code);

            // Decodifichiamo e verifichiamo l'ID token (contiene sub, email, name, picture, ecc.)
            const payload = await verifyGoogleIdTokenWithTokenInfo(tokens.id_token);

            const userInfo = await getGoogleUserInfo(tokens.access_token);

            const googleId = payload.sub;
            const email = userInfo.email;
            const name = userInfo.given_name ?? ''
            const surname = userInfo.family_name ?? ''

            // username: qui puoi decidere la logica che vuoi
            // const usernameBase = name!.replace(/\s+/g, '').toLowerCase();

            // upsert utente su email (o su googleId, come preferisci)
            const user = await fastify.prisma.user.upsert({
                where: { email },              // se esiste, aggiorna
                update: {
                    googleId,
                    // googleSecret: di solito salva il refresh_token SE Google te lo manda
                    googleSecret: tokens.refresh_token ?? null,
                },
                create: {
                    name,
                    surname,
                    email,
                    jobQualifier: '',
                    phone: '',
                    googleId,
                    googleSecret: tokens.refresh_token ?? null,
                },
            });

            // QUI: crea la tua sessione (cookie o JWT)
            // Esempio pseudo-JWT (se hai registrato @fastify/jwt):
            //
            // const token = fastify.jwt.sign({ userId: user.id });
            // res.setCookie('session', token, {
            //   path: '/',
            //   httpOnly: true,
            //   sameSite: 'lax',
            // });
            //
            // poi redirect al frontend (esempio):
            // return res.redirect('http://localhost:5173/dashboard');

            // HTTP ONLY
            const token = fastify.jwt.sign({ userId: user.id }, { expiresIn: '24h' })
            setAuthCookie(res, token)

            return res.send({
                success: true,
                user: { id: user.id, name: user.name, surname: user.surname, email: user.email },
            })

        } catch (err) {
            fastify.log.error(err);
            res.code(500);
            return { error: 'Google auth failed' };
        }
    });
};

export default AuthGoogle;
