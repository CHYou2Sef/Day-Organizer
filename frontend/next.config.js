/** @type {import('next').NextConfig} */
const nextConfig = {
    // Comments: Added config to handle external backend if needed
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
