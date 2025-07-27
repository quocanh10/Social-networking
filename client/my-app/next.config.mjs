/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    TIME_INTERVAL_CHECK_TOKEN: process.env.TIME_INTERVAL_CHECK_TOKEN,
    TIME_RENEW_ACCESS_TOKEN: process.env.TIME_RENEW_ACCESS_TOKEN,
  },
  images: {
    // domains: ["utfs.io", "res.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
