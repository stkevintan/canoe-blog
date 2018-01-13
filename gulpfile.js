const gulp = require("gulp");
const util = require("gulp-util");
const plumber = require("gulp-plumber");
const imagemin = require("gulp-imagemin");
const clean = require("gulp-clean");
const changed = require("gulp-changed");
const sass = require("gulp-sass");
const rollup = require("./buildtools/rollup");
const lunr = require("hugo-lunr-zh");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const purifycss = require("gulp-purifycss");
const htmlmin = require("gulp-htmlmin");
const rev = require("gulp-rev");
const replace = require("gulp-rev-replace");
const $if = require("gulp-if");
const run = require("run-sequence");
const pngquant = require("imagemin-pngquant");
const cp = require("child_process");
const fs = require("fs");
const toml = require("toml");

const bs = require("browser-sync").create();

const c = Object.assign({}, require("./package").config);
const siteConf = toml.parse(fs.readFileSync("./config.toml"));

const srcDir = "assets";

const devDir = ".tmp";
const prodDir = siteConf.publishDir || "public";
const themeDir = "themes/canoe";

let env = "dev"; // dev , prod , theme

gulp.task("clean", () =>
  gulp.src([devDir, prodDir], { read: false }).pipe(clean())
);

gulp.task("clean:theme", () =>
  gulp.src(`${themeDir}/{layouts,static}`).pipe(clean())
);

gulp.task("copy:static", () => {
  const destDir =
    env === "dev" ? devDir : env === "prod" ? prodDir : `${themeDir}/static`;
  return gulp.src(`${srcDir}/static/**/*`).pipe(gulp.dest(destDir));
});

// => dev
gulp.task("style", () => {
  // cover the global destDir
  const destDir = env === "theme" ? `${themeDir}/static/css` : `${devDir}/css`;
  return gulp
    .src(`${srcDir}/style/**/*.{scss,css}`)
    .pipe(plumber())
    .pipe(changed(destDir))
    .pipe($if(env === "dev", sourcemaps.init()))
    .pipe(sass().on("error", sass.logError))
    .pipe($if(env === "dev", sourcemaps.write()))
    .pipe(gulp.dest(destDir))
    .pipe(bs.stream({ match: "**/*.css" }));
});

//=> dev
gulp.task("script", () => {
  const destDir = env === "theme" ? `${themeDir}/static/js` : `${devDir}/js`;
  return rollup(
    [
      {
        entry: `./${srcDir}/script/polyfill.ts`,
        dest: `./${destDir}/polyfill.js`
      },
      { entry: `./${srcDir}/script/index.ts`, dest: `./${destDir}/index.js` },
      { entry: `./${srcDir}/script/canvas.ts`, dest: `./${destDir}/canvas.js` }
      // { entry: `${srcDir}/script/worker.ts`, dest: `./${destDir}/worker.js` }
    ],
    env === "dev"
  );
});

// => dev
gulp.task("image", () => {
  const destDir = env === "theme" ? `${themeDir}/static/img` : `${devDir}/img`;
  return gulp
    .src(`${srcDir}/image/**/*.{png,jpg}`)
    .pipe(changed(destDir))
    .pipe(
      $if(
        env !== "dev",
        imagemin({
          progressive: true,
          use: [pngquant({ quality: 90 })]
        })
      )
    )
    .pipe(gulp.dest(destDir))
    .pipe(bs.stream({ match: "**/*.{png,jpg}" }));
});

gulp.task("pimg", () => {
  const destDir = `${devDir}/pimg`;
  return gulp
    .src(`pimg/**/*.{png,jpg}`)
    .pipe(changed(destDir))
    .pipe(
      $if(
        env !== "dev",
        imagemin({
          progressive: true,
          use: [pngquant({ quality: 90 })]
        })
      )
    )
    .pipe(gulp.dest(destDir))
    .pipe(bs.stream({ match: "**/*.{png,jpg}" }));
});

// => devDir
gulp.task("hugo", cb => {
  const prodArgs = ["-d", `./${devDir}`];
  const devArgs = ["-d", `./${devDir}`, "-w", "-b", "/."];
  const hugo = cp.spawn("hugo", env === "dev" ? devArgs : prodArgs);
  hugo.stdout.on("data", data => util.log(data.toString()));
  hugo.stderr.on("data", data => util.log("error: ", data.toString()));
  hugo.on("exit", code => {
    util.log("hugo process exited with code", code);
    env !== "dev" && cb();
  });
  // env == dev is in watch mode
  env === "dev" && cb();
});

//devDir => prodDir
gulp.task("rev", () => {
  const revExts = "png,svg,jpg,css,js";
  return gulp
    .src(`${devDir}/**/*.{${revExts}}`)
    .pipe(rev())
    .pipe(gulp.dest(prodDir))
    .pipe(rev.manifest("rev-manifest.json"))
    .pipe(gulp.dest(devDir));
});

// prodDir => prodDir
gulp.task("ref", () => {
  const refExts = "html,css,js";
  return gulp
    .src(`${prodDir}/**/*.{${refExts}}`)
    .pipe(replace({ manifest: gulp.src(`${devDir}/rev-manifest.json`) }))
    .pipe(gulp.dest(prodDir));
});

// devDir => target
gulp.task("htmlmin", () => {
  return gulp
    .src(`${devDir}/**/*.{html,xml}`)
    .pipe($if("*.html", htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest(prodDir));
});

gulp.task("lunr", () => {
  const destDir = env === "dev" ? devDir : prodDir;
  const option = {
    output: `${destDir}/index.json`
  };
  if (siteConf.metaDataFormat === "yaml") {
    option.matterDelims = "---";
    option.matterType = "yaml";
  }

  return lunr(option);
});

gulp.task("purifycss", () => {
  const base = env === "theme" ? `${themeDir}` : `${devDir}`;
  return gulp
    .src(`${base}/**/*.css`)
    .pipe(purifycss([`${base}/**/*.html`, `${base}/**/*.js`]))
    .pipe(
      postcss([
        require("autoprefixer")({ browsers: c.browserslist }),
        require("cssnano")()
      ])
    )
    .pipe(gulp.dest(base));
});

gulp.task("build:dev", cb => {
  run("hugo", ["style", "script", "image", "pimg", "copy:static", "lunr"], cb);
});

gulp.task("build", ["clean"], cb => {
  env = "prod";
  run("build:dev", "purifycss", ["rev", "htmlmin"], "ref", cb);
});

gulp.task("serve", ["build:dev"], () => {
  bs.init({
    reloadDebounce: 200,
    port: c.port,
    server: {
      baseDir: devDir
    }
  });
  //watch resources
  gulp.watch(`${srcDir}/style/**/*.{scss,css}`, ["style"]);
  gulp.watch(`${srcDir}/image/**/*.{png,jpg}`, ["image"]);
  gulp.watch(`${srcDir}/pimg/**/*.{png,jpg}`, ["pimg"]);
  const toReload = [`${devDir}/**/*.html`, `${devDir}/js/**/*.js`];

  gulp.watch(toReload).on("change", () => bs.reload());
});

// theme
gulp.task("copy:layouts", () => {
  gulp.src("layouts/**/*.html").pipe(gulp.dest(`${themeDir}/layouts`));
});

gulp.task("theme", cb => {
  env = "theme";
  run(
    ["clean", "clean:theme"],
    ["script", "style", "image", "copy:static", "copy:layouts"],
    "purifycss",
    cb
  );
});
