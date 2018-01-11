---
title: JS DOM API分析
date: '2016-11-03T05:07:21+08:00'
categories:
  - Web
tags:
  - javascirpt
  - dom
  - html
---

## Element.classList
返回DOMTokenList,IE version>=10不完全支持。
1. 不支持classList.contains的第二个参数(force)
2. add和remove方法不支持多参数
3. SVG,MathML结点没有classList属性

<!--more-->
## Node种类
### Node.nodeName
|Interface|nodeName|
|:---------|:--------|
|Comment|#comment|
|Document|#document|
|DocumentFragment|#document-fragment|

## Node的树遍历
Node树遍历普遍要考虑空白文字结点。(whitespace textNode)。
### Node.childNodes
返回一个NodeList，表示该结点的所有子结点，包括文字结点和注释，该NodeList里面全部是object，并没有string。可以使用ParentNode.children来获得所有纯Element结点集合。
### Node.firstChild
返回结点的第一个子结点。可能是whitespace textNode。
可以使用Element.firstElementChild来获得Element结点。
### Node.lastChild
返回结点的最后一个子结点。可能是whitespace textNode。
可以使用Element.lastElementChild来获得Element结点。
### Node.nextSibling
返回下一个兄弟结点，可能是whitespace textNode。可以使用Element.nextElementSibling获得Element结点。
### Node.previousSibling
返回前一个兄弟结点，可能whitespace textNode。可以使用Element.previousElementSibling获得Element结点。

## Node.innerText
是一个非标准的属性，返回当前结点包括其子结点的所有文字。可以使用标准方法Node.textContent代替。
## Node.textContent
## Node.parentElement
返回当前Node的父Element元素，如果没有父Element元素，返回null。
## Node.parentNode
一个元素的parentNode可能是另一个元素、Document或者DocumentFragment。
Document和DocumentFragment的parentNode是null，同样，一个刚刚创建的node，如果还没有加到dom树里面，它的parentNode同样是null。
```javascript
//移除某element：
ele.parentNode.removeChild(ele);
```
