/*
 * @Descripttion: 
 * @Author: lukasavage
 * @Date: 2022-11-02 21:59:15
 * @LastEditors: lukasavage
 * @LastEditTime: 2022-11-06 22:04:23
 * @FilePath: \vue3.0-study\vue-train-2\packages\reactivity\src\computed.ts
 */
import { isFunction } from "@vue/shared";
import {
  activeEffect,
  ReactiveEffect,
  track,
  trackEffects,
  triggerEffects,
} from "./effect";

const noop = () => {};

class ComputedRefImpl {
  public dep = undefined; // 专门收集计算属性的effect的
  public effect = undefined;
  public __v_isRef = true; // 意味着有这个属性 需要用.value来取值
  public _dirty = true; // true:重新执行 false: 走缓存
  public _value; // 默认的缓存结果
  constructor(getter, public setter) {
    // 这里源码中不能使用 effect(()=>{},{scheduler:()=>{}})
    this.effect = new ReactiveEffect(getter, () => {
      this._dirty = true;
      triggerEffects(this.dep);
    });
  }
  // 类的属性访问器 Object.defineProperty(实例,value,{get})
  get value() {
      // 如果有activeEffect 意味着这个计算属性在effct中使用
      // 需要让计算属性收集这个effect
      // 用户取值发生依赖收集
    if (activeEffect) {
      trackEffects(this.dep || (this.dep = new Set()));
    }
    if (this._dirty) {
      // 取值才执行，并且把取到的值缓存起来
      this._value = this.effect.run();
      this._dirty = false; // 意味着取过了
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
}
export function computed(getterOrOptions) {
  let onlyGetter = isFunction(getterOrOptions);

  let getter;
  let setter;

  if (onlyGetter) {
    getter = getterOrOptions;
    setter = noop;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set || noop; // 如果没有set,默认绑定一个空函数
  }

  // getter=方法必须存在

  return new ComputedRefImpl(getter, setter);
}
