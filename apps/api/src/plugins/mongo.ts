import { getErrorMessage } from '@stridemon/shared/errors'
import fastifyPlugin from 'fastify-plugin'
import { MongoClient } from 'mongodb'

// Short enough that a stopped mongod fails boot (and /health) quickly instead of
// hanging for the driver's 30 s default.
const SERVER_SELECTION_TIMEOUT_MILLISECONDS = 5_000

/** Connects once at boot, decorates `fastify.mongo`, and closes the client on shutdown. */
export const mongoPlugin = fastifyPlugin(
  async (fastify) => {
    const mongoClient = new MongoClient(fastify.config.mongodbUri, {
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MILLISECONDS,
    })

    try {
      await mongoClient.connect()
    } catch (error) {
      throw new Error(
        `Could not connect to MongoDB (is it running? try \`bun run db:start\`): ${getErrorMessage(error)}`,
        { cause: error },
      )
    }

    fastify.decorate('mongo', { client: mongoClient, database: mongoClient.db() })
    fastify.addHook('onClose', async () => {
      await mongoClient.close()
    })
  },
  { name: 'mongo', dependencies: ['env'] },
)
