// babel-plugin-transform-jsx-event-handlers.js
const syntaxJsx = require('@babel/plugin-syntax-jsx').default;

module.exports = function({ types: t }) {
  return {
    inherits: syntaxJsx,
    visitor: {
      JSXAttribute(path) {
        let attributeName;
        try {
          attributeName = path.node.name.name;
        } catch (e) {
          return
        }
        if (attributeName === 'className') {
          path.node.name.name = 'class';
          return
        }

        // Process only attributes that start with "on"
        if (attributeName.startsWith('on')) {
          let eventName = attributeName.substring(2).toLowerCase();

          // Special case: Rename "onChange" to "onInput"
          if (attributeName === 'onChange') {
            eventName = 'onInput';
          }

          // Replace with `addEventListener`
          const parentElement = path.parentPath.parent.openingElement.name;
          const attributeValue = path.node.value;

          const listenerStatement = t.expressionStatement(
            t.callExpression(
              t.memberExpression(
                t.identifier(parentElement.name),
                t.identifier('addEventListener')
              ),
              [
                t.stringLiteral(eventName),
                t.isJSXExpressionContainer(attributeValue)
                  ? attributeValue.expression
                  : attributeValue,
              ]
            )
          );

          path.replaceWith(listenerStatement);
        }
      },
    },
  };
};
