module.exports = (api) => {
  api.cache(false);

  return {
    presets: [
      "@babel/preset-env",
      "@babel/preset-typescript",
      [
        "@babel/preset-react",
        {
          "pragma": "VentaInternal.createElement",
        }
      ],
    ],
    plugins: [
      // `${__dirname}/jsxAttributes.js`,
      `${__dirname}/rendering`,
      `${__dirname}/component`,
    ]
  };
};
