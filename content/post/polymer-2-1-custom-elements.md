+++
date = "2017-07-02T22:49:25+08:00"
title = "Polymer 2.0 文档笔记(1) Custom Elements"
tags = ["Polymer"]
categories = ["Web"]
+++

https://www.polymer-project.org/2.0/docs/devguide/custom-elements

>Custom element names. By specification, the custom element's name must start with a lower-case ASCII letter and must contain a dash (-). There's also a short list of prohibited element names that match existing names. For details, see the Custom elements core concepts section in the HTML specification.

自定义元素的命名规则： 按照规范，自定义元素的命名中必须以一个小写字母开始，必须包含一个连接符（-）

>Custom properties can only be defined in rule-sets that match the html selector or a Polymer custom element. This is a limitation of the Polymer implementation of custom properties.

Polymer实现方式的局限： 只有html元素或者Polymer自定义元素才能使用自定义CSS属性。(_个人感觉虽然shadowDOM原生支持CSS隔离，但是一部分元素能用cssnext一部分元素不能用，割裂感太严重了。_)

>Polymer does not currently support extending built-in elements. The custom elements spec provides a mechanism for extending built-in elements, such as `<button>` and ` <input>`. The spec calls these elements customized built-in elements. Customized built-in elements provide many advantages (for example, being able to take advantage of built-in accessibility features of UI elements like `<button>` and` <input>`). However, not all browser makers have agreed to support customized built-in elements, so Polymer does not support them at this time.

因为浏览器厂商的争议，Polymer不支持扩展内建元素。 


在生产环境下main document不要定义自定义元素。基于实验目的可以使用 
`HTMLImports.whenReady(callback)`方法等待所有html import 加载完毕。

### 组件生命周期 
标准的几个生命周期回调： 

| Reaction                 | Description                              |
| ------------------------ | ---------------------------------------- |
| constructor              | Called when the element is upgraded (that is, when an element is created, or when a previously-created element becomes defined). |
| connectedCallback        | Called when the element is added to a document. |
| disconnectedCallback     | Called when the element is removed from a document. |
| attributeChangedCallback | Called when any of the element's attributes are changed, appended, removed, or replaced, |

>For each reaction, the first line of your implementation must be a call to the superclass constructor or reaction.

开始写自己的回调事件之前都必须先调用super上面的回调。`Super.connectedCallback()`; 
  

>The constructor can't examine the element's attributes or children, and the constructor can't add attributes or children. 

Constructor函数中不能对DOM进行任何操作。 

>In general, work should be deferred to connectedCallback as much as possible—especially work involving fetching resources or rendering. However, note that connectedCallback can be called more than once, so any initialization work that is truly one-time will need a guard to prevent it from running twice. 
>In general, the constructor should be used to set up initial state and default values, and to set up event listeners and possibly a shadow root. 

<https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance> 

Constructor里面只应该做一些初始化状态、值、绑定事件，建立shadowroot之类的工作。其他工作应该推迟到connectedCallback里面做，但是需要注意的是__connectedCallback可能会调用多次__。 


>The custom elements specification doesn't provide a one-time initialization callback. Polymer provides a readycallback, invoked the first time the element is added to the DOM. 

Polymer提供了一个规范里面没有的回调： Ready， 只在元素第一次加入DOM时候触发。 

```javascript
ready() { 
  super.ready(); 
  // When possible, use afterNextRender to defer non-critical 
  // work until after first paint. 
  Polymer.RenderStatus.afterNextRender(this, function() { 
    ... 
  }); 
} 
```

>Elements have a custom element state that takes one of the following values:  
>  
>1. `uncustomized`: The element does not have a valid custom element name. It is either a built-in element (`<p>`, `<input>`) or an unknown element that cannot become a custom element (`<nonsense>`)    
>2. `undefined`: The element has a valid custom element name (such as "my-element"), but has not been defined.    
>3. `custom`: The element has a valid custom element name and has been defined and upgraded.    
>4. `failed`: An attempt to upgrade the element failed (for example, because the class was invalid).    


元素内部拥有四个状态，我们不能直接获得，但是可以使用:defined伪类来选择"uncustomized"和"custom"的元素。 





### 自定义元素

>___Hybrid elements___: should continue to use the Polymer DOM APIs, but may require some changes.
>___Legacy elements___: can use the Polymer DOM APIs or the native DOM APIs.
>___Class-based elements___: should use native DOM APIs.

总共有三种自定义元素：

- Hybird element： 主要是为了兼容Polymer 1.x;但 Gesture Events只支持Hybird elements。详见下文。
- Legacy element：处于两者之间（没有看出有什么用处）
- Class-based element：Polymer 2.0 最常用的自定义元素方式。



#### Class-based elements

```javascript
// define the element's class element
class MyElement extends Polymer.Element {
  // 'is' getter, return the tag name which is lowercased. required.
  static get is(){
    return 'my-element';
  }
  // Define the properties.
  static get properties() {}
  // Element class can define custom element reactions
  constructor() { super(); }
  connectedCallback() {
    super.connectedCallback();
    console.log('my-element created!');
  }
  ready() {
    super.ready();
    this.textContent = 'I\'m a custom element!';
  }
}

// Associate the new class with an element name
customElements.define(MyElement.is, MyElement);

// create an instance with createElement:
var el1 = document.createElement('my-element');

// ... or with the constructor:
var el2 = new MyElement();
```

#### Legacy elements

```javascript
// register an element  
MyElement = Polymer({  
is: 'my-element',  
// See below for lifecycle callbacks  
created: function() { this.textContent = 'My element!'; }  
});  
// create an instance with createElement:  
var el1 = document.createElement('my-element'); 
// ... or with the constructor: 
var el2 = new MyElement();
```

Legacy元素的生命周期有着不同的名字：

| Legacy lifecycle cb | Class-based lifecycle cb    |
| ------------------- | --------------------------- |
| `Created`           | `constructor`               |
| `Ready`             | `ready`                     |
| `Attached`          | `connectedCallback`         |
| `Detached`          | `disconnectedCallback`      |
| `attributeChanged`  | `attributedChangedCallback` |

#### Hybird elements
这种方式主要是为了兼容Polymer 1.x。可以使用Class-based方式改写。详见Gesture Events。

### 自定义属性（properties)
自定义属性主要在`properties` getter中定义。可以直接传一个字符串。也可以传给他们一个Object。
Object需要包含下面几个属性：
#### type 数据类型 

>Type: constructor  
>Attribute type, used for deserializing from an attribute. Polymer supports deserializing the following types: Boolean, Date, Number, String, Array and Object. You can add support for other types by overriding the element's  _deserializeValue method. 
>Unlike 0.5, the property's type is explicit, specified using the type's constructor. Seeattribute deserialization for more information. 

>When reflecting a property to an attribute or binding a property to an attribute, the property value is serialized to the attribute. 
>By default, values are serialized according to value's current type, regardless of the property's type value: 

>`String` No serialization required.  
>`Date or Number` Serialized using toString. 
>`Boolean` Results in a non-valued attribute to be either set (true) or removed (false). 
>`Array or Object` Serialized using  JSON.stringify. 

`Array`和`Object`需要写成JSON的形式，`Date`需要写成任何符合Date解析形式的String。

可以重写属性序列化函数： `_serializeValue method`.

```javascript
_serializeValue(value) { 
  if (value instanceof MyCustomType) { 
    return value.toString(); 
  }
  return super._serializeValue(value);
} 
```

#### value 默认值

>Type: `boolean`, `number`, `string` or `function`. 
>Default value for the property. If value is a function, the function is invoked and the return value is used as the default value of the property. If the default value should be an array or object unique to the instance, create the array or object inside a function. See Configuring default property values for more information

跟Vue一样，如果一个属性的默认值是以Array或者Object,那么所有该元素的实例的默认值都共享一个变量。如果要使每个元素拥有一份完全独立的拷贝的话，需要在这个值外面包一个函数。  

```javascript
class XCustom extends Polymer.Element { 
static get properties() { 
    return { 
      mode: { 
        type: String, 
        value: 'auto' 
      }, 
      data: { 
        type: Object, 
        notify: true, 
        value: function() { return {}; } 
      } 
    } 
}
```


#### reflectToAttribute

>Type: boolean 
>Set to true to cause the corresponding attribute to be set on the host node when the property value changes. If the property value is Boolean, the attribute is created as a standard HTML boolean attribute (set if true, not set if false). For other property types, the attribute value is a string representation of the property value. Equivalent to reflect in Polymer 0.5. See Reflecting properties to attributes for more information

值的变化是否同步更新DOM上面的attr 


>For a Boolean property to be configurable from markup, it must default to false. If it defaults to true, you cannot set it to false from markup, since the presence of the attribute, with or without a value, equates to true. This is the standard behavior for attributes in the web platform.
>If this behavior doesn't fit your use case, you can use a string-valued or number-valued attribute instead. 

Boolean类型的属性只能把默认值设为false，因为标准的HTML属性行为（存在为true，不存在为false）,如果必须把默认值设为true，可以用String或者Number类型属性代替。 

#### readOnly

>Type: boolean 
>If true, the property can't be set directly by assignment or data binding.

#### notify

>Type: boolean 
>If true, the property is available for two-way data binding. In addition, an event, property-name-changed is fired whenever the property changes

DOM上面的属性变化是否调用回调（反向绑定）属性`this.firstName`的变化会触发`first-name-changed`事件。这些事件被用在了双向绑定系统，在外部代码里面我们可以直接使用`addEventListener`。 
_有点像Java里面的约定大于配置的思想，这样能使代码变得简单易懂_

#### computed

>Type: string 
>The value is interpreted as a method name and argument list. The method is invoked to calculate the value whenever any of the argument values changes. Computed properties are always read-only. See Computed properties for more information


传入一个包含方法名和参数列表的字符串，参数必须readOnly，将该方法调用参数运行的结果作为该项的值


#### observer

>Type: string 
>The value is interpreted as a method name to be invoked when the property value changes. Note that unlike in 0.5, property change handlers must be registered 
>explicitly. The propertyNameChanged method will not be invoked automatically. See Property change callbacks (observers) for more information

传入一个方法名称，当值发生变化时自动执行该方法 


### 其他

1. 隐式声明属性: if you add it to a data binding or add it as a dependency of an observer, computed property, or computed binding. 
2. Priavte和Protected属性：分别用__prop和_prop表示。


