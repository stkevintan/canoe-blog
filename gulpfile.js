const $ = require("gulp");
const _ = require("gulp-util");
const plumber = require("gulp-plumber");
const imagemin = require("gulp-imagemin");
const clean = require("gulp-clean");
const changed = require("gulp-changed");
const sass = require("gulp-sass");
const rollup = require("rollup");
const ts = require("rollup-plugin-typescript");
const uglify = require("rollup-plugin-uglify");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");

const htmlmin = require("gulp-htmlmin");
const rev = require("gulp-rev");
const replace = require("gulp-rev-replace");
const $if = require("gulp-if");
const runseq = require("run-sequence");
const pngquant = require("imagemin-pngquant");
const cp = require("child_process");
const fs = require("fs");
const toml = require("toml");
const lunr = require("hugo-lunr");

const bs = require("browser-sync").create();

const c = Object.assign({}, require("./package").config);
const siteConf = toml.parse(fs.readFileSync("./config.toml"));

c.publishDir = siteConf.publishDir || "public";

let prod = false;

const src = {
  css: "assets/style/**/*.scss",
  jsdir: "assets/script/",
  static: "assets/static/**/*",
  img: "assets/image/**/*.{png,svg,jpg}"
};

const dest = {
  root: ".tmp-server",
  css: ".tmp-server/css",
  js: ".tmp-server/js",
  img: ".tmp-server/img"
};

const publish = {
  root: c.publishDir,
  js: c.publishDir + "/js",
  css: c.publishDir + "/css",
  img: c.publicDir + "/img"
};
$.task("clean", () =>
  $.src([dest.root, publish.root], { read: false }).pipe(clean())
);
$.task("copy:static", () =>
  $.src(src.static).pipe($.dest(prod ? publish.root : dest.root))
);

$.task("style", () => {
  return $.src(src.css)
    .pipe(plumber())
    .pipe(changed(dest.css))
    .pipe($if(!prod, sourcemaps.init()))
    .pipe(sass().on("error", sass.logError))
    .pipe($if(!prod, sourcemaps.write()))
    .pipe(
      $if(
        prod,
        postcss([
          require("autoprefixer")({ browsers: c.browserslist }),
          require("cssnano")()
        ])
      )
    )
    .pipe($.dest(dest.css))
    .pipe(bs.stream({ match: "**/*.css" }));
});

function rollupMultiEntry(options) {
  const watchOptions = [];
  const rollupResults = options.map(option => {
    const inputOpts = {
      input: option.entry,
      globals: { jquery: "$" },
      format: "iife",
      plugins: prod ? [ts(), uglify()] : [ts()]
    };
    const outputOpts = {
      file: option.dest,
      format: "iife",
      sourcemap: !prod
    };
    watchOptions.push({ ...inputOpts, output: [outputOpts] });
    return rollup.rollup(inputOpts).then(bundle => bundle.write(outputOpts));
  });
  return { promise: Promise.all(rollupResults), watchOptions };
}

$.task("script", () => {
  const rollupResult = rollupMultiEntry([
    { entry: `./${src.jsdir}/index.ts`, dest: `./${dest.js}/index.js` },
    { entry: `./${src.jsdir}/canvas.ts`, dest: `./${dest.js}/canvas.js` }
  ]);
  if (!prod) {
    //watch files in dev mode
    const watcher = rollup.watch(rollupResult.watchOptions);
    watcher.on("event", e => {
      if (e.code === "END") {
        _.log("rollup updated");
        bs.reload();
      }
      if (e.code === "ERROR") {
        _.log("rollup error: ", e);
      }
    });
  }
  return rollupResult.promise;
});

$.task("image", () => {
  return $.src(src.img)
    .pipe(changed(dest.img))
    .pipe(
      $if(
        prod,
        imagemin({
          progressive: true,
          use: [pngquant({ quality: 90 })]
        })
      )
    )
    .pipe($.dest(dest.img));
});

$.task("hugo", cb => {
  const args = ["-d", `./${dest.root}`];
  const hugo = cp.spawn("hugo", prod ? args : args.concat(["-w", "-b", "/."]));
  hugo.stdout.on("data", data => _.log(data.toString()));
  hugo.stderr.on("data", data => _.log("error: ", data.toString()));
  hugo.on("exit", code => {
    _.log("hugo process exited with code", code);
    prod && cb();
  });
  !prod && cb();
});

$.task("rev", () => {
  const revExts = "png,svg,jpg,css,js";
  return $.src(`${dest.root}/**/*.{${revExts}}`)
    .pipe(rev())
    .pipe($.dest(publish.root))
    .pipe(rev.manifest("rev-manifest.json"))
    .pipe($.dest(dest.root));
});

$.task("ref", () => {
  const refExts = "html,css,js,xml";
  return $.src(`${publish.root}/**/*.{${refExts}}`)
    .pipe(replace({ manifest: $.src(`${dest.root}/rev-manifest.json`) }))
    .pipe($.dest(publish.root));
});

$.task("htmlmin", () => {
  return $.src(`${dest.root}/**/*.{html,xml}`)
    .pipe($if("*.html", htmlmin({ collapseWhitespace: true })))
    .pipe($.dest(publish.root));
});

$.task("lunr", cb => {
  const h = new lunr();
  const file = `${prod ? publish.root : dest.root}/index.json`;
  h.index("content/post/**", file);
  cb();
});

$.task("build:dev", ["clean"], cb => {
  runseq("hugo", ["style", "script", "image", "copy:static"], "lunr", cb);
});

$.task("build", ["clean"], cb => {
  prod = true;
  runseq("build:dev", ["rev", "htmlmin"], "ref", cb);
});

$.task("serve", ["build:dev"], () => {
  bs.init({
    reloadDebounce: 200,
    port: c.port,
    server: {
      baseDir: dest.root
    }
  });

  $.watch(src.css, ["style"]);
  // $.watch(src.js, ["script"]);

  const reloadSource = [
    dest.root + "/**/*.html",
    dest.img + "/**/*.{png,svg,jpg}"
  ];
  $.watch(reloadSource).on("change", () => bs.reload());
});
