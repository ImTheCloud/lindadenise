import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Pages d'essai (dossier essais/) : servies par `npm run dev` seulement, jamais construites ni publiées
const essais = {
  name: 'essais',
  hooks: {
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command === 'dev') injectRoute({ pattern: '/essai-tilleul', entrypoint: './essais/tilleul.astro' });
    },
  },
};

export default defineConfig({
  site: 'https://lindadenise.be',
  trailingSlash: 'always',
  integrations: [essais, sitemap({ filter: (page) => !/\/(merci|bedankt)\//.test(page), i18n: { defaultLocale: 'fr', locales: { fr: 'fr-BE', nl: 'nl-BE' } } })],
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'nl'],
    routing: { prefixDefaultLocale: false },
  },
});
