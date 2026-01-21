/**
 * @fileoverview Require logger.error or console.error in every catch block
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require logger.error or console.error in every catch block',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      missingLogger: 'Missing logger.error or console.error in catch block.',
    },
  },
  create(context) {
    return {
      CatchClause(node) {
        let hasLogger = false
        context
          .getSourceCode()
          .getTokens(node.body)
          .forEach((token) => {
            if (
              token.type === 'Identifier' &&
              (token.value === 'logger' || token.value === 'this' || token.value === 'console')
            ) {
              const next = context.getSourceCode().getTokenAfter(token)
              if (
                next &&
                next.value === '.' &&
                context.getSourceCode().getTokenAfter(next).value === 'error'
              ) {
                hasLogger = true
              }
            }
          })
        if (!hasLogger) {
          context.report({
            node,
            messageId: 'missingLogger',
          })
        }
      },
    }
  },
}
