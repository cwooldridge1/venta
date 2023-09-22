module.exports = function(babel) {
  const { types: t } = babel;
  let conditionalId = 0;
  function wrapInRenderConditional(expression, referencedIdentifiers, statefulVariables) {
    if (t.isConditionalExpression(expression)) {
      const { test, consequent, alternate } = expression;
      babel.traverse(test, {
        noScope: true,
        Identifier(path) {
          if (statefulVariables.has(path.node.name)) {
            referencedIdentifiers.add(t.identifier(path.node.name));
          }
        }
      });
      const newConsequent = wrapInRenderConditional(consequent, referencedIdentifiers, statefulVariables);
      const newAlternate = wrapInRenderConditional(alternate, referencedIdentifiers, statefulVariables);

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
    return expression;
  }

  return {
    name: "transform-jsx-conditional",
    visitor: {
      Function(path) {
        const statefulVariables = new Set();

        path.traverse({
          VariableDeclarator(variablePath) {
            if (
              t.isCallExpression(variablePath.node.init) &&
              (variablePath.node.init.callee.name === 'useState' || variablePath.node.init.callee.name === 'useMemo')
            ) {
              statefulVariables.add(variablePath.node.id.name);
            }
          },
        });

        path.traverse({
          JSXExpressionContainer(path) {
            path.traverse({
              LogicalExpression(innerPath) {
                const { left, right, operator } = innerPath.node;
                if (operator === '||') return
                if (innerPath.findParent((parentPath) => parentPath.isConditionalExpression())) {
                  return;
                }

                let referencesStatefulVariable = false;
                const referencedIdentifiers = new Set();

                innerPath.get('left').traverse({
                  Identifier(testPath) {
                    if (statefulVariables.has(testPath.node.name)) {
                      referencesStatefulVariable = true;
                      referencedIdentifiers.add(t.identifier(testPath.node.name));
                    }
                  },
                });

                if (referencesStatefulVariable) {
                  const testFunc = t.arrowFunctionExpression([], left);
                  //you can still have a ternary afer so we have to have this
                  const newConsequent = wrapInRenderConditional(right, referencedIdentifiers, statefulVariables);
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

                  innerPath.replaceWith(
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
            })
            path.traverse({
              ConditionalExpression(innerPath) {
                const { test, consequent, alternate } = innerPath.node;

                let referencesStatefulVariable = false;
                const referencedIdentifiers = new Set();

                innerPath.get('test').traverse({
                  Identifier(testPath) {
                    if (statefulVariables.has(testPath.node.name)) {
                      referencesStatefulVariable = true;
                      referencedIdentifiers.add(t.identifier(testPath.node.name));
                    }
                  },
                });
                if (referencesStatefulVariable) {
                  const testFunc = t.arrowFunctionExpression([], test);
                  const newConsequent = wrapInRenderConditional(consequent, referencedIdentifiers, statefulVariables);
                  const newAlternate = wrapInRenderConditional(alternate, referencedIdentifiers, statefulVariables);

                  innerPath.replaceWith(
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
              },
            });
          },
        });
      },
    },
  };
};
