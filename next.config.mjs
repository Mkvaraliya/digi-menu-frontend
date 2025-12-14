// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dnuppcvyf/**", // your cloud name here 
      },
    ],
    
    // or simpler version:
    // domains: ["res.cloudinary.com"],
  },
  allowedDevOrigins: ['10.72.133.78:3000'],
};

export default nextConfig;
