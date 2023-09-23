/**
 * @jest-environment jsdom
 */
import { renderVentaNode } from "../../src";

// __tests__/plugin.test.js
const babel = require("@babel/core");
const plugin = require("../../babel/conditionalRendering.js");

function transformCode(code: any) {
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

function normalizeCode(str: string) {
  return str.replace(/\s/g, '')
}

test("ternary render test", () => {
  const input = `
    const App = () => {
      const count = useState(0);

      return (
        <Card>
          {count.value >= 1 ? <Card>greater than 1</Card> : <Card>less than 1</Card>}
        </Card>
      );
    };
    `;
  const code = normalizeCode(transformCode(input))
  const expectedCode = normalizeCode(`\"usestrict\";var App = function App() {
      var count = useState(0);
      return renderVentaNode(Card, null, registerConditional(function () {
        return count.value >= 1;
      }, function () {
        return renderVentaNode(Card, null, "greater than 1");
      }, function () {
        return renderVentaNode(Card, null, "less than 1");
      }, count));
    };`)
  expect(code).toBe(expectedCode)
});


test("nested ternary ternary test", () => {
  const input = `
    const App = () => {
      const count = useState(0);

      return (
        <Card>
          {count.value >= 1 ? (
            count.value >= 3 ? (
              <Card>greater than 3</Card>
            ) :
              <Card>Not greater than 3</Card>
          )
            : (
              <Card>less than 1</Card>
            )}
        </Card>
      );
    };
    `;
  const code = normalizeCode(transformCode(input));
  const expectedCode = normalizeCode(`
    "use strict";

    var App = function App() {
      var count = useState(0);
      return renderVentaNode(Card, null, registerConditional(function () {
        return count.value >= 1;
      }, function () {
        return renderConditional(function () {
          return count.value >= 3;
        }, function () {
          return renderVentaNode(Card, null, "greater than 3");
        }, function () {
          return renderVentaNode(Card, null, "Not greater than 3");
        }, 0);
      }, function () {
        return renderVentaNode(Card, null, "less than 1");
      }, count, count));
    };
`)
  expect(code).toBe(expectedCode)
});



test("&& render", () => {
  const input = `
    const App = () => {
      const count = useState(0);

      return (
        <Card>
          {count.value >= 1 && <Card>greater than 0</Card>}
        </Card>
      );
    };
    `;
  const code = normalizeCode(transformCode(input));
  const expectedCode = normalizeCode(`    
    "use strict";
    var App = function App() {
      var count = useState(0);
      return renderVentaNode(Card, null, registerConditional(function () {
        return count.value >= 1;
      }, function () {
        return renderVentaNode(Card, null, "greater than 0");
      }, function () {
        return document.createTextNode("");
      }, count));
    };
`)
  expect(code).toBe(expectedCode)
});



test("&& render with ternary", () => {
  const input = `
    const App = () => {
      const count = useState(0);

      return (
        <Card>
          {count.value >= 1 && (count.value >= 3 ? <Card>greater than 3</Card> : <Card>less than 3</Card>)}
        </Card>
      );
    };
    `;
  const code = normalizeCode(transformCode(input));
  const expectedCode = normalizeCode(`    
    "use strict";
    var App = function App() {
      var count = useState(0);
      return renderVentaNode(Card, null, registerConditional(function () {
        return count.value >= 1;
      }, function () {
        return renderConditional(function () {
          return count.value >= 3;
        }, function () {
          return renderVentaNode(Card, null, "greater than 3");
        }, function () {
          return renderVentaNode(Card, null, "less than 3");
        }, 1);
      }, function () {
        return document.createTextNode("");
      }, count, count));
    };
`)
  expect(code).toBe(expectedCode)
});



test("double conditional", () => {
  const input = `
    const App = () => {
      const count = useState(0);

      return (
        <Card>
          {(count.value >= 3 || count.value === 1) && <Card>greater than 0</Card>}
        </Card>
      );
    };
    `;
  const code = normalizeCode(transformCode(input));
  const expectedCode = normalizeCode(`
    "use strict";
    var App = function App() {
      var count = useState(0);
      return renderVentaNode(Card, null, registerConditional(function () {
        return count.value >= 3 || count.value === 1;
      }, function () {
        return renderVentaNode(Card, null, "greater than 0");
      }, function () {
        return document.createTextNode("");
      }, count, count));
    };
`)
  expect(code).toBe(expectedCode)
});



test("non-useState render should catch useMemo as state", () => {
  const input = `
    const App = () => {
      const count = useState(0);
      const doubleCount = useMemo(() => count.value * 2, [count]);

      return (
        <Card>
          {doubleCount.value >= 2 && <span>gt2</span>}
        </Card>
      );
    };
    `;
  const code = normalizeCode(transformCode(input));
  const expectedCode = normalizeCode(`      "use strict";

      var App = function App() {
        var count = useState(0);
        var doubleCount = useMemo(function () {
          return count.value * 2;
        }, [count]);
        return renderVentaNode(Card, null, registerConditional(function () {
          return doubleCount.value >= 2;
        }, function () {
          return renderVentaNode("span", null, "gt2");
        }, function () {
          return document.createTextNode("");
        }, doubleCount));
      };
`)
  expect(code).toBe(expectedCode)
});



test("non-jsx context ternary render test", () => {
  const input = `
    const App = () => {
      const count = useState(0);
      return  count.value >= 1 ? <Card>greater than 1</Card> : <Card>less than 1</Card>
    };
    `;
  const code = normalizeCode(transformCode(input))
  const expectedCode = normalizeCode(`
    "use strict";

    var App = function App() {
      var count = useState(0);
      return registerConditional(function () {
        return count.value >= 1;
      }, function () {
        return renderVentaNode(Card, null, "greater than 1");
      }, function () {
        return renderVentaNode(Card, null, "less than 1");
      }, count);
    };
   `)
  expect(code).toBe(expectedCode)
});


test("non-jsx non-component context ternary render test", () => {
  const input = `
    const app = () => {
      const count = useState(0);
      return  count.value >= 1 ? <Card>greater than 1</Card> : <Card>less than 1</Card>
    };
    `;
  const code = normalizeCode(transformCode(input))
  const expectedCode = normalizeCode(`
      "use strict";
      var app = function app() {
        var count = useState(0);
        return count.value >= 1 ? renderVentaNode(Card, null, "greater than 1") : renderVentaNode(Card, null, "less than 1");
      };
   `)
  expect(code).toBe(expectedCode)
});

test("non-jsx && render test", () => {
  const input = `
    const App = () => {
      const count = useState(0);
      return  count.value >= 1 && <Card>greater than 1</Card>
    };
    `;
  const code = normalizeCode(transformCode(input))
  const expectedCode = normalizeCode(`
      "use strict";
      var App = function App() {
        var count = useState(0);
        return registerConditional(function () {
          return count.value >= 1;
        }, function () {
          return renderVentaNode(Card, null, "greater than 1");
        }, function () {
          return document.createTextNode("");
        }, count);
      };
   `)
  expect(code).toBe(expectedCode)
});



test("no jsx && render test", () => {
  const input = `
    const App = () => {
      const count = useState(0);
      return  count.value >= 1 && 'greater than 1'
    };
    `;
  const code = normalizeCode(transformCode(input))
  const expectedCode = normalizeCode(`
    "use strict";
    var App = function App() {
      var count = useState(0);
      return registerConditional(function () {
        return count.value >= 1;
      }, function () {
        return renderTextNode('greater than 1');
      }, function () {
        return document.createTextNode("");
      }, count);
    };

`)
  expect(code).toBe(expectedCode)
});



test("no jsx ternary render test", () => {
  const input = `
    const App = () => {
      const count = useState(0);
      return  count.value >= 1 ? 'greater than 1' : count
    };
    `;
  const code = normalizeCode(transformCode(input))
  const expectedCode = normalizeCode(`
    "use strict";
    var App = function App() {
      var count = useState(0);
      return registerConditional(function () {
        return count.value >= 1;
      }, function () {
        return renderTextNode('greater than 1');
      }, function () {
        return renderTextNode(count);
      }, count);
    };

  `)
  expect(code).toBe(expectedCode)
});


test("no jsx ternary render test", () => {
  const input = `
    const App = () => {
      const count = useState(0);
      const val = 2;
      return  count.value >= 1 ? val : count
    };
    `;

  const code = normalizeCode(transformCode(input))
  const expectedCode = normalizeCode(`
    "use strict";
    var App = function App() {
      var count = useState(0);
      var val = 2;
      return registerConditional(function () {
        return count.value >= 1;
      }, function () {
        return renderTextNode(val);
      }, function () {
        return renderTextNode(count);
      }, count);
    };
  `)
  expect(code).toBe(expectedCode)
});

test("no jsx ternary render test", () => {
  const input = `
    const App = () => {
      const count = useState(0);
      return  count.value >= 1 ? 4 : count
    };
    `;

  const code = normalizeCode(transformCode(input))
  const expectedCode = normalizeCode(`
      "use strict";
      var App = function App() {
        var count = useState(0);
        return registerConditional(function () {
          return count.value >= 1;
        }, function () {
          return renderTextNode(4);
        }, function () {
          return renderTextNode(count);
        }, count);
      };
  `)
  expect(code).toBe(expectedCode)
});



test("non jsx return value no conditions", () => {
  const input = `
    const App = () => {
      const count = useState(0);
      return count 
    };
    `;

  const code = normalizeCode(transformCode(input))
  const expectedCode = normalizeCode(`
      "use strict";
      var App = function App() {
        var count = useState(0);
        return renderTextNode(count);
      };
`)
  expect(code).toBe(expectedCode)
});

