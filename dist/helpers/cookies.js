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
export { setAuthCookie };
//# sourceMappingURL=cookies.js.map