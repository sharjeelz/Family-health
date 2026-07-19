/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Cache the static assets aggressively so a page reload serves them straight
  // from the browser's disk cache instead of re-downloading. These files rarely
  // change; if you swap one, give it a new filename (or hard-refresh once).
  async headers() {
    return [
      {
        source: "/family/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/adhan.mp3",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
