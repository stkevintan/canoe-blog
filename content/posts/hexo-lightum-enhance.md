---
title: Hexo折腾笔记（二）博客优化与定制
tags:
  - 美化
  - html
categories:
  - Hexo
date: '2015-02-26T06:57:00+08:00'
toc: true
---
首先我使用的是由[zippera](http://zipperary.com/)基于官方[Light](https://github.com/hexojs/hexo-theme-light)主题改进而来的[Lightum](https://github.com/zippera/lightum)主题,其他主题可能稍有出入。
##速度优化
参考之前的文章：[静态页面优化](http://kevinsfork.info/2015/02/25/hexo-speedup-instantclick/)。然后使用了[hexo-qiniu-sync](https://github.com/gyk001/hexo-qiniu-sync)这个项目，将静态的图片以及css、js同步到了七牛云。（PS：主题模板中包含了两个不同版本的jquery，分别在head.ejs与after-footer.ejs中，随便删除一个。）

对于处于body区域的script、style的引用尽可能的加入data-no-instant属性，避免InstantClick重复加载。
##给instantclick加载进度条加上阴影效果
```CSS
#instantclick-bar{
-webkit-box-shadow: 0 0 8px rgba(0, 0, 0, 0.56);
box-shadow: 0 0 8px rgba(0, 0, 0, 0.56);
}
```

##加入Swiftype搜索
去[Swiftype](https://swiftype.com/)官网申请代码，然后修改search.ejs文件为：
```Html
<div class="search">
<form>
<input type="search" id="st-search-input" placeholder="<%= __('search') %>">
</form>
</div>
```
 <!--more-->
更具体的指导具体可以参考这篇文章：[click here](http://lukang.me/2015/optimization-of-hexo-2.html)。
##改进多说评论框
###添加data-thread-key等属性
```Html
<!-- 多说评论框 start -->
<div class="ds-thread" data-thread-key="<%= page.path %>" data-title="<%= page.title %>" data-url="<%= page.permalink %>"></div>
<!-- 多说评论框 end -->
```
###美化多说评论框
进入多说评论的管理后台，将下面代码粘贴到‘设置->自定义CSS’中。
```
#ds-reset .ds-avatar img{width:54px;height:54px;border-radius:27px;-webkit-border-radius:27px;-moz-border-radius:27px;box-shadow:inset 0 -1px 0 #3333sf;-webkit-box-shadow:inset 0 -1px 0 #3333sf;-webkit-transition:0.4s;-webkit-transition:-webkit-transform 0.4s ease-out;transition:transform 0.4s ease-out;-moz-transition:-moz-transform 0.4s ease-out;}
#ds-reset .ds-avatar img:hover{box-shadow:0 0 10px #fff;rgba(255,255,255,.6),inset 0 0 20px rgba(255,255,255,1);-webkit-box-shadow:0 0 10px #fff;rgba(255,255,255,.6),inset 0 0 20px rgba(255,255,255,1);transform:rotateZ(360deg);-webkit-transform:rotateZ(360deg);-moz-transform:rotateZ(360deg);}
p.ds-powered-by,#ds-sync-checkbox,.ds-sync label{display:none!important;}
#ds-reset .ds-rounded-top{-webkit-border-top-right-radius:0px;-webkit-border-top-left-radius:0px;border-top-right-radius:0px;border-top-left-radius:0px;}
#ds-thread #ds-reset .ds-textarea-wrapper{background:#fff;border:0;margin-bottom:20px;padding-right:0px;}
#ds-thread #ds-reset .ds-textarea-wrapper textarea{min-height:80px;border:1px solid #ccc;padding:10px;-webkit-appearance:none;border-radius:0;background-color:#FFFFFF;border-color:#cccccc;box-shadow:inset 0 1px 2px rgba(0,0,0,0.1);color:rgba(0,0,0,0.75);-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-transition:border-color 0.15s linear,background 0.15s linear;-moz-transition:border-color 0.15s linear,background 0.15s linear;-ms-transition:border-color 0.15s linear,background 0.15s linear;-o-transition:border-color 0.15s linear,background 0.15s linear;transition:border-color 0.15s linear,background 0.15s linear;}
#ds-thread #ds-reset .ds-textarea-wrapper textarea:focus{border-color:#999999;background:#fafafa;outline:none;}
#ds-thread #ds-reset .ds-post-options{border-bottom-left-radius:0px;-webkit-border-bottom-left-radius:0px;border:none;background:none!important;}
#ds-thread #ds-reset .ds-post-button{border-bottom-right-radius:0px;-webkit-border-bottom-right-radius:0px;}
#ds-reset .ds-textarea-wrapper textarea:focus{border-color:#66afe9;outline:0;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);}
#ds-thread #ds-reset .ds-post-button{background-image:none;text-shadow:none;border:none;font-weight:normal;line-height:normal;position:absolute;-webkit-appearance:button;-moz-appearance:button;background-color:#008CBA;border-color:#007095;color:#FFFFFF;transition:background-color 300ms ease-out;}
#ds-thread #ds-reset .ds-post-button:hover,#ds-thread #ds-reset .ds-post-button:focus{background-color:#007095;color:#FFFFFF;}
```
##加入多说最新评论
修改'theme/lightum/_config.yml'文件，在widgets下面添加`- recent_comments`项。
在主题文件的'theme/lightum/layout/_widget'目录中新建recent_comments.ejs文件，并放入如下代码：
```
<div class="widget tag">
<h3 class="title"><%= __('recent_comments')</h3>
<div class="entry">
<!-- 多说最新评论 start -->
    <div class="ds-recent-comments" data-num-items="5" data-show-avatars="1" data-show-time="1" data-show-title="1" data-show-admin="1" data-excerpt-length="70"></div>
<!-- 多说最新评论 end -->
<!-- 多说公共JS代码 start (一个网页只需插入一次) -->
..........
<!-- 多说公共JS代码 end -->
</div>
</div>
```
然后在'/languages/zh-CN.yml'文件添加翻译：`recent_comments: 最新评论`

最后，原来的评论样式不太符合lightum主题，可以在'/source/css/_partial'里建立一个recent_comment.styl文件：
```language
.ds-recent-comments
  li.ds-comment
    &:first-child
      border-top none !important
```
然后在/theme/lightum/source/css/style中将之包括进来：`@import '_partial/recent_comments'`


多说的这个插件同样不兼容于instantclick。我们可以在这篇文章的基础上解决：[click here](/2015/02/25/hexo-speedup-instantclick/):
- 将多说的公共JS放入head或加入'data-no-instant'属性放入body中，并删除recent.ejs与comment.ejs中重复的JS。
- 修改change事件中的代码为：
```
if(typeof DUOSHUO !== 'undefined'){ //support 多说评论框
if($(".ds-thread").length){
    DUOSHUO.EmbedThread($('.ds-thread')[0]);
}
DUOSHUO.RecentComments($('.ds-recent-comments')[0]);
}
```
这样虽然能够解决问题，但是会显示方面又会出现点小问题。可以加入下面css修复：
```language
span.caption{
display: none;
}
```
## 加入文章导航
修改'/layout/_partical/article.ejs'文件
```Html
<article class="<%= item.layout %>">
  // ...
  <div class="entry">
    <% if (item.excerpt && index){ %>
      <%- item.excerpt %>
    <% } else { %>
      <% if (!index){ %>
        // 插入文章导航
        <%- partial('toc') %>
      <% } %>
      <%- item.content %>
    <% } %>
  </div>
</article>
```
在'\source\css\_partial\article.styl'文件后添加：
```language
  .toc-article
    float right
     
  #toc
    background #eee
    margin 0 0 10px 20px
    padding 12px
    line-height 18px
    font-size 10px
    strong
      font-size 15px
    ol
      margin-top 5px
      margin-left 0
    .toc
      padding 0
      li
        list-style-type none
    .toc-child
      padding-left 20px
```
这样，我们就能在写文章的时候添加`toc: true`来启动文章导航功能。
###扩展：浮动式导航
实现当页面滑动到下方时将文章导航浮动到屏幕右侧。

在'\layout\_partial\'里新建文件：`float_nav.ejs`
```Html
<div id="menu-nav">
	<div id="title-nav"><%= __('navigation') %><div>→</div>
	</div>
	<div id="content-nav">
		<%- toc(item.content) %>
	</div>
</div>
<script>
(function($, scrollSpeed, hiddenSpeed, fadeSpeed) {
	var T = $('#toc');
	var M = $('#menu-nav');
	var C = $('#content-nav');
	var Tx = T.position().top;
	$(window).scroll(function() {
		var top = $(this).scrollTop();
		if (top >= Tx + 300) {
			M.stop().fadeIn(fadeSpeed);
			T.stop().fadeTo(fadeSpeed, 0);
		} else {
			M.stop().fadeOut(fadeSpeed);
			T.stop().fadeTo(fadeSpeed, 1);
		}
	});

	$('.toc-link').click(function(e) {
		//阻止默认跳转
		e.preventDefault();
		//定义滚动动画
		var scrollTarget = $('#' + $(this).children('.toc-text').first().text());
		$("html,body").animate({
			scrollTop: scrollTarget.prev().offset().top
		}, scrollSpeed);
	});
	C.click(function(e) {
		e.stopPropagation();
	});
	M.click(function() {
		C.toggle(hiddenSpeed, 'linear', function() {
			var T = $('#title-nav div');
			T.text() == '←' ? T.text('→') : T.text('←');
		});
	});
})(jQuery, 500, 200, 100);
</script>
```
在'layout/_partial/article.ejs'中添加对其的引用：
```Html
<% if(!index && item.toc){ %>
  <%- partial('float_nav') %>
<% } %>
```
添加css样式：
```language
navbcolor=rgba(100, 100, 100, 0.74)
#menu-nav
  position fixed;
  display none;
  cursor pointer;
  z-index 150;
  right 0;
  top 20%;
  box-shadow 0 0 5px rgba(0, 0, 0, 0.15);
  color white;
  background navbcolor;
  #title-nav
    display inline-block;
    vertical-align middle;
    width: 30px;
    height: 100%;
    font-size: 16px;
    text-align: center;
    padding: 10px 0;
  #content-nav
    display inline-block;
    vertical-align middle;
    white-space:nowrap;
    border-left: 1px dashed #ccc;
    box-sizing border-box;
    padding 15px;
    line-height 18px;
    font-size 10px;
    li
      list-style-type none;
      width 100%;
      a
        display block;
        box-sizing border-box;
        color #FFFFFF;
        &:hover
          background rgba(100, 100, 100, 1);
      .toc-child a
        padding-left 20px;
```
###添加"返回顶部"
与上一节相似，在'layout/_widget/'中添加`totop.ejs`文件：
```Html
<div id="to-top">↑</div>
<script>
(function($, scrollSpeed, fadeSpeed) {
	var T = $('#to-top');
	$(window).scroll(function() {
		var top = $(this).scrollTop();
		if (top >= 300) {
			T.stop().fadeIn(fadeSpeed);
		} else {
			T.stop().fadeOut(fadeSpeed);
		}
	});
	T.click(function() {
		$("html,body").animate({
			scrollTop: 0
		}, scrollSpeed);
	});
})(jQuery, 500, 200);
</script>
```
在'lightum/_config.yml'中启用该挂件：
```language
widgets:
- totop
```
添加css样式：
```language
#to-top
  background navbcolor;
  position fixed;
  display none;
  z-index 200;
  right 40px;
  bottom 10%;
  box-shadow 0 0 5px rgba(0, 0, 0, 0.15);
  font-size 14px;
  color white;
  padding 5px 15px;
  cursor pointer;
  font-size 12px;
  text-align center;
  &:hover
    background rgba(100,100,100,1);
```


##参考
- [Hexo 主题修改:为博客实现更多功能](http://deffi.info/2014/10/03/Hexo-%E4%B8%BB%E9%A2%98%E4%BF%AE%E6%94%B9%E4%B8%BA%E5%8D%9A%E5%AE%A2%E5%AE%9E%E7%8E%B0%E6%9B%B4%E5%A4%9A%E5%8A%9F%E8%83%BD/)
- [多说评论也玩圆角头像动画「自定义CSS:无压力小白级教程」](https://luolei.org/duoshuo-css/)
- [Hexo 优化与定制(二)](http://lukang.me/2015/optimization-of-hexo-2.html)
