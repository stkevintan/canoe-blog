---
categories:
- Web
date: 2017-07-02T22:51:37+08:00
tags:
- Polymer
title: Polymer 2.0 文档笔记(2) ShadowDOM
---

## ShadowDOM API
```javascript
var div = document.createElement('div'); 
var shadowRoot = div.attachShadow({mode: 'open'}); 
shadowRoot.innerHTML = '<h1>Hello Shadow DOM</h1>';
```


## ShadowDOM Composition
主要概念： 

- LightDOM: 元素的实际子孙节点，浏览器不会对LightDOM做任何的修改和移动。但是渲染的时候会渲染到相对于的slot节点之下，如果找不到对应的slot节点，则不会渲染。
- ShadowDOM: 不解释。。。 
- Slot:  slot标签是LightDOM插入到ShadowDOM中的标记。可以设置name属性来匹配对应的LightDOM。Slot标签不会渲染，但是还是会存在（即能够参与事件传递）。另外如果一个LightDOM找不到匹配的slot插入点，则改LightDOM也不会被渲染。 
- Flatterned Tree: LightDOM通过ShadowDOM里面的slot标记合并在一起（flattern）的抽象的DOM树（devTools中不可见），是最后浏览器实际用来渲染的DOM树。 

需要注意的是：

>Slots can only be selected explicitly, by slot name. It's impossible to select content implicitly, based on a tag name or an arbitrary selector like `:not(.header)`.

slot只能用slot name来区分、选中。不能用其他任意的css选择器。

各个slot之间的区域是互斥的，而且 __只能选择top-level元素__ (包括后面的`::slotted(selector)`选择器)。
```html
<!-- shadow DOM v1 template -->
<template>
  <!-- this slot gets any top-level nodes that don't have slot
       attributes. -->
  <slot></slot>
  <!-- the following insertion point gets any top-level nodes that have
       slot="special". -->
  <slot name="special"></slot>
  <!-- top-level nodes that have slot attributes with other values
       don't get distributed at all. -->
</template>
```

### Fallback content
实际上就是可以在模版的slot里面写东西，作为一个默认值

### Mulit-level distribution
多级slot嵌套。flatterning的时候规则是从外向里， 因此父节点的slot下面的lightDOM会渲染在子节点的LightDOM之下。


## Slot APIs && Observe added and removed children 
 
- `HTMLElement.assignedSlot`
- `HTMLSlotElement.assignedNodes` 
- `HTMLSlotElement.slotchange(event)` 
- `Polymer.FlattenedNodesObserver` 
- `Polymer.FlattenedNodesObserver.getFlattenedNodes(node)`
- `new Polymer.FlattenedNodesObserver(this.$.slot,(info)=>{})`

详情参考<https://www.polymer-project.org/2.0/docs/devguide/shadow-dom>  


## Shadow DOM polyfills 
因为shadowDOM不是每个浏览器都支持，所以使用了webcomponents.js中的shadyDOM和shadyCSS两个polyfills。 
 
### How the polyfills work 
 
>The polyfills use a combination of techniques to emulate shadow DOM: 
>`Shady DOM`: Maintains the logical divisions of shadow tree and descendant tree internally, so children added to the light DOM or shadow DOM render correctly. Patches DOM APIs on affected elements in order to emulate the native shadow DOM APIs. 
>`Shady CSS`: Provides style encapsulation by adding classes to shadow DOM children and rewriting style rules so that they apply to the correct scope. 

#### ShadyDOM
ShadyDOM主要原理是patch原生DOM API来提供跟native shadowDOM一致的接口。在内存中维护了一个保存LightDOM的children树和一个保存ShadowDOM的ShadowRoot树。但是实际上元素下面就是一颗渲染好的flatterned树。因为这个是就是实际上的用来渲染的树，所以不存在slot，因此shadyDOM polyfills方案里面的slot元素不参与事件传递。 
 
#### ShadyCSS 
ShadyCSS主要提供了原生ShadowDOM规则的支持和两个cssnext特性：`CSS custom properties` 和 `custom property mixins`. 
Scoped CSS特性的实现原理跟Vue相似：对元素的ShadowDOM添加class，并重写CSS的匹配规则。 


## ShadowDOM styling
ShadowDOM样式三大原则： 

1. 外层的样式不会对内层样式进行匹配。 
2. 内层样式不会影响外层样式。 
3. 可继承的css属性（例如：color）等，内层可以照样继承自外层。 

两个特殊伪类： 
- 选择ShadowDOM的根节点节点`:host`/`:host(selector)`
```html
#shadow-root
  <style>
    /* custom elements default to display: inline */
    :host {
      display: block;
    }
    /* set a special background when the host element
       has the .warning class */
    :host(.warning) {
      background-color: red;
    }
  </style>
```
    
- 选择分布式节点——`::slotted()`
  - `slotted()`选择器右边不能写任何其他选择器。
  - `slotted(selector)` 里面的selector只能是简单选择器，并且只能选择顶级元素。
  - `slotted(*)` 选择默认的LightDOM(不包含有name值的slot)
  - `slotted(slot=tkw)` 选择name为tkw的LightDOM

  ```html
  <dom-module>
  <template>
    <style>
      ::slotted(img){ 
        border-radius: 103%;
      }
    </style>
    <div><slot></slot></div>
  </template>
  <script>
    // define the element's class element
    class XFoo extends Polymer.Element {
      // 'is' getter, return the tag name which is lowercased. required.
      static get is(){
        return 'x-foo';
      }
      // Define the properties.
      static get properties() {}
      // Element class can define custom element reactions
      constructor() { super(); }
      connectedCallback() {
        super.connectedCallback();
        console.log('x-foo created!');
      }
    }
    
    window.customElements.define(XFoo.is, XFoo);
  </script>
  </dom-module>

  <x-foo>
    <h1>A logo</h1>
    <img />
  </x-foo>
  ```

### Share styles between elements

```html
<dom-module id="my-style-module"> 
  <template> 
    <style> 
      <!-- Styles to share go here! --> 
    </style> 
  </template> 
</dom-module>

<!-- another element -->
<dom-module id="new-element"> 
  <template> 
    <style include="my-style-module"> 
      <!-- Any additional styles go here --> 
    </style> 
    <!-- The rest of your element template goes here --> 
  </template> 
</dom-module>
```
### custom-style
兼容性写法，使用`<custom-style>`标签包围main document里面的全局`<style>`能避免在不支持shadowDOM v1规范的浏览器中全局css规则继续在shadowDOM中生效。
__注意是避免CSS规则生效，而不是避免CSS样式的继承__
custom-style元素不包含在Polymer中，需要引入：
```html
<link rel="import" href="components/polymer/lib/elements/custom-style.html">
```

## CSS custom properties
主要是提供一个支持两个CSS Next语法的扩展版本：
#### custom properties & var()
- 可以通过`——customvar`形式定义变量，然后通过`var(--customvar,[defaultvar])`取值。
- 通过这个特性我们可以暴露出一些可配置的变量，然后供组件外部的父元素进行自定义。
- 与cssnext规范不同的是，cssnext的变量定义必须写在`:root{}`中，而Polymer则是不能在LightDOM中使用。

```css
p {
  color: var(--paper-red-500);
}
paper-checkbox {
  --paper-checkbox-checked-color: var(--paper-red-500);
}
```
### custom properties set & @apply
Polymer默认不支持自定义属性集合，需要手动引入：
```html
<!-- import CSS mixins polyfill -->
<link rel="import" href="/bower_components/shadycss/apply-shim.html">
```
相当于cssnext对应的语法，但是同样可以在任何css Rule下使用。
```html
<dom-module id="my-element"> 
  <template> 
    <style> 
      /* Apply custom theme to toolbars */ 
      :host { 
        --my-toolbar-theme: { 
          background-color: green; 
          border-radius: 4px; 
          border: 1px solid gray; 
        }; 
        --my-toolbar-title-theme: { 
          color: green; 
        }; 
      } 
      /* Make only toolbars with the .warning class red and bold */ 
      .warning { 
        --my-toolbar-title-theme: { 
          color: red; 
          font-weight: bold; 
        }; 
      } 
    </style> 
    <my-toolbar title="This one is green."></my-toolbar> 
    <my-toolbar title="This one is green too."></my-toolbar> 
    <my-toolbar class="warning" title="This one is red."></my-toolbar> 
  </template> 
  <script> 
    class MyElement extends Polymer.Element { 
      static get is() { 
        return "my-element"; 
      } 
    } 
    customElements.define(MyElement.is, MyElement); 
  </script> 
</dom-module> 
 
<dom-module id="my-toolbar"> 
  <template> 
    <style> 
      :host { 
        padding: 4px; 
        background-color: gray; 
        /* apply a mixin */ 
        @apply --my-toolbar-theme; 
      } 
      .title { 
        @apply --my-toolbar-title-theme; 
      } 
    </style> 
    <span class="title">{{title}}</span> 
  </template> 
  ... 
</dom-module>
```
### CSS Custom Property API

#### updateStyles
动态更改css自定义属性的值。
```html
<dom-module id="x-custom">
  <template>
    <style>
      :host {
        --my-toolbar-color: red;
      }
    </style>
    <my-toolbar>My awesome app</my-toolbar>
    <button on-tap="changeTheme">Change theme</button>
  </template>
  <script>
    class XCustom extends Polymer.Element {
      static get is() {
        return "x-custom";
      }
      static get changeTheme() {
        return function() {
        this.updateStyles({
          '--my-toolbar-color': 'blue',
        });
      }
    }
    customElements.define(XCustom.is, XCustom);
  </script>
</dom-module>
```
注意当外层元素或者被继承元素里面已经定义了一个变量，那么当前再定义这个变量是无效的，需要手动调用该方法。这个行为类似于Less


#### getComputedStyle(ShadyCSS.getComputedStyle)
获得当前自定义属性的值(需要区分原生和Polyfill)
```javascript
if (ShadyCSS) { 
  style = ShadyCSS.getComputedStyleValue('--something'); 
} else { 
  style = getComputedStyle(this, '--something'); 
} 
```

## DOM Templating

>By default, adding a DOM template to an element causes Polymer to create a shadow root for the element and clone the template into the shadow tree. 

DOMTemplate是通过clone操作添加到shadow tree里面去的。 有三种方式定义一个DOM Template： 
### template标签 
直接将模板写在`<template>`标签里面, 是最直接的方式、最常见的方式。 
```html
<dom-module id="x-foo"> 
<template>I am x-foo!</template> 
<script> 
    class XFoo extends Polymer.Element { 
      static get is() { return  'x-foo' } 
    } 
    customElements.define(XFoo.is, XFoo); 
</script> 
</dom-module> 
```
### String template 
字符串模板
```javascript
class MyElement extends Polymer.Element { 
 
static get template() { 
    return `<style>:host { color: blue; }</style> 
       <h2>String template</h2> 
       <div>I've got a string template!</div>` 
  } 
} 
customElements.define('my-element', MyElement); 
```
### Retrieve or generate your own template element 
通过继承或手动实现template getter获得模板.
注意：
1. 不要对父类的template直接修改，应该先拷贝一份出来。 
2. 如果需要做一些耗资源的操作，应该对你修改的template进行缓存，以免重复调用。 


```javascript
(function() { 
  let memoizedTemplate; 
 
class MyExtension extends MySuperClass { 
    static get template() { 
      if (!memoizedTemplate) { 
        // create a clone of superclass template (`true` = "deep" clone) 
        memoizedTemplate = MySuperClass.template.cloneNode(true); 
        // add a node to the template. 
        let div = document.createElement('div'); 
        div.textContent = 'Hello from an extended template.' 
        memoizedTemplate.content.appendChild(div); 
      } 
      return memoizedTemplate; 
    } 
  } 
 
})(); 
```  
### URLs in template
默认对于所有从其他文件里面引入的组件里面元素所包含的链接Polymer是不做处理的，所有的相对路径的资源最后都是相对于主文档（main document）的路径。 
但是我们可以使用下面两个特殊的标记

#### importPath 
>A static getter on the element class that defaults to the element HTML import document URL and is overridable. It may be useful to override importPath when an element's template is not retrieved from a <dom-module> or the element is not defined using an HTML import. 
 

一个静态getter函数，默认指向该元素被HTML import时候的URL，也可以被重写。 

#### rootPath
>An instance property set to the value of Polymer.rootPath which is globally settable and defaults to the main document URL. It may be useful to set Polymer.rootPath to provide a stable application mount path when using client side routing.

一个实例化的属性，值被设置为Polymer.rootPath。代表着主文档(main document)的URL。 

>Relative URLs in styles are automatically re-written to be relative to the importPath property. Any URLs outside of a `<style>` element should be bound using importPath or rootPath where appropriate.
 
所有style标签里面的URL全部被重写为相对于importPath的路径。除此之外，都需要自己手动添加合适的前缀： 
```html
<img src$="[[importPath]]checked.jpg"> 
 
<a href$="[[rootPath]]users/profile">View profile</a>
```

### Static node map 
>Polymer builds a static map of node IDs when the element initializes its DOM template, to provide convenient access to frequently used nodes without the need to query for them manually. Any node specified in the element's template with an id is stored on the this.$ hash by id. 
 The this.$ hash is created when the shadow DOM is initialized. In the ready callback, you must call super.ready() before accessing this.$. 
 
这个主要是Polymer提供的一个可以快速访问DOM节点的方式。可以通过`this.$[id]`来获取拥有对应id的元素/自定义元素。  
相当于`document.getElementById`的升级版类似于react中的`this.refs`   
`this.$`接口只能在ready回调函数的`super.ready()`之后被调用。   
动态创建的节点（`dom-repeat`\ `dom-if`）并不包含在`this.$`集合里，但是还是可以用标准的`querySelector`方法获取。    


```html
<dom-module id="x-custom"> 
 
<template> 
    Hello World from <span id="name"></span>! 
  </template> 
 
<script> 
    class MyElement extends Polymer.Element { 
      static get is() { return  'x-custom' } 
      ready() { 
        super.ready(); 
        this.$.name.textContent = this.tagName; 
      } 
    } 
  </script> 
 
</dom-module>
```


