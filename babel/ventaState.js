module.exports = function(babel) {
  const { types: t } = babel;

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
            let parentJSX = path.findParent((path) => t.isJSXElement(path.node));

            let parentRef = t.nullLiteral();
            if (parentJSX) {
              const uniqueID = path.scope.generateUidIdentifier("parent");
              parentJSX.node.openingElement.attributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier('ventanodeid'),
                  t.stringLiteral(uniqueID.name)
                )
              );
              parentRef = t.stringLiteral(uniqueID.name);
            }

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
                  innerPath.replaceWith(
                    t.callExpression(
                      t.identifier("renderConditional"),
                      [testFunc, consequent, alternate, parentRef, ...Array.from(referencedIdentifiers)]
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




// VariableDeclarator(path) {
//   if (
//     path.node.init &&
//     t.isCallExpression(path.node.init) &&
//     t.isIdentifier(path.node.init.callee) &&
//     (path.node.init.callee.name === "useState" || path.node.init.callee.name === "useMemo")
//   ) {
//     id++;
//     const stateVariable = path.node.id.name;
//     const binding = path.scope.getBinding(stateVariable);
//
//
//     binding.path.traverse({
//       JSXExpressionContainer(path) {
//         path.traverse({
//           ConditionalExpression(innerPath) {
//             console.log(1)
//             if (!hasReferenceToBinding(innerPath, binding)) return;
//
//             const { test, consequent, alternate } = innerPath.node;
//
//             const testFunc = t.arrowFunctionExpression([], test);
//
//             innerPath.replaceWith(
//               t.callExpression(
//                 t.identifier("renderConditional"),
//                 [testFunc, consequent, alternate, t.numericLiteral(id)]
//               )
//             );
//           },
//         });
//       },
//     })
//
//   }
// },
