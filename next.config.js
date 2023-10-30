/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        // check s3.ts file before change it
        domains: [
            'community-profile-images-1r34goy.s3.amazonaws.com',
            'community-subscription-images-321t9587g.s3.amazonaws.com'
        ],
    },
}

module.exports = nextConfig
