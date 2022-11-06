// 提供多样的api 根据参数来区分

import { isObject } from "@vue/shared";

import { createVNode, isVNode } from "./vnode";
export function h(type, propsOrChildren?, children?) {
  const l = arguments.length;

  // h(type,{})   h(type,h('span')) => h(type,[h('span')])  /    h(type,[])   h(type,'文本')
  if (l == 2) {
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      }
      return createVNode(type, propsOrChildren);
    } else {
      // 数组 或者文本
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2);
      // h('div',{},'a','b','c') 这样操作第二个参数必须是属性 h('div','e','a','b','c')

      // h('div',{},h('span')) => h('div',{},[h('span')])
    } else if (l === 3 && isVNode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
    // l == 3
  }
}
