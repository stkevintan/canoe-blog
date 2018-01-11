export const requestAnimationFrame =
  window.requestAnimationFrame ||
  window["mozRequestAnimationFrame"] ||
  window.webkitRequestAnimationFrame ||
  window["msRequestAnimationFrame"] ||
  (cb => window.setTimeout(cb, 1000 / 60));

// no easing, no acceleration
export const linear = t => t;
// accelerating from zero velocity
export const easeInQuad = t => t * t;
// decelerating to zero velocity
export const easeOutQuad = t => t * (2 - t);
// acceleration until halfway, then deceleration
export const easeInOutQuad = t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
// accelerating from zero velocity
export const easeInCubic = t => t * t * t;
// decelerating to zero velocity
export const easeOutCubic = t => --t * t * t + 1;
// acceleration until halfway, then deceleration
export const easeInOutCubic = t =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
// accelerating from zero velocity
export const easeInQuart = t => t * t * t * t;
// decelerating to zero velocity
export const easeOutQuart = t => 1 - --t * t * t * t;
// acceleration until halfway, then deceleration
export const easeInOutQuart = t =>
  t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
// accelerating from zero velocity
export const easeInQuint = t => t * t * t * t * t;
// decelerating to zero velocity
export const easeOutQuint = t => 1 + --t * t * t * t * t;
// acceleration until halfway, then deceleration
export const easeInOutQuint = t =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;

class Animate {
  private id = 0;
  private active = {};
  constructor() {}

  private uniqKey() {
    return ++this.id;
  }

  exec(
    transform: Function,
    duration: number,
    easingFn: Function = linear,
    cb?: Function
  ) {
    const key = this.uniqKey();
    this.active[key] = true;
    const start = performance.now();
    const render = (now = performance.now()) => {
      const delta = now - start;
      if (!this.active[key] || delta >= duration) {
        transform(1);
        delete this.active[key];
        cb && cb();
        return;
      }
      transform(easingFn(delta / duration));
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  cancel(key: number) {
    if (this.active[key] === true) {
      this.active[key] = false;
    }
  }
}

export default new Animate();
