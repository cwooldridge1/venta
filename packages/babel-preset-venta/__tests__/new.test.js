import { test, expect } from 'vitest'
const { normalizeCode, compileCode } = require("../testUtils/helpers");

test("component with statful text node", () => {
  const input = `
    const App = () => {
      const count = useState(0);
      const id = 'yo';
      const arr = new VentaArrayState([1, 2, 3]);

      return (
        <Card>
          {count.value}
          {count.state.value}
          {count.value >= 1 ? <Card>greater than 1</Card> : <Card>less than 1</Card>}
          <p className='yo'>hello</p>
          <p id={id.value}>hello
            <span>world</span>
            <span className='yes'>world</span>
            <span id='1' className={id.value}>world</span>
          </p>
        {arr.value().map((item) => {
          return (
<div>
  <p>{item}</p>
  <p>{item.value}</p>
</div>
)
        })}
        </Card>
      );
    };
    `;
  console.log(compileCode(input));
  const code = normalizeCode(compileCode(input))
  const expectedCode = normalizeCode(
    `
"use strict";

var App = function App() {
  var count = useState(0);
  var id = 'yo';
  return VentaInternal.createComponent(Card, null, [VentaInternal.createStatefulTextNode(count.value, [count]), VentaInternal.createStatefulTextNode(count.state.value, [count, count.state]), VentaInternal.registerConditional(function () {
    return count.value >= 1;
  }, function () {
    return VentaInternal.createComponent(Card, null, ["greater than 1"]);
  }, function () {
    return VentaInternal.createComponent(Card, null, ["less than 1"]);
  }, count), VentaInternal.createElement("p", {
    "class": "yo"
  }, "hello"), VentaInternal.createStatefulElement("p", {}, {
    "id": [id]
  }, "hello", VentaInternal.createElement("span", null, "world"), VentaInternal.createElement("span", {
    "class": "yes"
  }, "world"), VentaInternal.createStatefulElement("span", {}, {
    "class": [id]
  }, "world"))]);
};
`)
  expect(code).toBe(expectedCode)
});
