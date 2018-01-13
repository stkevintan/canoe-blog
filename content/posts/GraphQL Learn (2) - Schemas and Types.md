---
title: GraphQL Learn (2) - Schemas and Types
categories:
  - Web
date: '2017-08-15T00:00:00+08:00'
tags:
  - GraphQL
grammar_cjkRuby: true
---


在此页面上，您将了解有关GraphQL类型系统的所有知识，以及如何描述可查询哪些数据。 由于GraphQL可以与任何后端框架或编程语言一起使用，因此我们将远离实现特定的详细信息，仅讨论概念。

### 类型系统（Type System）



如果您以前看过GraphQL查询，那么你应该知道GraphQL查询语言基本上是在对象上选择字段。 所以在以下查询中：

```graphql
{
  hero {
    name
    appearsIn
  }
}
```
<!--more-->
```json
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ]
    }
  }
}
```



1. 从一个特殊的 "root"对象开始
2. 在它里面选择一个`hero`字段
3. 在`hero`返回的对象中，我们继续选择 `name` 和 `appearsIn` 字段

因为GraphQL查询的形状与结果非常相似，所以您可以预测什么是查询将返回，而不必关心服务器的设置。 但是我们还是需要对我们所请求的数据进行详细的描述： 

- 我们可以选择哪些字段？ 
- 他们可能返回什么样的对象？ 
- 这些子对象里面包含哪些字段？ 

这就是schema所需要解决的问题。

每个GraphQL服务定义一组完全描述可以在该服务上查询的可能数据的类型。 然后，当收到查询时，它们将根据该架构进行验证和执行。.

### 类型语句（Type language）

GraphQL服务可以用任何语言编写。我们不能依赖特定的编程语言语法（如JavaScript），因此我们将使用“GraphQL schema 语言” ，它类似于查询语言，并允许我们以语言无关的方式谈论GraphQL的架构。

### 对象的类型和字段（Object types and fields）

GraphQL的最基本的组件是对象类型，表示你可以从服务中获取的一种对象，以及它具有哪些字段。 在GraphQL schema语言中，我们可以这样表示：

```graphql
type Character {
  name: String!
  appearsIn: [Episode]!
}
```

可读性已经很高了，但是让我们再过一遍，以便于让我们在细节上拥有共同的语言：

- `Character`是一个对象类型，大多数情况下，schema里面的type都是一个对象
- `name`和`appearsIn`是`Character`中的字段。意味着在任何查询包含`Character` 类的时候`name`和`appearsIn`是仅有且必须出现在其中的字段
- `String`是内置的标量类型之一，标量是GraphQL中的最小的类型，不能再做子选择了。 我们会稍后再看标量类型。


- `String!`代表着这个字段是不为空的，GraphQL服务保证在这个字段上返回一个不为空的值。
- `[Episode]!`代表着一个包含`Episode`对象的数列，它也是不为空的，因此当你查询`appearsIn`字段时，GraphQL永远会返回一个数组，即使是一个空数组。

现在，您知道GraphQL对象类型是什么样子了，并且掌握了如何读取GraphQL类型语言的基础知识。

### 参数（Arguments）

GraphQL对象类型上的每个字段都可以有零个或多个参数，例如下面的`length`字段：

```graphql
type Starship {
  id: ID!
  name: String!
  length(unit: LengthUnit = METER): Float
}
```

所有参数都是有命名的。与JavaScript和Python这样的语言不同，函数采用有序参数列表，GraphQL中的所有参数都是通过名称进行传递。上面例子中，`length`字段有一个定义的参数，`unit`。

参数可以是必需的或可选的。当参数是可选的时候，我们可以定义一个默认值 。上面例子中，如果`unit`参数没有被传递，默认情况下它将被设置为`METER`。



### Query和Mutation类型（The Query and Mutation types）

schema中的大多数类型将只是普通对象类型，但其中有两种特殊的类型：

```graphql
schema {
  query: Query
  mutation: Mutation
}
```

每个GraphQL服务都有一个`query`类型，但可能有也可能没有`mutation`类型。 这些类型与常规对象类型相同，但它们是特殊的，因为它们定义了每个GraphQL查询的入口点。 所以如果你看到一个查询：

```graphql
query {
  hero {
    name
  }
  droid(id: "2000") {
    name
  }
}
```

```json
{
  "data": {
    "hero": {
      "name": "R2-D2"
    },
    "droid": {
      "name": "C-3PO"
    }
  }
}
```



这意味着GraphQL服务需要一个具有`hero`和`droid`字段的`query`类型：

```graphql
type Query {
  hero(episode: Episode): Character
  droid(id: ID!): Droid
}
```

`Mutation`相同，您可以定义`Mutation`类型上的字段，这些字段就是你能变更的根字段。

重要的是要记住，除了作为模式的“入口点”的特殊状态之外，“查询和变更”类型与任何其他GraphQL对象类型相同，它们的字段的工作方式完全相同。



### 标量类型（Scalar types）

GraphQL对象类型具有名称和字段，但在某些时候，这些字段必须解析为某些具体数据。 这就是标量类型的来历：它们代表查询最低端的叶子节点。下面查询中，`name`和`appearsIn`将会被解析为标量类型（因为这两个字段没有任何子字段，他们是本次查询的叶子节点）：

```graphql
{
  hero {
    name
    appearsIn
  }
}
```

```json
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ]
    }
  }
}
```



GraphQL默认自带了一些变量类型：

- `Int`: 带符号32位的整数.
- `Float`: 带符号的双精度浮点数.
- `String`: UTF-8的字符串.
- `Boolean`: `true` 或`false`.
- `ID`: ID标量类型表示一个唯一的标识，通常用于重新获取对象或作为缓存中的键。 ID类型其实就是String类型; 然而将其定义为ID表示它是没有可读性的。

在大多数GraphQL服务实现中，还有一种方法来自定义标量类型。 例如，我们可以定义一个日期类型：

```graphql
scalar Date
```

然后由我们的自己来实现该自定义类型如何序列化，反序列化和验证。 例如，您可以指定Date类型应始终序列化为整数时间戳，并且让你的客户端也知道该格式。



### 枚举类型（Enumeration types）

也称为枚举（ _Enums_ ），枚举类型是一种特殊类型的标量，仅限于一组特定的允许值。 这样你可以：

1. 验证此类型的任何参数是允许的值之一
2. 通过类型系统沟通一个字段永远是一组有限的值

以下是GraphQL Schema语言中的枚举定义：

```graphql
enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}
```

这意味着无论何时我们在Schema中使用`Episode`类型时，其对应的值永远都是`NEWHOPE`, `EMPIRE`,  `JEDI`中间的一个。

请注意，各种语言的GraphQL服务实现将以自己的语言特定方式来处理枚举。 以支持枚举作“为一流公民”的语言，某些实现可能会利用这一点; 在没有枚举支持的JavaScript语言中，这些值可能在内部映射到一组整数。 但是，这些细节不会泄露给客户端，客户端可以完全按照枚举值的字符串名称进行操作。



### 列表和非空类型（Lists and Non-Null）

对象类型，标量和枚举是GraphQL中唯一可以定义的类型。 但是当您在Schema的其他部分或查询变量声明中使用这些类型时，可以使用类型修饰符来影响这些值的验证规则。 我们来看一个例子：

```graphql
type Character {
  name: String!
  appearsIn: [Episode]!
}
```

在这里，我们使用一个String类型，并通过在它之后添加一个感叹号将其标记为一个非空类型。 这意味着我们的服务器总是期望为此字段返回一个非空值，如果最终得到一个空值，实际上会触发一个GraphQL执行错误，让客户端知道出现了一些问题。

在定义字段的参数时，也可以使用非空类型修饰符，如果将null值作为该参数传递，则GraphQL服务器将返回验证错误，无论是在GraphQL字符串还是变量中。

```graphql
query DroidById($id: ID!) {
  droid(id: $id) {
    name
  }
}
```

```json
{
  "id": null
}
```

```json
{
  "errors": [
    {
      "message": "Variable \"$id\" of required type \"ID!\" was not provided.",
      "locations": [
        {
          "line": 1,
          "column": 17
        }
      ]
    }
  ]
}
```



列表以类似的方式工作：我们可以使用类型修饰符将类型标记为List，这表示该字段将返回该类型的数组。 在模式语言中，通过将类型包装在方括号`[`和`]`中来表示。 它与参数的表现相同但验证步骤将期望该值的数组。

非空修饰符和列表修饰符可以一起使用，例如，你可以要求一个由非空字符串组成的列表：

```graphql
myField: [String!]
```

这意味着列表本身可以为空，但它不能有任何空的成员。例如，在返回的JSON中：

```js
myField: null // valid
myField: [] // valid
myField: ['a', 'b'] // valid
myField: ['a', null, 'b'] // error
```

现在，让我们定义一个由字符串组成的非空数组：

```graphql
myField: [String]!
```

这意味着列表本身不能为空，但它可以包含空值：

```js
myField: null // error
myField: [] // valid
myField: ['a', 'b'] // valid
myField: ['a', null, 'b'] // valid
```

您可以根据需要随意嵌套任意数量的非空和列表修饰符。

### 接口（Interfaces）

像许多类型的系统一样，GraphQL支持接口。 接口是一种抽象类型，它包含一组类型必须包含已实现该接口的字段。

例如，你可以有一个`Character`接口表示星球大战三部曲中的任何角色：

```graphql
interface Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
}
```

这意味着，任何实现了`Character`接口的类型，都必须拥有这些字段，包括他们的参数和返回类型。例如，下面列举了一些实现`Character`接口的类型：

```graphql
type Human implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  starships: [Starship]
  totalCredits: Int
}

type Droid implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  primaryFunction: String
}
```

您可以看到，这两种类型都具有`Character`接口中的所有字段，还可以引入特定类型字符的额外字段，`totalCredits`，`starships`和`primaryFunction`。

当您要返回一个对象或一组对象时，接口很有用，但这些对象可能有几种不同的类型。

请注意以下查询会产生错误：

```graphql
# { "graphiql": true, "variables": { "ep": "JEDI" } }
query HeroForEpisode($ep: Episode!) {
  hero(episode: $ep) {
    name
    primaryFunction
  }
}
```

```json
{
  "ep": "JEDI"
}
```



```json
{
  "errors": [
    {
      "message": "Cannot query field \"primaryFunction\" on type \"Character\". Did you mean to use an inline fragment on \"Droid\"?",
      "locations": [
        {
          "line": 4,
          "column": 5
        }
      ]
    }
  ]
}
```

`hero`字段返回字符类型，这意味着它可能是`Human`或`Droid`，取决于`episode`参数。 在上面的查询中，您只能询问`Character`接口中存在的字段，不包括`primaryFunction`。

为了得到在一个特定对象类型中的字段，你需要使用内联片段(inline fragment)

```graphql
query HeroForEpisode($ep: Episode!) {
  hero(episode: $ep) {
    name
    ... on Droid {
      primaryFunction
    }
  }
}
```

```json
{
  "ep": "JEDI"
}
```

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



### 联合类型（Union types）



联合类型与接口非常相似，但它们不能指定类型之间的任何公共字段。

```graphql
union SearchResult = Human | Droid | Starship
```

当Schema返回了一个`SearchResult`类型，我们实际上可能会得到一个`Human`，一个`Droid`或者一个`Starship`。 注意，联合类型的成员需要是具体的对象类型; 您不能在接口或其他联合类型之上再创造一个联合类型。（扁平结构）

在这种情况下，如果查询返回的是`SearchResult`这样的联合类型字段，则需要使用条件片段才能查询其中的任意子字段：

```graphql
{
  search(text: "an") {
    ... on Human {
      name
      height
    }
    ... on Droid {
      name
      primaryFunction
    }
    ... on Starship {
      name
      length
    }
  }
}
```

```json
{
  "data": {
    "search": [
      {
        "name": "Han Solo",
        "height": 1.8
      },
      {
        "name": "Leia Organa",
        "height": 1.5
      },
      {
        "name": "TIE Advanced x1",
        "length": 9.2
      }
    ]
  }
}
```



### 输入类型（Input types）

到目前为止，我们只谈到将标量值（如枚举或字符串）作为参数传递到一个字段中。 但您也可以轻松地传递复杂的对象。 这在变更（Mutation）的情况下特别有价值，在这种情况下，您可能想要传入要创建的整个对象。 在GraphQL Schema语言中，输入类型与常规对象类型完全相同，但使用关键字`input`而不是`type`：

```graphql
input ReviewInput {
  stars: Int!
  commentary: String
}
```

下面是如何在变更语句中使用输入类型对象的例子：

```graphql
mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
  createReview(episode: $ep, review: $review) {
    stars
    commentary
  }
}
```

```json
{
  "ep": "JEDI",
  "review": {
    "stars": 5,
    "commentary": "This is a great movie!"
  }
}
```

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



输入类型对象上的字段本身可以引用其他输入类型对象，但是您不能在Schema中混合输入和输出类型。 输入类型对象也不能在其字段上有参数。
