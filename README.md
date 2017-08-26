# hugo-YAMT-theme
Yet Another Material Theme for hugo. [demo](https://keyin.me). 

![Chrome](https://raw.github.com/alrra/browser-logos/master/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/firefox/firefox_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/safari/safari_48x48.png)
--- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | 10+ ✔ | Latest ✔ | 6.1+ ✔ |

## Feature

1. Waterfall
2. Full screen / Responsive layout
3. Material Design

## Snapshot

![home page](https://raw.githubusercontent.com/stkevintan/hugo-YAMT-theme/master/snapshots/home.png)
![article page](https://raw.githubusercontent.com/stkevintan/hugo-YAMT-theme/master/snapshots/article.png)


## Usage && Dev

Because this theme is using a workflow of gulp. you should clone this repo and replace my stuff(such as post,pages,link,etc...) with yours. 

This theme is writted by `es6` `sass` and compiled by `gulp`， so, we should install all the dependencies required:

```bash
  # install glob globally
  yarn global add gulp # or npm install gulp -g
  # install dependencies
  yarn install # or npm install
``` 

All the available gulp commands:

1. `gulp serve`: start a livereload dev server to devlopment. equivalent to `hugo serve`.
2. `gulp build`: generate static file to your publish dir. equivalent to `hugo`.

After using `guilp build`,the static pages should be generated into `docs` folder, all the static resources should be minified and revisioned.   

Finally, push the whole project to your github repo, and enable the github pages with the help of [offical docs](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch) your site will be published online soon.