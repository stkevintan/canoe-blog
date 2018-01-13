const parser = new DOMParser();
const util = {
  log(...args) {
    console && console.log(...args);
  },
  fork(type: string, params, cb: Function) {
    const worker = new Worker("/js/worker.js");
    worker.addEventListener("message", e => {
      if (e.data.type === type) cb(e.data.res);
    });
    worker.postMessage({ type, params });
  },
  memory(Fn: Function) {
    let ret;
    return () => {
      if (ret != null) return ret;
      return (ret = Fn());
    };
  },
  fetch(url: string, options: any = {}) {
    if (options.credentials == null) options.credentials = "same-origin";
    return fetch(url, options).then(res => {
      if ((res.status >= 200 && res.status < 300) || res.status == 304) {
        return Promise.resolve(res);
      } else {
        var error = new Error(res.statusText || `${res.status}`);
        return Promise.reject(error);
      }
    });
  },
  domReady(cb: Function) {
    document.addEventListener("DOMContentLoaded", cb as any);
  },
  parseHtml(str: string) {
    return parser.parseFromString(str, "text/html").body.firstElementChild;
  },
  get(selector: string, context: Element | Document = document) {
    if (context == null) return null;
    return context.querySelector(selector);
  },
  getAll(selector: string, context: Element | Document = document) {
    if (context == null) return [];
    return context.querySelectorAll(selector);
  },
  remove(el: Element) {
    const parent = el.parentElement;
    parent && parent.removeChild(el);
  },
  css(el: Element, key: string, value?: string) {
    if (value == null) return getComputedStyle(el)[key];
    else (el as HTMLElement).style[key] = value;
  },
  offset(el: Element) {
    const rect = el.getBoundingClientRect();
    const docElem = document.documentElement;
    return {
      top: rect.top + window.pageYOffset - (docElem.clientTop || 0),
      left: rect.left + window.pageXOffset - (docElem.clientLeft || 0)
    };
  },
  size(el: Element, outer = false) {
    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    let width, height;
    const horGap = () =>
      parseFloat(styles.paddingLeft) +
      parseFloat(styles.paddingRight) +
      parseFloat(styles.borderLeftWidth) +
      parseFloat(styles.borderRightWidth);
    const verGap = () =>
      parseFloat(styles.paddingTop) +
      parseFloat(styles.paddingBottom) +
      parseFloat(styles.borderTopWidth) +
      parseFloat(styles.borderBottomWidth);
    if (outer) {
      width = rect.width;
      height = rect.height;
    } else {
      width = rect.width - horGap();
      height = rect.height - verGap();
    }
    return { width, height };
  }
};

export default util;
