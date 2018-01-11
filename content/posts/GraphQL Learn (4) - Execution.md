---
title: GraphQL Learn (4) - Execution
categories:
  - Web
date: '2017-08-15T00:00:00+08:00'
tags:
  - GraphQL
grammar_cjkRuby: true
---

经过验证，GraphQL查询由GraphQL服务器执行，然后返回一个与查询形状相同的结果，通常为JSON。

GraphQL无法执行没有类型系统的查询，让我们使用类型系统例子来说明执行查询，这个例子是我们教程中使用的类型系统中的一部分：

```graphql
type Query {
  human(id: ID!): Human
}
type Human {
  name: String
  appearsIn: [Episode]
  starships: [Starship]
}
enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}
type Starship {
  name: String
}
```
<!--more-->
为了解释执行查询语句时系统发生了什么，我们用下面的例子了跑一遍：

```graphql
# { "graphiql": true }
{
  human(id: 1002) {
    name
    appearsIn
    starships {
      name
    }
  }
}
```
```json
{
  "data": {
    "human": {
      "name": "Han Solo",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "starships": [
        {
          "name": "Millenium Falcon"
        },
        {
          "name": "Imperial shuttle"
        }
      ]
    }
  }
}
```

您可以将GraphQL查询中的每个字段视为返回下一个类型的类型函数或方法。 事实上，这正是GraphQL的工作原理。 每个类型的每个字段由GraphQL服务器开发人员提供的称为解析器 _resolver_ 的函数支持。 当一个字段被执行时，相应的解析器被调用以产生下一个值。

如果一个字段产生一个标量值，如字符串或数字，则执行完成。 但是，如果一个字段产生一个对象值，则该查询将应用于他的子字段。 这样一直迭代到标量值。 GraphQL查询始终以标量值结束。



## 根字段和解析器（Root fields & resolvers）

每个GraphQL服务器的最顶层是一个特殊的类型，表示GraphQL API中所有可能入口点，通常称为根类型（Root type）或查询类型(Query type)。

在这个例子中，我们的查询类型提供了一个接受参数`id` 的`human`字段。此字段的解析函数可能通过访问数据库来构造并返回一个`Human`对象。

```js
Query: {
  human(obj, args, context) {
    return context.db.loadHumanByID(args.id).then(
      userData => new Human(userData)
    )
  }
}
```
该示例使用JavaScript编写，但是GraphQL服务器可以使用许多[不同的语言](http://graphql.org/code/)构建。 解析器函数接收三个参数：

- `obj` 前一个对象，对于查询类型（Query type）中的字段来说不常用。
- `args` GraphQL提供的参数。
- `context` 提供给每个解析器并保存重要的上下文信息（如当前登录的用户、访问数据库）的值。
## 异步解析器（Asynchronous resolvers）
我们来仔细看看这个解析器函数发生了什么：
```js
human(obj, args, context) {
  return context.db.loadHumanByID(args.id).then(
    userData => new Human(userData)
  )
}
```
`context`用于提供对数据库的访问，通过GraphQL查询提供的参数`id`来向数据库查询数据。 由于数据库查询是异步操作，所以返回一个Promise。 在JavaScript中，Promises用于处理异步值，但是在许多语言中都存在相同的概念，通常称为 _Futures_ ， _Tasks_ 或 _Deferred_ 。 当数据库返回时，我们可以构造并返回一个新的 _Human_ 对象。

另外，虽然解析器函数需要留意Promises的使用，但是GraphQL查询不会。 在执行期间，GraphQL将等待Promises/Futures和Tasks完成，然后继续，并以最佳并发方式执行此操作。



## 微型解析器（Trivial resolvers）
至此，我们已经得到了`Human`对象，GraphQL将在这个对象内所要求的字段中继续执行。

```js
Human: {
  name(obj, args, context) {
    return obj.name
  }
}
```
GraphQL服务由类型系统组成，它能够帮助服务确定下一步做什么的。 即使在`human`字段返回之前，GraphQL知道下一步将是解决`Human`中的字段，因为类型系统告诉`human`字段将返回一个`Human`。

上面代码中的名称解析是很直接的。 调用名称解析函数，然后obj参数来自于上一个字段返回的新的`Human`对象。 我们期望`Human`对象有一个`name`属性，我们可以直接读取并返回。

实际上，许多GraphQL库可以让你省略这个简单的解决方案，一个约定：假如一个字段没有提供解析函数，那么应该读取和返回同名的属性。



## 标量强转（Scalar coercion）
当`name`字段正在解析时，`appearsIn`和`starships`字段也可以同时进行解析。 `appearsIn`字段也可以有一个微型解析器，但是让我们进一步了解一下：

```js
Human: {
  appearsIn(obj) {
    return obj.appearsIn // returns [ 4, 5, 6 ]
  }
}
```
请注意，我们的类型系统声明`appearsIn`将返回一直枚举值中的一个，但此函数却返回数字！实际上，如果我们查看结果，我们将看到正在返回适当的枚举值。 这是怎么回事？

这是标量强转的一个例子。 类型系统知道期望的类型并将解析器函数返回的值转换为API约定中的内容。 在例子中，我们的服务器上可能会定义一个Enum，它在内部使用数字比如4,5和6，但在GraphQL类型系统中将它们表示为枚举值。

## 列表解析器（List resolvers）
之前我们已经看到了`appearsIn`字段返回列表的情况，因为这是系统期望的类型，列表中的每个项将被被强转为对应的枚举类型。 当`starships`解析时会发生什么？

```js
Human: {
  starships(obj, args, context) {
    return obj.starshipIDs.map(
      id => context.db.loadStarshipByID(id).then(
        shipData => new Starship(shipData)
      )
    )
  }
}
```
该字段的解析器不是单单返回一个Promise，它返回了一个Promises列表。 `Human`对象有他们驾驶的`Starships`的id列表，但是我们需要通过所有这些id来获得真正的`Starship`对象。

GraphQL将在继续之前同时等待所有这些Promises，并且当剩下一个对象列表时，它将同时继续加载每个这些项目上的`name`字段。



## 产出结果（Producing the result）
当每个字段被解析时，结果值被放置到键值映射中，字段名称（或别名）作为键，解析出来的值作为值，这这过程从查询底部叶子节点的字段往上直到原始字段的根查询类型。 总而言之，它们产生一个镜像的原始查询结构，然后可以将其发送（通常为JSON）到请求的客户端。

我们来看看最初的查询，看看这些解析函数如何产生一个结果：

```graphql
# { "graphiql": true }
{
  human(id: 1002) {
    name
    appearsIn
    starships {
      name
    }
  }
}
```

```json
{
  "data": {
    "human": {
      "name": "Han Solo",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "starships": [
        {
          "name": "Millenium Falcon"
        },
        {
          "name": "Imperial shuttle"
        }
      ]
    }
  }
}
```

