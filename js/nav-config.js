(function () {
  'use strict';

  window.luxivalNavConfig = {
    brand: { href: '/', label: 'LUXIVAL' },
    items: [
      { href: '/hubs', key: 'nav.hubs', label: 'Service Hubs' },
      { href: '/services', key: 'nav.services', label: 'Services' },
      { href: '/digital', key: 'nav.digital', label: 'Digital Services' },
      { href: '/audit', key: 'nav.audit', label: 'Website Audit' },
      { href: '/portfolio', key: 'nav.portfolio', label: 'Portfolio' },
      { href: '/tourism', key: 'nav.tourism', label: 'Tourism' },
      { href: '/hub', key: 'nav.hub', label: 'Start Here' },
      { href: '/blog', key: 'nav.blog', label: 'Blog' },
      { href: '/about', key: 'nav.about', label: 'About' },
      { href: '/contact', key: 'nav.contact', label: 'Contact' }
    ],
    supportedLangs: ['en', 'fi', 'sv', 'de', 'fr', 'it', 'ru', 'no', 'da', 'ja', 'zh'],
    langNames: { en: 'English', fi: 'Suomi', sv: 'Svenska', de: 'Deutsch', fr: 'Français', it: 'Italiano', ru: 'Русский', no: 'Norsk', da: 'Dansk', ja: '日本語', zh: '中文' }
  };
})();
