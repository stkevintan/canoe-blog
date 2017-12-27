const gulp = require("gulp");
const util = require("gulp-util");
const plumber = require("gulp-plumber");
const imagemin = require("gulp-imagemin");
const clean = require("gulp-clean");
const changed = require("gulp-changed");
const sass = require("gulp-sass");
const rollup = require("./buildtools/rollup");
const lunr = require("./buildtools/lunr");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");

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

c.publishDir = siteConf.publishDir || "public";

process.env.NODE_ENV = "dev";
const isProd = () => process.env.NODE_ENV === "production";

const src = {
  js: "assets/style/**/*.js",
  css: "assets/style/**/*.scss",
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

gulp.task("clean", () =>
  gulp.src([dest.root, publish.root], { read: false }).pipe(clean())
);
gulp.task("copy:static", () =>
  gulp.src(src.static).pipe(gulp.dest(isProd() ? publish.root : dest.root))
);

gulp.task("style", () => {
  return gulp
    .src(src.css)
    .pipe(plumber())
    .pipe(changed(dest.css))
    .pipe($if(!isProd(), sourcemaps.init()))
    .pipe(sass().on("error", sass.logError))
    .pipe($if(!isProd(), sourcemaps.write()))
    .pipe(
      $if(
        isProd(),
        postcss([
          require("autoprefixer")({ browsers: c.browserslist }),
          require("cssnano")()
        ])
      )
    )
    .pipe(gulp.dest(dest.css))
    .pipe(bs.stream({ match: "**/*.css" }));
});

gulp.task("script", () => {
  const dir = "./assets/script/";
  return rollup(
    [
      { entry: `${dir}/index.ts`, dest: `./${dest.js}/index.js` },
      { entry: `${dir}/canvas.ts`, dest: `./${dest.js}/canvas.js` }
    ],
    () => bs.reload()
  );
});

gulp.task("image", () => {
  return gulp
    .src(src.img)
    .pipe(changed(dest.img))
    .pipe(
      $if(
        isProd(),
        imagemin({
          progressive: true,
          use: [pngquant({ quality: 90 })]
        })
      )
    )
    .pipe(gulp.dest(dest.img));
});

gulp.task("hugo", cb => {
  const args = ["-d", `./${dest.root}`];
  const hugo = cp.spawn(
    "hugo",
    isProd() ? args : args.concat(["-w", "-b", "/."])
  );
  hugo.stdout.on("data", data => util.log(data.toString()));
  hugo.stderr.on("data", data => util.log("error: ", data.toString()));
  hugo.on("exit", code => {
    util.log("hugo process exited with code", code);
    isProd() && cb();
  });
  !isProd() && cb();
});

gulp.task("rev", () => {
  const revExts = "png,svg,jpg,css,js";
  return gulp
    .src(`${dest.root}/**/*.{${revExts}}`)
    .pipe(rev())
    .pipe(gulp.dest(publish.root))
    .pipe(rev.manifest("rev-manifest.json"))
    .pipe(gulp.dest(dest.root));
});
gulp.task("ref", () => {
  const refExts = "html,css,js,xml";
  return gulp
    .src(`${publish.root}/**/*.{${refExts}}`)
    .pipe(replace({ manifest: gulp.src(`${dest.root}/rev-manifest.json`) }))
    .pipe(gulp.dest(publish.root));
});
gulp.task("htmlmin", () => {
  return gulp
    .src(`${dest.root}/**/*.{html,xml}`)
    .pipe($if("*.html", htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest(publish.root));
});
gulp.task("lunr", () => {
  const option = {
    contextPath: "/posts/",
    dir: "content/posts",
    output: `${isProd() ? publish.root : dest.root}/index.json`
  };
  if (siteConf.metaDataFormat === "yaml") {
    option.matterDelims = "---";
    option.matterType = "yaml";
  }

  return lunr(option);
});

gulp.task("build:dev", ["clean"], cb => {
  run("hugo", ["style", "script", "image", "copy:static"], "lunr", cb);
});

gulp.task("build", ["clean"], cb => {
  process.env.NODE_ENV = "production";
  run("build:dev", ["rev", "htmlmin"], "ref", () => {
    process.env.NODE_ENV = "dev" && cb();
  });
});

gulp.task("serve", ["build:dev"], () => {
  bs.init({
    reloadDebounce: 200,
    port: c.port,
    server: {
      baseDir: dest.root
    }
  });

  gulp.watch(src.css, ["style"]);
  // $.watch(src.js, ["script"]);

  const reloadSource = [
    dest.root + "/**/*.html",
    dest.img + "/**/*.{png,svg,jpg}"
  ];
  gulp.watch(reloadSource).on("change", () => bs.reload());
});
