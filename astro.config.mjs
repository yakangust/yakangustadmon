import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: false
    }
  }),
  build: {
    format: 'directory' // Crea la carpeta /contacto/index.html en lugar de /contacto.html
  }
});
