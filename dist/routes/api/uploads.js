var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { pipeline } from 'stream';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { fastify } from 'fastify';
import { getUserIdFromJWT } from '../../helpers/cookies.js';
import { error } from 'console';
import { isRegExp } from 'util/types';
import { asyncWrapProviders } from 'async_hooks';
const pump = promisify(pipeline);
const Upload = async (fastify) => {
    fastify.post('/', async (request, reply) => {
        var _a, e_1, _b, _c;
        const userId = getUserIdFromJWT(request, reply, fastify);
        if (!userId || Number.isNaN(userId)) {
            reply.code(401);
            return { error: 'user must be connected in order to upload a file.' };
        }
        let organizationId;
        let projectId;
        let filePart = null;
        try {
            // legge tutti i parts (fields + file)
            for (var _d = true, _e = __asyncValues(request.parts()), _f; _f = await _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const part = _c;
                if (part.type === 'file') {
                    // se arrivano più file, prendo il primo
                    if (!filePart)
                        filePart = part;
                    else {
                        // scarta eventuali file extra
                        part.file.resume();
                    }
                }
                else {
                    if (part.fieldname === 'organizationId')
                        organizationId = String(part.value);
                    if (part.fieldname === 'projectId')
                        projectId = String(part.value);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (!organizationId) {
            reply.code(400);
            return { error: 'organizationId is required' };
        }
        if (!filePart) {
            reply.code(400);
            return { error: 'No file uploaded' };
        }
        // permessi progetto (se projectId presente)
        if (projectId) {
            const pid = Number(projectId);
            if (Number.isNaN(pid)) {
                reply.code(400);
                return { error: 'invalid projectId' };
            }
            const permission = await fastify.prisma.projectParticipant.findUnique({
                where: { projectId_userId: { projectId: pid, userId } },
                include: { role: { select: { name: true } } },
            });
            // consenti upload solo OWNER/EDITOR (VIEWER NO)
            if (!permission || (permission.role.name !== 'OWNER' && permission.role.name !== 'EDITOR')) {
                reply.code(403);
                return { error: 'User has not the rights to upload a file.' };
            }
        }
        // sanitizza filename
        const safeFilename = filePart.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const orgDir = projectId
            ? path.join('uploads', organizationId, projectId)
            : path.join('uploads', organizationId);
        if (!fs.existsSync(orgDir))
            fs.mkdirSync(orgDir, { recursive: true });
        const uploadPath = path.join(orgDir, safeFilename);
        try {
            await pump(filePart.file, fs.createWriteStream(uploadPath));
            return reply.code(200).send({ success: true, filename: safeFilename });
        }
        catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: 'Failed to save file' });
        }
    });
};
export default Upload;
//# sourceMappingURL=uploads.js.map