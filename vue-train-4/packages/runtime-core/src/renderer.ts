import { ShapeFlags } from "@vue/shared";
import { isSameVNode } from "./vnode";

export function createRenderer(options) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
  } = options;
  const mountChildren = (children, el) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], el);
    }
  };
  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
    }
  };
  const mountElement = (vnode, container) => {
    const { type, props, children, shapeFlag } = vnode;
    // 创建元素
    const el = (vnode.el = hostCreateElement(type));
    // 增添属性
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    // 处理子节点
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);
    } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    }
    hostInsert(el, container);
  };

  const patchProps = (oldProps, newProps, el) => {
    if (oldProps !== newProps) {
      for (let key in newProps) {
        const prev = oldProps[key];
        const next = newProps[key];
        if (prev != next) {
          // 用新的改掉老的
          hostPatchProp(el, key, prev, next);
        }
      }
      for (let key in oldProps) {
        if (!(key in newProps)) {
          // 老的存在的新的没有了
          const prev = oldProps[key];
          hostPatchProp(el, key, prev, null);
        }
      }
    }
  };
  const patchKeyedChildren = (c1, c2, el) => {
    // [] , []
  };
  const patchChildren = (n1, n2, el) => {
    // 比较 两方孩子的差异 更新el中的孩子
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        // 文本内容不相同
        hostSetElementText(el, c2);
      }
    } else {
      // 老儿子是数组, 新的是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // diff算法
          patchKeyedChildren(c1, c2, el);
        } else {
          // 老的是数组  新的不是数组.删除来的
          unmountChildren(c1);
        }
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, "");
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el);
        }
      }
    }
  };
  const patchElement = (n1, n2) => {
    // 比对n1 和 n2的属性差异
    let el = (n2.el = n1.el);
    const oldProps = n1.props || {};

    const newProps = n2.props || {};

    patchProps(oldProps, newProps, el);

    patchChildren(n1, n2, el);
  };

  const processElement = (n1, n2, container) => {
    if (n1 == null) {
      // 初次渲染
      mountElement(n2, container);
    } else {
      // diff算法

      patchElement(n1, n2);
    }
  };
  const patch = (n1, n2, container) => {
    if (n1 == n2) {
      return; // 无需更新
    }
    // n1 div -》 n2 p

    // 如果  n1 n2 都有值 但是类型不同则删除n1 换n2
    if (n1 && !isSameVNode(n1, n2)) {
      unmount(n1); // 删除节点
      n1 = null;
    }
    processElement(n1, n2, container);
    // ...
  };
  const unmount = (vnode) => hostRemove(vnode.el);
  const render = (vnode, container) => {
    if (vnode == null) {
      // 卸载：删除节点

      if (container._vnode) {
        // 说明渲染过了，我才需要进行卸载操作
        unmount(container._vnode);
      }
    } else {
      // 初次渲染  更新

      patch(container._vnode || null, vnode, container);
    }
    container._vnode = vnode; // 第一次渲染保存虚拟节点
  };
  return {
    // createRenderer 可以用户自定义渲染方式
    // createRenderer 返回的render方法 接受参数是虚拟节点和容器
    render,
  };
}
