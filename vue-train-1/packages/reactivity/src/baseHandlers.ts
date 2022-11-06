/*
 * @Descripttion: 
 * @Author: lukasavage
 * @Date: 2022-11-02 21:59:15
 * @LastEditors: lukasavage
 * @LastEditTime: 2022-11-02 23:38:55
 * @FilePath: \vue3.0-study\vue-train-1\packages\reactivity\src\baseHandlers.ts
 */
import { activeEffect, track } from "./effect";
import { ReactiveFlags } from "./reactive";

export const mutableHandlers = {
  get(target, key, receiver) {
    // 用户取值操作
    if (ReactiveFlags.IS_REACTIVE == key) {
      return true;
    }
    track(target, key);
    return Reflect.get(target, key, receiver); // Reflect的主要作用是处理了this的指向问题
  },
  set(target, key, value, receiver) {
    // 用户赋值的操作
    return Reflect.set(target, key, value, receiver);
  },
};
