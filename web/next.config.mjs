/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react"],
  async rewrites() {
    const apiTarget = process.env.API_URL ? `${process.env.API_URL}/api/:path*` : "http://127.0.0.1:8000/api/:path*";
    return [
      {
        source: "/api/:path*",
        destination: apiTarget
      }
    ];
  }
};

export default nextConfig;
