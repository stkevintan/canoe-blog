+++
date = "2017-07-02T22:55:28+08:00"
title = "Polymer 2.0 文档笔记(6) Data Binding"
tags = ["Polymer"]
categories = ["Web"]
+++


>A _data binding_ connects data from a custom element (the _host element_) to a property or attribute of an element in its local DOM (the _child_
or _target element_). The host element data can be a property or sub-property represented by a [data path](data-system#paths), or data generated based on one or more paths.
数据绑定能够将host元素和target元素的property或者attribute相互链接床单。这里数据指的是路径(Paths)

## Anatomy of a data binding

数据绑定有两种绑定方式：

```html
<custom-element property-name=annotation-or-compound-binding ></custom-element>
<custom-element attribute-name$=annotation-or-compound-binding></custom-element>
```
1. `=`绑定property,`$=`绑定attribute(href,style,...)
2. annotation代表数据绑定标记: `[[ ]]`或者`{{ }}`
3. compound-binding:包含标记的字符串: `"my name is {{ name }}"`



## Bind to a target property 

将target元素的name属性绑定到当前元素的my-Name属性。
注意驼峰式和dash式命名的转换规则(property name to attribute name mapping)
```html
<target-element name="{{myName}}"></target-element>
```

### Bind to text content

相当于绑定到target元素的`textContent`属性上

```js
<dom-module id="user-view">
  <template>
    <div>[[name]]</div>
  </template>

  <script>
    class UserView extends Polymer.Element {
      static get is() {return 'user-view'}
      static get properties() {
        return {
          name: String
        }
      }
    }

    customElements.define(UserView.is, UserView);
  </script>
</dom-module>

<!-- usage -->
<user-view name="Samuel"></user-view>
```

>Binding to text content is always one-way, host-to-target.

注意，文字节点的绑定永远都是单向的(host to target)

### Bind to a target attribute
attribute绑定相当于
```javascript
element.setAttribute(attr,value)
```
property绑定相当于
```javascript
element.property = 'value'
```
因此，一些attribute同样可以使用property形式绑定：
```html
<template>
  <!-- Attribute binding -->
  <my-element selected$="[[value]]"></my-element>
  <!-- results in <my-element>.setAttribute('selected', this.value); -->

  <!-- Property binding -->
  <my-element selected="{{value}}"></my-element>
  <!-- results in <my-element>.selected = this.value; -->
</template>
```
需要注意的是： attribute形式的数据绑定只能是单向的(`[[ ]]`)

### Native properties that don't support property binding

>There are a handful of common native element properties that Polymer can't data-bind to directly,
because the binding causes issues on one or more browsers.

一些原生的property无法使用`=`绑定数据，需要使用attribute形式的`$=`才能成功绑定。

| Attribute | Property | Notes |
|----|----|----|
| `class` | `classList`, `className` | Maps to two properties with different formats. |
| `style` | `style` | By specification, `style` is considered a read-only reference to a `CSSStyleDeclaration` object. |
| `href` | `href` | |
| `for` | `htmlFor` | |
| `data-*` |  `dataset` | Custom data attributes (attribute names starting with `data-`) are stored on the `dataset` property. |
| `value` | `value` | Only for `<input type="number">`. |

>data binding to the `value` property doesn't work on IE for ***numeric input types***. For
this specific case, you can use one-way attribute binding to set the `value` of a numeric input. Or
use another element such as `iron-input` or `paper-input` that handles two-way binding correctly.

```html
<!-- class -->
<div class$="[[foo]]"></div>

<!-- style -->
<div style$="[[background]]"></div>

<!-- href -->
<a href$="[[url]]">

<!-- label for -->
<label for$="[[bar]]"></label>

<!-- dataset -->
<div data-bar$="[[baz]]"></div>

<!-- ARIA -->
<button aria-label$="[[buttonLabel]]"></button>

```
### Logical not operator 

可以在data-binding表达式前面添加`!`号取反

```html
<template>
  <my-page show-login="[[!isLoggedIn]]"></my-page>
</template>
```
注意：
1. 逻辑非只能用在单项绑定中使用
2. 只能有一个`!`不能`!!`



### Computed bindings

computed binding类似于computed property。
```js
<div>[[_formatName(first, last, title)]]</div>
```

>An element can have multiple computed bindings in its template that refer to the same computing
function.
一个元素里面可以有多个使用同样的computing function的computed binding

computed binding并不完全等同于computed property，差异有下面几点：
- computed binding的依赖路径是相对于元素当前的data scope的
- computed binding的参数不仅可以有computed property那样的路径参数，也可以是单纯的字符串或者数字等
- computed binding可以没有参数，这种情况下，函数只会被调用一次
- computed binding函数要等所有的参数中的依赖全部初始化(!=undefined)之后才会执行

```html
<dom-module id="x-custom">

  <template>
    My name is <span>[[_formatName(first, last)]]</span>
  </template>

  <script>
    class XCustom extends Polymer.Element {
      static get is() {return 'x-custom'}
      static get properties() {
        return {
          first: String,
          last: String
        }
      }
      _formatName(first, last) {
        return `${last}, ${first}`
      }

    }

    customElements.define(XCustom.is, XCustom);
  </script>

</dom-module>
```

>**Commas in literal strings:** Any comma occurring in a string literal **must** be escaped using a
backslash (`\`).

如果参数是字符串，那么字符串里面所有的逗号都要被转义

```html
<dom-module id="x-custom">
  <template>
    <span>{{translate('Hello\, nice to meet you', first, last)}}</span>
  </template>
</dom-module>
```

>**Computed bindings are one-way.** A computed binding is always one-way, host-to-target.

computed binding只能在单向绑定中使用


## Compound bindings

可以在字符串里面或者textContent里面使用绑定标记
```html
<img src$="https://www.example.com/profiles/[[userId]].jpg">

<span>Name: [[lastname]], [[firstname]]</span>
```
注意：
1. undefined会输出成空字符串
2. Compound binding永远是单向绑定，虽然你也可以使用`{{ }}`记号。




## Binding to array items

>To keep annotation parsing simple, **Polymer doesn't provide a way to bind directly to an array
item**.
为了解析简单，Polymer无法直接绑定一个数组里面的元素

```html
<!-- Don't do this! -->
<span>{{array[0]}}</span>
<!-- Or this! -->
<span>{{array.0}}</span>
```

有下面几种方法可以解决： 
- `dom-repeat`里面已经为每个数组里面的元素创建了一个子scope，因此可以直接binding
- `array-selector` 同上，可以直接绑定一个元素或者被选择的元素集合
- 使用computed binding来间接绑定，见下面例子
```html
<dom-module id="x-custom">

  <template>
    <div>[[arrayItem(myArray.*, 0, 'name')]]</div>
    <div>[[arrayItem(myArray.*, 1, 'name')]]</div>
  </template>

  <script>

    class XCustom extends Polymer.Element {

      static get is() {return 'x-custom'}

      static get properties() {
        return {
          myArray: {
            type: Array,
            value: [{ name: 'Bob' }, { name: 'Doug' }]
          }
        }
      }

      // first argument is the change record for the array change,
      // change.base is the array specified in the binding
      arrayItem(change, index, path) {
        // this.get(path, root) returns a value for a path
        // relative to a root object.
        return this.get(path, change.base[index]);
      },

      ready() {
        super.ready();
        // mutate the array
        this.unshift('myArray', { name: 'Susan' });
        // change a subproperty
        this.set('myArray.1.name', 'Rupert');
      }
    }

    customElements.define(XCustom.is, XCustom);
  </script>

</dom-module>
```

### Two-way binding to a non-Polymer element

为了达到非Polymer元素上面的双向绑定，可以使用下面的标记：
```js
target-prop="{{hostProp::target-change-event}}"
```
```html
<!-- Listens for `input` event and sets hostValue to <input>.value -->
<input value="{{hostValue::input}}">

<!-- Listens for `change` event and sets hostChecked to <input>.checked -->
<input type="checkbox" checked="{{hostChecked::change}}">

<!-- Listens for `timeupdate ` event and sets hostTime to <video>.currentTime -->
<video url="..." current-time="{{hostTime::timeupdate}}">
```
基于约定大于配置的原理，如果`target-prop`的变化通知函数是`target-prop-changed`则该定义可以省略。

```html
<!-- Listens for `value-changed` event -->
<my-element value="{{hostValue::value-changed}}">

<!-- Listens for `value-changed` event using Polymer convention by default -->
<my-element value="{{hostValue}}">
```
