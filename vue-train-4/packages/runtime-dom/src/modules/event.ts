function createInvoker(initialValue) {
  const invoker = (e) => invoker.value(e);
  invoker.value = initialValue; // 后续更新的时候 只需要更新invoker的value属性
  return invoker;
}
// 函数 更新 成新的函数了 直接更改.value即可
export function patchEvent(el, key, nextValue) {
  // vue event invoker
  const invokers = el._vei || (el._vei = {});
  // 如果nextValue 为空，而且有绑定过事件，要移除
  //click
  const name = key.slice(2).toLowerCase();
  const exisitingInvoker = invokers[name];
  if (nextValue && exisitingInvoker) {
    // 更新事件
    exisitingInvoker.value = nextValue;
  } else {
    if (nextValue) {
      // 缓存创建的invoker
      const invoker = (invokers[name] = createInvoker(nextValue));
      el.addEventListener(name, invoker);
    } else if (exisitingInvoker) {
      el.removeEventListener(name, exisitingInvoker);
      invokers[name] = null;
    }
  }
}
