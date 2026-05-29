import { pipeline } from 'stream';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { getUserIdFromJWT } from '../../../../helpers/cookies.js';

const pump = promisify(pipeline);

const Upload: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post('/', async (request, reply) => {
    const userId = getUserIdFromJWT(request, reply, fastify);

    if (!userId || Number.isNaN(userId)) {
      reply.code(401);
      return { error: 'user must be connected in order to upload a file.' };
    }

    let organizationId: string | undefined;
    let projectId: string | undefined;
    let savedFilename: string | null = null;

    for await (const part of request.parts()) {
      if (part.type !== 'file') {
        if (part.fieldname === 'organizationId') organizationId = String(part.value);
        if (part.fieldname === 'projectId') projectId = String(part.value);
        continue;
      }

      if (!organizationId) {
        part.file.resume();
        reply.code(400);
        return { error: 'organizationId is required before file' };
      }

      if (projectId) {
        const pid = Number(projectId);
        if (Number.isNaN(pid)) {
          part.file.resume();
          reply.code(400);
          return { error: 'invalid projectId' };
        }

        const permission = await fastify.prisma.projectParticipant.findUnique({
          where: { projectId_userId: { projectId: pid, userId } },
          include: { role: { select: { name: true } } },
        });

        if (!permission || (permission.role.name !== 'OWNER' && permission.role.name !== 'EDITOR')) {
          part.file.resume();
          reply.code(403);
          return { error: 'User has not the rights to upload a file.' };
        }
      }

      const safeFilename = part.filename.replace(/[^a-zA-Z0-9._-]/g, '_');

      const orgDir = projectId
        ? path.join('uploads', organizationId, projectId)
        : path.join('uploads', organizationId);

      fs.mkdirSync(orgDir, { recursive: true });

      const uploadPath = path.join(orgDir, safeFilename);

      try {
        await pump(part.file, fs.createWriteStream(uploadPath));

        if (part.file.truncated) {
          if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
          reply.code(413);
          return { error: 'File too large' };
        }

        savedFilename = safeFilename;
      } catch (err) {
        fastify.log.error(err);
        reply.code(500);
        return { error: 'Failed to save file' };
      }
    }

    if (!organizationId) {
      reply.code(400);
      return { error: 'organizationId is required' };
    }

    if (!savedFilename) {
      reply.code(400);
      return { error: 'No file uploaded' };
    }

    return reply.code(200).send({
      success: true,
      filename: savedFilename,
    });
  });


  // Uploads per gli user -> uploads/orgid/projId/userId/file.*
  fastify.post('/user', async (request, reply) => {
    const userId = getUserIdFromJWT(request, reply, fastify);

    if (!userId || Number.isNaN(userId)) {
      reply.code(401);
      return { error: 'user must be connected in order to upload a file.' };
    }

    let organizationId: string | undefined;
    let projectId: string | undefined;
    let savedFilename: string | null = null;

    for await (const part of request.parts()) {
      if (part.type !== 'file') {
        if (part.fieldname === 'organizationId') organizationId = String(part.value);
        if (part.fieldname === 'projectId') projectId = String(part.value);
        continue;
      }

      if (!organizationId) {
        part.file.resume();
        reply.code(400);
        return { error: 'organizationId is required before file' };
      }

      if (projectId) {
        const pid = Number(projectId);
        if (Number.isNaN(pid)) {
          part.file.resume();
          reply.code(400);
          return { error: 'invalid projectId' };
        }

        const permission = await fastify.prisma.projectParticipant.findUnique({
          where: { projectId_userId: { projectId: pid, userId } },
          include: { role: { select: { name: true } } },
        });

        if (!permission) {
          part.file.resume();
          reply.code(403);
          return { error: 'User has not the rights to upload a file.' };
        }
      }

      const safeFilename = part.filename.replace(/[^a-zA-Z0-9._-]/g, '_');

      const orgDir = projectId
        ? path.join(path.join('uploads', organizationId, projectId), userId.toString())
        : path.join(path.join('uploads', organizationId), userId.toString());

      fs.mkdirSync(orgDir, { recursive: true });

      const uploadPath = path.join(orgDir, safeFilename);

      try {
        await pump(part.file, fs.createWriteStream(uploadPath));

        if (part.file.truncated) {
          if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
          reply.code(413);
          return { error: 'File too large' };
        }

        savedFilename = safeFilename;
      } catch (err) {
        fastify.log.error(err);
        reply.code(500);
        return { error: 'Failed to save file' };
      }
    }

    if (!organizationId) {
      reply.code(400);
      return { error: 'organizationId is required' };
    }

    if (!savedFilename) {
      reply.code(400);
      return { error: 'No file uploaded' };
    }

    return reply.code(200).send({
      success: true,
      filename: savedFilename,
    });
  });

  // Uploads per gli admin -> uploads/orgid/projId/file.*
  fastify.post('/project', async (request, reply) => {
    const userId = getUserIdFromJWT(request, reply, fastify);

    if (!userId || Number.isNaN(userId)) {
      reply.code(401);
      return { error: 'user must be connected in order to upload a file.' };
    }

    let organizationId: string | undefined;
    let projectId: string | undefined;
    let savedFilename: string | null = null;

    for await (const part of request.parts()) {
      if (part.type !== 'file') {
        if (part.fieldname === 'organizationId') organizationId = String(part.value);
        if (part.fieldname === 'projectId') projectId = String(part.value);
        continue;
      }

      if (!organizationId) {
        part.file.resume();
        reply.code(400);
        return { error: 'organizationId is required before file' };
      }

      if (projectId) {
        const pid = Number(projectId);
        if (Number.isNaN(pid)) {
          part.file.resume();
          reply.code(400);
          return { error: 'invalid projectId' };
        }

        const permission = await fastify.prisma.projectParticipant.findUnique({
          where: { projectId_userId: { projectId: pid, userId } },
          include: { role: { select: { name: true } } },
        });

        if (!permission || (permission.role.name !== 'OWNER' && permission.role.name !== 'EDITOR')) {
          part.file.resume();
          reply.code(403);
          return { error: 'User has not the rights to upload a file.' };
        }
      }

      const safeFilename = part.filename.replace(/[^a-zA-Z0-9._-]/g, '_');

      const orgDir = projectId
        ? path.join('uploads', organizationId, projectId)
        : path.join('uploads', organizationId);

      fs.mkdirSync(orgDir, { recursive: true });

      const uploadPath = path.join(orgDir, safeFilename);

      try {
        await pump(part.file, fs.createWriteStream(uploadPath));

        if (part.file.truncated) {
          if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
          reply.code(413);
          return { error: 'File too large' };
        }

        savedFilename = safeFilename;
      } catch (err) {
        fastify.log.error(err);
        reply.code(500);
        return { error: 'Failed to save file' };
      }
    }

    if (!organizationId) {
      reply.code(400);
      return { error: 'organizationId is required' };
    }

    if (!savedFilename) {
      reply.code(400);
      return { error: 'No file uploaded' };
    }

    return reply.code(200).send({
      success: true,
      filename: savedFilename,
    });
  });

  fastify.post('/avatar', async (request, reply) => {
    const userId = getUserIdFromJWT(request, reply, fastify);

    if (!userId || Number.isNaN(userId)) {
      reply.code(401);
      return { error: 'user must be connected in order to upload a file.' };
    }

    let savedFilename: string | null = null;

    for await (const part of request.parts()) {
      if (part.type !== 'file') {
        continue;
      }
      
      const orgDir = path.join('./avatar/users/', userId.toString());

      fs.mkdirSync(orgDir, { recursive: true });

      const safeFilename = part.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uploadPath = path.join(orgDir, safeFilename);

      try {
        await pump(part.file, fs.createWriteStream(uploadPath));

        if (part.file.truncated) {
          if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
          reply.code(413);
          return { error: 'File too large' };
        }
        savedFilename = safeFilename;
        await fastify.prisma.user.update({
          where: { id: userId },
          data: { avatarUrl: uploadPath },
          select: { id: true },
        })

      } catch (err) {
        fastify.log.error(err);
        reply.code(500);
        return { error: 'Failed to save file' };
      }
    }

    return reply.code(200).send({
      success: true,
      filename: savedFilename
    });
  });
};

export default Upload;