---
title: KDE4的配置参考
categories:
  - Linux
date: '2014-11-01T04:35:05+08:00'
tags:
  - DE/WM
---

西北工大回来后,时间又充裕了,所以又开始了折腾KDE。

话说KDE的渲染阴影等效果非常接近MacBook。先放几张图：

[![抓图14](http://sforkw-wp.qiniudn.com/jae/uploads/2014/10/抓图14-1024x575.png)](http://sforkw-wp.qiniudn.com/jae/uploads/2014/10/抓图14.png)
<!--more-->
[![抓图15](http://sforkw-wp.qiniudn.com/jae/uploads/2014/10/抓图15-1024x575.png)](http://sforkw-wp.qiniudn.com/jae/uploads/2014/10/抓图15.png) [![抓图18](http://sforkw-wp.qiniudn.com/jae/uploads/2014/10/抓图18-1024x575.png)](http://sforkw-wp.qiniudn.com/jae/uploads/2014/10/抓图18.png)

下面说一下，我的配置过程：

1.  **发行版：**
     我的发行版是Arch，没有Arch强大的AUR，很多桌面的配件很难装上。
2.  **主题：**
     我的plasma主题是Helium与dynamo主题混合而成。标题栏主题是Qtcurve，图标主题是dynamo与flattr混合而成，鼠标主题是Breeze。应用程序主题是Qtcurve，配色是Breeze。这些都可以到[这里下载](http://pan.baidu.com/s/1jGLy3n4)。先安装qtcurve再将下载下来的文件解压并覆盖～/.kde4/share/即可。注意，Qtcurve的配置方案是Breeze，并且在窗口管理器中设置边框大小是无侧边框。
3.  **全局菜单：**
     全局菜单可以先加archlinuxcn源，然后依次用yaourt安装appmenu-qt,appmenu-qt5,appmenu-gtk,kdeplasma-applets-menubar。完成之后在面板上添加刚安装的部件再打开“系统设置&gt;应用程序外观&gt;风格”然后选择微调标签，修改“菜单栏风格”为“仅导出”就能有全局菜单了。
4.  **最大化隐藏菜单栏：**
     最大化隐藏菜单栏可以直接在qtCurve中配置，依然在“窗口管理器”中，勾选“最大化窗口无边框”复选框即可。
5.  **最大化上面板显示窗口控制按钮：**（最后一张图鼠标所指的地方）
     在AUR中安装kdeplasma-applets-kwin-button-improved，然后在面板上重复三次添加这个部件，分别设置为最小化（iconify），最大化/回复（maximize/restore）和关闭（close）就行了。
