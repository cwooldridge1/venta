import { normalizeCode, compileCode } from "../../testUtils/helpers";

// test("ternary render test", () => {
//   const input = `
//     const App = () => {
//       const count = useState(0);
//
//       return (
//         <Card>
//           {count.value >= 1 ? <Card>greater than 1</Card> : <Card>less than 1</Card>}
//         </Card>
//       );
//     };
//     `;
//   const code = normalizeCode(compileCode(input))
//   const expectedCode = normalizeCode(`\"usestrict\";var App = function App() {
//       var count = useState(0);
//       return renderVentaNode(Card, null, Venta.registerConditional(function () {
//         return count.value >= 1;
//       }, function () {
//         return renderVentaNode(Card, null, "greater than 1");
//       }, function () {
//         return renderVentaNode(Card, null, "less than 1");
//       }, count));
//     };`)
//   expect(code).toBe(expectedCode)
// });
//
//
// test("nested ternary ternary test", () => {
//   const input = `
//     const App = () => {
//       const count = useState(0);
//
//       return (
//         <Card>
//           {count.value >= 1 ? (
//             count.value >= 3 ? (
//               <Card>greater than 3</Card>
//             ) :
//               <Card>Not greater than 3</Card>
//           )
//             : (
//               <Card>less than 1</Card>
//             )}
//         </Card>
//       );
//     };
//     `;
//   const code = normalizeCode(compileCode(input));
//   const expectedCode = normalizeCode(`
//     "use strict";
//
//     var App = function App() {
//       var count = useState(0);
//       return renderVentaNode(Card, null, Venta.registerConditional(function () {
//         return count.value >= 1;
//       }, function () {
//         return Venta.renderConditional(function () {
//           return count.value >= 3;
//         }, function () {
//           return renderVentaNode(Card, null, "greater than 3");
//         }, function () {
//           return renderVentaNode(Card, null, "Not greater than 3");
//         }, 0);
//       }, function () {
//         return renderVentaNode(Card, null, "less than 1");
//       }, count, count));
//     };
// `)
//   expect(code).toBe(expectedCode)
// });
//
//
//
// test("&& render", () => {
//   const input = `
//     const App = () => {
//       const count = useState(0);
//
//       return (
//         <Card>
//           {count.value >= 1 && <Card>greater than 0</Card>}
//         </Card>
//       );
//     };
//     `;
//   const code = normalizeCode(compileCode(input));
//   const expectedCode = normalizeCode(`    
//     "use strict";
//     var App = function App() {
//       var count = useState(0);
//       return renderVentaNode(Card, null, Venta.registerConditional(function () {
//         return count.value >= 1;
//       }, function () {
//         return renderVentaNode(Card, null, "greater than 0");
//       }, function () {
//         return Venta.createAnchor("");
//       }, count));
//     };
// `)
//   expect(code).toBe(expectedCode)
// });
//
//
//
// test("double && render", () => {
//   const input = `
//     const App = () => {
//       const count = useState(0);
//
//       return (
//         <Card>
//           {count.value >= 1 && count.value <6 && <Card>greater than 0 and less than 6</Card>}
//         </Card>
//       );
//     };
//     `;
//   const code = normalizeCode(compileCode(input));
//   const expectedCode = normalizeCode(`    
//     "use strict";
//     var App = function App() {
//       var count = useState(0);
//       return renderVentaNode(Card, null, Venta.registerConditional(function () {
//         return count.value >= 1 && count.value < 6;
//       }, function () {
//         return renderVentaNode(Card, null, "greater than 0 and less than 6");
//       }, function () {
//         return Venta.createAnchor("");
//       }, count));
//     };
// `)
//   expect(code).toBe(expectedCode)
// });
//
//
//
// test("&& render with ternary", () => {
//   const input = `
//     const App = () => {
//       const count = useState(0);
//
//       return (
//         <Card>
//           {count.value >= 1 && (count.value >= 3 ? <Card>greater than 3</Card> : <Card>less than 3</Card>)}
//         </Card>
//       );
//     };
//     `;
//   const code = normalizeCode(compileCode(input));
//   const expectedCode = normalizeCode(`    
//     "use strict";
//     var App = function App() {
//       var count = useState(0);
//       return renderVentaNode(Card, null, Venta.registerConditional(function () {
//         return count.value >= 1;
//       }, function () {
//         return Venta.renderConditional(function () {
//           return count.value >= 3;
//         }, function () {
//           return renderVentaNode(Card, null, "greater than 3");
//         }, function () {
//           return renderVentaNode(Card, null, "less than 3");
//         }, 1);
//       }, function () {
//         return Venta.createAnchor("");
//       }, count, count));
//     };
// `)
//   expect(code).toBe(expectedCode)
// });
//
//
//
// test("double conditional", () => {
//   const input = `
//     const App = () => {
//       const count = useState(0);
//
//       return (
//         <Card>
//           {(count.value >= 3 || count.value === 1) && <Card>greater than 0</Card>}
//         </Card>
//       );
//     };
//     `;
//   const code = normalizeCode(compileCode(input));
//   const expectedCode = normalizeCode(`
//     "use strict";
//     var App = function App() {
//       var count = useState(0);
//       return renderVentaNode(Card, null, Venta.registerConditional(function () {
//         return count.value >= 3 || count.value === 1;
//       }, function () {
//         return renderVentaNode(Card, null, "greater than 0");
//       }, function () {
//         return Venta.createAnchor("");
//       }, count));
//     };
// `)
//   expect(code).toBe(expectedCode)
// });
//
//
//
// test("non-useState render should catch useMemo as state", () => {
//   const input = `
//     const App = () => {
//       const count = useState(0);
//       const doubleCount = useMemo(() => count.value * 2, [count]);
//
//       return (
//         <Card>
//           {doubleCount.value >= 2 && <span>gt2</span>}
//         </Card>
//       );
//     };
//     `;
//   const code = normalizeCode(compileCode(input));
//   const expectedCode = normalizeCode(`      "use strict";
//
//       var App = function App() {
//         var count = useState(0);
//         var doubleCount = useMemo(function () {
//           return count.value * 2;
//         }, [count]);
//         return renderVentaNode(Card, null, Venta.registerConditional(function () {
//           return doubleCount.value >= 2;
//         }, function () {
//           return renderVentaNode("span", null, "gt2");
//         }, function () {
//           return Venta.createAnchor("");
//         }, doubleCount));
//       };
// `)
//   expect(code).toBe(expectedCode)
// });
//
//
//
// test("non-jsx context ternary render test", () => {
//   const input = `
//     const App = () => {
//       const count = useState(0);
//       return  count.value >= 1 ? <Card>greater than 1</Card> : <Card>less than 1</Card>
//     };
//     `;
//   const code = normalizeCode(compileCode(input))
//   const expectedCode = normalizeCode(`
//     "use strict";
//
//     var App = function App() {
//       var count = useState(0);
//       return Venta.registerConditional(function () {
//         return count.value >= 1;
//       }, function () {
//         return renderVentaNode(Card, null, "greater than 1");
//       }, function () {
//         return renderVentaNode(Card, null, "less than 1");
//       }, count);
//     };
//    `)
//   expect(code).toBe(expectedCode)
// });
//
//
// test("non-jsx non-component context ternary render test", () => {
//   const input = `
//     const app = () => {
//       const count = useState(0);
//       return  count.value >= 1 ? <Card>greater than 1</Card> : <Card>less than 1</Card>
//     };
//     `;
//   const code = normalizeCode(compileCode(input))
//   const expectedCode = normalizeCode(`
//       "use strict";
//       var app = function app() {
//         var count = useState(0);
//         return count.value >= 1 ? renderVentaNode(Card, null, "greater than 1") : renderVentaNode(Card, null, "less than 1");
//       };
//    `)
//   expect(code).toBe(expectedCode)
// });
//
// test("non-jsx && render test", () => {
//   const input = `
//     const App = () => {
//       const count = useState(0);
//       return  count.value >= 1 && <Card>greater than 1</Card>
//     };
//     `;
//   const code = normalizeCode(compileCode(input))
//   const expectedCode = normalizeCode(`
//       "use strict";
//       var App = function App() {
//         var count = useState(0);
//         return Venta.registerConditional(function () {
//           return count.value >= 1;
//         }, function () {
//           return renderVentaNode(Card, null, "greater than 1");
//         }, function () {
//           return Venta.createAnchor("");
//         }, count);
//       };
//    `)
//   expect(code).toBe(expectedCode)
// });
//
//
//
// test("no jsx && render test", () => {
//   const input = `
//     const App = () => {
//       const count = useState(0);
//       return  count.value >= 1 && 'greater than 1'
//     };
//     `;
//   const code = normalizeCode(compileCode(input))
//   const expectedCode = normalizeCode(`
//     "use strict";
//     var App = function App() {
//       var count = useState(0);
//       return Venta.registerConditional(function () {
//         return count.value >= 1;
//       }, function () {
//         return Venta.renderTextNode('greater than 1');
//       }, function () {
//         return Venta.createAnchor("");
//       }, count);
//     };
//
// `)
//   expect(code).toBe(expectedCode)
// });
//
//
//
// test("no jsx ternary render test", () => {
//   const input = `
//     const App = () => {
//       const count = useState(0);
//       return  count.value >= 1 ? 'greater than 1' : count
//     };
//     `;
//   const code = normalizeCode(compileCode(input))
//   const expectedCode = normalizeCode(`
//     "use strict";
//     var App = function App() {
//       var count = useState(0);
//       return Venta.registerConditional(function () {
//         return count.value >= 1;
//       }, function () {
//         return Venta.renderTextNode('greater than 1');
//       }, function () {
//         return Venta.renderTextNode(count);
//       }, count);
//     };
//
//   `)
//   expect(code).toBe(expectedCode)
// });
//
//
// test("no jsx ternary render test", () => {
//   const input = `
//     const App = () => {
//       const count = useState(0);
//       const val = 2;
//       return  count.value >= 1 ? val : count
//     };
//     `;
//
//   const code = normalizeCode(compileCode(input))
//   const expectedCode = normalizeCode(`
//     "use strict";
//     var App = function App() {
//       var count = useState(0);
//       var val = 2;
//       return Venta.registerConditional(function () {
//         return count.value >= 1;
//       }, function () {
//         return Venta.renderTextNode(val);
//       }, function () {
//         return Venta.renderTextNode(count);
//       }, count);
//     };
//   `)
//   expect(code).toBe(expectedCode)
// });
//
// test("no jsx ternary render test", () => {
//   const input = `
//     const App = () => {
//       const count = useState(0);
//       return  count.value >= 1 ? 4 : count
//     };
//     `;
//
//   const code = normalizeCode(compileCode(input))
//   const expectedCode = normalizeCode(`
//       "use strict";
//       var App = function App() {
//         var count = useState(0);
//         return Venta.registerConditional(function () {
//           return count.value >= 1;
//         }, function () {
//           return Venta.renderTextNode(4);
//         }, function () {
//           return Venta.renderTextNode(count);
//         }, count);
//       };
//   `)
//   expect(code).toBe(expectedCode)
// });
//
//
//
// test("non jsx return value no conditions", () => {
//   const input = `
//     const Component = (count) => {
//       return  count.value >= 1 ? 4 : count
//     };
//     const App = () => {
//       const count = useState(0);
//       return  <Component count={count}/>
//     };
//     `;
//
//   const code = normalizeCode(compileCode(input))
//   const expectedCode = normalizeCode(`
//       "use strict";
//       var Component = function Component(count) {
//         return Venta.registerConditional(function () {
//           return count.value >= 1;
//         }, function () {
//           return Venta.renderTextNode(4);
//         }, function () {
//           return Venta.renderTextNode(count);
//         }, count);
//       };
//       var App = function App() {
//         var count = useState(0);
//         return renderVentaNode(Component, {
//           count: count
//         });
//       };
//   `)
//   expect(code).toBe(expectedCode)
// });



test("?? render test", () => {
  const input = `
    const App = () => {
      const count = useState(0);
      return  count.value ?? 'greater than 1'
    };
    `;
  const code = normalizeCode(compileCode(input))
  const expectedCode = normalizeCode(`
    "use strict";

    var App = function App() {
      var count = useState(0);
      return Venta.registerConditional(function () {
        return true;
      },function(){return Venta.renderConditional(function () {
        return count.value !== null && count.value !== undefined;
      }, function () {
        return Venta.renderFineTunedResponsiveNode(count, ["value"]);
      }, function () {
        return Venta.renderTextNode('greater than 1');
      }, 0);}, function () {
        return Venta.createAnchor("");
      }, count);
    };
`)


  expect(code).toBe(expectedCode)
});




test("multiple ?? render test", () => {
  const input = `
     const App = () => {
       const count = useState(0);
       const count2 = useState(0);
       return count.value ?? count2.value ?? 'no value'
     };
     `;

  const code = normalizeCode(compileCode(input))
  const expectedCode = normalizeCode(`
    "use strict";

    var App = function App() {
      var count = useState(0);
      var count2 = useState(0);
      return Venta.registerConditional(function () {
        return true;
      }, function(){return Venta.renderConditional(function () {
        return count.value !== null && count.value !== undefined;
      }, function () {
        return Venta.renderFineTunedResponsiveNode(count, ["value"]);
      }, function () {
        return Venta.renderConditional(function () {
          return count2.value !== null && count2.value !== undefined;
        }, function () {
          return Venta.renderFineTunedResponsiveNode(count2, ["value"]);
        }, function () {
          return Venta.renderTextNode('no value');
        }, 1);
      }, 2);}, function () {
        return Venta.createAnchor("");
      }, count, count2);
    };
 `)


  expect(code).toBe(expectedCode)
});

test('tripple ??', () => {
  const input = `
    const App = () => {
      const count = useState(0);
      const count2 = useState(0);
      const count3 = useState(0);
      return count.value ?? count2.value ?? count3.value ?? 'no value'
    };
    `;
  const code = normalizeCode(compileCode(input))
  const expectedCode = normalizeCode(`
    "use strict";

    var App = function App() {
      var count = useState(0);
      var count2 = useState(0);
      var count3 = useState(0);
      return Venta.registerConditional(function () {
        return true;
      }, function(){return Venta.renderConditional(function () {
        return count.value !== null && count.value !== undefined;
      }, function () {
        return Venta.renderFineTunedResponsiveNode(count, ["value"]);
      }, function () {
        return Venta.renderConditional(function () {
          return count2.value !== null && count2.value !== undefined;
        }, function () {
          return Venta.renderFineTunedResponsiveNode(count2, ["value"]);
        }, function () {
          return Venta.renderConditional(function () {
            return count3.value !== null && count3.value !== undefined;
          }, function () {
            return Venta.renderFineTunedResponsiveNode(count3, ["value"]);
          }, function () {
            return Venta.renderTextNode('no value');
          }, 3);
        }, 4);
      }, 5);}, function () {
        return Venta.createAnchor("");
      }, count, count2, count3);
    };
`)
  expect(code).toBe(expectedCode)
})


test('?? with function call', () => {

  const input = `
    const App = () => {
    const getVal = () => 'no value'
      return getVal() ?? 'no value'
    };
    `;
  const code = normalizeCode(compileCode(input))
  const expectedCode = normalizeCode(`

    "use strict";

    var App = function App() {
      var getVal = function getVal() {
        return 'no value';
      };
      return Venta.registerConditional(function () {
        return true;
      }, function () {
        return Venta.renderConditional(function () {
          return getVal() !== null && getVal() !== undefined;
        }, function () {
          return getVal();
        }, function () {
          return Venta.renderTextNode('no value');
        }, 6);
      }, function () {
        return Venta.createAnchor("");
      }, getVal);
    };
  `)
  expect(code).toBe(expectedCode)

})

test("&& with ??", () => {

  const input = `
    const App = () => {
      const count = useState(0);
      return count.value ?? (count.value > 2 && 'count greater than 2')
    };
    `;
  console.log(compileCode(input))
  const code = normalizeCode(compileCode(input))
  const expectedCode = normalizeCode(``)
  expect(code).toBe(expectedCode)

})

// test('ternary with ??', () => {
//
//
//   const input = `
//     const App = () => {
//       const count = useState(0);
//       return count.value ?? count.value > 2 && 'count greater than 2'
//     };
//     `;
//   console.log(compileCode(input))
//   const code = normalizeCode(compileCode(input))
//   const expectedCode = normalizeCode(``)
//   expect(code).toBe(expectedCode)
// })
//
// test('?? with nested ternary', () => {
//
//
//   const input = `
//     const App = () => {
//       const count = useState(0);
//       return count.value ?? count.value > 2 && 'count greater than 2'
//     };
//     `;
//   console.log(compileCode(input))
//   const code = normalizeCode(compileCode(input))
//   const expectedCode = normalizeCode(``)
//   expect(code).toBe(expectedCode)
// })
//
//
// test('?? with jsx element', () => {
//
//
//   const input = `
//     const App = () => {
//       const count = useState(0);
//       return count.value ?? count.value > 2 && 'count greater than 2'
//     };
//     `;
//   console.log(compileCode(input))
//   const code = normalizeCode(compileCode(input))
//   const expectedCode = normalizeCode(``)
//   expect(code).toBe(expectedCode)
// })
