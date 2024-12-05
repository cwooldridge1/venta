import { test, expect } from 'vitest'
const { normalizeCode, compileCode } = require("../testUtils/helpers");

test('works with list', () => {
  const code = `
    function MyComponent() {
      const items = [1, 2, 3];
      return (
        <div>
          {items.map((item, index) => {
            return <div key={index}>{item}</div>
          })}
        </div>
      );
    }
    `
  const expectedCode = normalizeCode(`
    "use strict";

    function MyComponent() {
      var items = [1, 2, 3];
      return VentaInternal.createElement("div", null, VentaInternal.renderLoop(function (item, index) {
        return VentaInternal.createElement("div", {
          key: index
        }, item);
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
      return VentaInternal.renderLoop(function (item, index) {
        return VentaInternal.createElement("div", {
          key: index
        }, item);
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
      return VentaInternal.createElement("div", null, VentaInternal.renderLoop(function (item, index) {
        return VentaInternal.createElement("div", {
          key: index
        }, VentaInternal.renderLoop(function (val, index) {
          return VentaInternal.createElement("div", {
            key: val
          }, val);
        }, item));
      }, items));
    }
   `)
  expect(normalizeCode(compileCode(code))).toBe(expectedCode)
})
