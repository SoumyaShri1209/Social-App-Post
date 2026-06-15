module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Fix 1: ESM resolution for MUI v9
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      });

      // Fix 2: Handle .mjs files properly
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      });

      // Fix 3: Resolve extensions
      webpackConfig.resolve.extensions = [
        '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'
      ];

      return webpackConfig;
    },
  },
};