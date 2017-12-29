const fs = require("fs");
const path = require("path");
const { escape } = require("querystring");

const matter = require("gray-matter");
const removeMd = require("remove-markdown");
const striptags = require("striptags");
const nodejieba = require("nodejieba");

nodejieba.load({
  // user dict ...
});

const { promisify } = require("util");

const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);

const defaultOpt = {
  contextPath: "/posts",
  dir: "content/posts",
  output: "index.json",
  matterType: "toml",
  matterDelims: "+++",
  skipDraft: true,
  extensions: ".md"
};

function urlize(str) {
  str = str
    .replace(/\s/g, "-")
    .replace(/[\(\)&@]/g, "")
    .toLowerCase();
  return escape(str);
}

function ChinsesCut(str) {
  return (
    str &&
    str.replace(
      /[\u4E00-\u9FA5\uF900-\uFA2D]+/gm,
      match => ` ${nodejieba.cut(match).join(" ")} `
    )
  );
}

function handle(filename, option) {
  const filepath = path.join(option.dir, filename);
  const pathinfo = path.parse(filepath);
  const meta = matter.read(filepath, {
    language: option.matterType,
    delims: option.matterDelims
  });

  if (option.skipDraft && meta.data.draft === true) return;

  const plainText =
    pathinfo.ext === ".md" ? removeMd(meta.content) : striptags(meta.content);
  let uri = path.join(option.contextPath, urlize(pathinfo.name));

  if (meta.data.slug != null) uri = path.dirname(uri) + meta.data.slug;
  if (meta.data.url != null) uri = meta.data.url;
  const tags = meta.data.tags || [];
  //中文分词
  const content = ChinsesCut(plainText);
  const title = ChinsesCut(meta.data.title);

  return { uri, tags, content, title, oriTitle: meta.data.title };
}

module.exports = function(option = {}) {
  option = Object.assign({}, defaultOpt, option);
  const exts = arrayfy(option.extensions);
  return readdir(option.dir)
    .then(files => files.filter(file => exts.some(ext => file.endsWith(ext))))
    .then(files => JSON.stringify(files.map(file => handle(file, option))))
    .then(index => {
      mkdirp(path.dirname(option.output));
      return writeFile(option.output, index, { encoding: "utf8" });
    });
};

function mkdirp(dir) {
  if (fs.existsSync(dir)) {
    return;
  }

  try {
    fs.mkdirSync(dir);
  } catch (err) {
    if (err.code == "ENOENT") {
      mkdirp(path.dirname(dir)); //create parent dir
      mkdirp(dir); //create dir
    }
  }
}

function arrayfy(o) {
  return Array.isArray(o) ? o : [o];
}
