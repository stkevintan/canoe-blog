---
title: Hexo折腾笔记（一）博客加速以及instantclick的兼容
date: '2015-02-26T04:18:23+08:00'
tags:
  - html
  - instantclick
categories:
  - Hexo
toc: true
---

~~首先，Gitcafe的国内速度已经够快了，加不加速其实没多大区别,只不过是闲的蛋疼而已。~~
Gitcafe无故page不更新，所以又换回了github。

## Hexo加速
Hexo加速可以有以下几个方面：
1. 使用[BootCDN](http://www.bootcdn.cn/)并将图片等资源储存至七牛云。可以使用此项目[click here](https://github.com/gyk001/hexo-qiniu-sync)。
2. 使用[hexo optimize](https://github.com/FlashSoft/hexo-console-optimize)压缩优化HTML、CSS、JS、Image资源。
3. 使用[InstantClick](http://instantclick.io/)。

InstantClick是一款类似于[Turbolinks](http://instantclick.io/)的js库，利用[pjax](https://github.com/defunkt/jquery-pjax)（pushState and Ajax)技术对网站进行优化，能够极大的提高访问速度。
<!--more-->
## 解决InstantClick的兼容问题
InstantClick效果明显，但是副作用也大。加入它之后，原来相处无碍的Fancybox、百度分享、百度统计、 mathJax、多说评论都挂了。下面是我的解决方法：
###Fancybox
Fancybox的修复首先要避面页面切换时jquery.fancybox.min.js文件的重复加载。可以将该js文件的引用放入head中或者加入data-no-instant属性。
然后，因为instantclick在预加载时默认只替换body元素，所以在绑定fancybox的时候需要设置parent属性为body：
```Javascript
(function($){
    $('.fancybox').fancybox({parent:'body'});
})(jQuery);
```
这样就应该可以了。
###多说评论（以及最新评论、热评文章等）
首先，多说的公共JS是不能放在加入data-no-instant属性的。因为不是网站所有页面都包含评论部分的。
因此，我们需要将其裹入一层判断中来阻止其多次加载，提高网页的访问速度：
```Html
<!-- 多说公共JS代码 start (一个网页只需插入一次) -->
<script type="text/javascript">
if(typeof duoshuoQuery === 'undefined'){
    var duoshuoQuery = {short_name:"你的域名"};
    (function() {
        var ds = document.createElement('script');
        ds.type = 'text/javascript';ds.async = true;
        ds.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') + '//static.duoshuo.com/embed.unstable.js';
        ds.charset = 'UTF-8';
        (document.getElementsByTagName('head')[0]
         || document.getElementsByTagName('body')[0]).appendChild(ds);
    })();
}
</script>
<!-- 多说公共JS代码 end -->
```
然后，我们需要在页面预加载的change事件里对其进行重载：
```Html
<script data-no-instant>
InstantClick.on('change', function(isInitialLoad) {
  if (isInitialLoad === false) {
  	if($(".ds-thread").length && typeof DUOSHUO !== 'undefined'){ //support 多说评论框
  		DUOSHUO.EmbedThread($('.ds-thread')[0]);
  	}
  }
});
InstantClick.init();
</script>
```
可以用同样的方式解决多说的热门文章、最新评论等插件的问题。DUOSHUO全部的重载函数有：`"EmbedThread", "RecentComments", "RecentVisitors", "TopUsers", "TopThreads", "LoginWidget", "ThreadCount"`

###百度统计、google统计、MathJax
这三个可以参考这篇文章：[click here](http://zhiqiang.org/blog/it/instantclick-support-mathjax-baidu-stat.html)。同样是在change事件里对他们进行重新加载。
```Javascript
InstantClick.on('change', function(isInitialLoad) {
  if (isInitialLoad === false) {
    if (typeof MathJax !== 'undefined') // support MathJax
      MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    if (typeof prettyPrint !== 'undefined') // support google code prettify
      prettyPrint();
    if (typeof _hmt !== 'undefined')  // support 百度统计
      _hmt.push(['_trackPageview', location.pathname + location.search]);
    if (typeof ga !== 'undefined')  // support google analytics
        ga('send', 'pageview', location.pathname + location.search);
  }
});
```

###百度分享
百度分享可以用[jiathis](http://www.jiathis.com/)代替，其实国内的分享工具都差不多。

##关于data-no-instant属性
data-no-instant属性是用来避免instantclick在页面切换时对该元素重复加载。可以用在script、style标签中，也能放在a标签中，表示该链接将使用正常方式打开而不用instantclick加速。

data-no-intant无法阻止对div等元素的重新加载，因此无法实现像网易云音乐那样在切换页面的时候无间断的播放音乐等功能。不过曾有人contribute过类似的功能，但是作者没有接受：[click here](https://github.com/dieulot/instantclick/pull/108)。


<br/>
至此全部问题解决了，其他的问题可以参考下面几个链接：
- [整合 InstantClick 與 AddThis](http://shinychang.net/article/544b6c3578cf49f90fc204d7)
- [Hexo 静态博客加速](http://lukang.me/2014/hexo-page-speed.html)
- [fancybox文档](http://fancyapps.com/fancybox/#docs)
- [InstantClick文档](http://instantclick.io/documentation)
