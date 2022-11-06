export const patchClass = (el, value) => {
  if (value == null) {
    // 如果没有类名 就是移除
    el.removeAttribute("class");
  } else {
    el.className = value;
  }
};
