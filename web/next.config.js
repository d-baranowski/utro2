const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    API_BASE_URL: process.env.API_BASE_URL,
  },
  webpack: (config, { isServer }) => {
    // Add bundle analyzer for detailed analysis
    if (process.env.BUNDLE_ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
          openAnalyzer: false,
          generateStatsFile: true,
          statsFilename: isServer ? '../analyze/server-stats.json' : './analyze/client-stats.json',
        })
      );
    }
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
