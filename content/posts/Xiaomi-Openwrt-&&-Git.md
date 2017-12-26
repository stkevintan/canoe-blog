---
title: Tech Daily@1-20
date: '2017-01-20T00:00:00+08:00'
tags:
  - openwrt
  - git
  - go
categories:
  - Tech Daily
---

小米路由器mini（Xiaomi mini R1CM）刷Openwrt

```bash
scp /path/to/PandoraBox-xxxx.bin root@192.168.1.1:/tmp/PandoraBox.bin
mtd -r write /tmp/PandoraBox.bin firmware
```



> 從爬文中得知，小米路由器Mini 官方韌體是雙系統，由於 ROM 有16MB，官方韌體都小於8MB，所以會有一份備援系統（8MB+8MB），因此如果刷了大於 8MB 的第三方韌體的話，會覆蓋掉第二個分區的系統，導致未來刷回官方韌體時會有掉 SN 的問題，而且再也無法刷入 SSH，從此以後就只能乖乖用官方韌體，再也不能玩刷機，目前新版的 PandoraBox 韌體大約都在 10MB 左右，所以刷機還真要有點決心，除非完整備份小米路由器Mini 中所有分區的資料，才能在日後完整刷回官方韌體，當然，如果已經完全放棄官方韌體的話，這些問題都是不用考慮的。from -  http://blog.icece.tw/MiWiFi-Mini-Flash-uboot



## Disable middle button of mouse

Execute those commands:

```bash
xinput list
⎡ Virtual core pointer                    	id=2	[master pointer  (3)]
⎜   ↳ Virtual core XTEST pointer              	id=4	[slave  pointer  (2)]
⎜   ↳ MI Dongle MI Wireless Mouse             	id=11	[slave  pointer  (2)]
⎜   ↳ MI Dongle MI Wireless Mouse             	id=12	[slave  pointer  (2)]
⎜   ↳ DLL0704:01 06CB:76AE Touchpad           	id=14	[slave  pointer  (2)]
⎜   ↳ PS/2 Synaptics TouchPad                 	id=17	[slave  pointer  (2)]
⎜   ↳ MiMouse                                 	id=21	[slave  pointer  (2)]

xinput set-button-map 21 1 0 3
```
<!--more-->
### **Explaination** 

The first number is the id of the pointer (you'll often only have one, in this case there were two, 9 and 10).

The next numbers are what you do with the first, second, and third (ie, left, middle, right) mouse buttons. The "1 0 3" tells it that the left button should do a left click (action 1), the middle button should do nothing, and the right button should do a right click (action 3). If you want to make the middle button also do a left click you could use "1 1 3". If you wanted to switch the right and left actions you could use "3 0 1". See [https://wiki.ubuntu.com/X/Config/Input](https://wiki.ubuntu.com/X/Config/Input) for more info.



## git merge

```bash
git merge <特性分支> # 将特性分支合并到当前分支中，形成一个新的提交
```



## git rebase

```bash
git rebase <主分支> [<特性分支>] # 在主分支的基础上重演特性分支的修改，修改特性分支的历史（变基）
git rebase --onto master server client # 取出client分支，将client和server的共同祖先之后的变化在master上重演一遍
```

> [git-scm reference](https://git-scm.com/book/zh/v1/Git-%E5%88%86%E6%94%AF-%E5%88%86%E6%94%AF%E7%9A%84%E8%A1%8D%E5%90%88)



## Vscode Go	

设置GOPATH（为~/go-workspace）

```bash
cat > ~/.zshrc <<"EOF"
# Set Go Path
export GOPATH=$HOME/go-workspace
# Customize to your needs...
export PATH=$PATH:$GOPATH
EOF
```

在vscode中设置：打开用户设置，设置`go.gopath`

安装插件：`Go`

安装依赖：(事先设置好`http_proxy`和`https_proxy`)
```bash
go get -u -v github.com/nsf/gocode
go get -u -v github.com/rogpeppe/godef
go get -u -v github.com/golang/lint/golint
go get -u -v github.com/lukehoban/go-find-references
go get -u -v github.com/lukehoban/go-outline
go get -u -v sourcegraph.com/sqs/goreturns
go get -u -v golang.org/x/tools/cmd/gorename
```

