import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  trailingSlash: 'never',
  build: {
    format: 'file' // Genera contacto.html para responder nativamente a /contacto
  }
});
