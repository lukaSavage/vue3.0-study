import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

export const patchProp = (el, key, prevValue, nextValue) => {
  // class style event attr
  if (key === "class") {
    // class
    patchClass(el, nextValue);
  } else if (key === "style") {
    // {color:'red',background:red}   {color:'red'}
    // onXxxx  on1
    patchStyle(el, prevValue, nextValue);
  } else if (/^on[^a-z]/.test(key)) {
    // event
    // 事件操作？ addEventListener  removeEventListener
    // @click="fn1"       @click="fn2" ?
    // invoker.fn = fn1   invoker.fn = fn2
    // @click="()=>invoker.fn"   @click="()=> invoker.fn" ?

    patchEvent(el, key, nextValue);
  } else {
    //attr
    patchAttr(el, key, nextValue);
  }
};
