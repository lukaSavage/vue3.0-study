import { isObject } from "@vue/shared";
import { mutableHandlers } from "./baseHandlers";
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

export function isReactive(target) {
  return !!(target && target[ReactiveFlags.IS_REACTIVE]);
}
const reactiveMap = new WeakMap(); // key 只能是对象
export function reactive(target) {
  // 不对非对象的类型来进行处理
  if (!isObject(target)) {
    return target;
  }
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }
  const exisitsProxy = reactiveMap.get(target);
  if (exisitsProxy) {
    return exisitsProxy;
  }
  // 代理 ，我通过代理对象操作属性，你会去源对象上进行获取
  const proxy = new Proxy(target, mutableHandlers);
  // 缓存一下 代理过的对象，下次再进行代理的时候直接拿出来用即可
  // target -> proxy
  reactiveMap.set(target, proxy);
  return proxy;
}
