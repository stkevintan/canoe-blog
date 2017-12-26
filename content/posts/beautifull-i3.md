---
title: 体验I3之美
categories:
  - Linux
tags:
  - gnome
  - i3wm
date: '2017-03-20T00:00:00+08:00'
grammar_cjkRuby: true
---
![enter description here][1]
先晒张日常桌面图。Gnome3用了半年了一直被其蹩脚的交互和层出不穷的Bug所折磨。虽然Gnome3很漂亮，很简洁，但是毕竟漂亮不能当饭吃。套餐这种东西虽然简单省事，但是终究不是为你所量身定制的，总有其中一样不合你口味。因此，我决定再次抛弃“开箱即用”的DE(Desktop Environment)，在WM(Window Manager)的基础上自己打造一套适合自己的桌面环境。
<!-- more -->
## i3WM
i3是一个比较知名的平铺式的窗口管理器（TilingWM），它可以通过快捷键来管理程序窗口，使他们像截图那样平铺在显示屏幕，控制他们的大小和位置。十分高效也有几分Geek的味道。  
i3的所有配置全部使用shell写成，甚至顶部panel的各种指示器，都由用户自己写的bash脚本获得并显示。十分简单暴力。虽然没有图形界面那么直观，但是有一种一切尽在自己掌控之下的感觉。这种感觉其实是十分十分不错的。  
我的I3WM配置文件托管在了[Github][2]。
## 配置细节
I3配置文件的语法其实跟shell差不多，熟悉Linux的用户应该都能完全看懂。我的配置文件分为几大模块：
### Workspaces
工作区配置，我根据日常使用的程序类别一共设置了10个工作区(图标显示需要在本地电脑上安装Fontawesome字体）：
```bash
set $ws1 	     "1: Browser"
set $ws2         "2: Code"
set $ws3 		 "3: Chat"
set $ws4 		 "4: File"
set $ws5 		 "5: Terminal"
set $ws6 		 "6: Video"
set $ws7 	     "7: Music"
set $ws8  	     "8:  Graphic"
set $ws9 		 "9: Game"
set $ws0 		 "0: Fullscreen"
```
然后，把属于各自类别的程序绑定到对应的工作区，这样打开这些程序的时候他们就能自动出现在合适的工作区了：
```bash
assign 	[class="google-chrome-stable"] 			$ws1   # Browser
assign 	[class="vivaldi"] 						            $ws1   # Browser
assign 	[class="firefox"] 					            	$ws1   # Browser
assign  [class="(?i)code"]                                $ws2   # Code IDE
# ...
assign  [class="dota2"]         		                   $ws0   # Fullscreen
assign	[class="Minecraft 1.8.9"]		              $ws0   # Fullscreen
```
### Application
在i3配置文件里面我们可以对常用的程序绑定快捷启动键：
```bash
bindsym F10 exec xfce4-appfinder
bindsym Print exec xfce4-screenshooter

# bindsym $mod+Return exec i3-sensible-terminal
bindsym $mod+Return exec pantheon-terminal

bindsym $mod+Control+t exec telegram-desktop
bindsym $mod+Control+g exec google-chrome-stable
bindsym $mod+Control+v exec vivaldi
bindsym $mod+Control+f exec nemo
bindsym $mod+Control+c exec code
bindsym $mod+Control+n exec nitrogen
bindsym $mod+Control+w exec electronic-wechat
bindsym $mod+Control+y exec youdao-dict
```
然后，对于特殊的不适合平铺的窗口，可以直接设置它们为浮动窗口：
```bash
for_window [class="Geany"] floating enable border normal
for_window [class="GParted"] floating enable border normal
for_window [class="Nitrogen"] floating enable border normal
for_window [class="(?i)virtualbox"] floating enable border normal
for_window [class="Youdao Dict"] floating enable border normal
# ...
```
PS：可以使用`xprop|grep WM_CLASS`来查看正在运行窗口的class名称。
### i3blocks
i3blocks是I3顶部面板的一个可选组件。它使用ini格式的配置文件，支持多种终端脚本，还支持鼠标点击、滚动事件，十分强大。配置文件样本如下：
```ini
command=~/.config/i3/blocks/$BLOCK_NAME
align=center
color=#ffffff
separator=true
separator_block_width=13
markup=pango

[disk-home]
label=
command=~/.config/i3/blocks/disk $HOME
instance=/home/kevin
interval=30
color=#FFCC80

[weather]
instance=1808926 # hangzhou's city code
interval=60
color=#90CAF9

# ...
```
主要字段解释：
- 首先前面无section的parameters属于默认配置项，为每个section的缺省配置。  
- 然后每个section都对应顶栏上面的一个指示器，称为block。  
- 每个block必须显示一定的数据，可以通过command配置项指定获取数据的命令，并使用interval来设置命令执行周期间隔。
- instance为可以传递到command脚本中的环境变量。
- color和label为颜色和标签，属于修饰性的配置项。

所有可用的block命令可以参考我的配置文件夹：[blocks][3]

### compton
compton可以给i3带来透明和阴影效果的支持。如果只关心性能而不介意美观与否，你完全可以跳过此节。
compton默认是不给顶栏加透明效果的，需要加入如下配置：
```
wintypes:
{
    dock = 
    { 
        opacity = 0.8;        
    };
};
```
同时，compton的阴影效果不适用于某些窗口，需要排除它们：
```
shadow-exclude = [
    "name = 'Notification'",
    "name *= 'compton'",
    "class_g = 'Conky'",
    "class_g = 'Firefox'",
    "class_g *= 'fcitx'",
    "class_g = 'Youdao Dict'"
];
```
## 易用性建议
i3WM只是一个地基，我们可以在这之上搭建一个适合自己的环境。每个人的口味都不一样，所以我简单的罗列一下我个人比较喜欢的应用和配置以供参考。
- dmenu: WM下使用最广泛的应用启动器，可以自动根据用户输入的命令进行提示。
- rofi: dmenu的替代品
- quickswitch.py:  跨工作区窗口快速跳转工具，可以整合到dmenu中。
-  xfce4-appfinder:  xfce4的应用程序列表。能够自动搜索文件系统中的desktop文件，并生成应用列表。非常实用的工具。
-  pantheon-terminal: elementaryOS的默认终端。小巧，依赖少，支持背景透明、多标签，很完美的终端模拟器。（需要使用dconf-editor来修改设置，位置：`/org/pantheon/terminal/settings/`）
-  nemo: linuxmint的默认文件管理器，forks自nautilus，但是比nautilus好用得多。（使用之前需要使用dconf-editor设置`/org/nemo/desktop/show-desktop-icons`为`false`）
-  nitrogen: 提供简单的图形界面来设置壁纸并在每次开机之后自动恢复。
- clipit: 剪贴板支持
- lightdm: 轻量级图形登录界面



  [1]: https://ol1kreips.qnssl.com/%E6%88%AA%E5%9B%BE_2017-03-13_18-50-11.png "截图_2017-03-13_18-50-11"
  [2]: https://github.com/stkevintan/i3dotfile
  [3]: https://github.com/stkevintan/i3dotfile/tree/master/blocks
