---
title: GraphQL Learn (1) - Queries and Mutations
tags:
  - GraphQL
categories:
  - Web
date: '2017-08-15T00:00:00+08:00'
grammar_cjkRuby: true
---

在此页面上，你将详细了解如何查询GrahQL服务器。

## 字段（Fields）
最简单的，GraphQL是关于要求对象上的特定字段。我们先来看一个非常简单的查询，当我们运行它时得到结果：

```graphql
{
  hero {
    name
  }
}
```
```js
{
  "data": {
    "hero": {
      "name": "R2-D2"
    }
  }
}
```
可以看到，查询与结果的形状完全相同。这对于GraphQL是至关重要的，因为您总是收到您期望的内容，并且服务器确切知道客户端要求哪些字段。
<!--more-->
字段名返回一个String类型，在这种情况下是星球大战主角“R2-D2”的名称。

>哦，还有一件事: 上面的查询是互动的。这意味着您可以随意更改它，并看到新的结果。尝试在查询中向`hero`对象添加一个`appearIn`字段，并查看新结果。

在前面的例子中，我们只是要求我们返回一个String类型的主角名字，但字段也可以引用对象。在这种情况下，您可以对该对象的字段进行子查询。 GraphQL查询可以遍历相关对象及其字段，让客户端在一个请求中获取大量相关数据，而不是像传统的REST架构中一样需要进行几次往返。

```graphql
{
  hero {
    name
    # Queries can have comments!
    friends {
      name
    }
  }
}
```
```js
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "friends": [
        {
          "name": "Luke Skywalker"
        },
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        }
      ]
    }
  }
}
```
请注意，在此示例中，`friends`字段返回一个项目数组。 GraphQL查询对于单个项或多个项列表写法上相同，但是我们根据schema中记录的内容知道预期获得的是哪一种。

## 参数（Arguments）
如果我们唯一可以做的是遍历对象及其字段，则GraphQL已经是数据提取的非常有用的语言。但是如果你还能将参数传递给字段的话，事情会变得更有趣。
```graphql
{
  human(id: "1000") {
    name
    height
  }
}
```
```js
{
  "data": {
    "human": {
      "name": "Luke Skywalker",
      "height": 1.72
    }
  }
}
```
在像REST这样的系统中，您只能传递一组参数(paramter和url query)。但是在GraphQL中，每个字段和嵌套对象都可以获取自己的参数集，从而使一次GraphQL查询可以完全代替多个传统的API请求。您甚至可以将参数传递到标量字段中并在服务器上实现数据转换，而不需要在客户端上进行。

```graphql
{
  human(id: "1000") {
    name
    height(unit: FOOT)
  }
}
```

```js
{
  "data": {
    "human": {
      "name": "Luke Skywalker",
      "height": 5.6430448
    }
  }
}
```

参数可以是很多不同的类型。在上面的例子中，我们使用了一个枚举类型，它表示一组有限的选项之一（在这种情况下是长度单位，METER或FOOT）。 GraphQL带有默认的类型，但是GraphQL服务器也可以声明自定义类型。只要能将它们序列化为可传输的格式。



## 别名（Aliases）
也许您已经注意到，相对应的结果字段名与查询字段名相同，但却不包括该字段的查询参数，因此您不能直接使用不同的参数查询相同的字段。这就是为什么你需要别名的原因。
```graphql
{
  empireHero: hero(episode: EMPIRE) {
    name
  }
  jediHero: hero(episode: JEDI) {
    name
  }
}
```

```js
{
  "data": {
    "empireHero": {
      "name": "Luke Skywalker"
    },
    "jediHero": {
      "name": "R2-D2"
    }
  }
}
```



## 片段（Fragments）

假设我们的应用中存在一个比较复杂的页面，可以一次性展示两个角色并列出他们的朋友信息。可以想象，这样一个查询可能会很快变得复杂，因为我们需要重复写角色字段至少两次。

这就是为什么GraphQL包含“片段”这种可重用单元。片段让您构建一组字段，然后我们可以将它们包含在需要的查询中。以下是使用片段解决上述情况的示例：

```graphql
{
  leftComparison: hero(episode: EMPIRE) {
    ...comparisonFields
  }
  rightComparison: hero(episode: JEDI) {
    ...comparisonFields
  }
}

fragment comparisonFields on Character {
  name
  appearsIn
  friends {
    name
  }
}
```

```js

{
  "data": {
    "leftComparison": {
      "name": "Luke Skywalker",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "friends": [
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        },
        {
          "name": "C-3PO"
        },
        {
          "name": "R2-D2"
        }
      ]
    },
    "rightComparison": {
      "name": "R2-D2",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "friends": [
        {
          "name": "Luke Skywalker"
        },
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        }
      ]
    }
  }
}
```
如果重复这些字段，您可以看到上述查询将如何重复。片段的概念经常用于将复杂的应用程序数据需求分解成更小的块，特别是当您需要将大量具有不同片段的UI组件合并到一个初始数据请求时。

## 变量（variables）

到目前为止，我们一直在查询字符串中写入所有的参数。 但在大多数应用程序中，字段的参数将是动态的：例如，可能会有一个下拉列表，您可以选择您感兴趣的星球大战插曲，或搜索字段或一组过滤器。

在查询字符串中直接传递这些动态参数并不是一个好主意，因为我们的客户端代码需要在运行时动态地处理查询字符串，并将其序列化为特定于图形的格式。 相反，GraphQL具有将查询中的动态值参数化的一级方法(first-class way)，并将其作为单独的字典传递。 这些值称为 _变量_ 。

当开始使用变量之时，我们需要做三件事情：

1. 用`$variableName`替换查询语句中静态的值
2. 声明`$variableName`为一个被查询语句接收的变量之一
3. 将`$variableName: value`写入到一种传输专用的变量字典中(通常是JSON)，用来与查询语句分别传输到服务器上。

整合后的结果：

- query

  ```graphql
  query HeroNameAndFriends($episode: Episode) {
    hero(episode: $episode) {
      name
      friends {
        name
      }
    }
  }
  ```

- variables

  ```json
  {
    "episode": "JEDI"
  }
  ```

- result

  ```json
  {
    "data": {
      "hero": {
        "name": "R2-D2",
        "friends": [
          {
            "name": "Luke Skywalker"
          },
          {
            "name": "Han Solo"
          },
          {
            "name": "Leia Organa"
          }
        ]
      }
    }
  }
  ```

现在，在我们的客户端代码中，我们可以简单地传递一个不同的变量，而不需要构造一个全新的查询。 这通常也是一个好的做法，表示我们的查询中的哪些参数预期是动态的 - 我们不应该使用字符串插值来从用户提供的值构造查询。

### 变量定义

变量定义是上面查询中的（`$episode：Episode`）部分。 它的作用就像类型语言中函数的参数定义一样。 它列出所有变量，前缀为$，后跟其类型（当前为`Episode`）。

所有声明的变量必须是标量，枚举或输入对象类型。 因此，如果要将复杂对象传递到字段中，则需要知道在服务器上匹配的输入类型。 在“架构”页面上了解有关输入对象类型的更多信息。

变量定义可以是可选的或必需的。 在上面的情况下，因为没有！ 在Episode类型后面，所以它是可选的。 但是，如果要将变量传递给需要非空参数的字段，那么该变量也必须是必需的。

要了解有关这些变量定义的语法的更多信息，学习GraphQL模式语言非常有用。 模式语言在Schema页面中有详细的说明。

### 默认变量

可以在变量的类型声明后面添加该变量的默认值

```graphql
query HeroNameAndFriends($episode: Episode = "JEDI") {
  hero(episode: $episode) {
    name
    friends {
      name
    }
  }
}
```

## 操作名（Operation  name）

从上面的查询例子我们可以看到一个`HeroNameAndFriends`的操作名。但到目前为止，我们大部分是在速记语法，省略查询关键字和查询名称，但在生产中，这钟写法会使我们的代码不明确。

想想这就像你最喜欢的编程语言中的函数名。 例如，在JavaScript中，我们可以轻松地使用匿名函数，但是当我们给一个函数一个名字时，跟踪它更容易，调试我们的代码，并在被调用时记录。 以同样的方式，GraphQL查询和变量名称以及片段名称可以作为服务器端的一个有用的调试工具来识别不同的GraphQL请求。

## 指令（Directives）

我们上面讨论了变量如何使我们避免进行手动字符串插值来构造动态查询。 在参数中传递变量解决了这些问题的一部分，但是我们也可能需要一种使用变量来动态地更改查询的结构和形状的方法。 例如，我们可以想象一个UI组件，它具有一个总结和详细的视图，其中一个包含比另一个更多的字段。让我们来为这样的组件构建一个查询语句：

- query

  ```graphql
  query Hero($episode: Episode, $withFriends: Boolean!) {
    hero(episode: $episode) {
      name
      friends @include(if: $withFriends) {
        name
      }
    }
  }
  ```

- variables

  ```json
  {
    "episode": "JEDI",
    "withFriends": false
  }
  ```

- result

  ```json
  {
    "data": {
      "hero": {
        "name": "R2-D2"
      }
    }
  }
  ```

尝试编辑上面的变量（比如将`true`传给`withFriends`），看看结果如何变化。

我们需要在GraphQL中使用一个新功能，称为一个指令。 一个指令可以附加到字段或片段包含，并且可以以服务器的任何方式影响查询的执行。 核心GraphQL规范仅包含两个指令，这些指令必须由任何符合规范的GraphQL服务器实现支持：

- `@include(if: Boolean)` 仅当参数为`true`时返回结果才包括这个字段
- `@skip(if: Boolean)` 当参数为`true`时跳过这个字段

指令可用于摆脱需要执行字符串操作以在查询中添加和删除字段的情况。 服务器实现也可以通过定义全新的指令来添加实验功能。

## 修改（Mutations）

大多数关于GraphQL的讨论集中于数据获取，但是任何完整的数据平台也需要一种修改服务器端数据的方法。

在REST中，任何请求可能会导致在服务器上造成一些副作用，但按照惯例，建议不要使用GET请求来修改数据。 GraphQL是类似的：技术上任何查询都可以被实现来进行数据写入。 但是，建立一个约定，任何导致写入的操作都应该通过修改操作显式发送。

就像查询一样，如果修改字段返回一个对象类型，可以要求嵌套字段。 这可以在更新后获取对象的新状态。 我们来看一个简单的例子：

- mutation

  ```graphql
  mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
    createReview(episode: $ep, review: $review) {
      stars
      commentary
    }
  }
  ```

- varialbes

  ```json
  {
    "ep": "JEDI",
    "review": {
      "stars": 5,
      "commentary": "This is a great movie!"
    }
  }
  ```

- result

  ```json
  {
    "data": {
      "createReview": {
        "stars": 5,
        "commentary": "This is a great movie!"
      }
    }
  }
  ```

注意`createReview`字段是如何返回新创建的`review`中的`commentary`和`stars`字段的。 这在修改已有字段的时候尤其有用，例如，当增加一个字段时，我们可以通过一个请求来同时修改该字段并查询该字段的新值。

您可能还会注意到，在本示例中，我们传入的评论变量不是标量。 它是一个输入对象类型，可以作为参数传入的特殊种类的对象类型。 详细了解“架构”页面上的输入类型。

### 修改多个字段

像查询操作一样，一个修改操作可以包含多个字段，但是两者之间有一个重大的差异：   

__查询操作是并行的，而修改操作是串行的__

这意味着，如果我们在一个修改操作中两次修改`incremenetCredits`字段的操作，第一个操作在保证结束后才会执行第二个操作。避免出现竞争情况。



## 内联片段（inline Fragments）

跟其他类型系统一样，GraphQL也可以定义接口（Interfaces）和联合类型（Union Types）。详情见schema guide

你可以使用内联片段来访问一个接口或者联合类型中所包含的数据。用下面这个例子可以很方便的说明：

- query

  ```graphql
  query HeroForEpisode($ep: Episode!) {
    hero(episode: $ep) {
      name
      ... on Droid {
        primaryFunction
      }
      ... on Human {
        height
      }
    }
  }
  ```

- variables

  ```json
  {
    "ep": "JEDI"
  }
  ```

- result

  ```json
  {
    "data": {
      "hero": {
        "name": "R2-D2",
        "primaryFunction": "Astromech"
      }
    }
  }
  ```

在这个查询中，`hero`字段返回类型为`Character`，它可能是`Human`或`Droid`，这取决于参数`episode`。 在直接选择中，您只能访问`Character`接口中存在的字段，如`name`。

要访问具体类型的字段，您需要使用特定类型（type condition）的内联片段。 第一个片段在`Droid`上被标记为`...`，所以只有当从`hero`返回的`Character`是`Droid`类型时，`primaryFunction`字段才会被执行。 类似于`Human`类型中的`height`字段。

命名片段也可以以相同的方式使用，因为命名片段始终包含限定类型。

### 元字段（Meta fields）

鉴于有些情况下您不知道从GraphQL服务返回的类型，您需要一些方法来确定如何处理客户端上的数据。 GraphQL允许您在查询中的任何位置请求`__typename`，一个元字段，以获取该点上对象类型的名称。

- query

  ```graphql
  {
    search(text: "an") {
      __typename
      ... on Human {
        name
      }
      ... on Droid {
        name
      }
      ... on Starship {
        name
      }
    }
  }
  ```

- result

  ```json
  {
    "data": {
      "search": [
        {
          "__typename": "Human",
          "name": "Han Solo"
        },
        {
          "__typename": "Droid",
          "name": "Leia Organa"
        },
        {
          "__typename": "Starship",
          "name": "TIE Advanced x1"
        }
      ]
    }
  }
  ```

在上述查询中，`search`返回可以是三个选项之一的联合类型。 在没有`__typename`字段的情况下，不可能将客户端的不同类型告诉客户端。

GraphQL服务提供了少量的元字段，其余的公开 于“内省”系统。
