const babel = require("@babel/core");
const plugin = require("../rendering.js");
const componentPlugin = require("../component.js");
const jsxAttributes = require("../jsxAttributes.js");


const compileCode = function(code) {
  var result = babel.transform(code, {
    filename: 'dummyFile.tsx',
    presets: ["@babel/preset-env",
      "@babel/preset-typescript",
      [
        "@babel/preset-react",
        {
          "pragma": "VentaInternal.createElement"
        }
      ],
    ],
    plugins: [
      jsxAttributes,
      plugin,
      componentPlugin,
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

