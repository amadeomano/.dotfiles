// @ts-check
const packageJSON = require('./package.json');
const transpilePackages = Object.keys(packageJSON.dependencies).filter(
  (it) =>
    it.startsWith('@personio-web') ||
    it.startsWith('@codesandbox') ||
    it.startsWith('nuqs-next-router'),
);

const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
});

const targetUrl =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? 'https://www.personio.design'
    : 'https://design-system-docs.preview.personio.design';
const rootUrl = process.env.VERCEL_URL || targetUrl;

/**
 * @type {import('next').NextConfig}
 **/
const config = {
  transpilePackages,
  async rewrites() {
    return [
      {
        source: '/va/:match*',
        destination: `${rootUrl}/_vercel/insights/:match*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/overview',
        destination: '/overview/approach',
        permanent: true,
      },
      {
        source: '/foundations',
        destination: '/foundations/introduction',
        permanent: true,
      },
      {
        source: '/foundations/color',
        destination: '/foundations/color/introduction',
        permanent: true,
      },
      {
        source: '/contributing',
        destination: '/contributing/getting-started',
        permanent: true,
      },
      {
        source: '/contributing/engineering',
        destination: '/contributing/engineering/getting-started',
        permanent: true,
      },
      {
        source: '/contributing/engineering/components',
        destination: '/contributing/engineering/components/creation',
        permanent: true,
      },
      {
        source: '/roadmap',
        destination: '/contributing/roadmap',
        permanent: true,
      },
      {
        source: '/request',
        destination:
          'https://personio.atlassian.net/servicedesk/customer/portal/68',
        permanent: true,
      },
      {
        source: '/components',
        destination: '/components/introduction',
        permanent: true,
      },
      {
        source: '/components/button',
        destination: '/components/button/button',
        permanent: true,
      },
    ];
  },
};

module.exports = withNextra(config);
