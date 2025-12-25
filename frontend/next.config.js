/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://backend:8080/:path*', // Proxy to backend container
            },
        ]
    },
}

module.exports = nextConfig
