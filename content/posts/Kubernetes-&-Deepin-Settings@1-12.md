---
title: Deepin初始化
date: '2017-01-12T00:00:00+08:00'
tags:
  - deepin
  - ppa
  - octotree
  - infinality fonts
categories:
  - Linux
---



## Infinality and Harfbuzz

会发生冲突，这是今天Archlinux无法启动输入法界面的元凶。重新安装freetype2\fontconfig\cairo以替换infinality-bundle。



## 添加PPA出现GPG问题

#### 问题：

```bash
gpg: keybox '/tmp/tmpyiw6jvck/pubring.gpg' created
gpg: /tmp/tmpyiw6jvck/trustdb.gpg：建立了信任度数据库
gpg: 密钥 531EE72F4C9D234C：公钥“Launchpad webupd8”已导入
gpg: 合计被处理的数量：1
gpg:           已导入：1
gpg: 找不到有效的 OpenPGP 数据。
```
<!-- more -->


#### 可能原因：

keyserver.ubuntu.com使用非标准的11371端口，而一般公司的防火墙都屏蔽掉了该端口，而允许标准的80端口。

#### 解决方法：

```bash
sudo apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 531EE72F4C9D234C
# 或者
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E985B27B
```



## Telnet

需要安装server的

```bash
# ubuntu
sudo apt install telnetd
sudo systemctl start inetd
sudo systemctl enable inetd
# arch
sudo systemctl start telnet.socket
sudo systemctl enable telnet.socket
```

使用telnet测试端口是否打开：

```bash
telnet localhost 33171
```



## Github Online File Tree View Plugin

[Octotree](https://github.com/buunguyen/octotree)



