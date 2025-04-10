const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['mysql2']
  },
  // ไม่ต้องใช้ output: 'standalone' ในขณะพัฒนา
  // output: 'standalone',
  
  // เพิ่ม config สำหรับการจัดการรูปภาพ
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig

