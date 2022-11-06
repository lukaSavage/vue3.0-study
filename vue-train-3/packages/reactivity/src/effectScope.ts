export let activeEffectScope;
class EffectScope {
  active = true;
  effects = []; // 这个是收集内部的effect
  parent;
  scopes; // 这个是收集作用域的
  constructor(detached = false) {
    if (!detached && activeEffectScope) {
      activeEffectScope.scopes || (activeEffectScope.scopes = []).push(this);
    }
  }
  run(fn) {
    if (this.active) {
      try {
        this.parent = activeEffectScope;
        activeEffectScope = this;
        return fn();
      } finally {
        // 清空了
        activeEffectScope = this.parent;
        this.parent = null;
      }
    }
  }
  stop() {
    if (this.active) {
      for (let i = 0; i < this.effects.length; i++) {
        this.effects[i].stop(); // 让每一个存储的effect全部终止
      }
    }
    if (this.scopes) {
      for (let i = 0; i < this.scopes.length; i++) {
        this.scopes[i].stop(); // 调用的是作用域的stop
      }
    }
    this.active = false;
  }
}
export function recordEffectScope(effect) {
  if (activeEffectScope && activeEffectScope.active) {
    activeEffectScope.effects.push(effect);
  }
}

export function effectScope(detached) {
  return new EffectScope(detached);
}
