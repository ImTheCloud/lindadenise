import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lindadenise.be',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !/\/(merci|bedankt|panier|mandje)\//.test(page), i18n: { defaultLocale: 'fr', locales: { fr: 'fr-BE', nl: 'nl-BE' } } })],
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'nl'],
    routing: { prefixDefaultLocale: false },
  },
});
