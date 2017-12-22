import "whatwg-fetch";
const parser = new DOMParser();
const util = {
  fetch(url: string, options?) {
    if (options == null) options = {};
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
  get(selector: string, context?: Element | Document) {
    if (context == null) context = document;
    return context.querySelector(selector);
  },
  getAll(selector: string, context?: Element | Document) {
    if (context == null) context = document;
    return context.querySelectorAll(selector);
  },
  offset(el: Element) {
    const box = el.getBoundingClientRect();
    return {
      top: box.top + window.pageYOffset - document.documentElement.clientTop,
      left: box.left + window.pageXOffset - document.documentElement.clientLeft
    };
  }
};

export default util;
