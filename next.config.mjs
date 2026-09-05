/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Replace <your-project-ref> after creating your Supabase project,
        // or leave permissive during early development.
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
