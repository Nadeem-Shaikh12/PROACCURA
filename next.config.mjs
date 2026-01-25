/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['pdfkit', 'adm-zip'],
    webpack: (config) => {
        config.resolve.alias.canvas = false;
        config.resolve.alias.encoding = false;
        return config;
    },
    turbopack: {}
};

export default nextConfig;
