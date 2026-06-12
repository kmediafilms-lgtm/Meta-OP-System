/** @type {import('next').NextConfig} */
const nextConfig = {
  // No Supabase or external API calls until credentials are configured
  env: {
    NEXT_PUBLIC_SYSTEM_MODE: 'mock',
  },
}

module.exports = nextConfig
