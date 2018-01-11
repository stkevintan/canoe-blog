---
title: Centos初始化
date: '2017-01-04T00:21:43+08:00'
tags:
  - centos
categories:
  - Linux
---



## 换源

### 备份

```bash
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
```

### 写入国内源(centos 7)

ustc： https://lug.ustc.edu.cn/wiki/mirrors/help/centos

<!--more-->

163：

``` 
# CentOS-Base.repo
#
# The mirror system uses the connecting IP address of the client and the
# update status of each mirror to pick mirrors that are updated to and
# geographically close to the client.  You should use this for CentOS updates
# unless you are manually picking other mirrors.
#
# If the mirrorlist= does not work for you, as a fall back you can try the 
# remarked out baseurl= line instead.
#
#
[base]
name=CentOS-$releasever - Base - 163.com
#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=os
baseurl=http://mirrors.163.com/centos/$releasever/os/$basearch/
gpgcheck=1
gpgkey=http://mirrors.163.com/centos/RPM-GPG-KEY-CentOS-7

#released updates
[updates]
name=CentOS-$releasever - Updates - 163.com
#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=updates
baseurl=http://mirrors.163.com/centos/$releasever/updates/$basearch/
gpgcheck=1
gpgkey=http://mirrors.163.com/centos/RPM-GPG-KEY-CentOS-7

#additional packages that may be useful
[extras]
name=CentOS-$releasever - Extras - 163.com
#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=extras
baseurl=http://mirrors.163.com/centos/$releasever/extras/$basearch/
gpgcheck=1
gpgkey=http://mirrors.163.com/centos/RPM-GPG-KEY-CentOS-7

#additional packages that extend functionality of existing packages
[centosplus]
name=CentOS-$releasever - Plus - 163.com
baseurl=http://mirrors.163.com/centos/$releasever/centosplus/$basearch/
gpgcheck=1
enabled=0
gpgkey=http://mirrors.163.com/centos/RPM-GPG-KEY-CentOS-7
```



### 更新

```bash
yum clean all
yum makecache
```



## 设置代理

```bash
#! /bin/bash
# Author: Kevin Tan
# Update-Date: 2017-1-14
URL=$1
ACTION=('\nSet' '\nDel')
mode=1
if [ -z $URL ]; then
    echo '[Warning]: URL parameter is empty, default action change to remove'
    mode=2
fi
set_proxy(){
  file=$1;prefix=$2;value="$2=$3";
  echo "Set \"$value\" to \"$file\""
  if [ -e "$file" ]; then
    if grep -q "^\s*$prefix" "$file"; then
        sed -i "s#^\s*$prefix=.*#$value#g" $file
    else
        echo $value >> $file
    fi
  fi
}

del_proxy(){
    file=$1;prefix=$2
    echo "Del \"$prefix\" from \"$file\""
    if [ -e "$file" ]; then
        sed -i "/^\s*$prefix=.*/d" $file
    fi
    eval $prefix=""
}

SHELL_NAME=`ps -p $$ | awk 'NR==2 {print $4}'`
echo 'Current shell is '$SHELL_NAME
source_file(){
    ## bash
    if [ "$SHELL_NAME" = "bash" ]; then
        source $HOME'/.bashrc'
    fi
    ## zsh
    if [ "$SHELL_NAME" = "zsh" ]; then
        source $HOME'/.zshrc'
    fi
}

# yum
echo -n ${ACTION[$mode]}' the yum? (y/n/r) ';read F
if [ $F = 'y' ] && [ $mode -eq 1 ]; then
    set_proxy '/etc/yum.conf' 'proxy' $URL
elif [ $F = 'r' ] || ([ $F = 'y' ] && [ $mode -eq 2 ]); then
    del_proxy '/etc/yum.conf' 'proxy'
fi

# environment
echo -n ${ACTION[$mode]}' the environment var?(y/n/r) ';read F
shell_names=(zsh bash)
if [ $F = 'y' ] && [ $mode -eq 1 ]; then
    for name in ${shell_names[@]}; do
        set_proxy "$HOME/.${name}rc" "export http_proxy" $URL
        set_proxy "$HOME/.${name}rc" "export https_proxy" $URL
    done
    source_file
elif [ $F = 'r' ] || ([ $F = 'y' ] && [ $mode -eq 2 ]); then
    for name in ${shell_names[@]}; do
        del_proxy "$HOME/.${name}rc" "export http_proxy"
        del_proxy "$HOME/.${name}rc" "export https_proxy"
    done
fi

#curl
echo -n ${ACTION[$mode]}' the curl proxy alias?(y/n/r) ';read F
shell_names=(zsh bash)
if [ $F = 'y' ] && [ $mode -eq 1 ]; then
    for name in ${shell_names[@]}; do
    	set_proxy "$HOME/.${name}rc" "alias curl" "\"curl -x $URL\""   
    done
    source_file
elif [ $F = 'r' ] || ([ $F = 'y' ] && [ $mode -eq 2 ]); then
    for name in ${shell_names[@]}; do
        del_proxy "$HOME/.${name}rc" "alias curl"
        unalias curl
    done
fi

# kubernetes
echo -n ${ACTION[$mode]}' kube environment var?(y/n/r) ';read F
if [ $F = 'y' ] && [ $mode -eq 1 ]; then
    for name in ${shell_names[@]}; do
        set_proxy "$HOME/.${name}rc" "export KUBERNETES_HTTP_PROXY" $URL
        set_proxy "$HOME/.${name}rc" "export KUBERNETES_HTTPS_PROXY" $URL
        set_proxy "$HOME/.${name}rc" "export KUBE_BUILD_HTTPS_PROXY" $URL
        set_proxy "$HOME/.${name}rc" "export KUBE_BUILD_HTTP_PROXY" $URL
    done
    source_file
elif [ $F = 'r' ] || ([ $F = 'y' ] && [ $mode -eq 2 ]); then
    for name in ${shell_names[@]}; do
        del_proxy "$HOME/.${name}rc" "export KUBERNETES_HTTP_PROXY"
        del_proxy "$HOME/.${name}rc" "export KUBERNETES_HTTPS_PROXY"
        del_proxy "$HOME/.${name}rc" "export KUBE_BUILD_HTTPS_PROXY"
        del_proxy "$HOME/.${name}rc" "export KUBE_BUILD_HTTP_PROXY"
    done
fi

# docker
echo -n ${ACTION[$mode]}' the docker?(y/n/r) ';read F
if type "docker" &>/dev/null && ([ $F = 'y' ] || [ $F = 'r' ]); then
        DOCKER_CONF_DIR='/etc/systemd/system/docker.service.d'
        DOCKER_CONF=$DOCKER_CONF_DIR'/http-proxy.conf'
        REGISTRY="87129800.m.daodocker.io"
        sudo mkdir -p "$DOCKER_CONF_DIR"
        sudo rm -rf $DOCKER_CONF
        if [ $F = 'y' ] && [ $mode -eq 1 ]; then
            printf "[Service]\nEnvironment=" | sudo tee $DOCKER_CONF > /dev/null
            printf "\"HTTP_PROXY=%s\" " $URL | sudo tee -a $DOCKER_CONF > /dev/null
            printf "\"HTTPS_PROXY=%s\" " $URL | sudo tee -a $DOCKER_CONF > /dev/null
            printf "\"NO_PROXY=localhost,%s\"" $REGISTRY | sudo tee -a $DOCKER_CONF > /dev/null
        fi
        sudo systemctl daemon-reload
        sudo systemctl restart docker
        echo "Daemon reloaded"
        systemctl show --property=Environment docker 
fi
```

将上面脚本保持为setproxy，然后执行,注意，如果当前环境下已经有了http_proxy等变量。则需要我们手动reset

```bash
chmod u+x setproxy
source setproxy http://10.100.100.136:4411
```



## 基础建设

### git && gcc

```bash
yum install git gcc
```

### pip

```bash
curl "https://bootstrap.pypa.io/get-pip.py" | python
```

EPEL

```bash
rpm -ivh http://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm 
```



## ZSH

### 安装 & 激活

```bash
yum install zsh
chsh -s /bin/zsh
```


