export const requestAnimationFrame =
  window.requestAnimationFrame ||
  window["mozRequestAnimationFrame"] ||
  window.webkitRequestAnimationFrame ||
  window["msRequestAnimationFrame"] ||
  (cb => window.setTimeout(cb, 1000 / 60));

let idx = 0;
function makeID() {
  return idx++;
}

let animateStateMap: any = {};

export function animate(
  setter: Function,
  duration: number,
  easingFn: Function,
  cb?: Function
) {
  const id = makeID();
  animateStateMap[id] = true;
  const start = performance.now();
  const render = (now = performance.now()) => {
    const delta = now - start;
    if (!animateStateMap[id] || delta >= duration) {
      setter(1);
      delete animateStateMap[id];
      cb && cb();
      return;
    }
    setter(easingFn(delta / duration));
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
  return id;
}

export function cancelAnimate(id) {
  if (animateStateMap[id] === true) {
    animateStateMap[id] = false;
  }
}

export default {
  // no easing, no acceleration
  linear: function(t) {
    return t;
  },
  // accelerating from zero velocity
  easeInQuad: function(t) {
    return t * t;
  },
  // decelerating to zero velocity
  easeOutQuad: function(t) {
    return t * (2 - t);
  },
  // acceleration until halfway, then deceleration
  easeInOutQuad: function(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  // accelerating from zero velocity
  easeInCubic: function(t) {
    return t * t * t;
  },
  // decelerating to zero velocity
  easeOutCubic: function(t) {
    return --t * t * t + 1;
  },
  // acceleration until halfway, then deceleration
  easeInOutCubic: function(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
  // accelerating from zero velocity
  easeInQuart: function(t) {
    return t * t * t * t;
  },
  // decelerating to zero velocity
  easeOutQuart: function(t) {
    return 1 - --t * t * t * t;
  },
  // acceleration until halfway, then deceleration
  easeInOutQuart: function(t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
  },
  // accelerating from zero velocity
  easeInQuint: function(t) {
    return t * t * t * t * t;
  },
  // decelerating to zero velocity
  easeOutQuint: function(t) {
    return 1 + --t * t * t * t * t;
  },
  // acceleration until halfway, then deceleration
  easeInOutQuint: function(t) {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
  }
};
