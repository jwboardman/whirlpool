module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: 3,
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: ['@babel/plugin-proposal-class-properties'],
  env: {
    test: {
      presets: [
        ['@babel/preset-env'],
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
      plugins: ['transform-require-context'],
    },
  },
};
