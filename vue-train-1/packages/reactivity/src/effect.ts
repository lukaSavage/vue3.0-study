/*
 * @Descripttion: 
 * @Author: lukasavage
 * @Date: 2022-11-02 21:59:15
 * @LastEditors: lukasavage
 * @LastEditTime: 2022-11-03 23:46:27
 * @FilePath: \vue3.0-study\vue-train-1\packages\reactivity\src\effect.ts
 */
export let activeEffect;

class ReactiveEffect {
  public active = true; // 是否是激活的，用于判断当前effect是否要依赖收集
  public deps = []; // 用于收集响应式的数据
  public parent = undefined; // 用于记录上一层effect函数(最顶层为null)
  constructor(public fn) {}
  run() {
    // 如果是失活状态，只执行一次，后面什么也不做
    if (!this.active) {
      return this.fn(); // 直接执行此函数即可
    }
    // 其它情况下 意味着是激活的状态
    try {
      /*
        第一次执行的时候，parent=undefined,此时activeEffect = 当前第一个effect,即e1
        碰到第二个effect的时候，parent= e1,此时activeEffect指向第二个effect,即e2
        第二个effect结束后，执行finally作用域下的代码，此时activeEffect = e1, 而此时parent也指向undefined了(相当于e2执行完后，又回到了e1作用域)
      */
      this.parent = activeEffect;
      activeEffect = this;
      return this.fn(); // 会取响应式的属性
    } finally {
      // 无论任何情况都会执行的
      activeEffect = this.parent;
      this.parent = undefined;
    }
  }
}
// 依赖收集 就是将当前的effect变成全局的  稍后取值的时候可以拿到这个全局的effect
export function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run(); // 默认让响应式的effect执行一次
}


/*
  track函数需要维护的映射对象如下↓
  (由于target是对象，因此使用weakMap做弱引用，防止重复)
  同时一个target可能对应多个effect,如
  effect(()=>{
    console.log(this.name)
  })
  effect(()=>{
    console.log(this.name)
  })
*/
// let mapping = {
//   target: {
//     name: [activeEffect1,activeEffect2,activeEffect3],
//   },
// };

const targetMap = new WeakMap();
export function track(target, key) {
  if (!activeEffect) {
    // 取值操作没有发生在effect中
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    // weakMap中的key 只能是对象
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  let shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep); // 后续需要通过effect来清理的时候可以去使用

    // 一个属性对应多个effect， 一个effect对应着多个属性
    // 属性 和 effect的关系是多对多的关系
  }
}

// let activeEffect = e2
// effect(() => { // e1  e1.parent = null
//   name; // e1
//   effect(() => { //e2  e2.parent = e1
//     age;  //e2
//   }); // activeEffect = e2.parent
//   address; // e1
// });
