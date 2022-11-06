import { isString, ShapeFlags } from "@vue/shared";

// children 数组 字符串 空

export function isVNode(vnode) {
  return vnode.__v_isVnode == true;
}

export function isSameVNode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
export function createVNode(type, props = null, children = null) {
  // 组件
  // 元素
  // 文本
  // 自定义的keep-alive..
  // 用标识来区分 对应的虚拟节点类型 ， 这个表示采用的是位运算的方式 可以方便组合
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
  // 虚拟节点要对应真实节点
  const vnode = {
    __v_isVnode: true, // 添加标识是不是vnode
    type,
    props,
    children,
    shapeFlag,
    key: props?.key,
    el: null, // 对应的真实节点
  };
  if (children) {
    let type = 0;
    if (Array.isArray(children)) {
      // [vnode，'文本']
      type = ShapeFlags.ARRAY_CHILDREN;
    } else {
      // 文本
      type = ShapeFlags.TEXT_CHILDREN;
    }
    vnode.shapeFlag |= type; // a+b     a|b = c        c&b > 0 有b     c&b == 0 没有b
  }
  return vnode; // 根据  vnode.shapeFlag  来判断自己的类型和孩子的类型
}
