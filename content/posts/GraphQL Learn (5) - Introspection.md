---
title: GraphQL Learn (5) - Introspection
categories:
  - Web
date: '2017-08-15T00:00:00+08:00'
tags:
  - GraphQL
grammar_cjkRuby: true
---


查询GraphQL架构有关它支持的查询的信息通常很有用。 GraphQL允许我们使用内省系统来做到这一点！对于我们的星球大战例子来说，文件[starWarsIntrospection-test.js](https://github.com/graphql/graphql-js/blob/master/src/__tests__/starWarsIntrospection-test.js)包含许多查询内省系统的查询，并且是一个完整的按照规范实现的测试文件。

我们设计了类型系统，所以我们应该知道系统中可用的类型。但是如果不知道，我们还可以通过查询__schema字段来询问GraphQL。这个字段始终存在于根类型中。
<!--more-->

```graphql
# { "graphiql": true }
{
  __schema {
    types {
      name
    }
  }
}
```
```json
{
  "data": {
    "__schema": {
      "types": [
        {
          "name": "Query"
        },
        {
          "name": "Episode"
        },
        {
          "name": "Character"
        },
        {
          "name": "ID"
        },
        {
          "name": "String"
        },
        {
          "name": "Int"
        },
        {
          "name": "FriendsConnection"
        },
        {
          "name": "FriendsEdge"
        },
        {
          "name": "PageInfo"
        },
        {
          "name": "Boolean"
        },
        {
          "name": "Review"
        },
        {
          "name": "SearchResult"
        },
        {
          "name": "Human"
        },
        {
          "name": "LengthUnit"
        },
        {
          "name": "Float"
        },
        {
          "name": "Starship"
        },
        {
          "name": "Droid"
        },
        {
          "name": "Mutation"
        },
        {
          "name": "ReviewInput"
        },
        {
          "name": "__Schema"
        },
        {
          "name": "__Type"
        },
        {
          "name": "__TypeKind"
        },
        {
          "name": "__Field"
        },
        {
          "name": "__InputValue"
        },
        {
          "name": "__EnumValue"
        },
        {
          "name": "__Directive"
        },
        {
          "name": "__DirectiveLocation"
        }
      ]
    }
  }
}
```

哇哦，这上面输出了很多类型，他们代表什么？让我们对他们进行一下分类：

 - **Query, Character, Human, Episode, Droid** - 这些都是我们在类型系统中定义的类型
 - **String, Boolean** - 这些是类型系统中内建的标量类型
 - ** \_\_Schema, \_\_Type, \_\_TypeKind, \_\_Field, \_\_InputValue, _\_EnumValue, \_\_Directive  ** 这些名字都用双下划线做前缀，用来表示是内省系统里的类型。

现在，让我们开始探索系统可用的查询。首先，当设计我们的类型系统时，我们指定了一个起始查询的类型，让内省系统告诉我们起始查询的名字：

```graphql
# { "graphiql": true }
{
  __schema {
    queryType {
      name
    }
  }
}
```
```json
{
  "data": {
    "__schema": {
      "queryType": {
        "name": "Query"
      }
    }
  }
}
```

返回的结果与类型系统部分中所描述的匹配，`Query`类型是我们将要开始的地方！ 请注意，这里的命名只是为了方便，我们可以将`Query`类型命名为其他任何东西，如果我们指定它是查询的起始类型，系统仍然会返回相应的结果。虽然将它命名为`Query` 是一个比较实用的约定。

让我们来看看`Droid`类型：

```graphql
# { "graphiql": true }
{
  __type(name: "Droid") {
    name
  }
}
```
```json
{
  "data": {
    "__type": {
      "name": "Droid"
    }
  }
}
```

如果我们需要知道更多的关于Droid的信息，比如说其中的一个接口或对象呢？

```graphql
# { "graphiql": true }
{
  __type(name: "Droid") {
    name
    kind
  }
}
```
```json
{
  "data": {
    "__type": {
      "name": "Droid",
      "kind": "OBJECT"
    }
  }
}
```

`kind`返回一个`__TypeKind`的枚举类型，值为`OBJECT1`，如果我们直接查询`Character`而不在接口里面的话呢？

```graphql
# { "graphiql": true }
{
  __type(name: "Character") {
    name
    kind
  }
}
```
```json
{
  "data": {
    "__type": {
      "name": "Character",
      "kind": "INTERFACE"
    }
  }
}
```

知道一个对象所包含的所有字段是很常见的需求。所以，让我们继续查询`Droid`上面的内省系统：

```graphql
# { "graphiql": true }
{
  __type(name: "Droid") {
    name
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}
```
```json
{
  "data": {
    "__type": {
      "name": "Droid",
      "fields": [
        {
          "name": "id",
          "type": {
            "name": null,
            "kind": "NON_NULL"
          }
        },
        {
          "name": "name",
          "type": {
            "name": null,
            "kind": "NON_NULL"
          }
        },
        {
          "name": "friends",
          "type": {
            "name": null,
            "kind": "LIST"
          }
        },
        {
          "name": "friendsConnection",
          "type": {
            "name": null,
            "kind": "NON_NULL"
          }
        },
        {
          "name": "appearsIn",
          "type": {
            "name": null,
            "kind": "NON_NULL"
          }
        },
        {
          "name": "primaryFunction",
          "type": {
            "name": "String",
            "kind": "SCALAR"
          }
        }
      ]
    }
  }
}
```

这些就是我们在`Droid`上面定义的字段！

`id`看起来有点奇怪，它没有类型的名称。 因为它是一种“封装”的`NON_NULL`类型。 如果我们查询该字段类型的`ofType`信息，我们将会得到一个ID类型，告诉我们这是一个非空ID。
相似的，`friends`和`appearsIn`也没有类型名，因为他们是一个`LIST`封装过的类型。我们可以查询他们的`ofType`信息，我们将会得到一个`LIST`类型。

```graphql
# { "graphiql": true }
{
  __type(name: "Droid") {
    name
    fields {
      name
      type {
        name
        kind
        ofType {
          name
          kind
        }
      }
    }
  }
}
```
```json
{
  "data": {
    "__type": {
      "name": "Droid",
      "fields": [
        {
          "name": "id",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "ID",
              "kind": "SCALAR"
            }
          }
        },
        {
          "name": "name",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "String",
              "kind": "SCALAR"
            }
          }
        },
        {
          "name": "friends",
          "type": {
            "name": null,
            "kind": "LIST",
            "ofType": {
              "name": "Character",
              "kind": "INTERFACE"
            }
          }
        },
        {
          "name": "friendsConnection",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "FriendsConnection",
              "kind": "OBJECT"
            }
          }
        },
        {
          "name": "appearsIn",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null,
              "kind": "LIST"
            }
          }
        },
        {
          "name": "primaryFunction",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        }
      ]
    }
  }
}
```

让我们在这个非常适合作为一个工具的内省系统特性上结束本教程。让用户向系统本身查询文档！

```graphql
# { "graphiql": true }
{
  __type(name: "Droid") {
    name
    description
  }
}
```
```json
{
  "data": {
    "__type": {
      "name": "Droid",
      "description": "An autonomous mechanical character in the Star Wars universe"
    }
  }
}
```

我们可以使用内省系统访问有关类型系统的文档，并创造一种文档浏览器或富IDE的体验。

这些只是内省系统的冰山一角，我们还可以查询枚举值、一个类型实现的接口等等。 我们甚至可以内省我们的内省系统本身。 该规范在“Introspection”部分中有关于该主题的更多细节，GraphQL.js中的 [introspection](https://github.com/graphql/graphql-js/blob/master/src/type/introspection.js)文件包含规范的代码实现。
