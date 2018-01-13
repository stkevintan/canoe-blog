---
title: 网易云音乐新API简述
date: '2017-02-08T00:00:00+08:00'
tags:
  - 网易云音乐
  - API
  - Encryption
categories:
  - Web
grammar_cjkRuby: true
---


新API采用了略微修改过的AES和RSA加密，主要用在登陆接口上，对新API进行简单的分析。
## Url
估计会抓包的人都知道，Url中的api便成了weapi。比如手机登录：
原来是：http://music.163.com/api/login/cellphone/
现在是：http://music.163.com/weapi/login/cellphone/

## 加密算法
核心过程如下：
```Javascript
 aesRsaEncrypt = function (text, pubKey, modulus, nonce) {
  const secKey = createSecretKey(16);  // 随机生成16位加密密钥
  return {
	params:  aesEncrypt(aesEncrypt(text, nonce), secKey),
	encSecKey: rsaEncrypt(secKey, pubKey, modulus)
  }
}
```
<!--more-->
```javascript
{
	Text : "JSON.stringify({phone:xxx,password:"md5 hashed Data",rememberLogin:"true"})" //需要加密的post body
	pubKey : "010001"
	nonce : "0CoJUm6Qyw8W8jud"
	modulus : "00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7"
}
```

### 一些细节
1. AES加密的具体算法为:AES-128-CBC，输出格式为base64。
2. AES加密时需要指定iv：`0102030405060708`
3. RSA加密输出为Hex格式，公钥是`{N:modulus,e:pubKey}`
4. 我的Javascript实现：[Crypto](https://github.com/stkevintan/Cube/blob/master/src/model/Crypto.js)
5. RSA算法的JS实现方法参考：<http://www.cnblogs.com/kxdhm/archive/2012/02/02/2336103.html>

