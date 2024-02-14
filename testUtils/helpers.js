var babel = require("@babel/core");
var plugin = require("../babel/conditionalRendering.js");
export var compileCode = function (code) {
    var result = babel.transform(code, {
        filename: 'dummyFile.tsx',
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
};
export var normalizeCode = function (code) {
    return code.replace(/\s/g, '');
};
