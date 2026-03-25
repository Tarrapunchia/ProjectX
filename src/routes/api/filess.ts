import { fastify, type FastifyInstance, type FastifyPluginAsync } from 'fastify'
import path from 'path'
import fs from 'fs'
import pippo from '../../helpers/auth.js'
import { getUserIdFromJWT } from '../../helpers/cookies.js'

const Files: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	fastify.get('/files/:organizationId/:projectId', async (request, reply) => {
		const { organizationId, projectId } = request.params as { organizationId: string, projectId: string};
		const dirPath = path.join('uploads', organizationId, projectId)
		const userId = getUserIdFromJWT(request, reply, fastify)
		if (!userId || Number.isNaN(userId)) {
			reply.code(401)
			return { error: 'user must be connected in order to request a file.' }
		}
		if (organizationId) {
			if (projectId) {
				const pid = Number(organizationId)
				if (Number.isNaN(pid)) {
					reply.code(400)
					return { error: 'invalid organizationId' }
				}
				const org = await fastify.prisma.organization.findUnique({
					where: { id: Number(organizationId)}
				})
				if (!org) {
					reply.code(404)
					return { error: 'Organization does not exist'} 
				}
				const pidProj = Number(projectId)
				if (Number.isNaN(pidProj)) {
					reply.code(400)
					return { error: 'invalid projectId'}
				}
				const proj = await fastify.prisma.project.findUnique({
					where: { id: Number(projectId) }
				})
				if (!proj) {
					reply.code(404)
					return { error: 'Project does not exist.'}
				}
				if (!pippo.isParticipant(userId, pidProj, fastify)) {
					reply.code(403)
					return { error: 'User has not the rights to request this file.' }
				}
			}
		}
		if (!fs.existsSync(dirPath)) {
			return reply.code(200).send({ files: [] });
		}
		const files = fs.readdirSync(dirPath).filter(f => fs.statSync(path.join(dirPath, f)).isFile());
		return reply.code(200).send({ files });
	});
}

export default Files;