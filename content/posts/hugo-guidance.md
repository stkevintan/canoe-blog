---
categories:
- Tool
date: 2017-08-26T18:48:30+08:00
tags:
- hugo
- blog generator
title: 开始使用Hugo
---

Hugo是spf13大神写的一个静态博客生成器，拥有仅次于Hexo的用户量。相比于Hexo，Hugo使用Go编写，生成速度快了很多。除此之外，Hugo的设计更加合理，文档也比较详尽，比较适合我这种喜欢从零开始折腾的技术宅。本博客就是在hugo上搭建的，使用了自己编写的主题： [canoe](https://github.com/stkevintan/canoe-blog) 。



## 迁徙博文

因为我以前使用的hexo，已经拥有相当一部分博文了，所以我需要将原来hexo格式的博文转换到hugo中。其中主要的差异在于front matter，hexo使用YAML格式，这也是支持最为广泛的格式。hugo则默认是toml，但是同时可以支持yaml和json格式。个人感觉toml格式并没有多大的方便，倒是YAML格式支持的最为广泛，所以我还是在hugo中指定了使用YAML格式的front matter:

```toml
metaDataFormat = "yaml"
```

<!--more-->

但是仅仅这样，还是不能直接copy & paste，因为hexo的front matter中date没有包含时区信息而hugo则需要指定。直接一篇一篇的改太过繁琐，因此我写了一个小工具来做这件事，PS：需要先安装依赖 `mkdirp`、`moment-timezone`和`gray-matter` 。

```js
const fs = require("fs");
const { promisify } = require("util");
const moment = require("moment-timezone");
const matter = require("gray-matter");
const mkdirp = require("mkdirp-promise");

const timezone = "Asia/Shanghai";
const src = "hexo";
const target = "hugo";

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const log = console.log.bind(console);
const indent = "   ";

function read(name) {
  const path = `${src}/${name}`;
  const opts = { encoding: "utf8" };
  return readFile(path, opts).then(text => ({ name, text }));
}

function write(file) {
  const path = `${target}/${file.name}`;
  return mkdirp(target).then(_ => writeFile(path, file.text));
}

function check(file) {
  file.text = file.text.trim();
  if (!/^-{3}\s*\n/.test(file.text)) {
    file.text = `---\n${file.text}`;
  }
  if (!matter.test(file.text)) {
    log("Ops,something wrong in file:", file.name);
    return false;
  }
  return true;
}

function convert(file) {
  log("Starting to convert file", file.name);

  const { data, content } = matter(file.text);

  // title
  if (!data.title)
    data.title = file.name
      .replace(/\.md$/, "")
      .replace(/-/g, " ")
      .replace(/\b[a-z]/g, m => m.toUpperCase());

  log(indent, "[title]", data.title);

  // date
  data.date = moment
    .tz(data.date ? new Date(data.date) : new Date(), timezone)
    .format();

  log(indent, "[date]", data.date);

  // categories
  if (data.categories) {
    if (!Array.isArray(data.categories)) {
      data.categories = [data.categories];
    }
    log(indent, "[categories]", data.categories);
  }

  //tags
  if (data.tags) {
    if (!Array.isArray(data.tags)) data.tags = [data.tags];
    log(indent, "[tags]", data.tags);
  }
  file.text = matter.stringify(content, data);

  log("Done\n");

  return file;
}

function __main__() {
  readdir(src)
    .then(names => names.filter(name => /\.md$/.test(name)))
    .then(names => Promise.all(names.map(read)))
    .then(files => files.filter(check))
    .then(files => files.map(convert))
    .then(files => Promise.all(files.map(write)))
    .then(files => log(`Converted ${files.length} files`))
    .catch(console.error);
}

__main__();

```





## 主题

hugo的主题大部分都是非常简陋的，看得出来都是一群后端程序员 😂，看了一圈没有我喜欢的，加上自己对博客主题设计有一些自己的想法，于是就自己动手写了当前这个主题。取名叫canoe吧，有特殊的纪念意义。

### 模版类型

hugo把一个博客的模版归总成了四大类： `index` ,`single`,`list`,`terms`分别代表首页模版、详情（文章）页模版、列表页模版和分类页模版（categories、tags）。而且hugo还能为页面定义不同的类型(type)，不同的类型可以编写不同的模版，也可以fallback到默认的模版(如对于类型是`archive`的文章，首先采用的是`archive\signle.html` 如果前者找不到则会采用默认的文章模版`_default\single.html`)。

###  文章分类

文章分类在hugo中是一个比较抽象的概念，统称为`taxonomies`，是一个key-array的结构，包括`categories`和`tags`。我们可以实现`terms.html`来展示某一类`taxonomy`所包含的文章列表。



### 前端开发

hugo默认只提供了一个高性能的livereload服务器。但是开发主题需要用到很多前端相关的流程，包括热替换、前端资源预处理和后处理等等等，所以我还是引入了`gulp` 。使用了一套我最熟悉的技术组合：

1. 使用`typescript`和`rollup`来编写脚本
2. 使用`sass` 和`postcss`来编写样式
3. 使用`browserSync`来进行热替换

与hugo相关的`gulp`任务：

```js
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
```

### 延迟加载Valine

```html
<div id="comment"></div>
<script>
window["VALINECONFIG"] = {
  el: '#comment',
  notify: false,
  verify: false,
  appId: '{{ .valine.id }}',
  appKey: '{{ .valine.key }}',
  placeholder: '{{ .valine.placeholder }}',
  path: window.location.pathname,
  avatar: '{{ .valine.avatar }}'
}
</script>
```

```js
function loadValine() {
  const config = window["VALINECONFIG"];
  if (!config) return;
  const urls = [`${baseURL}/js/av-min.js`, `${baseURL}/js/Valine.min.js`];
  const asyncloader = url =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.addEventListener("load", _ => resolve(), false);
      script.addEventListener("error", _ => reject(), false);
      document.body.appendChild(script);
    });
  Promise.all(urls.map(asyncloader))
    .then(() => new window["Valine"](config))
    .catch(e => U.log("load Valine Failed,", e));
}
```





### 搜索

hugo在[官方文档](https://gohugo.io/tools/search/#readout) 提到了几种实现站点搜索的方式。抛开第三方搜索工具不论只剩下`lunr`了。但是lunr需要一个索引文件，hugo没有像hexo那样的`hexo-generate-json-content`插件（其实它压根就没有插件系统）所以到最后还是用Node来干这件事情吧，而且刚好我已经搭好了一个可用的`gulp` workflow了。  

需要注意的是lunr默认不支持中文搜索。这是一个非常蛋疼问题，网上的解决方法通常是这样的：

```js
const trimmer = function(token) {
  return token.update(str => {
    if (/[\u4E00-\u9FA5\uF900-\uFA2D]/.test(str)) return str;
    return str.replace(/^\W+/, "").replace(/\W+$/, "");
  });
};

const lunr_zh = function() {
  this.pipeline.reset();
  this.pipeline.add(trimmer, lunr.stopWordFilter, lunr.stemmer);
};

lunr.Pipeline.registerFunction(trimmer, "trimmer-zh");

//...
const index = lunr(function() {
  this.use(lunr_zh);
  //...
});

```

这里通过注册一个自定义的`trimmer` 方法来避免中文字符被忽略，分词算法应该写到`stemmer`函数中，但是中文分词算法并不是那么几行代码就能搞定的，如果全部放到线上的话，会极大的拖慢浏览器的加载速度。因此我们只能直接沿用原有的分词算法`lunr.stemmer` 在本地就把中文分词分好用空格分开，这样线上就可略过分词这一个步骤了。我写了一个工具来做这个，使用了`nodejieba`库，分词速度挺快的。主要逻辑是：

```js
const matter = require("gray-matter");
const removeMd = require("remove-markdown");
const nodejieba = require("nodejieba");
// ...
function parse(filename, option) {
  const filepath = path.join(option.dir, filename);
  const { name } = path.parse(filepath);
  let { data:meta, content } = matter.read(filepath);
  return { 
    uri:      path.join(option.contextPath, urlize(name)), 
    tags:     meta.tags || [], 
    content:  ChineseCut(removeMd(content)), 
    title:    ChineseCut(meta.title), 
    oriTitle: meta.title 
  };
}

function ChineseCut(str) {
  return (
    str &&
    str
      .replace(/\n/gm, "")
      .replace(
        /[\u4E00-\u9FA5\uF900-\uFA2D]+/g,
        match => ` ${nodejieba.cut(match).join(" ")} `
      )
  );
}
```

主要是利用`gray-matter`这个库对文档内容进行解析，然后把得到的`content`和`title`字段使用`ChineseCut`方法进行分词，将分词后的数组重新使用空格拼接成字符串返回，最后得到一个文章描述对象，包含着`uri`、`tags`、`content`、`title`和`oriTitle` 这几个字段。

### 动画

动画绝大情况可以使用css3 transition解决，但是还是有一些css无能为力的情况。比如说章节滚动等。因此我用`requestAnimate`写了一个简单的纯动画方法：

```typescript

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
//example
let id = null;
const animate = new Animate();
// ... other animation
const el = document.querySelector('modal');
const easeOutCubic = t => --t * t * t + 1;
const transition = p => (el.style.opacity = `${p}`),
if(id) animate.cancel(id);
id = animate.exec(transition, 200, easeOutCubic);
```

更多的动画函数可以参考： <https://gist.github.com/gre/1650294>



## 部署

### Github Pages

hugo官方教程是通过添加一个orphan的`gh-pages`分支，然后使用`git worktree`特性来将`master`分支里面的`public`目录定位到`gh-pages`中的。整个过程比较复杂，部署的过程中需要切换工作目录。所以官方也提供了一个`shell`脚本来自动干这事。

我这边直接使用了github的`docs`文件夹特性。在`config.toml`中添加一行`publishDir: docs`将站点文件生成至`docs`文件夹下，然后直接在`master`分支中开启github page就好了。github会自动部署`docs`文件夹里面的静态文件。

### 绑定域名和HTTPS

Github绑定域名就不说了，主要添加两条A记录，然后在Github上设置一下即可。但是Github绑定域名之后无法再使用https了（coding.net说起来这点还挺良心的），目前免费的解决方案只能使用cloudflare这种cdn了。



### Netlify

使用Github Pages的方式主要不足是每次提交站点源码之前需要自己手动在本地先`build`一下，另外使用master/docs的方式的话还会污染每次的提交信息。

Netlify是一个不错的选择，连接了Github之后可以像TravisCL那样，持续集成部署了。另一方面，Netlify不仅能够绑定域名，提供https访问，还能支持HTTP/2协议，完全免费，国内速度也不错。[官方网站](https://app.netlify.com/)



### Forestry

这个挺强大的，像是把静态博客变成了一个动态博客。但是环境不能自己配置，不太适合我。[官方网站](https://app.forestry.io/)