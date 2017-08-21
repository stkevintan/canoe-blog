+++
date = "2017-07-02T22:52:21+08:00"
title = "Polymer 2.0 文档笔记(3) Events"
tags = ["Polymer"]
categories = ["Web"]
+++
## Normal Events

>Polymer elements can use the standard DOM APIs for creating, dispatching, and listening for events. 
Polymer also provides annotated event listeners, which allow you to specify event listeners declaratively as part of the element's DOM template. 

### Add annotated event listeners 
这个其实就是在标签上使用on-event属性。 
```html
<dom-module id="x-custom"> 
  <template> 
    <button on-click="handleClick">Kick Me</button> 
  </template> 
  <script> 
    class XCustom extends Polymer.Element { 
 
static get is() {return 'x-custom'} 
 
handleClick() { 
console.log('Ow!'); 
} 
} 
customElements.define(XCustom.is, XCustom); 
     </script> 
</dom-module> 
```
需要注意的有： 

1. 如果添加了手势事件则应当使用`on-tap`事件代替`on-click`事件，提供更好的移动浏览器支持。 
2. 因为html属性的限制，所有的事件名称都将转化为小写字母。(To avoid confusion, always use lowercase event names. )
 
### Add and remove listeners imperatively 
直接使用原生的`addEventListener`和`removeEventListener` 
 
### Fire custom events 
直接使用原生的`CustomEvent`和`dispatchEvent` 
 
## Event Retargeting

1. 为了保持ShadowDOM的隐蔽性。元素内部ShadowDOM触发的一些事件在网上传播时会将target重定向到当前元素。 
2. `event.composedPath()` : 包含事件传递过程中所经过的nodes路径列表。  

自定义的事件默认无法穿透ShadowDOM边界。可以如下设置： 
```javascript
var event = new CustomEvent('my-event', {bubbles: true, composed: true});
```

## Gesture Events 
 
手势事件的支持是基于Legacy Element的，如果使用Polymer2的class风格定义需要使用mixin:`Polymer.GestureEventListeners`
```html
<link rel="import" href="polymer/lib/mixins/gesture-event-listeners.html"> 
 
<script> 
    class TestEvent extends Polymer.GestureEventListeners(Polymer.Element) { 
      ... 
</script> 
```
注册事件也有两种方式： 
1. 支持on-event形式的声明方式 
2. 显示定义的方式：`Polymer.Gestures.addListener(this, 'tap', e => this.tapHandler(e)); `
 
 
包含以下几种手势事件，包含在e.detail中。 

- down—finger/button went down 
  - `x`—clientX coordinate for event 
  - `y`—clientY coordinate for event 
  - `sourceEvent`—the original DOM event that caused the down action 
- up—finger/button went up 
  - `x`—clientX coordinate for event 
  - `y`—clientY coordinate for event 
  - `sourceEvent`—the original DOM event that caused the up action 
- tap—down & up occurred 
  - `x`—clientX coordinate for event 
  - `y`—clientY coordinate for event 
  - `sourceEvent`—the original DOM event that caused the tap action 
- track—moving while finger/button is down 
  - `state`—a string indicating the tracking state: 
    - `start`—fired when tracking is first detected (finger/button down and moved past a pre-set distance threshold) 
    - `track`—fired while tracking 
    - `end`—fired when tracking ends 
  - `x`—clientX coordinate for event 
  - `y`—clientY coordinate for event 
  - `dx`—change in pixels horizontally since the first track event 
  - `dy`—change in pixels vertically since the first track event 
  - `ddx`—change in pixels horizontally since last track event 
  - `ddy`—change in pixels vertically since last track event 
  - `hover()`-a function that may be called to determine the element currently being hovered 