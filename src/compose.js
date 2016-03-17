/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

export default function compose(...funcs) {
  return (...args) => {
    if (funcs.length === 0) {
      return args[0]
    }

    const last = funcs[funcs.length - 1]
    const rest = funcs.slice(0, -1)

    // @param composed 是上一个函数的返回值, 如果是第一个调用函数, 就是初始化值即last(...args)返回的值
    // 这里@param ...args 其实就是store.dispatch 参考applyMiddleware.js源码 dispatch = compose(...chain)(store.dispatch)
    // 最后返回左边第一个函数的返回值
    return rest.reduceRight((composed, f) => f(composed), last(...args))
  }
}
