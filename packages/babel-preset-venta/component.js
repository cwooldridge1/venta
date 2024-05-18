// babel-plugin-jsx-custom-create-component.js
const syntaxJsx = require('@babel/plugin-syntax-jsx').default;

function isComponent(name) {
  // Consider a name starting with an uppercase letter to be a component
  return name && name[0] === name[0].toUpperCase();
}

module.exports = function({ types: t }) {
  return {
    inherits: syntaxJsx,
    visitor: {
      JSXElement(path) {
        const openingElement = path.node.openingElement;
        const tagName = openingElement.name.name;

        // Check if the tagName starts with an uppercase letter (component)
        const isFunctionalComponent = isComponent(tagName);

        if (!isFunctionalComponent) {
          return;
        }

        // Build the arguments for the `createComponent` call
        const args = [];

        // Add the component name
        args.push(t.identifier(tagName));

        // Prepare attributes (props)
        const props = openingElement.attributes.length
          ? t.objectExpression(
            openingElement.attributes.map((attr) =>
              t.objectProperty(
                t.identifier(attr.name.name),
                t.isJSXExpressionContainer(attr.value)
                  ? attr.value.expression
                  : attr.value
              )
            )
          )
          : t.nullLiteral();

        args.push(props);

        // Add children
        const children = path.node.children.filter(
          (child) => !t.isJSXText(child) || child.value.trim() !== ''
        );

        if (children.length) {
          args.push(
            t.arrayExpression(
              children.map((child) => {
                if (t.isJSXText(child)) {
                  return t.stringLiteral(child.value.trim());
                } else if (t.isJSXExpressionContainer(child)) {
                  return child.expression;
                }
                return child;
              })
            )
          );
        }

        // Create the function call
        const call = t.callExpression(t.identifier('VentaInternal.createComponent'), args);

        // Replace the JSX element with the function call
        path.replaceWith(call);
      },
    },
  };
};
