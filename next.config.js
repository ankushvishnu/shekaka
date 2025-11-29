// next.config.js
const webpack = require("webpack");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ensure externals exists
    if (!config.externals) config.externals = [];

    // Tell webpack NOT to try bundling these native/node-only modules
    config.externals.push({
      "onnxruntime-node": "commonjs onnxruntime-node",
      "onnxruntime-web": "commonjs onnxruntime-web",
      sharp: "commonjs sharp",
      // Add any other native modules you discover here
    });

    // Prevent resolving these modules for client bundles
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "onnxruntime-node": false,
      "onnxruntime-web": false,
      sharp: false,
      // If other modules show up in errors, add them as false as well
    };

    // Helpful: ignore attempts to require binary files by name (optional)
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.(node)$/ // ignore .node binaries in client build
      })
    );

    return config;
  },

  // Other Next settings you may have:
  // experimental: { ... }, reactStrictMode: true, etc.
};

module.exports = nextConfig;
