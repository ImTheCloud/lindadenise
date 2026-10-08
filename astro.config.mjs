import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lindadenise.be',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'nl'],
    routing: { prefixDefaultLocale: false },
  },
});
