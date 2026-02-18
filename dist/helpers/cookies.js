function setAuthCookie(reply, token) {
    const isProd = process.env.NODE_ENV === 'production';
    reply.setCookie('session', token, {
        httpOnly: true,
        secure: isProd, // in dev: false
        sameSite: isProd ? 'none' : 'lax', // se prod e cross-site -> none
        path: '/',
        maxAge: 60 * 60 * 24, // 1 giorno,
    });
}
function getUserIdFromJWT(req, res, fastify) {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.session;
    let userId = null;
    fastify.log.info("GETUSERJWT");
    if (token) {
        try {
            const payload = fastify.jwt.verify(token);
            userId = payload.userId;
            fastify.log.info("GETUSERJWT - has token -> userId " + userId);
        }
        catch (_b) {
            // token scaduto/invalid: logout comunque? boh, penso di si
            if (res) {
                res.code(400);
                res.send({ error: 'Invalid token' });
            }
            fastify.log.error('GETUSERJWT - problema su estrazuione');
            return null;
        }
    }
    return userId;
}
function wsGetUserIdFromJWT(req, fastify) {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.session;
    let userId = null;
    fastify.log.info("GETUSERJWT");
    if (token) {
        try {
            const payload = fastify.jwt.verify(token);
            userId = payload.userId;
            fastify.log.info("GETUSERJWT - has token -> userId " + userId);
        }
        catch (_b) {
            // token scaduto/invalid: logout comunque? boh, penso di si
            fastify.log.error('GETUSERJWT - problema su estrazuione');
            return null;
        }
    }
    return userId;
}
export { setAuthCookie, getUserIdFromJWT, wsGetUserIdFromJWT };
//# sourceMappingURL=cookies.js.map