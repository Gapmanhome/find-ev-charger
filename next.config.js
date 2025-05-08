
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { appDir: true },
  compiler: {
    // Enable the SWC compiler to use the "module" type
    swcMinify: true,
  },
};
export default nextConfig;
