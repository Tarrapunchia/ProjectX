import { type FastifyInstance, type FastifyPluginAsync, type FastifyReply, type FastifyRequest } from 'fastify';
import { getUserIdFromJWT, setAuthCookie } from '../../../helpers/cookies.js';
import { orgSchemas } from './schemas/organizationsSchema.js';

const Organizations: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // GET /api/v1/organizations
    fastify.get('/', { schema: orgSchemas.getAllOrgs },  async (req, res) => {
        return fastify.prisma.organization.findMany()
    })

    // GET /api/v1/organizations/:id/profile
    fastify.get<{
        Params: { id: string }
        }>(
        '/:id/profile',
        { schema: orgSchemas.getOrgProfile },
        async (req, res) => {
            const id = Number(req.params.id)
            if (Number.isNaN(id)) {
            res.code(400)
            return { error: 'invalid id' }
            }

            const org = await fastify.prisma.organization.findUnique({where: { id },})

            if (!org) {
                res.code(404)
                return { error: 'Organization not found' }
            }

            return {
                id: org.id,
                name: org.name,
                email: org.email,
                phone: org.phone,
                city: org.city,
                address: org.address,
                cap: org.cap,
                state: org.state,
                ownerId: org.ownerId
            }
        }
    )

    // // POST /api/v1/organizations/addUser
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
}

export default Organizations