import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Tell Turbopack to treat the project folder as the workspace root so it
  // doesn't try to scan parent directories (which can trigger macOS privacy
  // permission errors when the parent folder is restricted).
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
