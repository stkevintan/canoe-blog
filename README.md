# hugo-YAMT-theme
Yet Another Material Theme for hugo. [demo](https://keyin.me). 

![Chrome](https://raw.github.com/alrra/browser-logos/master/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/firefox/firefox_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/safari/safari_48x48.png)
--- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | 10+ ✔ | Latest ✔ | 6.1+ ✔ |

## Feature

1. Waterfall
2. Full screen / Responsive layout
3. Material Design  
4. Table of Content  

## Snapshot

![home page](https://raw.githubusercontent.com/stkevintan/hugo-YAMT-theme/master/snapshots/home.png)
![article page](https://raw.githubusercontent.com/stkevintan/hugo-YAMT-theme/master/snapshots/article.png)


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

Finally, there are 2 gulp task we can run in the terminal:

1. `gulp serve`: start a livereload dev server. equivalent to `hugo serve`.
2. `gulp build`: generate static file to your publish dir. equivalent to `hugo`.

After using `guilp build`,the static pages should be generated into `docs` folder, all the static resources should be minified and revisioned.   

Finally, push the whole project to your github repo, and enable the github pages with the help of [offical docs](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch) your site should be published soon.