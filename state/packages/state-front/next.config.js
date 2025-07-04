const dotenv = require("dotenv");
const result = dotenv.config();

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
        config.externals.push("pino-pretty", "lokijs", "encoding");
        return config;
    },
    env: {
        ...result.parsed,
    },
};

module.exports = nextConfig;
