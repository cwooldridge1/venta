const babel = require("@babel/core");
const plugin = require("../babel/conditionalRendering.js");

export const compileCode = (code: string) => {
  const result = babel.transform(code, {
    filename: 'dummyFile.tsx',  // Or whatever name you want
    presets: ["@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-typescript"

    ],

    plugins: [
      [
        "@babel/plugin-transform-react-jsx",
        {
          "pragma": 'renderVentaNode'
        }
      ],
      plugin
    ]
  });
  return result.code;
}

export const normalizeCode = (code: string) => {
  return code.replace(/\s/g, '')
}
