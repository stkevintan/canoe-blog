---
title: neutron源码分析
date: '2016-10-28T22:52:02+08:00'
tags:
  - openstack
  - neutron
categories:
  - Cloud Computing
---
## 消息总线
Openstack各项目之间通过RESTful API进行通信；而项目内部不同服务进程则需要通过消息总线通信。关于消息总线的实现，包含在Openstack.oslo.messaging库中。
### RPC
远程过程调用，一个服务进程可以调用其他远程服务进程的方法，有两种方式：
- call 远程方法会被同步执行，调用者会阻塞直到取得返回结果。
- cast 远程方法会被异步执行，调用者需要通过其他方式查询这次远程调用的结果。

<!--more-->

### 事件通知(Event Notification)
服务可以把事件通知发到消息总线上，该消息总线上所有对此类事件感兴趣的服务进程，都可以获得次事件通知并进行处理。处理结果不会返回事件发送者。

### AMQP
AMQP是一个异步消息传递所使用的开放的应用层协议规范。包括导向、队列、路由、可靠性和安全性。不同的AMQP实现可以进行相互操作。
所有消息都有一个routing key,所有Queue都有一个binding key。生产者将消息发送给Exchange,然后Exchange根据这两个key把消息送到相匹配的Queue中。不同类型的Exchange有不同的匹配算法。


|类型|说明|
|:---|:---|
|Direct|binding key和routing key必须完全一样，不支持通配符|
|Topic|同Direct类型，但是支持通配符，"*"匹配单字，“#”匹配零个或多个单字，单字之间由“.”来分割|
|Fanout|忽略binding key和routing key，广播式路由|


## WSGI
WSGI 是一个连接服务端和应用端的接口。WSGI把Web组件分为三部分：
- WSGI Server
- WSGI Middleware
- WSGI Application

An Application must return an iterable object.
```python
def application(environ,start_response):
   start_response('200 Ok',[('Content-Type','text/plain')])
   yield 'Hello World\n'
```
- `environ`:一个dict，包括CGI中定义的环境变量以及7个WSGI所定义的环境变量：wsgi.version,wsgi_input...
- `start_response`: 回调函数，要返回一个write(data)对象，用作兼容现有的特殊框架，一般返回None

### Paste.Deploy
Paste Deploy通过api-paste.ini配置
Paste配置文件分为多个section，每个section以`type`:`name`的格式命名。
（书上P99）
### WebOb
对WSGI的封装，包含：
- `webob.Request` 对WSGI的environ的封装
- `webob.Response` 对WSGI响应的封装 
- `webob.exc` 对HTTP错误代码的封装

Webob提供了`webob.dec.wsgify`的decorator，可以快速开发application
```python
# 继承自webob.Request
class MyRequest(webob.Request): 
    @property
    def is_local(self):
        return self.remote_addr == '127.0.0.1'


@wsgify(RequestClass=MyRequest) 
def myfunc(req):
    if req.is_local:
        return Response('hi!')
    else:
        raise webob.exc.HTTPForbidden
```
## Eventlet
Openstack的协程模块
### 协程
与线程类似，拥有独立的栈和局部变量，但是无法同时执行，(Compare To: Javascript callback)
### GreenThread
```python
import eventlet
def my_func(param):
    # do something in coroutine
    return param
gt = eventlet.spawn(my_func,param)
result = gt.wait()
```
`eventlet.spawn`只是创建一个协程并不立即执行，直到主线程运行到`gt.wait()`时才开始进入调度序列。
### Monkey Path
实现协程需要使用Patch的方式对Python的网络相关的标准库进行改写，这个patch就叫`monkey_patch`。
Monkey Patch是大部分使用Eventlet函数库之前需要进行的初始化工作
```python
# ceilometer/cmd/__init__.py
import eventlet
# patch socket,select,thread三个模块
eventlet.monkey_patch(socket=True,select=True,thread=True)
```
## Oslo
Openstack 通用库
### Cliff
构建命令行程序
DEMO: <https://github.com/openstack/cliff/tree/master/demoapp>

### oslo.config
解析命令行和配置文件中的配置选项（书上P111）
```python
from oslo.config import cfg
conf(sys.argv[1:],project=`xyz`) # 初始化，使得oslo.config能够正常解析配置文件和命令行选项
rabbit_group = cfg.OptGroup(name='rabbit',
                            title='RabbitMQ options')

rabbit_host_opt = cfg.StrOpt('host',
                             default='localhost',
                             help='IP/hostname to listen on.'),
rabbit_port_opt = cfg.PortOpt('port',
                              default=5672,
                              help='Port number to listen on.')

def register_rabbit_opts(conf):
    conf.register_group(rabbit_group)
    # options can be registered under a group in either of these ways:
    conf.register_opt(rabbit_host_opt, group=rabbit_group)
    conf.register_opt(rabbit_port_opt, group='rabbit')
```
如果没有指定group，则选项默认放在[DEFAULT]组下
```ini
# glance-api.conf:
  [DEFAULT]
  bind_port = 9292
  # ...

  [rabbit]
  host = localhost
  port = 5672
  use_ssl = False
  userid = guest
  password = guest
  virtual_host = /
```
从命令行中设置conf，需要使用使用‘-’连接groupname和optionname
```shell
--rabbit-host localhost --rabbit-port 9999
```
### oslo.db
SQLAlchemy数据库模型的抽象
### oslo.i18n
是对Python gettext的封装，主要用于字符串翻译和国际化
### oslo.messaging
Openstack各项目使用RPC和事件通知的统一的接口。其中包括下面4个对象。
#### Transport
传输层，主要实现RPC底层的通信，支持rabbit、qpid、zmq三种协议。可以通过URL来指定不同的transport的实现。
```
transport://user:pass@host1:port[,hostN:portN]/virtual_host
```
#### Target
封装了指定某一消息最终目的地的所有信息
#### Server
即服务端，创建一个Server对象需要指定Transport、Target、endpoints(包含多组可被远程调用的方法，比如某一资源包含CUID四个操作）
#### RPC Client
即客户端，一个RPC Client可以调用RPC Server上的方法。
#### Notifier
Notifier是一个用来发送通知消息的对象。格式如下：
```javscript
{
    message_id:six_text_type(uuid.uuid4()), #消息id号
    publisher_id:'computer.host1',#发送者id
    timestamp:timeutils.utcnow(),#时间戳
    priority:'WARN', # 通知优先级
    event_type:'compute.create_instance',#通知类型
    payload:{'instance_id':12,...} #通知内容
}
```
#### Notifier Listener
消息监听者，跟Server类似，可以暴露多个endpoint，每个endpoint中也可以包含多种方法，但是它们只是对应者不同的消息优先级。（P118）


