import { pipeline } from 'stream'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { getUserIdFromJWT } from '../../helpers/cookies.js'

const pump = promisify(pipeline)

const Upload: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post('/', async (request, reply) => {
    const userId = getUserIdFromJWT(request, reply, fastify)
    if (!userId || Number.isNaN(userId)) {
      reply.code(401)
      return { error: 'user must be connected in order to upload a file.' }
    }
    let organizationId: string | undefined
    let projectId: string | undefined
    let filePart: any | null = null

    // legge tutti i parts (fields + file)
    for await (const part of request.parts()) {
      if (part.type === 'file') {
        // se arrivano più file, prendo il primo
        if (!filePart) filePart = part
        else {
          // scarta eventuali file extra
          part.file.resume()
        }
      } else {
        if (part.fieldname === 'organizationId') organizationId = String(part.value)
        if (part.fieldname === 'projectId') projectId = String(part.value)
      }
    }

    if (!organizationId) {
      reply.code(400)
      return { error: 'organizationId is required' }
    }

    if (!filePart) {
      reply.code(400)
      return { error: 'No file uploaded' }
    }

    // permessi progetto (se projectId presente)
    if (projectId) {
      const pid = Number(projectId)
      if (Number.isNaN(pid)) {
        reply.code(400)
        return { error: 'invalid projectId' }
      }

      const permission = await fastify.prisma.projectParticipant.findUnique({
        where: { projectId_userId: { projectId: pid, userId } },
        include: { role: { select: { name: true } } },
      })

      // consenti upload solo OWNER/EDITOR (VIEWER NO)
      if (!permission || (permission.role.name !== 'OWNER' && permission.role.name !== 'EDITOR')) {
        reply.code(403)
        return { error: 'User has not the rights to upload a file.' }
      }
    }

    // sanitizza filename
    const safeFilename = filePart.filename.replace(/[^a-zA-Z0-9._-]/g, '_')

    const orgDir = projectId
      ? path.join('uploads', organizationId, projectId)
      : path.join('uploads', organizationId)

    if (!fs.existsSync(orgDir)) fs.mkdirSync(orgDir, { recursive: true })

    const uploadPath = path.join(orgDir, safeFilename)

    try {
      await pump(filePart.file, fs.createWriteStream(uploadPath))
      return reply.code(200).send({ success: true, filename: safeFilename })
    } catch (err) {
      fastify.log.error(err)
      return reply.code(500).send({ error: 'Failed to save file' })
    }
  })
}

export default Upload