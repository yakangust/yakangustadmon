import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'cloudflare',
    cloudflareModules: true,
    platformProxy: {
      enabled: false,
    },
  }),
  build: {
    format: 'directory',
  },
});
