const rollup = require("rollup");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const ts = require("rollup-plugin-typescript");
const uglify = require("rollup-plugin-uglify");

const prod = process.env.NODE_ENV === "production";

const plugins = prod
  ? [resolve(), commonjs(), ts(), uglify()]
  : [resolve(), commonjs(), ts()];

function watchChanges(options, cb) {
  //watch files in dev mode
  rollup.watch(options).on("event", e => {
    if (e.code === "END") {
      console.log("Rollup complete");
      cb && cb();
    }
    if (e.code === "ERROR") {
      console.error("Rollup error: ", e);
    }
  });
}

module.exports = (options, cb) => {
  const watchOpts = [];
  if (!Array.isArray(options)) options = [options];
  const res = options.map(option => {
    const inOpts = { input: option.entry, plugins };
    const outOpts = {
      file: option.dest,
      format: "iife",
      sourcemap: !prod
    };
    watchOpts.push(Object.assign(inOpts, { output: [outOpts] }));
    return rollup.rollup(inOpts).then(bundle => bundle.write(outOpts));
  });

  if (!prod) watchChanges(watchOpts, cb);
  return Promise.all(res);
};
