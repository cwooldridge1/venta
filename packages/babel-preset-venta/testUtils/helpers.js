const babel = require("@babel/core");
const plugin = require("../rendering.js");


const compileCode = function(code) {
  var result = babel.transform(code, {
    filename: 'dummyFile.tsx',
    presets: ["@babel/preset-env",
      "@babel/preset-typescript",
      [
        "@babel/preset-react",
        {
          "pragma": "VentaInternal.renderVentaNode",
        }
      ],
    ],
    plugins: [
      plugin
    ]
  });
  return result.code;
};
const normalizeCode = function(code) {
  return code.replace(/[\s;]/g, '');
};

module.exports = {
  compileCode,
  normalizeCode
};

