---
date: "2017-12-11T16:47:26+08:00"
title: "ZJU校园网Openwrt路由器设置"
categories: 
  - Openwrt
tags:
  - IPv6
  - PT




typora-root-url: ../..
typora-copy-images-to: ../../pimg
---


## Why

学校这边上网每次都要输入账号，有登陆设备数量限制，玉泉这边还要申请静态IP地址，每人只能申请两个，申请下来还需要隔天才能生效……真的是有多不方便就多不方便。不过还好，学校的上网协议是标准的L2TP VPN认证，这几天想着把压箱底的小米路由器mini拿出来试一试看看能不能的openwrt上拨VPN然后分享出来。



## 刷机

{{<admonition type="warning">}}

刷机有变砖的风险，最好先刷入breed 或 uboot做一层保护

{{</admonition>}}

<!--more-->
路由器原来我就刷了的Pandorabox，但是现在拿出来看发现它的官网和软件源因为没有备案都被和谐掉了，版本也一直没有变化，也许作者本身精力都放到newifi上面去了吧。想想还是弃坑了。
于是决定刷入原生的openwrt，然而重启后久久未见openwrt字样的wifi名，用有线连接进去手动开启wifi也是失败了。猜测是驱动的原因，遂再次弃坑。
最后翻了一下openwrt的wiki，发现lede上面有针对这款路由器的补丁，上官网看了看，最近更新在17年10月，感觉开发还挺活跃的，于是又将路由器刷成了lede。刚开始也没有wifi，不过使用有线进入管理界面后可以成功开启两个频道（2.4g和5g,默认都叫LEDE）。


## 联网
刷好机之后直接面临一个比较严重的问题：如何在没网的情况下在路由器上安装l2tp协议包。这个说起来有点死锁的味道了。首先常规的方法是把xl2tpd这个包以及其所有依赖都下载到本地，然后scp到路由器中，在ssh里面使用opkg命令手动安装。这个比较麻烦，我最后的解决方法是通过手机分享wifi，然后让路由器当作一个Client接入，这样路由器就能通过手机热点连上网了。
直接在luci管理界面里面安装xl2tpd这个包之后我们就能够顺利拨l2tp vpn了。



## IPv6
IPv6可谓是校园网的一大福利了。IPv6是没有IPv4的nat概念的。因此如何通过路由器给所有终端设备提供可用的IPv6连接是一个问题。Google到了一篇不错的[文章](http://blog.kompaz.win/2017/02/22/OpenWRT%20IPv6%20%E9%85%8D%E7%BD%AE/)

>OpenWRT在默认情况下，会分配一个IPv6私网地址段，登录网页管理，在Network->Interfaces页面底下有Global network options->IPv6 ULA-Prefix这里应该有一个随机的fd开头的/64IPv6地址段，清空该地址并保存
>SSH登录路由器，修改/etc/config/dhcp文件，添加如下部分，使用无状态地址自动配置（SLAAC）IPv6，不使用DHCPv6。
>
>       config dhcp 'lan'
>           option dhcpv6 'disabled'
>           option ra 'relay'
>           option ndp 'relay'
>       config dhcp 'wan6'
>           option interface 'wan'
>            option dhcpv6 'disabled'
>            option ra 'relay'
>            option ndp 'relay'
>            option master '1'


## NexusHD 校内PT网站
NexusHD只对浙大校园开放，里面的资源非常非常多而且速度也非常快。下面是我的一些配置流程：

1. **安装** ：`transmission-daemon-openssl` `transmission-remote-openssl`和`luci-app-transmission`
2. **端口映射** ：设置transmission的Peer Port为51413，然后在防火墙里面打开51413端口以及转发wan的51413端口到lan上。
3. **外接硬盘** ：插入并挂载一块移动硬盘(使用`blkid`查看硬盘的UUID)，由于是NTFS格式的所以需要安装`ntfs-3g`,千万别看错了，`ntfs`只能只读挂载。
4. **samba服务** ：安装`luci-app-samba` 和`samba36-server`提供samba服务。这样我们就可以在任何联网设备中远程观看transmission下载下来视频了。


另外如果连着VPN的话，校内网站也是走的VPN流量，这样PT下载速度不仅受限于你当前的上网套餐也会影响到你的正常的上网速度。每次PT下载的时候都断开VPN太过于麻烦了，因此我们需要直接针对内网IP设置静态路由。  
在`/etc/config/network`里面加入：

```
config route
        option target '10.0.0.0'
        option netmask '255.0.0.0'
        option gateway '10.110.64.1'
        option interface 'wan'
        option metric '1'

config route
        option target '210.32.0.0'
        option netmask '255.255.240.0'
        option gateway '10.110.64.1'
        option interface 'wan'
        option metric '1'

config route
        option interface 'wan'
        option target '210.32.128.0'
        option netmask '255.255.192.0'
        option gateway '10.110.64.1'
        option metric '1'

config route
        option interface 'wan'
        option target '222.205.0.0'
        option netmask '255.255.128.0'
        option gateway '10.110.64.1'
        option metric '1'

config route
        option interface 'wan'
        option target '58.206.0.0'
        option netmask '255.255.0.0'
        option gateway '10.110.64.1'
        option metric '1'

config route
        option target '58.196.192.0'
        option netmask '255.255.224.0'
        option gateway '10.110.64.1'
        option interface 'wan'
        option metric '1'

config route
        option target '58.196.224.0'
        option netmask '255.255.240.0'
        option gateway '10.110.64.1'
        option interface 'wan'
        option metric '1'

config route
        option interface 'wan'
        option gateway '10.110.64.1'
        option target '222.205.46.0'
        option netmask '255.255.254.0'
        option metric '1'

config route
        option interface 'wan'
        option target '222.205.48.0'
        option netmask '255.255.248.0'
        option gateway '10.110.64.1'
        option metric '1'

config route
        option interface 'wan'
        option target '222.205.56.0'
        option netmask '255.255.252.0'
        option gateway '10.110.64.1'
        option metric '1'

config route
        option interface 'wan'
        option target '210.32.160.0'
        option netmask '255.255.248.0'
        option gateway '10.110.64.1'
        option metric '1'
```


## Bug#1 DNS解析异常
遇到最折腾人的bug是始终不能使用域名来访问内网的网站，只能使用ip地址。明眼人一看就是dns的问题嘛。但是折腾来折腾去，发现dns服务没有配置错啊。最后终于通过Google找到了我的答案：去掉“重定向保护 丢弃 RFC1918 上行响应数据"（DNS rebind protect）就行了。

## Bug#2 VPN自动断线
用上后不久发现VPN还会时不时自动断线，cc98里面也有人反馈。应该是学校网络的原因。因此我写了一个脚本来自动检查并配置：
```bash
#!/bin/sh
ifname=vpn

CONNECT(){
  if_state=`ifconfig | grep l2tp`
  if [ -z "$if_state" ]; then
    logger -t "vpn-guard" "Try to reconnect $1"
    ifup $1
    sleep 10
    return 0
  fi
  return 1
}

if [ ! -f "tmp/vpn_status_check.lock" ]; then
  touch /tmp/vpn_status_check.lock
  CONNECT $ifname && /etc/init.d/odhcpd restart
  rm /tmp/vpn_status_check.lock
fi
```
然后在crontab计划任务里面加入下面一行，就能让crontab每分钟都检查执行一次该脚本了。
```bash
* * * * * /etc/vpn-guard.sh >/dev/null 2>&1
```

## Bug#3 视频等有规律卡顿
如果不是视频/音频这种大流量的联网活动，网速非常好。但是一到看视频无论高清还是流畅都会隔段时间卡一下。这个问题很玄学，我同学一年都没有解决。不过我还是Google到了原因：因为学校的VPN的MTU值跟正常值不一致。（曾经也遇到过这个问题）在VPN接口里把默认的MTU改为1400就完美了。
