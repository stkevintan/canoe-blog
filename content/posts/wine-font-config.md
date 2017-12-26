---
title: 优化Wine程序的字体显示
categories:
  - Wine
date: '2014-10-13T20:42:42+08:00'
tags:
  - linux
---

默认Wine的字体太难看，而且有时候还会显示不出来。开启Wine字体的反锯齿及平滑功能以及将字体映射成文泉驿微米黑的方法是：

1.新建文本文件a.reg，放入如下内容：
<!--more-->
```language
REGEDIT4

[HKEY_CURRENT_USER\Software\Wine\X11 Driver]
"ClientSideAntiAliasWithCore"="Y"
"ClientSideAntiAliasWithRender"="Y"
"ClientSideWithRender"="Y"

[HKEY_CURRENT_USER\Control Panel\Desktop]
"FontSmoothing"="2"
"FontSmoothingType"=dword:00000002
"FontSmoothingGamma"=dword:00000578
"FontSmoothingOrientation"=dword:00000001

[HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\FontSubstitutes]
"Arial Baltic,186"="WenQuanYi Micro Hei"
"Arial CE,238"="WenQuanYi Micro Hei"
"Arial CYR,204"="WenQuanYi Micro Hei"
"Arial Greek,161"="WenQuanYi Micro Hei"
"Arial TUR,162"="WenQuanYi Micro Hei"
"Courier New Baltic,186"="WenQuanYi Micro Hei"
"Courier New CE,238"="WenQuanYi Micro Hei"
"Courier New CYR,204"="WenQuanYi Micro Hei"
"Courier New Greek,161"="WenQuanYi Micro Hei"
"Courier New TUR,162"="WenQuanYi Micro Hei"
"Helv"="WenQuanYi Micro Hei"
"Helvetica"="WenQuanYi Micro Hei"
"MS Shell Dlg"="WenQuanYi Micro Hei"
"MS Shell Dlg 2"="WenQuanYi Micro Hei"
"Tahoma"="WenQuanYi Micro Hei"
"Times"="WenQuanYi Micro Hei"
"Times New Roman Baltic,186"="WenQuanYi Micro Hei"
"Times New Roman CE,238"="WenQuanYi Micro Hei"
"Times New Roman CYR,204"="WenQuanYi Micro Hei"
"Times New Roman Greek,161"="WenQuanYi Micro Hei"
"Times New Roman TUR,162"="WenQuanYi Micro Hei"
"Tms Rmn"="WenQuanYi Micro Hei"
"Simsun"="WenQuanYi Micro Hei"
```

2.如果是普通的wine直接终端输入wine regedit打开注册表编辑器。然后点击“注册表—&gt;导入注册表文件"导入该文件。

3.如果是longene等封装好的wine（比如tm2013）可以使用tm2013 -reg命令打开注册表。

