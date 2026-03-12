import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { pipeline } from 'stream';  // pipeline è un pacchetto di Node.js che collega due o piu strem e gestisce automaticamente gli errori (per trasferire i dati dal file ricevuto (strem) al file sul disco (strem di scrittura))
import path from 'path'; // path è il modulo di Node.js per gestire e manipolare i percorsi dei file ('path.join' unisce piu parti di un percorso in modo sicuro, indipendentemente dal sistema operativo)
import fs from 'fs'
import { getUserIdFromJWT } from "../../helpers/cookies.js";
type allowed = 'OWNER' | 'EDITOR' | 'SUPERVISOR'

const Upload: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    fastify.post<{
        Body: {
            projectId?: string
            organizationId: string
        }
        }>(
        '/',
        async function (request, reply) {
        const { projectId, organizationId } = request.body as { projectId?: string, organizationId: string};
        const file = await request.file();
        const allowedTypes = ['image/png', 'application/pdf']; // piu tipi ? tutti ??
        if (!file) {
            return reply.code(400).send({ error: 'No file uploaded' });
        }
        if (file.file.truncated) {
            return reply.code(400).send({ error: 'File too large' });
        }
        // if (!allowedTypes.includes(file.mimetype)) {
        //     return reply.code(400).send({ error: 'Not supported type of file'});
        // }
        // Sanitizza filename (solo caratteri sicuri)
        const safeFilename = file.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const orgDir = projectId
            ? path.join('uploads', organizationId, projectId)
            : path.join('uploads', organizationId);
        if (!fs.existsSync(orgDir))
            fs.mkdirSync(orgDir, { recursive: true });

        const userId = getUserIdFromJWT(request, reply, fastify)
        if (!userId || Number.isNaN(userId)) {
            reply.code(400)
            return {
                error: 'user must be connected in order to upload a file.'
            }
        }

        if (projectId) {
            const pid = Number(projectId)
            const permission = fastify.prisma.projectParticipant.findUnique({
                where: { projectId_userId: {projectId: pid, userId} },
                include: { role: {
                    select: { name: true }
                }}
            })

            if (!permission || permission.role.name != 'VIEWER') {
                reply.code(400)
                return {
                    error: 'User has not the rights to upload a file.'
                }
            }
        } 

        const upload_path = path.join(orgDir, safeFilename);
        pipeline(
            file.file,
            fs.createWriteStream(upload_path),
            (err) => {
                if (err) {
                    return reply.code(500).send({ error: 'Failed to save file' });
                }
                return reply.code(200).send({ success: true, filename: safeFilename });
            }
        );
    });
}

export default Upload