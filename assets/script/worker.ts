const sendMessage: any = self.postMessage;
class Handler {
  private handlerMap = Object.create(null);
  register(name, func) {
    this.handlerMap[name] = func;
  }
  unregister(name) {
    delete this.handlerMap[name];
  }
  invoke(name, params) {
    if (Object.prototype.hasOwnProperty.call(this.handlerMap, name)) {
      this.handlerMap[name](name, params);
    } else {
      console && console.log("type", name, "is not registered!");
    }
  }
}

const handler = new Handler();

self.addEventListener("message", e => {
  handler.invoke(e.data.type, e.data.params);
});
