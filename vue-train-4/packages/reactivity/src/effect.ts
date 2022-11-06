import { recordEffectScope } from "./effectScope";

export let activeEffect;

// 每次执行依赖收集前，先做清理操作
function cleanupEffect(effect) {
  // 每次执行effect之前 我们应该清理掉effect中依赖的所有属性
  let { deps } = effect;
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect); // 属性记录了effect  {key:new set()}
  }
  effect.deps.length = 0; // 清理对应的数组的
}
export class ReactiveEffect {
  public active = true;
  public deps = [];
  public parent = undefined;
  constructor(public fn, private scheduler) {
    recordEffectScope(this);
  }
  run() {
    if (!this.active) {
      return this.fn(); //失活了就不在进行依赖收集了
    }
    try {
      this.parent = activeEffect;
      activeEffect = this;
      cleanupEffect(this);
      return this.fn(); // 这个地方做了依赖收集
    } finally {
      activeEffect = this.parent;
      this.parent = undefined;
    }
  }
  stop() {
    if (this.active) {
      cleanupEffect(this); // 先将effect的依赖全部删除掉
      this.active = false; // 在将其变成失活态
    }
  }
}
// 依赖收集 就是将当前的effect变成全局的  稍后取值的时候可以拿到这个全局的effect
export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run(); // 默认让响应式的effect执行一次

  const runner = _effect.run.bind(_effect); // 保证_effect执行的时候this是当前的effect
  runner.effect = _effect;
  return runner;
}

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
  // let shouldTrack = !dep.has(activeEffect);
  // if (shouldTrack) {
  //   dep.add(activeEffect);
  //   activeEffect.deps.push(dep); // 后续需要通过effect来清理的时候可以去使用

  //   // 一个属性对应多个effect， 一个effect对应着多个属性
  //   // 属性 和 effect的关系是多对多的关系
  // }
  trackEffects(dep);
}

export function trackEffects(dep) {
  let shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep); // 后续需要通过effect来清理的时候可以去使用
    // 一个属性对应多个effect， 一个effect对应着多个属性
    // 属性 和 effect的关系是多对多的关系
  }
}
// 触发更新
export function trigger(target, key, newValue, oldValue) {
  // weakMap {obj: map{key: set(effect)}}
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const dep = depsMap.get(key);
  triggerEffects(dep);
}
export function triggerEffects(dep) {
  if (dep) {
    const effects = [...dep];
    effects.forEach((effect) => {
      // 当我重新执行此effect时，会将当前的effect放到全局上 activeEffect
      if (activeEffect != effect) {
        if (!effect.scheduler) {
          effect.run(); // 每次调用run 都会重新依赖收集
        } else {
          effect.scheduler();
        }
      }
    });
  }
}

// 默认执行了一个[]，在当前的set中清空了某一个effect，又像此set中添加了一项
