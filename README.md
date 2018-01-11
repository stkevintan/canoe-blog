# hugo-YAMT-theme

Yet Another Material Theme for hugo. [demo](https://keyin.me).

![](https://raw.githubusercontent.com/stkevintan/canoe/master/images/screenshot.png)

## Feature

1. Waterfall layout
2. Responsive layout
3. Material design
4. Table of content
5. Tiny and powerfull, no JQuery
6. Chinese keyword search(using `lunr` and `nodejieba`)

## How to use or dev

This theme is writted by `typescript` and `sass` and using `gulp` to control the build progress.

First, install `hugo` and make sure you have a node environment.  
Next, clone this repo and replace my stuff (such as post,pages,link,etc...) with yours.  
Then, install the node dependencies with `yarn` or `npm`:

```bash
  # install glob globally
  yarn global add gulp # or npm install gulp -g
  # install dependencies
  yarn install # or npm install
```

Finally, there are several gulp tasks we can run in the terminal:

1. `gulp serve`: start a livereload dev server. equivalent to `hugo serve`.
2. `gulp build`: generate static file to your publish dir. equivalent to `hugo`.
3. `gulp lunr`: generate a lunr-index-json file (with Chinese support) to your publish directory.

After using `guilp build`,the static pages should be generated into `docs` folder, all the static resources should be minified and revisioned.

Finally, push the whole project to your github repo, and enable the github pages with the help of [offical docs](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch) your site should be published soon.
