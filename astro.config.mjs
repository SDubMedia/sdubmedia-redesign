import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sdubmedia.com',
  integrations: [sitemap({
    // Hidden send-the-link-only pages stay out of the sitemap. Keep in sync
    // with the noindex prop on the page and the X-Robots-Tag in vercel.json.
    filter: (page) => !page.includes('/lifestyle') && !page.includes('/refilms'),
  })],
});
