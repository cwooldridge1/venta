import { test, expect } from 'vitest'
const { normalizeCode, compileCode } = require("../testUtils/helpers");

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

  const code = normalizeCode(compileCode(input))
  const expectedCode = normalizeCode(`
"use strict";

var App = function App() {
  var count = useState(0);
  return VentaInternal.createComponent(Card, null, [VentaInternal.registerConditional(function () {
    return count.value >= 1;
  }, function () {
    return VentaInternal.createComponent(Card, null, ["greater than 1"]);
  }, function () {
    return VentaInternal.createComponent(Card, null, ["less than 1"]);
  }, count)]);
};
`)
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

  const code = normalizeCode(compileCode(input));
  const expectedCode = normalizeCode(`
"use strict";

var App = function App() {
  var count = useState(0);
  return VentaInternal.createComponent(Card, null, [VentaInternal.registerConditional(function () {
    return count.value >= 1;
  }, function () {
    return VentaInternal.renderConditional(function () {
      return count.value >= 3;
    }, function () {
      return VentaInternal.createComponent(Card, null, ["greater than 3"]);
    }, function () {
      return VentaInternal.createComponent(Card, null, ["Not greater than 3"]);
    }, 0);
  }, function () {
    return VentaInternal.createComponent(Card, null, ["less than 1"]);
  }, count, count)]);
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
  const code = normalizeCode(compileCode(input));
  const expectedCode = normalizeCode(`
"use strict";

var App = function App() {
  var count = useState(0);
  return VentaInternal.createComponent(Card, null, [VentaInternal.registerConditional(function () {
    return count.value >= 1;
  }, function () {
    return VentaInternal.createComponent(Card, null, ["greater than 0"]);
  }, function () {
    return VentaInternal.createAnchor("");
  }, count)]);
};
`)
  expect(code).toBe(expectedCode)
});



test("double && render", () => {
  const input = `
    const App = () => {
      const count = useState(0);

      return (
        <Card>
          {count.value >= 1 && count.value <6 && <Card>greater than 0 and less than 6</Card>}
        </Card>
      );
    };
    `;
  const code = normalizeCode(compileCode(input));
  const expectedCode = normalizeCode(`
"use strict";

var App = function App() {
  var count = useState(0);
  return VentaInternal.createComponent(Card, null, [VentaInternal.registerConditional(function () {
    return count.value >= 1 && count.value < 6;
  }, function () {
    return VentaInternal.createComponent(Card, null, ["greater than 0 and less than 6"]);
  }, function () {
    return VentaInternal.createAnchor("");
  }, count)]);
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

  const code = normalizeCode(compileCode(input));
  const expectedCode = normalizeCode(`
"use strict";

var App = function App() {
  var count = useState(0);
  return VentaInternal.createComponent(Card, null, [VentaInternal.registerConditional(function () {
    return count.value >= 1;
  }, function () {
    return VentaInternal.renderConditional(function () {
      return count.value >= 3;
    }, function () {
      return VentaInternal.createComponent(Card, null, ["greater than 3"]);
    }, function () {
      return VentaInternal.createComponent(Card, null, ["less than 3"]);
    }, 1);
  }, function () {
    return VentaInternal.createAnchor("");
  }, count, count)]);
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
  const code = normalizeCode(compileCode(input));
  const expectedCode = normalizeCode(`
"use strict";

var App = function App() {
  var count = useState(0);
  return VentaInternal.createComponent(Card, null, [VentaInternal.registerConditional(function () {
    return count.value >= 3 || count.value === 1;
  }, function () {
    return VentaInternal.createComponent(Card, null, ["greater than 0"]);
  }, function () {
    return VentaInternal.createAnchor("");
  }, count)]);
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

  const code = normalizeCode(compileCode(input))
  const expectedCode = normalizeCode(`
"use strict";

var App = function App() {
  var count = useState(0);
  return VentaInternal.registerConditional(function () {
    return count.value >= 1;
  }, function () {
    return VentaInternal.createComponent(Card, null, ["greater than 1"]);
  }, function () {
    return VentaInternal.createComponent(Card, null, ["less than 1"]);
  }, count);
};
   `)
  expect(code).toBe(expectedCode)
});


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
      return VentaInternal.registerConditional(function () {
        return true;
      },function(){return VentaInternal.renderConditional(function () {
        return count.value !== null && count.value !== undefined;
      }, function () {
        return VentaInternal.createStatefulTextNode(count.value, [count]);
      }, function () {
        return VentaInternal.renderTextNode('greater than 1');
      }, 2);}, function () {
        return VentaInternal.createAnchor("");
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
      return VentaInternal.registerConditional(function () {
        return true;
      }, function(){return VentaInternal.renderConditional(function () {
        return count.value !== null && count.value !== undefined;
      }, function () {
        return VentaInternal.createStatefulTextNode(count.value, [count]);
      }, function () {
        return VentaInternal.renderConditional(function () {
          return count2.value !== null && count2.value !== undefined;
        }, function () {
          return VentaInternal.createStatefulTextNode(count2.value, [count2]);
        }, function () {
          return VentaInternal.renderTextNode('no value');
        }, 3);
      }, 4);}, function () {
        return VentaInternal.createAnchor("");
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
      return VentaInternal.registerConditional(function () {
        return true;
      }, function(){return VentaInternal.renderConditional(function () {
        return count.value !== null && count.value !== undefined;
      }, function () {
        return VentaInternal.createStatefulTextNode(count.value, [count]);
      }, function () {
        return VentaInternal.renderConditional(function () {
          return count2.value !== null && count2.value !== undefined;
        }, function () {
          return VentaInternal.createStatefulTextNode(count2.value, [count2]);
        }, function () {
          return VentaInternal.renderConditional(function () {
            return count3.value !== null && count3.value !== undefined;
          }, function () {
            return VentaInternal.createStatefulTextNode(count3.value, [count3]);
          }, function () {
            return VentaInternal.renderTextNode('no value');
          }, 5);
        }, 6);
      }, 7);}, function () {
        return VentaInternal.createAnchor("");
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
      return VentaInternal.registerConditional(function () {
        return true;
      }, function () {
        return VentaInternal.renderConditional(function () {
          return getVal() !== null && getVal() !== undefined;
        }, function () {
          return getVal();
        }, function () {
          return VentaInternal.renderTextNode('no value');
        }, 8);
      }, function () {
        return VentaInternal.createAnchor("");
      }, getVal);
    };
  `)
  expect(code).toBe(expectedCode)

})

test("?? with &&", () => {

  const input = `
    const App = () => {
      const count = useState(0);
      return count.value ?? (count.value > 2 && 'count greater than 2')
    };
    `;
  const code = normalizeCode(compileCode(input))
  const expectedCode = normalizeCode(`
    "use strict";

    var App = function App() {
      var count = useState(0);
      return VentaInternal.registerConditional(function () {
        return true;
      }, function () {
        return VentaInternal.renderConditional(function () {
          return count.value !== null && count.value !== undefined;
        }, function () {
          return VentaInternal.createStatefulTextNode(count.value, [count]);
        }, function () {
          return VentaInternal.renderConditional(function () {
            return count.value > 2;
          }, function () {
            return VentaInternal.renderTextNode('count greater than 2');
          }, function () {
            return VentaInternal.createAnchor("");
          });
        }, 9);
      }, function () {
        return VentaInternal.createAnchor("");
      }, count);
    };
`)
  expect(code).toBe(expectedCode)
})


test('ternary with ??', () => {

  const input = `
    const App = () => {
      const count = useState(0);
      return count.value ?? (count.value > 2 ? 'count greater than 2' : 'count less than 2')
    };
    `;
  const code = normalizeCode(compileCode(input))
  const expectedCode = normalizeCode(`
    "use strict";

    var App = function App() {
      var count = useState(0);
      return VentaInternal.registerConditional(function () {
        return true;
      }, function () {
        return VentaInternal.renderConditional(function () {
          return count.value !== null && count.value !== undefined;
        }, function () {
          return VentaInternal.createStatefulTextNode(count.value, [count]);
        }, function () {
          return VentaInternal.renderConditional(function () {
            return count.value > 2;
          }, function () {
            return VentaInternal.renderTextNode('count greater than 2');
          }, function () {
            return VentaInternal.renderTextNode('count less than 2');
          }, 10);
        }, 11);
      }, function () {
        return VentaInternal.createAnchor("");
      }, count);
    };
  `)
  expect(code).toBe(expectedCode)
})


test("|| render test", () => {
  const input = `
    const App = () => {
      const count = useState(0);
      const count2 = useState(0);
      return  count.value || count2.value || 'no value'
    };
    `;
  const code = normalizeCode(compileCode(input))
  const expectedCode = normalizeCode(`
      "use strict";

      var App = function App() {
        var count = useState(0);
        var count2 = useState(0);
        return VentaInternal.registerConditional(function () {
          return true;
        }, function () {
          return VentaInternal.renderConditional(function () {
            return count.value;
          }, function () {
            return VentaInternal.createStatefulTextNode(count.value, [count]);
          }, function () {
            return VentaInternal.renderConditional(function () {
              return count2.value;
            }, function () {
              return VentaInternal.createStatefulTextNode(count2.value, [count2]);
            }, function () {
              return VentaInternal.renderTextNode('no value');
            }, 12);
          }, 13);
        }, function () {
          return VentaInternal.createAnchor("");
        }, count, count2);
      };
`)
  expect(code).toBe(expectedCode)
})
