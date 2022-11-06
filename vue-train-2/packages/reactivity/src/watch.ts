import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";

function traverse(source, s = new Set()) {
  if (!isObject(source)) {
    return source;
  }
  if (s.has(source)) {
    return source;
  }
  s.add(source);
  // 考虑循环引用的问题，采用set 来解决此问题
  for (let key in source) {
    traverse(source[key], s); // 递归取值
  }
  return source;
}
export function watch(source, cb, { immediate } = {} as any) {
  let getter;
  if (isReactive(source)) {
    // 最终都处理成函数
    getter = () => traverse(source); // 直接稍后调用run的时候 会执行此函数，直接返回对象 ，只有访问属性才能依赖收集
  } else if (isFunction(source)) {
    getter = source;
  }
  let oldValue;
  const job = () => {
    // 内部要调用 cb 也就是watch的回调方法
    let newValue = effect.run(); // 再次调用effect 拿到新值
    cb(newValue, oldValue); // 调用回调传入新和老的
    oldValue = newValue; // 更新
  };
  const effect = new ReactiveEffect(getter, job);
  if (immediate) {
    // 默认执行一次
    return job();
  }
  oldValue = effect.run(); // 保留老值
}
