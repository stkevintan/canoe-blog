---
title: "Service Wroker Precache Zh"
date: 2018-01-13T19:01:21+08:00
tags: 
  - Service Worker
categories: 
  - Web
draft: true
---

Service Worker Precache是一个可以生成能够缓存资源的Service Worker的模块。他跟你的构建流程集成在一起。一旦配置好，他能够检测你所有的静态资源（HTML，Javascript，CSS，图片等等）根据文件内容生成对应的哈希值。文件路径和版本哈希这些信息都被储存在生成的Service Worker文件中，根据缓存优先（cache-first）的策略来服务这些文件且当后续构建过程中检测到内容变后会自动更新。



对本地静态资源实行缓存优先（cache-first）服务策略意味着你可以在屏幕上立即获取这些重要的部分（App Shell）而不用等待任何网络回应。



这个模块能够在基于js上的构建脚本使用。比如`gulp` ，同时他也提供了一个[命令行接口](https://github.com/GoogleChromeLabs/sw-precache#command-line-interface)（CLI）。你能直接使用这个模块，也能使用一些基于特定构建环境下的[包装组件](https://github.com/GoogleChromeLabs/sw-precache#wrappers-and-starter-kits) 像`webpack` 。



他能够与[sw-toolbox](https://github.com/GoogleChrome/sw-toolbox)库[同时使用](https://github.com/GoogleChromeLabs/sw-precache/blob/master/sw-precache-and-sw-toolbox.md)，提供一个App Shell + Dynamic Content模型。

