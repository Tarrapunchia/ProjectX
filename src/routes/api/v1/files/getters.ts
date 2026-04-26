import { fastify, type FastifyInstance, type FastifyPluginAsync, type FastifyReply } from 'fastify'
import path from 'path'
import fs from 'fs'
import auth from '../../../../helpers/auth.js'
import { getUserIdFromJWT } from '../../../../helpers/cookies.js'

const streamFile = (baseDir: string, filename: string, reply: FastifyReply) => {
    const resolvedBase = path.resolve(baseDir)
    const resolvedFile = path.resolve(resolvedBase, filename)
    if (!resolvedFile.startsWith(resolvedBase + path.sep) && resolvedFile !== resolvedBase) {
        return reply.code(400).send({ error: 'invalid filename' })
    }
    if (!fs.existsSync(resolvedFile) || !fs.statSync(resolvedFile).isFile()) {
        return reply.code(404).send({ error: 'File not found' })
    }

    reply.type('application/octet-stream')
    reply.header('Content-Disposition', `attachment; filename="${path.basename(filename)}"`)
    return reply.send(fs.createReadStream(resolvedFile))
}

const previewFile = (baseDir: string, filename: string, reply: FastifyReply) => {
    const resolvedBase = path.resolve(baseDir)
    const resolvedFile = path.resolve(resolvedBase, filename)
    if (!resolvedFile.startsWith(resolvedBase + path.sep) && resolvedFile !== resolvedBase) {
        return reply.code(400).send({ error: 'invalid filename' })
    }
    if (!fs.existsSync(resolvedFile) || !fs.statSync(resolvedFile).isFile()) {
        return reply.code(404).send({ error: 'File not found' })
    }

    const finalPath = path.basename(filename)

    reply.type('text/plain')

    reply.header('Content-Disposition', `inline`)
    console.log(`AHHHHHHHHHHHHHHHHHH ${resolvedFile}`);
    
    return reply.send(fs.createReadStream(resolvedFile))
     
}

const Files: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	fastify.get('/:organizationId/:projectId', async (request, reply) => {
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
				if (!auth.isParticipant(userId, pidProj, fastify)) {
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

    fastify.get('/files/:organizationId/:filename', async (request, reply) => {
            const { organizationId, filename  } = request.params as { organizationId: string, filename: string };
            const filePath = path.join('uploads', organizationId)
            const userId = getUserIdFromJWT(request, reply, fastify)
            if (!userId || Number.isNaN(userId)) {
                reply.code(401)
                return { error: 'user must be connected in order to request a file.' }
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
                if (!auth.isMember(userId, pid, fastify)) {
                    reply.code(403)
                    return { error: 'User has not the rights to request this file.' }
                }
            }
    
            return streamFile(filePath, filename, reply)
    });

    fastify.get('/files/:organizationId/:projectId/:filename', async (request, reply) => {
            const { organizationId, projectId, filename  } = request.params as { organizationId: string, projectId: string, filename: string };
            const filePath = path.join('uploads', organizationId, projectId)
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
                    if (!auth.isParticipant(userId, pidProj, fastify)) {
                        reply.code(403)
                        return { error: 'User has not the rights to request this file.' }
                    }
                }
            }
    
            return streamFile(filePath, filename, reply)
    });

    fastify.get('/files/preview/:organizationId/:projectId/:filename', async (request, reply) => {
            const { organizationId, projectId, filename  } = request.params as { organizationId: string, projectId: string, filename: string };
            const filePath = path.join('uploads', organizationId, projectId)
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
                    if (!auth.isParticipant(userId, pidProj, fastify)) {
                        reply.code(403)
                        return { error: 'User has not the rights to request this file.' }
                    }
                }
            }
    
            return previewFile(filePath, filename, reply)
    });
}

export default Files;