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
      return VentaInternal.renderVentaNode("div", null, VentaInternal.renderLoop(function () {
        return items.map(function (item, index) {
          return [index, function () {
            return VentaInternal.renderVentaNode("div", {
              key: index
            }, item);
          }];
        });
      }, items));
    }
  `)
  expect(normalizeCode(compileCode(code))).toBe(expectedCode)
})


test('works with list with components', () => {
  const code = `
    function Row({key}) {
      return <div>{key}</div>
    }
    function MyComponent() {
      const items = [1, 2, 3];
      return (
        <div>
          {data.value.map((item) => {
            return <Row key={item} />
          })}
        </div>
      );
    }
    `
  console.log(compileCode(code))

  const expectedCode = normalizeCode(`
    "use strict";

    function Row(_ref) {
      var key = _ref.key;
      return VentaInternal.renderVentaNode("div", null, key);
    }
    function MyComponent() {
      var items = [1, 2, 3];
      return VentaInternal.renderVentaNode("div", null, VentaInternal.renderLoop(function () {
        return data.value.map(function (item) {
          return [item, function () {
            return VentaInternal.renderVentaNode(Row, {
              key: item
            });
          }];
        });
      }, data));
    }
  `)
  expect(normalizeCode(compileCode(code))).toBe(expectedCode)
})

test('works with arrow function return type', () => {

})



// test('works with stateful list', () => {
//   const code = `
//     function MyComponent() {
//       const items = useState([1, 2, 3]);
//       return (
//         <div>
//           {items.values.map((item, index) => (
//             <div key={index}>{item}</div>
//           ))}
//         </div>
//       );
//     }
//     `
//   const expectedCode = normalizeCode(`
//     "use strict";
//     function MyComponent() {
//       var items = useState([1, 2, 3]);
//       return VentaInternal.renderVentaNode("div", null, VentaInternal.renderLoop(function () {
//         return items.values.map(function (item, index) {
//           return VentaInternal.renderVentaNode("div", {
//             key: index
//           }, item);
//         });
//       }, items));
//     }
//   `)
//   expect(normalizeCode(compileCode(code))).toBe(expectedCode)
// })

// test('works with list not in jsx context', () => {
//   const code = `
//     function MyComponent() {
//       const arr = useState([1, 2, 3]);
//       return arr.values.map((item, index) => <div key={index}>{item}</div>)
//     }
//     `
//   const expectedCode = normalizeCode(`
//     "use strict";
//
//     function MyComponent() {
//       var arr = useState([1, 2, 3]);
//       return VentaInternal.renderLoop(function () {
//         return arr.values.map(function (item, index) {
//           return VentaInternal.renderVentaNode("div", {
//             key: index
//           }, item);
//         });
//       }, arr);
//     }
//   `)
//   expect(normalizeCode(compileCode(code))).toBe(expectedCode)
// })
//
//
// test('nested loop', () => {
//   const code = `
//     function MyComponent() {
//       const items = useState([1, 2, 3]);
//       return (
//         <div>
//           {items.values.map((item, index) => (
//             <div key={index}>
//               {item.map((val, index) => (
//                 <div key={val}>{val}</div>
//               ))}
//             </div>
//           ))}
//         </div>
//       );
//     }
//     `
//   const expectedCode = normalizeCode(`
//     "use strict";
//
//     function MyComponent() {
//       var items = useState([1, 2, 3]);
//       return VentaInternal.renderVentaNode("div", null, VentaInternal.renderLoop(function () {
//         return items.values.map(function (item, index) {
//           return VentaInternal.renderVentaNode("div", {
//             key: index
//           }, VentaInternal.renderLoop(function () {
//             return item.map(function (val, index) {
//               return VentaInternal.renderVentaNode("div", {
//                 key: val
//               }, val);
//             });
//           }, item));
//         });
//       }, items));
//     }
//    `)
//   expect(normalizeCode(compileCode(code))).toBe(expectedCode)
// })
//
//
//
// test('loop with external identifier', () => {
//   const code = `
//     function MyComponent() {
//       const items = useState([1, 2, 3]);
//       const val = 2
//       return (
//         <div>
//           {items.values.map((item, index) => (
//             <div key={index}>
//               {val} 
//             </div>
//           ))}
//         </div>
//       );
//     }
//     `
//
//   const expectedCode = normalizeCode(`
//     "use strict";
//
//     function MyComponent() {
//       var items = useState([1, 2, 3]);
//       var val = 2;
//       return VentaInternal.renderVentaNode("div", null, VentaInternal.renderLoop(function () {
//         return items.values.map(function (item, index) {
//           return VentaInternal.renderVentaNode("div", {
//             key: index
//           }, val);
//         });
//       }, items));
//     }
//   `
//   )
//
//   expect(normalizeCode(compileCode(code))).toBe(expectedCode)
// })
//
//
//
// test('nested loop that uses state', () => {
//   const code = `
//     function MyComponent() {
//       const items = useState([1, 2, 3]);
//       const state = useState(2)
//       return (
//         <div>
//           {items.values.map((item, index) => (
//             <div key={index}>
//               {item.map((val, index) => (
//                 <div key={val}>{state.value}</div>
//               ))}
//             </div>
//           ))}
//         </div>
//       );
//     }
//     `
//   const expectedCode = normalizeCode(`
//       "use strict";
//
//       function MyComponent() {
//         var items = useState([1, 2, 3]);
//         var state = useState(2);
//         return VentaInternal.renderVentaNode("div", null, VentaInternal.renderLoop(function () {
//           return items.values.map(function (item, index) {
//             return VentaInternal.renderVentaNode("div", {
//               key: index
//             }, VentaInternal.renderLoop(function () {
//               return item.map(function (val, index) {
//                 return VentaInternal.renderVentaNode("div", {
//                   key: val
//                 }, state.value);
//               });
//             }, item));
//           });
//         }, items));
//       }
//    `)
//
//   expect(normalizeCode(compileCode(code))).toBe(expectedCode)
// })
