import { fastify, type FastifyInstance, type FastifyPluginAsync } from 'fastify'
import path from 'path'
import fs from 'fs'
import { getUserIdFromJWT } from '../../helpers/cookies.js'

const Delete: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	fastify.delete('/files/:organizationId/:filename', async (request, reply) => {
	const { organizationId, filename } = request.params as { organizationId: string, filename: string}
	const filePath = path.join('uploads', organizationId, filename)
	const userId = getUserIdFromJWT(request, reply, fastify)
	if (!userId || Number.isNaN(userId)) {
		reply.code(401)
		return { error: 'user must be connected in order to delete a file.' }
	}
	if (organizationId) {
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
		// CONTROLLARE CHE SIA L'OWNER 
		const permission = await fastify.prisma.organizationMember.findUnique({
       		where: { organizationId_userId: { organizationId: pid, userId } }
		})
		if (permission?.userId !== org?.ownerId) {
			reply.code(403)
			return { error: 'User has not the rights to delete a file.'}
		}
	}
	try {
		await fs.promises.unlink(filePath)
		const dirPath = path.join("uploads", organizationId)
		const dir = await fs.promises.readdir(dirPath)
		if (dir.length === 0) await fs.promises.rmdir(dirPath)
		return reply.code(200).send({ success: true })
	} catch (err) {
		fastify.log.error(err)
		return reply.code(500).send({ error: 'Failed to delete file' })
	}
  })

  fastify.delete('/files/:organizationId/:projectId/:filename', async (request, reply) => {
	const { organizationId, projectId, filename } = request.params as { organizationId: string, projectId: string, filename: string};
	const filePath = path.join('uploads', organizationId, projectId, filename)
	const userId = getUserIdFromJWT(request, reply, fastify)
	if (!userId || Number.isNaN(userId)) {
		reply.code(401)
		return { error: 'user must be connected in order to delete a file.' }
	}
	if (organizationId) {
		if (projectId) {
			// ========= CONTROLLO CHE L'ORGANIZZAZIONE ESISTA ========
			const org = await fastify.prisma.organization.findUnique({
				where: { id: Number(organizationId) }
			})
			if (!org) {
				reply.code(404)
				return { error: 'Organization does not exist or is not active.' }
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
			const permission = await fastify.prisma.projectParticipant.findUnique({
				where: { projectId_userId: { projectId: pidProj, userId } },
				include: { role: { select: { name: true } } },
			})
			if (!permission || permission.role.name !== 'OWNER' && permission.role.name !== 'EDITOR') {
				reply.code(403)
				return { error: 'User has not the rights to delete a file.'}
			}
		}		
	}
	try {
		await fs.promises.unlink(filePath)
		const dirPath = path.join("uploads", organizationId, projectId)
		const dir = await fs.promises.readdir(dirPath)
		if (dir.length === 0){
			await fs.promises.rmdir(dirPath)
			const orgPath = path.join("uploads", organizationId)
			const org = await fs.promises.readdir(orgPath)
			if (org.length === 0) await fs.promises.rmdir(orgPath)
		}
		return reply.code(200).send({ success: true })
	} catch (err) {
		fastify.log.error(err)
		return reply.code(500).send({ error: 'Failed to delete file' })
	}
  })
}

export default Delete