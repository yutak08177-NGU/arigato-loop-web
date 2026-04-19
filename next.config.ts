import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Cloudflare Pages用
}

export default nextConfig
import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
