const rollup = require("rollup");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const ts = require("rollup-plugin-typescript");
const uglify = require("rollup-plugin-uglify");
const devPlugins = [
  resolve(),
  commonjs(),
  ts({
    typescript: require("typescript")
  })
];

const ProdPlugins = [...devPlugins, uglify()];

function watchChanges(options) {
  //watch files in dev mode
  rollup.watch(options).on("event", e => {
    if (e.code === "END") {
      console.log("Rollup complete");
    }
    if (e.code === "ERROR") {
      console.error("Rollup error: ", e);
    }
  });
}

module.exports = (options, isDev) => {
  const watchOpts = [];
  if (!Array.isArray(options)) options = [options];
  const res = options.map(option => {
    const inOpts = {
      input: option.entry,
      plugins: isDev ? devPlugins : ProdPlugins
    };
    const outOpts = {
      file: option.dest,
      format: "iife",
      sourcemap: isDev
    };
    watchOpts.push(Object.assign(inOpts, { output: [outOpts] }));
    return rollup.rollup(inOpts).then(bundle => bundle.write(outOpts));
  });
  isDev && watchChanges(watchOpts);
  return Promise.all(res);
};
