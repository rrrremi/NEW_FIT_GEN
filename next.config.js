/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/protected/workouts',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
