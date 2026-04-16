import { config as loadEnv } from 'dotenv'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'prisma/config'

// Ensure local `.env` is loaded even when Prisma CLI doesn't auto-load it.
// Prisma may run with a different cwd, so use an explicit path.
const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: `${__dirname}/.env` })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL. Set it in .env or your environment.')
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
})

