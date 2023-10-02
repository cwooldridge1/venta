import { normalizeCode, compileCode } from "../../testUtils/helpers";

test('proper render', () => {
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
  console.log(compileCode(code))
})
