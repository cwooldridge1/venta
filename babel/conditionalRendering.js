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
      t.identifier('VentaInternal.renderTextNode'),
      [value]
    );
  }

  const createFineTunedResponsiveNode = (root, accessPaths) => {
    const accessPathNodes = accessPaths.map(path => t.stringLiteral(path));
    return t.callExpression(
      t.identifier('VentaInternal.renderFineTunedResponsiveNode'),
      [root, t.arrayExpression(accessPathNodes)]
    );
  }


  function getRootAndAccessPaths(node) {
    let current = node;
    let accessPaths = [];

    // Traverse up the MemberExpression chain
    while (current.type === "MemberExpression") {
      // Handle both dot and bracket notation
      const key = current.property.type === "Identifier" ? current.property.name : current.property.value;
      accessPaths.unshift(key); // Prepend to maintain correct order
      current = current.object;
    }
    return {
      root: t.identifier(current.name),
      accessPaths
    };
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
        t.identifier("VentaInternal.renderConditional"),
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
          t.identifier("VentaInternal.registerConditional"),
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

  const createLogicalAndExpression = (node) => {
    if (shouldBeTextNode(node.right.type)) {
      node.right = createTextNode(node.right)
    }

    const { left, right } = node;

    // Perform the traversal
    let referencedIdentifiers = new Set();

    const testFunc = t.arrowFunctionExpression([], left)

    const alternate = t.arrowFunctionExpression(
      [],
      t.blockStatement([
        t.returnStatement(
          t.callExpression(
            t.identifier('VentaInternal.createAnchor'),
            [
              t.stringLiteral('') // The text content for the text node
            ]
          )
        )
      ])
    );


    const consequent = t.arrowFunctionExpression([],
      wrapInRenderConditional(right, referencedIdentifiers));

    return t.callExpression(
      t.identifier("VentaInternal.renderConditional"),
      [
        testFunc,
        consequent,
        alternate,
        ...Array.from(referencedIdentifiers)
      ],
    )
  }


  const createNullishCoalescingFunction = (variables) => {
    if (variables.length === 1) {
      if ((t.isLogicalExpression(variables[0]) && variables[0].operator === '&&')) {
        return createLogicalAndExpression(variables[0])
      }
      if (t.isConditionalExpression(variables[0])) {
        return wrapInRenderConditional(variables[0], new Set())
      }
      if (shouldBeTextNode(variables[0].type)) {
        const { root, accessPaths } = getRootAndAccessPaths(variables[0]);

        return createFineTunedResponsiveNode(root, accessPaths)
      }
      return variables[0]
    }

    const left = variables.splice(0, 1)[0];

    const testFunc =
      t.arrowFunctionExpression([], t.logicalExpression('&&',
        t.binaryExpression('!==', left, t.nullLiteral()),
        t.binaryExpression('!==', left, t.identifier('undefined'))
      ));

    let leftFunc = left;
    if (shouldBeTextNode(left.type)) {
      const { root, accessPaths } = getRootAndAccessPaths(left);

      leftFunc = createFineTunedResponsiveNode(root, accessPaths)
    }
    else if ((t.isLogicalExpression(variables[0]) && variables[0].operator === '&&')) {
      leftFunc = createLogicalAndExpression(variables[0])
    }
    else if (t.isConditionalExpression(variables[0])) {
      leftFunc = wrapInRenderConditional(variables[0], new Set())
    }

    return t.callExpression(
      t.identifier("VentaInternal.renderConditional"),
      [
        testFunc,
        t.arrowFunctionExpression([], leftFunc),
        t.arrowFunctionExpression([], createNullishCoalescingFunction(variables)),
        t.numericLiteral(conditionalId++)
      ],
    );
  }


  const createOrFunction = (variables) => {
    if (variables.length === 1) {
      if ((t.isLogicalExpression(variables[0]) && variables[0].operator === '&&')) {
        return createLogicalAndExpression(variables[0])
      }
      if (t.isConditionalExpression(variables[0])) {
        return wrapInRenderConditional(variables[0], new Set())
      }
      if (shouldBeTextNode(variables[0].type)) {
        const { root, accessPaths } = getRootAndAccessPaths(variables[0]);

        return createFineTunedResponsiveNode(root, accessPaths)
      }
      return variables[0]
    }

    const left = variables.splice(0, 1)[0];

    const testFunc = t.arrowFunctionExpression([], left);

    let leftFunc = left;
    if (shouldBeTextNode(left.type)) {
      const { root, accessPaths } = getRootAndAccessPaths(left);

      leftFunc = createFineTunedResponsiveNode(root, accessPaths)
    }
    else if ((t.isLogicalExpression(variables[0]) && variables[0].operator === '&&')) {
      leftFunc = createLogicalAndExpression(variables[0])
    }
    else if (t.isConditionalExpression(variables[0])) {
      leftFunc = wrapInRenderConditional(variables[0], new Set())
    }

    return t.callExpression(
      t.identifier("VentaInternal.renderConditional"),
      [
        testFunc,
        t.arrowFunctionExpression([], leftFunc),
        t.arrowFunctionExpression([], createOrFunction(variables)),
        t.numericLiteral(conditionalId++)
      ],
    );
  }


  function getVariablesFromLogicalExpression(expression, variables) {
    if (t.isLogicalExpression(expression)) {
      getVariablesFromLogicalExpression(expression.left, variables);
      getVariablesFromLogicalExpression(expression.right, variables)
    } else {
      variables.push(expression);
    }
    return variables;
  }


  const registerLogicalExpression = (path) => {
    if (shouldBeTextNode(path.node.right.type)) {
      path.node.right = createTextNode(path.node.right)
    }
    const { left, operator, right } = path.node;

    let referencedIdentifiers = getReferenceIdentifiers(path.get('left'));
    let newConsequent = null;

    let newAlternate = t.arrowFunctionExpression(
      [],
      t.blockStatement([
        t.returnStatement(
          t.callExpression(
            t.identifier('VentaInternal.createAnchor'),
            [
              t.stringLiteral('') // The text content for the text node
            ]
          )
        )
      ])
    );

    if (path.findParent((parentPath) => parentPath.isConditionalExpression())) {
      return;
    }

    if (operator === '||') {
      const variables = [];
      getVariablesFromLogicalExpression(left, variables);
      variables.push(right);

      newConsequent = t.arrowFunctionExpression([], createOrFunction(variables))
    }
    else if (operator === '??') {
      const variables = [];
      getVariablesFromLogicalExpression(left, variables);
      variables.push(right);

      newConsequent = t.arrowFunctionExpression([], createNullishCoalescingFunction(variables))
    }
    else {
      newConsequent = t.arrowFunctionExpression([],
        wrapInRenderConditional(right, referencedIdentifiers));
    }


    if (referencedIdentifiers.size) {
      const testFunc = operator === '&&' ?
        t.arrowFunctionExpression([], left) :
        t.arrowFunctionExpression([], t.booleanLiteral(true))


      //you can still have a ternary afer so we have to have this
      //false case we just add a empty text node as we need an anchor still but this does not have any dom effect and it not even visible

      path.replaceWith(
        t.callExpression(
          t.identifier("VentaInternal.registerConditional"),
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
        t.identifier("VentaInternal.renderLoop"),
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
                t.identifier('VentaInternal.createAnchor'),
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
