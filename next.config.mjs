/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Report photos are served from Supabase Storage's public bucket URL.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
