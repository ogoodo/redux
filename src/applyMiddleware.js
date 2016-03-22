import compose from './compose'

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
// 要确认下, 这个函数能不能多次调用(现在想法是不能)        重要重要重要
// 中间件其实是包括3次柯里华的高级函数
// 最终中间件是从左往右执行
export default function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, initialState, enhancer) => {
    var store = createStore(reducer, initialState, enhancer)
    var dispatch = store.dispatch
    var chain = []

    var middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    }

    // 第一次调用中间件初始化, 使得传入的中间件每个都调用下
    // middleware(middlewareAPI) 这句是调用中间件函数(高阶函数)初始化
    // 中间件函数会定义像下面这样子的
    // export default function thunkMiddleware({ dispatch, getState }) { return next => action => {console.log(' ')}}
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    // 第二次调用中间件， 传入(绑定)中间件递归调用的next参数(闭包参数), 给最终函数做递归调用(能现实中间件one by one的调用， 通过next(action)这样子调用)
    // compose创建一个包括一组异步函数的函数集合，每个函数会消费上一次函数的返回值， 执行顺序是从右边函数往左执行
    // 返回的dispatch是个函数, 如果调用dispatch()， 就会从数组的左边向右边执行每个中间件最终的函数(即最底层带action参数的那个函数)
    // 假设中间件数组(...chain)是[fn1, fn2, fn3]
    // 那么结果就是dispatch=fn1(fn2(fn3(store.dispatch)))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
