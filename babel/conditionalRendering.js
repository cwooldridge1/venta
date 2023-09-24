module.exports = function(babel) {
  const { types: t } = babel;
  let conditionalId = 0;

  const shouldBeTextNode = (type) => {
    const nonTextTypes = [
      'JSXElement',
      'JSXFragment',
      'ConditionalExpression',
      'BinaryExpression',
      'CallExpression',
      'MemberExpression',
      'LogicalExpression',
      'UnaryExpression',
      'ArrowFunctionExpression',
      'FunctionExpression',
      'NewExpression',
      'ThisExpression',
    ];

    return !nonTextTypes.includes(type);
  }
  const createTextNode = (value) => {
    return t.callExpression(
      t.identifier('renderTextNode'),
      [value]
    );
  }

  const getReferenceIdentifiers = (path) => {

    const referencedIdentifiers = new Set();

    path.traverse({
      Identifier(path) {
        // If this Identifier is part of a MemberExpression and it's not the object, skip it
        if (path.parent.type === "MemberExpression" && path.parent.property === path.node) {
          return;
        }
        referencedIdentifiers.add(t.identifier(path.node.name));
      },
    });
    return referencedIdentifiers;
  }


  const wrapInRenderConditional = (expression, referencedIdentifiers) => {
    if (t.isConditionalExpression(expression)) {

      if (shouldBeTextNode(expression.consequent.type)) {
        expression.consequent = createTextNode(expression.consequent)
      };

      if (shouldBeTextNode(expression.consequent.type)) {
        expression.alternate = createTextNode(expression.alternate)
      }

      const { test, consequent, alternate } = expression;

      babel.traverse(test, {
        noScope: true,
        Identifier(path) {
          // Skip if this Identifier is part of a MemberExpression and it's not the object
          if (path.parent.type === "MemberExpression" && path.parent.property === path.node) {
            return;
          }
          referencedIdentifiers.add(t.identifier(path.node.name));
        }
      });

      const newConsequent = wrapInRenderConditional(consequent, referencedIdentifiers);
      const newAlternate = wrapInRenderConditional(alternate, referencedIdentifiers);

      const testFunc = t.arrowFunctionExpression([], test);
      return t.callExpression(
        t.identifier("renderConditional"),
        [
          testFunc,
          t.arrowFunctionExpression([], newConsequent),
          t.arrowFunctionExpression([], newAlternate),
          t.numericLiteral(conditionalId++)
        ],
      );
    }

    if (shouldBeTextNode(expression.type)) {
      expression = createTextNode(expression)
    }
    return expression;
  }

  const isComponentContext = (path) => {
    let functionName = null;
    let parentPath = path.findParent((p) => p.isFunctionDeclaration() || p.isFunctionExpression() || p.isArrowFunctionExpression());

    if (parentPath) {
      if (parentPath.isFunctionDeclaration()) {
        functionName = parentPath.node.id.name;
      } else if (parentPath.isFunctionExpression() && parentPath.parentPath.isVariableDeclarator()) {
        functionName = parentPath.parentPath.node.id.name;
      } else if (parentPath.isArrowFunctionExpression() && parentPath.parentPath.isVariableDeclarator()) {
        functionName = parentPath.parentPath.node.id.name;
      }
    }

    if (!functionName || !/^[A-Z]/.test(functionName)) return false //component must start with capital letter
    return true;
  }


  const registerConditional = (path) => {

    if (shouldBeTextNode(path.node.consequent.type)) {

      path.node.consequent = createTextNode(path.node.consequent)
    }

    if (shouldBeTextNode(path.node.alternate.type)) {
      path.node.alternate = createTextNode(path.node.alternate)
    }

    const { test, consequent, alternate } = path.node;

    const referencedIdentifiers = getReferenceIdentifiers(path.get('test'))

    if (referencedIdentifiers.size) {
      const testFunc = t.arrowFunctionExpression([], test);
      const newConsequent = wrapInRenderConditional(consequent, referencedIdentifiers);
      const newAlternate = wrapInRenderConditional(alternate, referencedIdentifiers);

      path.replaceWith(
        t.callExpression(
          t.identifier("registerConditional"),
          [
            testFunc,
            t.arrowFunctionExpression([], newConsequent),
            t.arrowFunctionExpression([], newAlternate),
            ...Array.from(referencedIdentifiers)
          ],
        )
      );
    }
  }

  const registerLogicalExpression = (path) => {
    if (shouldBeTextNode(path.node.right.type)) {
      path.node.right = createTextNode(path.node.right)
    }
    const { left, right, operator } = path.node;
    if (operator === '||') return
    if (path.findParent((parentPath) => parentPath.isConditionalExpression())) {
      return;
    }
    const referencedIdentifiers = getReferenceIdentifiers(path.get('left'));

    if (referencedIdentifiers.size) {
      const testFunc = t.arrowFunctionExpression([], left);
      //you can still have a ternary afer so we have to have this
      const newConsequent = wrapInRenderConditional(right, referencedIdentifiers);
      //false case we just add a empty text node as we need an anchor still but this does not have any dom effect and it not even visible
      const newAlternate = t.arrowFunctionExpression(
        [],
        t.blockStatement([
          t.returnStatement(
            t.callExpression(
              t.memberExpression(
                t.identifier('document'),
                t.identifier('createTextNode')
              ),
              [
                t.stringLiteral('') // The text content for the text node
              ]
            )
          )
        ])
      );

      path.replaceWith(
        t.callExpression(
          t.identifier("registerConditional"),
          [
            testFunc,
            t.arrowFunctionExpression([], newConsequent),
            newAlternate,
            ...Array.from(referencedIdentifiers)
          ],
        )
      );
    }
  }
  const isJSXContext = (path) => path.findParent((parentPath) => parentPath.isJSXElement())

  return {
    name: "transform-jsx-conditional",
    visitor: {
      Function(path) {
        path.traverse({
          ReturnStatement(path) {
            const returnValue = path.node.argument;
            if (!isComponentContext(path)) return
            if (returnValue && shouldBeTextNode(returnValue.type)) {
              path.node.argument = t.callExpression(
                t.identifier('renderTextNode'),
                [returnValue]
              );
            } else {
              path.traverse({
                ConditionalExpression(innerPath) {
                  if (isJSXContext(innerPath) || !isComponentContext(path)) return;
                  registerConditional(innerPath)
                },
                LogicalExpression(innerPath) {
                  if (isJSXContext(innerPath) || !isComponentContext(path)) return;
                  registerLogicalExpression(innerPath)
                }
              })
            }
          },
          JSXExpressionContainer(path) {
            path.traverse({
              LogicalExpression(innerPath) {
                registerLogicalExpression(innerPath)

              }
            })
            path.traverse({
              ConditionalExpression(innerPath) {
                registerConditional(innerPath)
              },
            });
          },
        });
      },
    },
  };
};
