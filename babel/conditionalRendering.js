module.exports = function(babel) {
  const { types: t } = babel;
  let conditionalId = 0;
  const visited = new Set();

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
      t.identifier('Venta.renderTextNode'),
      [value]
    );
  }


  const dropDuplicateIdentifiers = (identifiers) => {
    const nonDupes = Array.from(identifiers).filter((item, index, self) => item.name !== 'undefined' && self.findIndex(t => t.name === item.name) === index)
    return new Set(nonDupes);
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
    // this is actually needed because the of how babel references these identifiers
    return dropDuplicateIdentifiers(referencedIdentifiers)
  }

  function getReferenceIdentifiersFromNode(node, identifiers) {
    if (t.isIdentifier(node)) {
      identifiers.push(t.identifier(node.name));
    }
    else if (t.isMemberExpression(node)) {
      getReferenceIdentifiersFromNode(node.object, identifiers);
    } else if (t.isLogicalExpression(node)) {
      getReferenceIdentifiersFromNode(node.left, identifiers);
      getReferenceIdentifiersFromNode(node.right, identifiers);
    } else if (t.isCallExpression(node)) {
      node.arguments.forEach(arg => getReferenceIdentifiersFromNode(arg, identifiers));
    }
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
        t.identifier("Venta.renderConditional"),
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
    /* 
     * TODO / NOTE
     * For some reason VentaMemoState is being defined as a component, for some reason the compiled code it being ran through
     * in which case the es6 syntax has a return statement in the constructor and it ends up wrapping the return statement of 'this'
     * in a renderTextNode. I have spent too much time trying to fix this so I am just adding this patch for now and will come back later
     * */
    if (functionName === 'VentaMemoState') {
      return false
    }
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
          t.identifier("Venta.registerConditional"),
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


  const getNullishCoalescing = (path) => {
    //basically to make this easy we just want to find the last nullish coalescing operator and put put it all in a function
    if (path.node.type === "LogicalExpression" && path.node.operator === '??') {

      // Collect all parts of ?? expressions
      let parts = [];
      let current = path.node;


      const identifiers = [];
      while (t.isLogicalExpression(current) && current.operator === '??') {
        getReferenceIdentifiersFromNode(current.right, identifiers);
        getReferenceIdentifiersFromNode(current.left, identifiers);
        parts.push(current.right);
        current = current.left;
      }
      parts.push(current); // Push the last left-most expression
      parts.reverse(); // Reverse to maintain original order





      //now we have to make a new express that ?? all of the indentifiers
      function nullishCoalescingNodes(nodes) {
        if (nodes.length === 0) {
          return t.identifier('undefined');
        }

        if (nodes.length === 1) {
          return nodes[0];
        }

        const [first, ...rest] = nodes;
        if (t.isNode(first)) {
          return t.logicalExpression('??', first, nullishCoalescingNodes(rest));
        } else {
          return nullishCoalescingNodes(rest);
        }
      }
      const chain = nullishCoalescingNodes(parts)


      const funcExpression = t.arrowFunctionExpression(
        [],
        t.blockStatement([
          t.returnStatement(
            chain
          )
        ])
      );


      const identifierNodes = dropDuplicateIdentifiers(identifiers);

      return { funcExpression, identifierNodes };
    }
    return { funcExpression: () => { }, identifierNodes: [] };
  }



  const registerLogicalExpression = (path) => {
    if (shouldBeTextNode(path.node.right.type)) {
      path.node.right = createTextNode(path.node.right)
    }

    let currentPath = path;
    while (currentPath.node.right.type === 'LogicalExpression' && currentPath.node.right.operator !== '??') {
      currentPath = currentPath.get('right');
    }

    const { left, operator, right } = currentPath.node;


    let referencedIdentifiers = getReferenceIdentifiers(currentPath.get('left'));
    let newConsequent = null;

    if (operator === '||') return
    if (currentPath.findParent((parentPath) => parentPath.isConditionalExpression())) {
      return;
    }
    if (operator === '??') {
      const { funcExpression, identifierNodes } = getNullishCoalescing(currentPath);
      referencedIdentifiers = dropDuplicateIdentifiers([...referencedIdentifiers, ...identifierNodes]);
      newConsequent = funcExpression;
    }
    else {
      newConsequent = t.arrowFunctionExpression([],
        wrapInRenderConditional(right, referencedIdentifiers));
    }


    if (referencedIdentifiers.size) {
      const testFunc = operator !== '??' ?
        t.arrowFunctionExpression([], left) :
        t.arrowFunctionExpression([],
          t.booleanLiteral(true)
        );


      //you can still have a ternary afer so we have to have this
      //false case we just add a empty text node as we need an anchor still but this does not have any dom effect and it not even visible
      const newAlternate = t.arrowFunctionExpression(
        [],
        t.blockStatement([
          t.returnStatement(
            t.callExpression(
              t.identifier('Venta.createAnchor'),
              [
                t.stringLiteral('') // The text content for the text node
              ]
            )
          )
        ])
      );

      path.replaceWith(
        t.callExpression(
          t.identifier("Venta.registerConditional"),
          [
            testFunc,
            newConsequent,
            newAlternate,
            ...Array.from(referencedIdentifiers)
          ],
        )
      );
    }
    path.skip();
  }
  const isJSXContext = (path) => path.findParent((parentPath) => parentPath.isJSXElement())

  const getRootObject = (node) => {
    if (node.type === 'MemberExpression') {
      return getRootObject(node.object);
    }
    return node;
  }

  const handleCallExpression = (innerPath) => {
    const callee = innerPath.get('callee');
    if (callee.getData('processed')) return
    if (
      callee &&
      t.isMemberExpression(callee.node) &&
      t.isIdentifier(callee.node.property) &&
      callee.node.property.name === 'map'
    ) {
      handleMap(innerPath)
      callee.setData('processed', true);  // Mark as processed
    }
  }


  const handleMap = (path) => {
    const identifiers = new Set();
    const identifierNames = new Set();
    const ignoreList = new Set();
    let stop = false;


    const arrowFunc = path.get('arguments.0');
    if (arrowFunc.isArrowFunctionExpression() || arrowFunc.isFunctionExpression()) {
      const params = arrowFunc.get('params').map(paramPath => paramPath.node.name);
      params.forEach(param => {
        ignoreList.add(param)
      })
    }


    path.get('arguments.0').traverse({
      JSXExpressionContainer(innerPath) {
        innerPath.traverse({
          CallExpression(path) {
            //essentially if there is a nested map then we need to stop as dependencies should only be top level
            const callee = path.get('callee');
            if (
              callee &&
              t.isMemberExpression(callee.node) &&
              t.isIdentifier(callee.node.property) &&
              callee.node.property.name === 'map'
            ) {
              stop = true; //kinda janky but could not find better way
            }
          },
          Identifier(path) {
            if (stop) return
            const parentType = path.parent.type;

            // If this Identifier is part of a MemberExpression and it's not the object, skip it
            if (path.parent.type === "MemberExpression" && path.parent.property === path.node) {
              return;
            }
            if (parentType === "JSXAttribute" || parentType === "JSXElement" || parentType === "JSXExpressionContainer" || parentType === "MemberExpression") {
              const identifier = t.identifier(path.node.name);
              if (ignoreList.has(path.node.name) || identifierNames.has(path.node.name)) return
              identifiers.add(identifier);
              identifierNames.add(path.node.name)
            }
          }
        })
      }
    })
    path.replaceWith(
      t.callExpression(
        t.identifier("Venta.renderLoop"),
        [
          t.arrowFunctionExpression(
            [],
            path.node,
          ),
          getRootObject(path.get('callee').node.object),
          ...Array.from(identifiers)
        ],
      )
    );
  }

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
                t.identifier('Venta.createAnchor'),
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
                },
                CallExpression(innerPath) {
                  if (isJSXContext(innerPath)) return
                  handleCallExpression(innerPath)
                },
              })
            }
          },
          JSXExpressionContainer(path) {
            path.traverse({
              CallExpression(innerPath) {
                handleCallExpression(innerPath)
              },
            })
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
