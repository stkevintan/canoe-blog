---
title: GraphQL Learn (3) - Validation
categories:
  - Web
date: '2017-08-15T00:00:00+08:00'
tags:
  - GraphQL
grammar_cjkRuby: true
---

通过使用类型系统，可以预先确定GraphQL查询是否有效。 这样可以让服务器和客户端有效地通知开发人员在创建无效查询时，无需在运行时检查。

对于我们的星球大战示例，文件[starWarsValidation-test.js](https://github.com/graphql/graphql-js/blob/master/src/__tests__/starWarsValidation-test.js)包含许多无效的查询，可以用来测试当前实现的验证器。

首先，我们来看一个复杂的有效查询。 这是一个嵌套查询，类似于上一节的一个示例，但将重复的字段分解成一个片段：
<!--more-->
```
{
  hero {
    ...NameAndAppearances
    friends {
      ...NameAndAppearances
      friends {
        ...NameAndAppearances
      }
    }
  }
}

fragment NameAndAppearances on Character {
  name
  appearsIn
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
      ],
      "friends": [
        {
          "name": "Luke Skywalker",
          "appearsIn": [
            "NEWHOPE",
            "EMPIRE",
            "JEDI"
          ],
          "friends": [
            {
              "name": "Han Solo",
              "appearsIn": [
                "NEWHOPE",
                "EMPIRE",
                "JEDI"
              ]
            },
            {
              "name": "Leia Organa",
              "appearsIn": [
                "NEWHOPE",
                "EMPIRE",
                "JEDI"
              ]
            },
            {
              "name": "C-3PO",
              "appearsIn": [
                "NEWHOPE",
                "EMPIRE",
                "JEDI"
              ]
            },
            {
              "name": "R2-D2",
              "appearsIn": [
                "NEWHOPE",
                "EMPIRE",
                "JEDI"
              ]
            }
          ]
        },
        {
          "name": "Han Solo",
          "appearsIn": [
            "NEWHOPE",
            "EMPIRE",
            "JEDI"
          ],
          "friends": [
            {
              "name": "Luke Skywalker",
              "appearsIn": [
                "NEWHOPE",
                "EMPIRE",
                "JEDI"
              ]
            },
            {
              "name": "Leia Organa",
              "appearsIn": [
                "NEWHOPE",
                "EMPIRE",
                "JEDI"
              ]
            },
            {
              "name": "R2-D2",
              "appearsIn": [
                "NEWHOPE",
                "EMPIRE",
                "JEDI"
              ]
            }
          ]
        },
        {
          "name": "Leia Organa",
          "appearsIn": [
            "NEWHOPE",
            "EMPIRE",
            "JEDI"
          ],
          "friends": [
            {
              "name": "Luke Skywalker",
              "appearsIn": [
                "NEWHOPE",
                "EMPIRE",
                "JEDI"
              ]
            },
            {
              "name": "Han Solo",
              "appearsIn": [
                "NEWHOPE",
                "EMPIRE",
                "JEDI"
              ]
            },
            {
              "name": "C-3PO",
              "appearsIn": [
                "NEWHOPE",
                "EMPIRE",
                "JEDI"
              ]
            },
            {
              "name": "R2-D2",
              "appearsIn": [
                "NEWHOPE",
                "EMPIRE",
                "JEDI"
              ]
            }
          ]
        }
      ]
    }
  }
}
```

这个查询是合法的，让我们看一些非法的查询：

片段不能引用自身或创建一个循环，因为这可能导致无限循环！ 以上是上述相同的查询，但没有弄明白的三层的嵌套关系。

```
{
  hero {
    ...NameAndAppearancesAndFriends
  }
}

fragment NameAndAppearancesAndFriends on Character {
  name
  appearsIn
  friends {
    ...NameAndAppearancesAndFriends
  }
}
```

```json
{
  "errors": [
    {
      "message": "Cannot spread fragment \"NameAndAppearancesAndFriends\" within itself.",
      "locations": [
        {
          "line": 11,
          "column": 5
        }
      ]
    }
  ]
}
```

当我们查询字段时，我们必须查询给定类型上存在的字段。 所以当`hereo`返回一个`Character`时，我们必须在一个`Character`字段上查询，然而该类型没有`favoriteSpaceship`字段，因此此查询无效：

```graphql
# INVALID: favoriteSpaceship does not exist on Character
{
  hero {
    favoriteSpaceship
  }
}
```

```json
{
  "errors": [
    {
      "message": "Cannot query field \"favoriteSpaceship\" on type \"Character\".",
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



每当我们查询一个字段并返回除标量或枚举之外的东西时，我们需要指定我们想从字段中获取的数据。 `hero`返回一个`Character`，而我们一直在请求其中的字段，如`name`和`appearIn`; 如果我们忽略，查询将不合法：

```graphql
# INVALID: hero is not a scalar, so fields are needed
{
  hero
}
```

```json
{
  "errors": [
    {
      "message": "Cannot query field \"favoriteSpaceship\" on type \"Character\".",
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

类似地，如果一个字段是一个标量，查询其中的其他字段就没有意义，这样做会使查询不合法：

```graphql
# INVALID: name is a scalar, so fields are not permitted
{
  hero {
    name {
      firstCharacterOfName
    }
  }
}
```

```json
{
  "errors": [
    {
      "message": "Field \"name\" must not have a selection since type \"String!\" has no subfields.",
      "locations": [
        {
          "line": 4,
          "column": 10
        }
      ]
    }
  ]
}
```

之前，有人指出，查询只能查询有关类型的字段; 当我们查询返回一个`Character`的`hero`时，我们只能查询`Character`上存在的字段。 如果要直接查询R2-D2s的主要功能，会发生什么？

```graphql
# INVALID: primaryFunction does not exist on Character
{
  hero {
    name
    primaryFunction
  }
}
```

```json
{
  "errors": [
    {
      "message": "Cannot query field \"primaryFunction\" on type \"Character\". Did you mean to use an inline fragment on \"Droid\"?",
      "locations": [
        {
          "line": 5,
          "column": 5
        }
      ]
    }
  ]
}
```

该查询无效，因为`primaryFunction`不是`Character`上字段。 我们想要一些判断，如果`Character`是`Droid`，则获取primaryFunction，否则忽略该字段。 我们可以使用前面介绍的片段（Fragment）来做到这一点。 通过设置一个在`Droid`上定义的片段并包含它，我们确保我们只查询已定义的`primaryFunction`。

```graphql
{
  hero {
    name
    ...DroidFields
  }
}

fragment DroidFields on Droid {
  primaryFunction
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

这个查询是合法的，但它有点冗长; 当我们需要多次使用它时，命名片段是有价值的，但是如果我们只使用一次，我们可以直接使用内联片段。

```graphql
{
  hero {
    name
    ... on Droid {
      primaryFunction
    }
  }
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

以上只是验证系统的表面一层，事实上存在这很多验证规则来确保GraphQL查询具有良好的语义和意义。规范中的"Validation"章节有更详细的介绍。[validation](https://github.com/graphql/graphql-js/blob/master/src/validation) 中包含了GraphQL符合规范的代码实现。

