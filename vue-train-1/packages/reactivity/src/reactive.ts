/*
 * @Descripttion: 
 * @Author: lukasavage
 * @Date: 2022-11-02 21:59:15
 * @LastEditors: lukasavage
 * @LastEditTime: 2022-11-03 22:33:07
 * @FilePath: \vue3.0-study\vue-train-1\packages\reactivity\src\reactive.ts
 */
import { isObject } from '@vue/shared';
import { mutableHandlers } from './baseHandlers';
export const enum ReactiveFlags {
	IS_REACTIVE = '__v_isReactive',
}
const reactiveMap = new WeakMap(); // key 只能是对象
export function reactive(target) {
	// 判断是否为对象，如果不是对象，直接返回
	if (!isObject(target)) {
		return target;
	}

  /*
    代理对象作为参数再次被代理时，两者应该是 ‘===’的关系，对应情形↓
    const p1 = reactive(obj)
    const p2 = reactive(p1)
    结果应该是 p1 === p2
  */
	if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
	}
  /*
    禁止嵌套，已经是proxy代理对象，就不用再次代理了,对应情形↓
    const p1 = reactive(obj);
    cosnt p2 = reactive(obj)
  */
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
