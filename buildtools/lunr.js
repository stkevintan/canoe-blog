const fs = require("fs");
const path = require("path");
const { escape } = require("querystring");
const matter = require("gray-matter");
const removeMd = require("remove-markdown");
const striptags = require("striptags");

const { promisify } = require("util");

const readdir = promisify(fs.readdir);
const readfile = promisify(fs.readFile);
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
("http://localhost:3000/posts/graphql-learn-(5)---introspection");
("http://localhost:3000/posts/graphql-learn-5---introspection/");
function encodeURIComponent(str) {
  return escape(
    str
      .replace(/\s/g, "-")
      .replace(/[\(\)&@]/g, "")
      .toLowerCase()
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

  const content =
    pathinfo.ext === ".md" ? removeMd(meta.content) : striptags(meta.content);

  const uri = path.join(option.contextPath, encodeURIComponent(pathinfo.name));

  if (meta.data.slug != null) uri = path.dirname(uri) + meta.data.slug;
  if (meta.data.url != null) uri = meta.data.url;
  const tags = meta.data.tags || [];

  return {
    uri,
    content,
    tags,
    title: meta.data.title
  };
}

module.exports = function(option = {}) {
  option = Object.assign({}, defaultOpt, option);
  const exts = arrayfy(option.extensions);
  return readdir(option.dir)
    .then(files => files.filter(file => exts.some(ext => file.endsWith(ext))))
    .then(files => JSON.stringify(files.map(file => handle(file, option))))
    .then(index => writeFile(option.output, index, { encoding: "utf8" }));
};

function arrayfy(o) {
  return Array.isArray(o) ? o : [o];
}
