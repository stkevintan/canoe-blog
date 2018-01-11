---
title: Centos初始化2
date: '2017-01-04T00:00:00+08:00'
tags:
  - centos
  - tmux
  - prezto
categories:
  - Linux
---

## proxychains-ng

```bash
git clone https://github.com/rofl0r/proxychains-ng
cd proxychains-ng                                 
./configure --prefix=/usr --sysconfdir=/etc 
make
make install
make install-config   # 生成配置文件
echo 'http 10.100.100.136 4411' >> /etc/proxychains.conf  # 输入代理设置
```

<!--more-->

## TMUX

CentOS的版本太老，手动编译最新版本

```bash
yum install ncurses-devel libevent-devel
curl -L https://github.com/tmux/tmux/releases/download/2.3/tmux-2.3.tar.gz | tar xz
cd tmux-2.3
./configure
make
make install
```

如果出现`protocol version mismatch`错误，说明现在tmux正在运行，手动结束掉即可。

```bash
kill -9 `pidof tmux`
```



### theme

```bash
git clone https://github.com/gpakosz/.tmux.git
ln -s -f .tmux/.tmux.conf
cp .tmux/.tmux.conf.local .
vim .tmux.conf.local #编辑配置文件
# 去掉status left/right sections separators后面几行的注释（终端字体需要支持Powerline）
# 启用 force vi mode
```

### shortcuts

```bash
# Session
:new[-s name]  # new session
:kill-session[-t name] # kill session
:ls # list sessions
C-c # new session
s  # list and select sessions
$  # name session

==============================================

# Window
c  # create window
w  # list windows
n  # next window
p  # previous window
f  # find window
,  # name window
&  # kill window

===============================================

# Panes
%  #vertical split
"  # horizontal split
o  # swap panes
q  # show pane numbers
x  # kill pane
+  # 最大化pane，再按一次还原
-  # restore pane from window
⍽  # space - toggle between layouts
q  # (Show pane numbers, when the numbers show up type the key to goto that pane)
{  # (Move the current pane left)
}  # (Move the current pane right)
z  # toggle pane zoom
方向键 # select the sibling pane
C-方向键 # resize current pane

================================================

# Misc
d  # detach
t  # big clock
?  # list shortcuts
:  # prompt
```

### Tmux Plugin Manager && tmux-yank

tmux-yank可以将tmux的paste-buffer中的文字拷贝到系统剪贴板

```bash
yumi xclip # 安装依赖
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm 
vim .tmux.conf # 在最后添加下面几行，注意不是 .tmux.conf.local!!!
```

```bash
# List of plugins
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-yank'

# Initialize TMUX plugin manager (keep this line at the very bottom of tmux.conf)
run '~/.tmux/plugins/tpm/tpm'
```

然后，重新加载tmux，按<prefix> + I 安装`tmux-yank`插件

然后，并不能奏效，因为xclip需要有X服务。然而ssh客户端Centos只是纯命令行。需要开启`X11Forwarding`

## X11Forwarding

1. 在远程Centos中的`/etc/ssh/ssh_config`文件中，添加`X11Forwarding yes`

2. 在远程Centos中安装认证软件：`yumi xorg-x11-xauth`

3. 在本地ssh连接命令添加`-Y`参数

   启用x11转发之后就可以在Centos中启动x11程序了，可以安装轻量级的xfce4-terminal方便操作。

## Prezto

```bash
  git clone --recursive https://github.com/sorin-ionescu/prezto.git "${ZDOTDIR:-$HOME}/.zprezto"
rm -rf .zshrc .zpreztorc .zlogin .zlogout .zprofile .zshenv .zhistory .zcompdump
setopt EXTENDED_GLOB
for rcfile in "${ZDOTDIR:-$HOME}"/.zprezto/runcoms/^README.md(.N); do
  ln -s "$rcfile" "${ZDOTDIR:-$HOME}/.${rcfile:t}"
done

# 主题列表
prompt -l
# 预览主题
prompt -p NAME
# 做个备份
mv .zpreztorc .zpreztorc.tmp
# 添加常用插件(不要第二次运行，而是手动修改.zpreztorc文件)
awk -v s="syntax-highlighting git command-not-found yum history-substring-search autosuggestions" \
'BEGIN{n=split(s,m)}/'\''utility'\''\s+\\/{for(i=1;i<=n;i++)printf("  '\''%s'\'' \\\n",m[i])}{print}' .zpreztorc.tmp > .zpreztorc
# 修改默认主题（推荐 skwp）
sed -i "s/\(zstyle.*theme\s\).*/\1'skwp'/" .zpreztorc
```


Yum Aliases
-------

- `yumc` removes package(s) and leaves.
- `yumi` installs package(s).
- `yumh` displays history.
- `yuml` lists packages.
- `yumL` lists installed packages.
- `yumq` displays package information.
- `yumr` removes package(s).
- `yums` searches for a package.
- `yumu` updates packages.
- `yumU` upgrades packages.


## spf13 Vim

```bash
curl https://j.mp/spf13-vim3 -L > spf13-vim.sh && sh spf13-vim.sh
```

