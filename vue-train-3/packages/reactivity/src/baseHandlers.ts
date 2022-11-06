import { isObject } from "@vue/shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags } from "./reactive";

export const mutableHandlers = {
  get(target, key, receiver) {
    // 用户取值操作
    if (ReactiveFlags.IS_REACTIVE == key) {
      return true;
    }
    track(target, key);
    let r = Reflect.get(target, key, receiver); // 处理了this问题
    if (isObject(r)) {
      // 只有用户取值的时候 才会进行二次代理，不用担心性能
      return reactive(r);
    }
    return r;
  },
  set(target, key, value, receiver) {
    // 用户赋值的操作
    let oldValue = target[key]; // 没有修改之前的值

    // set 方法的返回值是一个boolean
    let r = Reflect.set(target, key, value, receiver);

    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }
    return r;
  },
};
