import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import { orgSchemas } from "./organizationsSchema.js";

const Posters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // // POST /api/v1/organizations/addOrganization
        fastify.post<{
            Body: {
                name: string
                email: string
                phone: string
                city?: string | null
                address?: string | null
                cap?: string | null
                state?: string | null
            }
            }>(
            '/addOrganization',
            { schema: orgSchemas.createOrg },
            async (req, res) => {
                // Controllo se loggati (vedo se ho JWT nei session token)
                let ownerId = getUserIdFromJWT(req, res, fastify)
                if (!ownerId) {
                    res.code(400)
                    return { error: 'You must be logged in in order to create an Organization' }
                }
    
                const {
                    name,
                    email,
                    phone,
                    city,
                    address,
                    cap,
                    state,
                } = req.body
    
                // validazione (minima)
                if (!name || !email || !phone) {
                    res.code(400)
                    return { error: 'All fields are required' }
                }
    
                try {
                    const organization = await fastify.prisma.organization.create({
                        data: {
                            name,
                            email,
                            phone,
                            city: city ?? null,
                            address: address ?? null,
                            cap: cap ?? null,
                            state: state ?? null,
                            ownerId: ownerId
                        },
                    })
    
                    // Aggiunge l'owner ai membri
                    const membership = await fastify.prisma.organizationMember.create({
                        data: { organizationId: organization.id, userId: ownerId },
                    })
    
                    res.code(201)
                    return organization
                } catch (error: any) {
                    fastify.log.error(error)
    
                    // msg errore per nome org duplicato
                    if (error?.code === 'P2002') {
                        res.code(400)
                        return { error: 'Name already in use' }
                    }
                    res.code(400)
                    return { error: 'Unable to create the organization' }
                }
            }
        )
    
        // POST /api/v1/organizations/:id/addMember
        fastify.post<{
        Params: { id: string }
            Body: { email: string }
        }>(
        '/:id/addMember',
        { schema: orgSchemas.addMember },
        async (req, res) => {
            const organizationId = Number(req.params.id)
            if (Number.isNaN(organizationId)) {
                res.code(400)
                return { error: 'invalid organization id' }
            }
    
            const { email } = req.body
            if (!email) {
                res.code(400)
                return { error: 'email address is required' }
            }
    
            const actorId = getUserIdFromJWT(req, res, fastify)

            if (!actorId) {
                res.code(400)
                return { error: "You must be logged in to perform the action" }
            }

            // org esiste?
            const org = await fastify.prisma.organization.findUnique({
                where: { id: organizationId },
                select: { id: true, ownerId: true },
            })
            if (!org) {
                res.code(404)
                return { error: 'Organization not found' }
            }
    
            // solo owner puo' espandere ruoli
            if (org.ownerId !== actorId) {
                res.code(403)
                return { error: 'Only the owner can add members' }
            }
    
            // user esiste?
            const user = await fastify.prisma.user.findUnique({
                where: { email: email },
                select: { email: true, id: true },
            })
            if (!user) {
                res.code(404)
                return { error: 'User not found' }
            }
    
            // crea membership (gestiscendo duplicati)
            try {
                const membership = await fastify.prisma.organizationMember.create({
                    data: { organizationId, userId: user.id },
                })
    
                return res.code(201).send({
                    success: true,
                    organizationId,
                    email,
                    joinedAt: membership.createdAt,
            })
            } catch (error: any) {
            // duplicato (già membro) → Prisma unique/PK violation
            // sqlite = P2002 (unique constraint)
                if (error?.code === 'P2002') {
                    res.code(409)
                    return { error: 'User is already a member' }
            }
    
            fastify.log.error(error)
                res.code(400)
                return { error: 'Unable to add member' }
            }
        }
    )

    fastify.post<{
        Params: { id: string }
        Body: { email: string }
    }>(
        '/:id/invitations',
        { schema: orgSchemas.inviteMember },
        async (req, res) => {
        const organizationId = Number(req.params.id);
        if (Number.isNaN(organizationId)) {
            res.code(400);
            return { error: 'invalid organization id' };
        }

        const { email } = req.body;
        if (!email) {
            res.code(400);
            return { error: 'email address is required' };
        }

        const actorId = getUserIdFromJWT(req, res, fastify);
        if (!actorId) {
            res.code(401);
            return { error: 'You must be logged in to perform the action' };
        }

        const org = await fastify.prisma.organization.findUnique({
            where: { id: organizationId },
            select: { id: true, ownerId: true, name: true },
        });

        if (!org) {
            res.code(404);
            return { error: 'Organization not found' };
        }

        if (org.ownerId !== actorId) {
            res.code(403);
            return { error: 'Only the owner can invite members' };
        }

        const user = await fastify.prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true, surname: true },
        });

        if (!user) {
            res.code(404);
            return { error: 'User not found' };
        }

        const existingMember = await fastify.prisma.organizationMember.findUnique({
            where: {
            organizationId_userId: {
                organizationId,
                userId: user.id,
            },
            },
        });

        if (existingMember) {
            res.code(409);
            return { error: 'User is already a member' };
        }

        const existingInvitation = await fastify.prisma.organizationJoinRequest.findFirst({
            where: {
            organizationId,
            requesterId: actorId,
            targetUserId: user.id,
            status: 'PENDING',
            },
        });

        if (existingInvitation) {
            res.code(409);
            return { error: 'Invitation already pending' };
        }

        const invitation = await fastify.prisma.organizationJoinRequest.create({
            data: {
            organizationId,
            requesterId: actorId,
            targetUserId: user.id,
            status: 'PENDING',
            },
        });

        const actor = await fastify.prisma.user.findUnique({
            where: { id: actorId },
            select: { name: true, surname: true, email: true }
        });

        fastify.wsSendToUser(user.id, 
                {
                    type: 'organization:invitation',
                    payload: {
                        id: invitation.id,
                        senderId: actorId,
                        sender: {
                            name: actor?.name ?? 'Someone',
                            surname: actor?.surname ?? '',
                            email: actor?.email ?? ''
                        },
                        organization: {
                            id: org.id,
                            name: org.name
                        },
                        createdAt: new Date().toISOString()
                    },
                    ts: Date.now(),
                });

        return res.code(201).send({
            success: true,
            invitation,
        });
        }
    );

    fastify.post<{
  Params: { id: string; requestId: string }
}>(
  '/:id/invitations/:requestId/accept',
  { schema: orgSchemas.acceptInvitation },
  async (req, res) => {
    const authUser = getUserIdFromJWT(req, res, fastify);

    const organizationId = Number(req.params.id);
    const requestId = Number(req.params.requestId);

    if (!authUser || Number.isNaN(organizationId) || Number.isNaN(requestId)) {
      res.code(400);
      return { error: 'Invalid organizationId or requestId' };
    }

    const invitation = await fastify.prisma.organizationJoinRequest.findUnique({
      where: { id: requestId },
    });

    if (!invitation) {
      res.code(404);
      return { error: 'Invitation not found' };
    }

    if (invitation.organizationId !== organizationId) {
      res.code(400);
      return { error: 'Invitation does not belong to this organization' };
    }

    if (invitation.targetUserId !== authUser) {
      res.code(403);
      return { error: 'You are not allowed to accept this invitation' };
    }

    if (invitation.status !== 'PENDING') {
      res.code(409);
      return { error: `Invitation already ${invitation.status}` };
    }

    const alreadyMember = await fastify.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: authUser,
        },
      },
    });

    if (alreadyMember) {
      await fastify.prisma.organizationJoinRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      });

      return res.code(200).send({
        success: true,
        message: 'User already in organization, invitation marked as accepted',
      });
    }

    const result = await fastify.prisma.$transaction(async (tx) => {
      const membership = await tx.organizationMember.create({
        data: {
          organizationId,
          userId: authUser,
        },
      });

      const updatedInvitation = await tx.organizationJoinRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      });

      return { membership, updatedInvitation };
    });

    fastify.wsSendToUser(invitation.requesterId, {
      type: 'organization:invitation:accepted',
      organizationId,
      requestId: invitation.id,
      acceptedByUserId: authUser,
      ts: Date.now(),
    });

    return res.code(200).send({
      success: true,
      invitation: result.updatedInvitation,
      membership: result.membership,
    });
  })

  fastify.post<{
  Params: { id: string; requestId: string }
}>(
  '/:id/invitations/:requestId/reject',
  { schema: orgSchemas.rejectInvitation },
  async (req, res) => {
    const authUser = getUserIdFromJWT(req, res, fastify)

    const organizationId = Number(req.params.id)
    const requestId = Number(req.params.requestId)

    if (!authUser || Number.isNaN(organizationId) || Number.isNaN(requestId)) {
      res.code(400)
      return { error: 'Invalid organizationId or requestId' }
    }

    const invitation = await fastify.prisma.organizationJoinRequest.findUnique({
      where: { id: requestId },
    })

    if (!invitation) {
      res.code(404)
      return { error: 'Invitation not found' }
    }

    if (invitation.organizationId !== organizationId) {
      res.code(400)
      return { error: 'Invitation does not belong to this organization' }
    }

    if (invitation.targetUserId !== authUser) {
      res.code(403)
      return { error: 'You are not allowed to reject this invitation' }
    }

    if (invitation.status !== 'PENDING') {
      res.code(409)
      return { error: `Invitation already ${invitation.status}` }
    }

    const updatedInvitation = await fastify.prisma.organizationJoinRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    })

    fastify.wsSendToUser(invitation.requesterId, {
      type: 'organization:invitation:rejected',
      organizationId,
      requestId: invitation.id,
      rejectedByUserId: authUser,
      ts: Date.now(),
    })

    return res.code(200).send({
      success: true,
      invitation: updatedInvitation,
    })
  }
)
}

export default Posters