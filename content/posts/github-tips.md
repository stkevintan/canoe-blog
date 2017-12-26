---
title: github使用札记
tags:
  - github
categories:
  - Git
date: '2014-08-10T21:01:03+08:00'
---

1. 生成ssh key:
		ssh-keygen -t rsa -C "stkevintan@foxmail.com"

	输入合适的密码。然后将生成的pub公钥粘贴到github上：[click here](https://github.com/settings/ssh)
2. 版本推送命令：<!--more-->
        ### Create a new repository on the command line

            touch README.md
            git init
            git add README.md
            git commit -m "first commit"
            git remote add origin <span class="js-live-clone-url">https://github.com/stkevintan/资源名.git</span>
            <span class="js-selectable-text">git push -u origin master</span>`</pre>

            ### Push an existing repository from the command line

            <pre>`git remote add origin <span class="js-live-clone-url">https://github.com/stkevintan/资源名.git</span>
            <span class="js-selectable-text">git push -u origin master</span>
3. 修改或删除passphrase。([Details](https://help.github.com/articles/working-with-ssh-key-passphrases/))
		ssh-keygen -p
