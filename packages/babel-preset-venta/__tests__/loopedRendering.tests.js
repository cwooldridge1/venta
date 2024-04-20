const { normalizeCode, compileCode } = require("../testUtils/helpers");

test('works with list', () => {
  const code = `
    function MyComponent() {
      const items = [1, 2, 3];
      return (
        <div>
          {items.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </div>
      );
    }
    `
  const expectedCode = normalizeCode(`
    "use strict";
    function MyComponent() {
      var items = [1, 2, 3];
      return VentaInternal.renderVentaNode("div", null, VentaInternal.renderLoop(function () {
        return items.map(function (item, index) {
          return VentaInternal.renderVentaNode("div", {
            key: index
          }, item);
        });
      }, items));
    }
  `)
  expect(normalizeCode(compileCode(code))).toBe(expectedCode)
})



test('works with stateful list', () => {
  const code = `
    function MyComponent() {
      const items = useState([1, 2, 3]);
      return (
        <div>
          {items.values.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </div>
      );
    }
    `
  const expectedCode = normalizeCode(`
    "use strict";
    function MyComponent() {
      var items = useState([1, 2, 3]);
      return VentaInternal.renderVentaNode("div", null, VentaInternal.renderLoop(function () {
        return items.values.map(function (item, index) {
          return VentaInternal.renderVentaNode("div", {
            key: index
          }, item);
        });
      }, items));
    }
  `)
  expect(normalizeCode(compileCode(code))).toBe(expectedCode)
})

test('works with list not in jsx context', () => {
  const code = `
    function MyComponent() {
      const arr = useState([1, 2, 3]);
      return arr.values.map((item, index) => <div key={index}>{item}</div>)
    }
    `
  const expectedCode = normalizeCode(`
    "use strict";

    function MyComponent() {
      var arr = useState([1, 2, 3]);
      return VentaInternal.renderLoop(function () {
        return arr.values.map(function (item, index) {
          return VentaInternal.renderVentaNode("div", {
            key: index
          }, item);
        });
      }, arr);
    }
  `)
  expect(normalizeCode(compileCode(code))).toBe(expectedCode)
})


test('nested loop', () => {
  const code = `
    function MyComponent() {
      const items = useState([1, 2, 3]);
      return (
        <div>
          {items.values.map((item, index) => (
            <div key={index}>
              {item.map((val, index) => (
                <div key={val}>{val}</div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    `
  const expectedCode = normalizeCode(`
    "use strict";

    function MyComponent() {
      var items = useState([1, 2, 3]);
      return VentaInternal.renderVentaNode("div", null, VentaInternal.renderLoop(function () {
        return items.values.map(function (item, index) {
          return VentaInternal.renderVentaNode("div", {
            key: index
          }, VentaInternal.renderLoop(function () {
            return item.map(function (val, index) {
              return VentaInternal.renderVentaNode("div", {
                key: val
              }, val);
            });
          }, item));
        });
      }, items));
    }
   `)
  expect(normalizeCode(compileCode(code))).toBe(expectedCode)
})



test('loop with external identifier', () => {
  const code = `
    function MyComponent() {
      const items = useState([1, 2, 3]);
      const val = 2
      return (
        <div>
          {items.values.map((item, index) => (
            <div key={index}>
              {val} 
            </div>
          ))}
        </div>
      );
    }
    `

  const expectedCode = normalizeCode(`

    "use strict";
    function MyComponent() {
      var items = useState([1, 2, 3]);
      var val = 2;
      return VentaInternal.renderVentaNode("div", null, VentaInternal.renderLoop(function () {
        return items.values.map(function (item, index) {
          return VentaInternal.renderVentaNode("div", {
            key: index
          }, val);
        });
      }, items, val));
    }
  `
  )
  expect(normalizeCode(compileCode(code))).toBe(expectedCode)
})



test('nested loop that uses state', () => {
  const code = `
    function MyComponent() {
      const items = useState([1, 2, 3]);
      const state = useState(2)
      return (
        <div>
          {items.values.map((item, index) => (
            <div key={index}>
              {item.map((val, index) => (
                <div key={val}>{state.value}</div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    `
  const expectedCode = normalizeCode(`
    "use strict";

    function MyComponent() {
      var items = useState([1, 2, 3]);
      var state = useState(2);
      return VentaInternal.renderVentaNode("div", null, VentaInternal.renderLoop(function () {
        return items.values.map(function (item, index) {
          return VentaInternal.renderVentaNode("div", {
            key: index
          }, VentaInternal.renderLoop(function () {
            return item.map(function (val, index) {
              return VentaInternal.renderVentaNode("div", {
                key: val
              }, state.value);
            });
          }, item,state));
        });
      }, items));
    }
   `)
  expect(normalizeCode(compileCode(code))).toBe(expectedCode)
})

test('conditional inside of loop', () => {
  const code = `
    function MyComponent() {
      return (
        <div>
          {items.map((item, index) => (
            count.value > 2 && <div key={index}>{item}</div>
          ))}
        </div>
      );
    }
    `
  const expectedCode = normalizeCode(`
    "use strict";

    function MyComponent() {
      return VentaInternal.renderVentaNode("div", null, VentaInternal.renderLoop(function () {
        return items.map(function (item, index) {
          return VentaInternal.registerConditional(function () {
            return count.value > 2;
          }, function () {
            return VentaInternal.renderVentaNode("div", {
              key: index
            }, item);
          }, function () {
            return VentaInternal.createAnchor("");
          }, count);
        });
      }, items));
    }
  `)
  expect(normalizeCode(compileCode(code))).toBe(expectedCode)
})
