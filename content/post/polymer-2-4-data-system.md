+++
date = "2017-07-02T22:53:02+08:00"
title = "Polymer 2.0 文档笔记(4) Data System"
tags = ["Polymer"]
categories = ["Web"]
+++

Polymer提供观察函数、计算属性、数据绑定三大模型功能： 
>- __Observers__ Callbacks invoked when data changes. 
>- __Computed properties__ Virtual properties computed based on other properties, and recomputed when the input data changes. 
>- __Data bindings__ Annotations that update the properties, attributes, or text content of a DOM node when data changes. 
 ```html
<dom-module id="name-card"> 
  <template> 
    <div>[[name.first]] [[name.last]]</div> 
  </template> 
  <script> 
    class NameCard extends Polymer.Element { 
      static get is() { return "name-card"; } 
      constructor() { 
        super(); 
        this.name = {first: 'Kai', last: 'Li'}; 
      } 
    } 
    customElements.define(NameCard.is, NameCard); 
  </script> 
</dom-module> 
 ```

## Observable Change
 
>The data system is based on paths, not objects, where a path represents a property or subproperty relative to the host element. 

Polymer的数据系统是基于数据的 __路径__ 之上的。并不是实际的对象。

可观察到的变化指的是Polymer里面存在一个相关的路径指向这个数据的变化。因此，直接改变一个object、array等引用对象不会被观察到。
```javascript
this.address.street = 'Elm Street'
```
改变`address.street`并不能被`address`上的观察器捕捉到变化

### Mutating objects and arrays observably
使用Polymer提供的方法：
```javascript
// 改变object
this.set('address.street','Half Moon Street') 
// 改变array
this.set('users.3',{name:'Hawking'})
this.push('users',{name: 'Maturin'}) 
this.pop('users')
this.unshift('users',{name: 'Martin'})
this.shift('users')
this.splice('users',3,1,{name:'Hawking'})

// 批量更新
this.setProperties({item:'Orange', count:12},true) //setReadOnly:true 代表需要设置ready-only的属性
//延迟统一更新
this.notifyPath('address.street') 
this.notifySplices('users') //only array

// 获得路径代表的属性值
var value = this.get('address.street') 
 //获得users[2]的值
var item = this.get(['users',2])
```

>Polymer performs dirty checking for objects and arrays using __object equality__. It doesn't produce any property effects if the value at the specified path hasn't changed.

`notifyPath`方式需要提供具体属性的路径，而不应该是Object或Array，因为Polymer直接使用数据引用地址进行比较。如果一定需要观察它们，Polymer提供了三种解决方案：

1. 使用`Immutable`之类的库，或者每次改变Object和Array里面的值的时候都先克隆出一个副本，在克隆的副本上修改然后把路径指向克隆副本。
2. 使用mixin `Polymer.MutableData`可以禁止Polymer的对object和array的脏检查(dirty check)
3. 使用mixin `Polymer.OptionalMutableData`可以在标签上添加一个bool属性mutable，代表是否对object或array开启脏检测

## Data Paths
>A data path is a series of path segments. In most cases, each path segment is a property name. The data APIs accept two kinds of paths:
>- A string, with path segments separated by dots.
>- An array of strings, where each array element is either a path segment or a dotted path.

数据路径可以是一个路径字符串，也可以是一个包含路径字符串的数组，比如下面三行全部代表同一个路径：
```javascript
"one.two.three"
["one", "two", "three"]
["one.two", "three"]
```

![data-path](https://www.polymer-project.org/images/1.0/data-system/data-binding-paths-new.png)

> Polymer doesn't automatically know that these properties refer to the same object.`<address-card>` makes a change to the object, no property effects are invoked on `<user-profile>`
> For data changes to flow from one element to another, the elements must be connected with a data binding.

Polymer是以路径来监听数据变化的。所以，就算两个路径实际上都指向同一个对象，他俩也不会联动。需要对这两个路径进行链接操作。

### Linking paths with data bindings

>data binding is the only way to link paths on different elements

```html
<dom-module id="user-profile">
  <template>
    …
    <address-card
        address="{{primaryAddress}}"></address-card>
  </template>
  …
</dom-module>
```
链接两个路径之后的示意图：
![data-binding](https://www.polymer-project.org/images/1.0/data-system/data-bound-paths-new.png)

>The `<user-profile>` element has a property `primaryAddress` that refers to a JavaScript object.
>The `<address-card>` element has a property `address` that refers to the same object.
>The data binding connects the path "`primaryAddress`" on `<user-profile>` to the path "`address`" on `<address-card>`


### Data binding scope
>Paths are relative to the current data binding scope.
>The topmost scope for any element is the element's properties. Certain data binding helper elements (like template repeaters) introduce new, nested scopes.
>For observers and computed properties, the scope is always the element's properties.

1. 上面所说的路径都是相对于当前数据绑定(data-binding scope)定的。
2. 最外层的域就是当前元素的本身(this)，但一些数据绑定辅助元素(比如: `template` `repeaters`)可以创建新的子域。
3. 观察函数(`observers`)和计算属性`computed properties`的域永远都是当前元素本身(this)

### Special paths
1. 通配路径(Wildcard paths)-可以使用通配符`*`来表示当前路径下的所有子路径的任何变化。比如`users`指向一个数组,`users.*`代表该数组的所有变化
2. `splices`- 可以用在数组路径后面，代表数组任何添加、删除的变化
3. 数组路径后面接下标代表数组里面对应的项，比如`users.12`

注意： 
1. 通配符只能用在observers、computed properties里面的路径中，不能用在数据绑定里
2. 观察`splices`路径时，事件参数中只提供当前数组发生变化的元素组成的子数组，所以在一般情况下通配符路径比`splices`路径要实用


### Two paths referencing the same object
如果两条路径都指向同一个对象,如下图,需要使用`linkPaths`方法将它们关联起来。
![two-paths](https://www.polymer-project.org/images/1.0/data-system/linked-paths-new.png)
注意： 
1. 两条路径必须在同一个data scope下
2. 如果需要接触两条路径的关联，使用`unlinkPaths`, __该函数只接受`linkPaths`调用时的第一条路径__




## Data flow
>Polymer implements the mediator pattern, where a host element manages data flow between itself and its local DOM nodes.
>When two elements are connected with a data binding, data changes can flow downward, from host to target, upward, from target to host, or both ways.
>When two elements in the local DOM are bound to the same property data appears to flow from one element to the other, but this flow is mediated by the host. A change made by one element propagates up to the host, then the host propagates the change down to the second element.


Polymer的数据流是一个中间人模型。任何存在数据绑定的两个元素直接的数据流都不是表面上的直接传递的，而是先向上传递(upward)到host元素再向下传递(downward)到目标元素。

> Data flow is synchronous. When your code makes an observable change, all of the data flow and property effects from that change occur before the next line of your JavaScript is executed, unless an element explicitly defers action (for example, by calling an asynchronous method).

Polymer的数据传递是同步的，除非调用一个外部异步函数

### How data flow is controlled
数据流的方向主要由两个地方控制：数据绑定方式和属性配置项。

数据绑定主要有两种方式：
-   __Automatic__ ：双向绑定，包括向上(upward,target to host)和向下(downward.host to target),使用`{{ }}`
    ```html
    <my-input value="{{name}}"></my-input>
    ```

-   __One-way__ :单向绑定，仅向下(downward.host to target)，使用`[[ ]]`
    ```html
    <name-tag name="[[name]]"></name-tag>
    ```
属性配置项具体有两项：
*   `notify` 允许数据向上(upward,target to host)传递，默认为false
*   `readOnly` 禁止数据向下(downward.host to target)传递到当前组件，默认false

属性配置实例：

```js
properties: {
  // default prop, read/write, non-notifying.
  basicProp: {
  },
  // read/write, notifying
  notifyingProp: {
    notify: true
  },
  // read-only, notifying
  fancyProp: {
    readOnly: true,
    notify: true
  }
}
```
注意：
1. 当使用单向绑定的时候，`notify`配置项无效。
2. 当单向绑定且`readOnly:true`时，将没有任何数据流



>**Property configuration _only affects the property itself_, not
subproperties**. In particular, binding a property that's an object or array creates shared data
between the host and target element. There's no way to prevent either element from mutating a shared
object or array.

属性配置不能继承



### Data flow examples
参考:[Data flow examples](https://www.polymer-project.org/2.0/docs/devguide/data-system#data-flow-examples)




### Upward and downward data flow

>Since the host element manages data flow, it can directly interact with the target element. The host
propagates data downward by setting the target element’s properties or invoking its methods.

host元素可以直接通过设置target元素属性或调用回调函数等方法将数据向下传递给target元素

![An element, host-element connected to an element, target-element by an arrow labeled 1.](https://www.polymer-project.org/images/1.0/data-system/data-flow-down-new.png)

>Polymer elements use events to propagate data upward. The target element fires a non-bubbling event
when an observable change occurs.

当数据是双向绑定的时候，target元素通过触发一个non-bubbling的change事件来将数据传递给监听这个事件的host元素，host元素监听到事件后对数据变化做出响应改变数据绑定模型（可能影响相邻元素）并触发另外一个change事件向上传播。

当数据是单向绑定的时候，host元素不会监听target元素的change事件，因此数据无法向上传递。

![An element, target-element connected to an element, host-element by an arrow labeled 1. An arrow labeled 2 connects from the host element back to itself.](https://www.polymer-project.org/images/1.0/data-system/data-flow-up-new.png)



### Data flow for objects and arrays

>For object and array properties, data flow is a little more complicated. An object or array can be
referenced by multiple elements, and there's no way to prevent one element from mutating a shared
array or changing a subproperty of an object.
As a result, Polymer treats the contents of arrays and objects as always being **available** for two-
way binding. That is:
>*   Data updates always flow downwards, even if the target property is marked read-only.
>*   Change events for upward data flow are always fired, even if the target property is not marked
    as notifying.
>
>Since one-way binding annotations don't create an event listener, they prevent these change
notifications from being propagated to the host element.

对于objects和arrays绑定的数据流非常复杂，不得已Polymer将忽略关于它们所有的`readyOnly`和`notify`配置项，并将它们hardcode为`true`，单项绑定和双向绑定不受影响。

### Change notification events 
当一个元素某路径比如`property`发生变化，则会响应的触发一个`property-changed`的通知事件。
事件内容根据路径类型相关：
1. 属性变化： 新值将储存`detail.value`中
2. 子属性变化：子属性的路径将会储存在`detail.path`中，新值将会储存在`detail.value`中。
3. 数组变化：变化路径将会储存在`detail.path`中(比如： `myArray.splices`)，新值将会被储存在`detail.value`中。

_不是很明白`myArray.splices`是什么鬼，文档不清楚_

>**Don't stop propagation on change notification events.** To avoid creating and discarding
event objects, Polymer uses cached event objects for change notifications. Calling `stopPropagation`
on a change notification event **prevents all future events for that property.** Change notification
events don't bubble, so there should be no reason to stop propagation.

注意： __不要在通知事件里面使用`stopPropagation`__


### Custom change notification events

一些Native元素比如`<input>`并不存在变化通知事件，因此也不能将数据向上传递。可以通过下面的方式手动自定义一个变化通知事件：

```html
<input value="{{firstName::change}}">
```

>In this example, the `firstName` property is bound to the input's `value` property. Whenever the
input element fires its `change` event, Polymer updates the `firstName` property to match the input
value, and invokes any associated property effects. **The contents of the event aren't important.**

>This technique is especially useful for native input elements, but can be used to provide two-way
binding for any non-Polymer component that exposes a property and fires an event when the property
changes.



### Property effects
当属性变化的时候，下面的任务会依次执行：
1. 重写计算受到影响的属性的值 - 此步将会更新计算属性(computed properties)
2. 更新数据绑定
3. 更新host元素上面的html属性
4. 执行观察事件observers
5. 触发变化通知事件



