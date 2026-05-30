import type { FastifyInstance, FastifyPluginAsync, FastifyReply } from 'fastify'
import path from 'path'
import fs from 'fs'
import auth from '../../../../helpers/auth.js'
import { getUserIdFromJWT } from '../../../../helpers/cookies.js'

const getMimeType = (filename: string) => {
  const ext = path.extname(filename).toLowerCase()
  const mimes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    '.webp': 'image/webp',
  }
  return mimes[ext]
}

function safeResolve(baseDir: string, filename: string) {
  const resolvedBase = path.resolve(baseDir)
  const resolvedFile = path.resolve(resolvedBase, filename)

  if (!resolvedFile.startsWith(resolvedBase + path.sep)) {
    return null
  }
  return resolvedFile
}

const streamFile = (baseDir: string, filename: string, reply: FastifyReply) => {
  const resolvedFile = safeResolve(baseDir, filename)
  if (!resolvedFile) return reply.code(400).send({ error: 'invalid filename' })

  if (!fs.existsSync(resolvedFile) || !fs.statSync(resolvedFile).isFile()) {
    return reply.code(404).send({ error: 'File not found' })
  }

  reply.type('application/octet-stream')
  reply.header('Content-Disposition', `attachment; filename="${path.basename(filename)}"`)
  return reply.send(fs.createReadStream(resolvedFile))
}

const previewFile = (baseDir: string, filename: string, reply: FastifyReply) => {
  const resolvedFile = safeResolve(baseDir, filename)
  if (!resolvedFile) return reply.code(400).send({ error: 'invalid filename' })

  if (!fs.existsSync(resolvedFile) || !fs.statSync(resolvedFile).isFile()) {
    return reply.code(404).send({ error: 'File not found' })
  }

  reply.type(getMimeType(filename) ?? 'application/octet-stream')
  reply.header('Content-Disposition', `inline; filename="${path.basename(filename)}"`)
  return reply.send(fs.createReadStream(resolvedFile))
}

const getFullName = async (id: number, fastify: FastifyInstance) => {
    try {
        const name = await fastify.prisma.user.findUnique({
            where: { id: id },
            select: { name: true, surname: true }
        })

        if (!name) return ''
        return (`${name.name} ${name.surname}`)
    } catch (error) {
        return ``        
    }
}

const FilesGetters: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get('/:organizationId/:projectId', async (req, reply) => {
    const { organizationId, projectId } = req.params as { organizationId: string; projectId: string }
    const orgId = Number(organizationId)
    const projId = Number(projectId)

    const userId = getUserIdFromJWT(req, reply, fastify)
    if (!userId || Number.isNaN(userId)) return reply.code(401).send({ error: 'Unauthorized' })

    if (Number.isNaN(orgId)) return reply.code(400).send({ error: 'invalid organizationId' })
    if (Number.isNaN(projId)) return reply.code(400).send({ error: 'invalid projectId' })

    const [org, proj] = await Promise.all([
      fastify.prisma.organization.findUnique({ where: { id: orgId }, select: { id: true } }),
      fastify.prisma.project.findUnique({ where: { id: projId }, select: { id: true, organizationId: true } }),
    ])
    if (!org) return reply.code(404).send({ error: 'Organization does not exist' })
    if (!proj) return reply.code(404).send({ error: 'Project does not exist' })
    if (proj.organizationId !== orgId) return reply.code(400).send({ error: 'Project not in this organization' })

    const can = await auth.isParticipant(userId, projId, fastify)
    if (!can) return reply.code(403).send({ error: 'Forbidden' })

    const dirPath = path.join('uploads', organizationId, projectId)
    if (!fs.existsSync(dirPath)) return reply.code(200).send({ files: [] })

    const files = fs
      .readdirSync(dirPath, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name)

    return reply.code(200).send({ files })
  })

  fastify.get('/:organizationId/:projectId/user', async (req, reply) => {
    const { organizationId, projectId } = req.params as { organizationId: string; projectId: string }
    const orgId = Number(organizationId)
    const projId = Number(projectId)

    const userId = getUserIdFromJWT(req, reply, fastify)
    if (!userId || Number.isNaN(userId)) return reply.code(401).send({ error: 'Unauthorized' })

    if (Number.isNaN(orgId)) return reply.code(400).send({ error: 'invalid organizationId' })
    if (Number.isNaN(projId)) return reply.code(400).send({ error: 'invalid projectId' })

    const [org, proj] = await Promise.all([
      fastify.prisma.organization.findUnique({ where: { id: orgId }, select: { id: true } }),
      fastify.prisma.project.findUnique({ where: { id: projId }, select: { id: true, organizationId: true } }),
    ])
    if (!org) return reply.code(404).send({ error: 'Organization does not exist' })
    if (!proj) return reply.code(404).send({ error: 'Project does not exist' })
    if (proj.organizationId !== orgId) return reply.code(400).send({ error: 'Project not in this organization' })

    const can = await auth.isParticipant(userId, projId, fastify)
    if (!can) return reply.code(403).send({ error: 'Forbidden' })

    const baseDir = path.join('uploads', organizationId, projectId)
    if (!fs.existsSync(baseDir)) return reply.code(200).send({ files: [] })

    const userDirs = fs
      .readdirSync(baseDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .filter((name) => /^\d+$/.test(name))

    const out: Array<{ uploaderId: number; filename: string; relativePath: string, uploaderFullName: string }> = []

    for (const dirName of userDirs) {
      const uploaderId = Number(dirName)
      const uDir = path.join(baseDir, dirName)
      if (!fs.existsSync(uDir)) continue

      const files = fs
        .readdirSync(uDir, { withFileTypes: true })
        .filter((d) => d.isFile())
        .map((d) => d.name)

      for (const filename of files) {
        out.push({
          uploaderId,
          filename,
          uploaderFullName: await getFullName(uploaderId, fastify),
          relativePath: `${dirName}/${filename}`,
        })
      }
    }

    return reply.code(200).send({ files: out })
  })

  fastify.get('/files/:organizationId/:filename', async (req, reply) => {
    const { organizationId, filename } = req.params as { organizationId: string; filename: string }
    const orgId = Number(organizationId)

    const userId = getUserIdFromJWT(req, reply, fastify)
    if (!userId || Number.isNaN(userId)) return reply.code(401).send({ error: 'Unauthorized' })

    if (Number.isNaN(orgId)) return reply.code(400).send({ error: 'invalid organizationId' })

    const org = await fastify.prisma.organization.findUnique({ where: { id: orgId }, select: { id: true } })
    if (!org) return reply.code(404).send({ error: 'Organization does not exist' })

    const can = await auth.isMember(userId, orgId, fastify)
    if (!can) return reply.code(403).send({ error: 'Forbidden' })

    const baseDir = path.join('uploads', organizationId)
    return streamFile(baseDir, filename, reply)
  })

  fastify.get('/files/:organizationId/:projectId/:filename', async (req, reply) => {
    const { organizationId, projectId, filename } = req.params as {
      organizationId: string
      projectId: string
      filename: string
    }
    const orgId = Number(organizationId)
    const projId = Number(projectId)

    const userId = getUserIdFromJWT(req, reply, fastify)
    if (!userId || Number.isNaN(userId)) return reply.code(401).send({ error: 'Unauthorized' })

    if (Number.isNaN(orgId)) return reply.code(400).send({ error: 'invalid organizationId' })
    if (Number.isNaN(projId)) return reply.code(400).send({ error: 'invalid projectId' })

    const can = await auth.isParticipant(userId, projId, fastify)
    if (!can) return reply.code(403).send({ error: 'Forbidden' })

    const baseDir = path.join('uploads', organizationId, projectId)
    return streamFile(baseDir, filename, reply)
  })

  fastify.get('/files/preview/:organizationId/:projectId/:filename', async (req, reply) => {
    const { organizationId, projectId, filename } = req.params as {
      organizationId: string
      projectId: string
      filename: string
    }
    const orgId = Number(organizationId)
    const projId = Number(projectId)

    const userId = getUserIdFromJWT(req, reply, fastify)
    if (!userId || Number.isNaN(userId)) return reply.code(401).send({ error: 'Unauthorized' })

    if (Number.isNaN(orgId)) return reply.code(400).send({ error: 'invalid organizationId' })
    if (Number.isNaN(projId)) return reply.code(400).send({ error: 'invalid projectId' })

    const can = await auth.isParticipant(userId, projId, fastify)
    if (!can) return reply.code(403).send({ error: 'Forbidden' })

    const baseDir = path.join('uploads', organizationId, projectId)
    return previewFile(baseDir, filename, reply)
  })

  fastify.get('/files/:organizationId/:projectId/user/:uploaderId/:filename', async (req, reply) => {
    const { organizationId, projectId, uploaderId, filename } = req.params as any
    const orgId = Number(organizationId)
    const projId = Number(projectId)
    const upId = Number(uploaderId)

    const userId = getUserIdFromJWT(req, reply, fastify)
    if (!userId || Number.isNaN(userId)) return reply.code(401).send({ error: 'Unauthorized' })

    if (Number.isNaN(orgId)) return reply.code(400).send({ error: 'invalid organizationId' })
    if (Number.isNaN(projId)) return reply.code(400).send({ error: 'invalid projectId' })
    if (Number.isNaN(upId)) return reply.code(400).send({ error: 'invalid uploaderId' })

    const can = await auth.isParticipant(userId, projId, fastify)
    if (!can) return reply.code(403).send({ error: 'Forbidden' })

    const baseDir = path.join('uploads', organizationId, projectId, String(upId))
    return streamFile(baseDir, filename, reply)
  })

  fastify.get('/files/preview/:organizationId/:projectId/user/:uploaderId/:filename', async (req, reply) => {
    const { organizationId, projectId, uploaderId, filename } = req.params as any
    const orgId = Number(organizationId)
    const projId = Number(projectId)
    const upId = Number(uploaderId)

    const userId = getUserIdFromJWT(req, reply, fastify)
    if (!userId || Number.isNaN(userId)) return reply.code(401).send({ error: 'Unauthorized' })

    if (Number.isNaN(orgId)) return reply.code(400).send({ error: 'invalid organizationId' })
    if (Number.isNaN(projId)) return reply.code(400).send({ error: 'invalid projectId' })
    if (Number.isNaN(upId)) return reply.code(400).send({ error: 'invalid uploaderId' })

    const can = await auth.isParticipant(userId, projId, fastify)
    if (!can) return reply.code(403).send({ error: 'Forbidden' })

    const baseDir = path.join('uploads', organizationId, projectId, String(upId))
    return previewFile(baseDir, filename, reply)
  })
}

export default FilesGetters