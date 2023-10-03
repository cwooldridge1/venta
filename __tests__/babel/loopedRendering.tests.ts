import { normalizeCode, compileCode } from "../../testUtils/helpers";

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
      return renderVentaNode("div", null, renderLoop(function () {
        return items.map(function (item, index) {
          return renderVentaNode("div", {
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
      return renderVentaNode("div", null, renderLoop(function () {
        return items.values.map(function (item, index) {
          return renderVentaNode("div", {
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
  console.log(compileCode(code))
  const expectedCode = normalizeCode(`
    "use strict";

    function MyComponent() {
      var arr = useState([1, 2, 3]);
      return renderLoop(function () {
        return arr.values.map(function (item, index) {
          return renderVentaNode("div", {
            key: index
          }, item);
        });
      }, arr);
    }
  `)
  expect(normalizeCode(compileCode(code))).toBe(expectedCode)
})
