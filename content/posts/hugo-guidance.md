---
categories:
- Tool
date: 2017-08-26T18:48:30+08:00
tags:
- hugo
- blog generator
title: 开始使用Hugo
---

## 迁徙博客

最近了解到了hugo这个博客生成器，试用了一下，发现跟之前hexo相比，生成速度的确快了不少。而且还是sp13大神用Go写的作品,于是想着把博客从原来的hexo迁徙到hugo上来。

博客迁徙主要是文章front matter的转化，hexo使用的是YAML语法而hugo则是TOML语法，虽然hugo也支持YAML语法但是两者日期字段上还是有差别。这里推荐使用[这篇文章](https://github.com/nodejh/nodejh.github.io/issues/11)所提供的转化工具。


另外图片等静态资源的我用的是七牛cdn，不需要迁徙。这里就不多说了。



## 主题开发

hugo虽然性能优势很明显但是转了半圈官网却没发现一个中意的主题。也许是后端大牛普遍都不太在意设计吧。官方虽然移植了很多其他博客引擎的主题，但是大多潦潦草草，大体可以，细节不行。因此我决定自己开发一套主题。正好当时收集了很多博客设计的点子，也有着自己的想法。

为hugo开发主题，事先得好好看一下官方文档。看了一遍觉得hugo设计的真心不错。go template语言也很完备。不愧是sp13大佬的作品。

### 模版类型

hugo把一个博客的模版归总成了四大类： `index` ,`single`,`list`,`terms`分别代表首页模版、详情（文章）页模版、列表页模版和分类页模版（categories、tags）。而且hugo还能为页面定义不同的类型(type)，不同的类型可以编写不同的模版，也可以fallback到默认的模版(如对于类型是`archive`的文章，首先采用的是`archive\signle.html` 如果前者找不到则会采用默认的文章模版`_default\single.html`)。

###  文章分类

文章分类在hugo中是一个比较抽象的概念，统称为`taxonomies`，是一个key-array的结构，包括`categories`和`tags`。我们可以实现`terms.html`来展示某一类`taxonomy`所包含的文章列表。



### 前端自动化构建

hugo默认只提供了一个高性能的livereload服务器，但是前端主题还是一个比较大的工程，直接使用原始的CSS和JS显然不太合适。因此引入前端自动化构建工具是必不可少的。我这里用的还是`gulp`，虽然比较古老。但依然简单可靠。根据自己的开发习惯我配了一套Sass和es6的自动化构建流程。然后使用`browserSync`配合`hugo -w`命令写了一个简单的livereload服务器。生成的时候，把该压缩的文件压缩掉，然后引入了`gulp-rev`来对静态资源添加随机后缀。



### 搜索

`hexo`有一个比较成熟的`hexo-generate-json-content`插件来生成JSON格式的网站索引，`hugo`则没有。官方推荐使用`hugo-lunr`这个node程序来生成，其实挺无语的，本来是一个Go的程序却还是依赖于Node。但是对我来说刚好可以集成到我的构建脚本中。

每次构建都能生成一个JSON格式的索引，然后在前端使用`lunr.js`进行后续处理。主要的逻辑代码：

```js
const loadLunrDB = (() => {
  let db = null;
  return () => {
    if (db) return db;
    const url = window.origin + '/index.json';
    db = $.getJSON(url)
      .then(pages => ({
        pageMap: pages.reduce((map, page) => {
          map[page.uri] = page;
          return map;
        }, Object.create(null)),
        index: lunr(function() {
          this.field('title', { boost: 10 });
          this.field('tags', { boost: 5 });
          this.field('content');
          this.ref('uri');
          pages.forEach(page => this.add(page));
        })
      }))
      .fail((jqxhr, textStatus, error) => {
        console.error('Error getting Hugo index flie:',textStatus + ', ' + error);
        db = null;
      });
    return db;
  };
})();

const search = query => loadLunrDB().then(data =>
    data.index.search(query).map(item => data.pageMap[item.ref]));

const setSearchBoard = () => {
  const $in = $('#in-search');
  const $out = $('#out-search');
  const clear = (text = 'No Result...') => {
    const $item = $(
      `<span class="collection-item text-grey" style="display:none">${text}</span>`
    );
    $out.empty().append($item.fadeIn(200));
    
  };
  clear();

  const add = items => {
    if (!items || !items.length) {
      clear();
      return;
    }
    if (!$.isArray(items)) items = [items];
    const $items = items.map(
      item =>
        $(`<a href="${item.uri}" class="collection-item nowrap" style="display:none"><i class="material-icons">description</i>${item.title}</a>`)
    );
    $out.empty().append($items);
    $items.forEach($item => $item.fadeIn(100));
  };

  $in.keyup(() => {
    const query = $in.val().trim();
    if (query.length < 2) {
      clear();
      return;
    }
    clear('Searching...');
    search(query)
      .then(items => add(items))
      .fail(() => clear('Fail to execute search, Please check your network.'));
  });
};

setSearchBoard();
```

但是写好后才发现`lunr.js`至今还没有支持中文。一口老血。。。打算有时间试试用`WebAssembly`包装一个中文分词算法来玩玩。To Be Continue...



## 部署

hugo官方教程是通过添加一个orphan的`gh-pages`分支，然后使用`git worktree`特性来将`master`分支里面的`public`目录定位到`gh-pages`中的。整个过程比较复杂，部署的过程中需要切换工作目录。所以官方也提供了一个`shell`脚本来自动干这事。

我这边直接使用了github的`docs`文件夹特性。在`config.toml`中添加一行`publishDir: docs`将站点文件生成至`docs`文件夹下，然后直接在`master`分支中开启github page就好了。github会自动部署`docs`文件夹里面的静态文件。

## 绑定域名和HTTPS

Github绑定域名就不说了，主要添加两条A记录，然后在Github上设置一下即可。但是Github绑定域名之后无法再使用https了（coding.net说起来这点还挺良心的）。Google一圈，还是通过cloudflare的方式实现了。



## Netlify和HTTP/2

最近发现这个还不错，连接了Github之后可以自动编译自动部署。相当于已经给你提供了一个现成的Travis CI任务。而且还能够不污染Github提交。相当不错的网站。

Netlify不仅能够绑定域名，提供https访问，还能支持HTTP/2协议。感觉又可以折腾一下了。



完