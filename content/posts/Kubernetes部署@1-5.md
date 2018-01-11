---
title: Kubernetes部署
date: '2017-01-04T00:00:00+08:00'
tags:
  - meow
  - docker
  - kubernetes
categories:
  - Cloud Computing
---



## MEOW

安装

```bash
curl -L git.io/meowproxy | bash
# 建议安装目录 /usr/bin/
```

复制自己的配置文件

```bash
# in local computer
xclip -sel clipboard < ~/.meow/rc
# in CentOS server
mv ~/.meow/rc ~/.meow/rc.bak
xclip -o -sel clipboard > ~/.meow/rc
```

<!--more-->

运行

```
MEOW
```



## Hostname

执行下面脚本。**不要执行多次** 如果出错则手动修改

```bash
sed -i s/localhost\.localdomain/NAME/g /etc/hosts /etc/hostname 
hostname="10-10-103-144.node"
rm -rf /etc/hostname
echo $hostname > /etc/hostname 
sed -i "s/\slocalhost\s/ localhost $hostname /g" /etc/hosts
sysctl kernel.hostname=$hostname
```

## Screenfetch

```bash
curl -L https://raw.githubusercontent.com/KittyKatt/screenFetch/master/screenfetch-dev -o /usr/bin/screenfetch
```

## AWK简述

```bash
awk -v var1=xxx BEGIN{[something]} [ifstatments or regex]{something match the condition}{[always run]}END{[something]}
# 支持if else,for,i++
# 支持数组（支持for in遍历，但是顺序会打乱）
# 最好的批量初始化的方式： 
arr[""]=0 # 批量设为0
str="a b c"; split(str,arr[," "]);# ["a","b","c"]
```



## 加Kubernetes源

```Bash
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=http://yum.kubernetes.io/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
EOF
```

## 安装Kubernetes

```bash
yum install docker kubelet kubeadm kubectl kubernetes-cni
```

## 启动进程&关闭防火墙

```bash
systemctl start docker
systemctl start kubelet
systemctl enable docker 
systemctl enable kubelet 
systemctl stop firewalld
systemctl disable firewalld
```



## Tear Down(当kubeadm init失败时执行) 

```bash
kubeadm reset && systemctl start kubelet
```



## Pull Docker Images

**此方式十分艰难。后面可以通过代理直接安装。见Tech Log@1-12**

```bash
#! /bin/bash
declare -a images=(
    'dnsmasq-metrics-amd64:1.0'
    'etcd-amd64:3.0.14-kubeadm'
    'exechealthz-amd64:v1.2.0'
    'kube-apiserver-amd64:v1.5.1'
    'kube-controller-manager-amd64:v1.5.1'
    'kube-discovery-amd64:1.0'
    'kube-dnsmasq-amd64:1.4'
    'kube-proxy-amd64:v1.5.1'
    'kube-scheduler-amd64:v1.5.1'
    'kubedns-amd64:1.9'
    'kubernetes-dashboard-amd64:v1.5.0'
    'pause-amd64:3.0'
#   'weave-kube:1.8.1'
#   'weave-npc:1.8.1'
)
for imageName in ${images[@]}; do
    docker pull stkevintan/$imageName
    docker tag stkevintan/$imageName gcr.io/google_containers/$imageName
    docker rmi stkevintan/$imageName
done
```

```bash
xclip -o -sel clipboard > pull_docker
chmod +x pull_docker
./pull_docker
```



## 初始化（Master）

```bash
# 首先需要使用@17-1-3的脚本设置代理。
# Del environment
# Set curl
# Set kube env
# Set docker
# 在/etc/default/docker的DOCKER_OPTS中加入:--insecure-registry gcr.io
root@10-10-103-144 ~ $ kubeadm init
[kubeadm] WARNING: kubeadm is in alpha, please do not use it for production clusters.
[preflight] Running pre-flight checks
[init] Using Kubernetes version: v1.5.2
[tokens] Generated token: "c30875.954dc1dda4d0184b"
[certificates] Generated Certificate Authority key and certificate.
[certificates] Generated API Server key and certificate
[certificates] Generated Service Account signing keys
[certificates] Created keys and certificates in "/etc/kubernetes/pki"
[kubeconfig] Wrote KubeConfig file to disk: "/etc/kubernetes/kubelet.conf"
[kubeconfig] Wrote KubeConfig file to disk: "/etc/kubernetes/admin.conf"
[apiclient] Created API client, waiting for the control plane to become ready
[apiclient] All control plane components are healthy after 16.391731 seconds
[apiclient] Waiting for at least one node to register and become ready
[apiclient] First node is ready after 0.509209 seconds
[apiclient] Creating a test deployment
[apiclient] Test deployment succeeded
[token-discovery] Created the kube-discovery deployment, waiting for it to become ready
[token-discovery] kube-discovery is ready after 3.505676 seconds
[addons] Created essential addon: kube-proxy
[addons] Created essential addon: kube-dns

Your Kubernetes master has initialized successfully!

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
    http://kubernetes.io/docs/admin/addons/

You can now join any number of machines by running the following on each node:

kubeadm join --token=c30875.954dc1dda4d0184b 10.10.103.144
```





## 初始化（Node）

```bash
# 需要在子节点上安装kubelet kubectl kubernetes-cni kubeadm
# 需要使用@17-1-3的脚本设置代理。
# Del environment
# Set curl
# Set kube env
# Set docker
# 在/etc/default/docker的DOCKER_OPTS中加入:--insecure-registry gcr.io
systemctl enable kubelet
systemctl start kubelet

kubeadm join --token=ace10c.73fcdec44f7a4045 10.10.103.146
```

可以在master节点上看到该子节点：

```bash
root@master ~ $ kubectl get node
NAME      STATUS         AGE
master    Ready,master   5d
node1     Ready          1m
```



## Weave Network

```bash
# download config file
curl -L https://git.io/weave-kube -o weave-kube.yaml
# pull docker image
docker pull stkevintan/weave-kube:1.8.1
docker tag stkevintan/weave-kube:1.8.1 weaveworks/weave-kube:1.8.1
docker rmi stkevintan/weave-kube:1.8.1
# create
kubectl create -f weave-kube.yaml
# 或者
kubectl create -f https://git.io/weave-kube
```

可以看到结果：

```bash
root@master ~ $ kubectl get pod --namespace=kube-system
NAME                              READY     STATUS              RESTARTS   AGE
dummy-2088944543-bv5gj            1/1       Running             0          5d
etcd-master                       1/1       Running             0          5d
kube-apiserver-master             1/1       Running             27         5d
kube-controller-manager-master    1/1       Running             0          5d
kube-discovery-1769846148-xbm2h   1/1       Running             0          5d
kube-dns-2924299975-phn03         0/4       ContainerCreating   0          5d
kube-proxy-081gt                  1/1       Running             0          5d
kube-proxy-qc40l                  1/1       Running             0          1h
kube-scheduler-master             1/1       Running             1          5d
weave-net-4wvkm                   0/2       ContainerCreating   0          30s
weave-net-l7dh0                   0/2       ContainerCreating   0          30s
```



## Dashboard

```bash
 curl -L https://rawgit.com/kubernetes/dashboard/master/src/deploy/kubernetes-dashboard.yaml -o kubernetes-dashboard.yaml
 
 sed -i 's/v1.5.1/v1.5.0/g' kubernetes-dashboard.yaml # 注意此时gcr上面并没有v1.5.1
 sed -i 's/Alaways/IfNotPresent/g' kubernetes-dashboard.yaml
 
 kubectl create -f kubernetes-dashboard.yaml
 
 kubectl create -f https://rawgit.com/kubernetes/dashboard/master/src/deploy/kubernetes-dashboard.yaml
```



## Delete Pod

```bash
kubectl delete -f xxx.yaml
```

