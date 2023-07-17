# RPC介绍
RPC是什么？

> In distributed computing, a remote procedure call (RPC) is 
> when a computer program causes a procedure (subroutine) to 
> execute in a different address space (commonly on another computer on a shared network)
>
>                                       -- wikipedia

写代码的应该都知道RPC是啥，但是RPC跟区块链是什么关系呢？

引用Polkadot的一个架构图：

![](./assets/images/dot_arch.png)

RPC作为区块链系统与外界交互的一层接口调用。被普通用户直接使用。

但是为什么普通用户又感知不到RPC的存在呢？普通用户只知道钱包，拉起、确定=》 币没了。

这里是因为我们这帮程序员，帮忙将中间的过程都通过代码来串联起来了。所以RPC又是用户界面和区块链之间的桥梁。

Solana提供的RPC分为主动请求的HTTP接口和消息推送的Websocket接口。只是单次查询一般使用HTTP接口，
如发送交易，查询用户余额。而对于链上数据的监控则通过Websocket接口，如监控合约执行的日志。

## HTTP接口
HTTP接口是通过JSON RPC的格式对外提供服务，[JSON RPC](https://www.jsonrpc.org/) 是一种
以JSSON作为序列化工具，HTTP 作为传输协议的RPC模式，其有多个版本，当前使用的是v2版本。

其请求格式为：

    {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [
            "83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri"
        ]
    }

这里最外层是一个字典，其中各个Key是固定的，其中method表示RPC的函数方法名。params表示该函数的参数。

对应的请求结果为：

    {
        "jsonrpc": "2.0",
        "result": {
            
            },
        "id": 1
    }

同样的，这里的几个字段也是固定的，result表示请求的结果。id和请求里面的id对应，表示的是哪个请求的结果。

在请求查询的时候，对查询的结果有三种状态选择：

* 'finalized' - 节点将查询由超过集群中超多数确认为达到最大封锁期的最新区块，表示集群已将此区块确认为已完成。
* 'confirmed' - 节点将查询由集群的超多数投票的最新区块。
* 'processed' - 节点将查询最新的区块。注意，该区块可能被集群跳过。

状态参数可以在"params"数组的最后，以字典的形式带入进去。

同时Solana也对常用的结果做了人为可读的优化。当传递` "encoding":"jsonParsed"`会讲结果尽量以JSON的方式
返回。encoding和上面的状态放在同一个位置。如：

        {
            "commitment":"processed",
            "encoding":"jsonParsed"
        }

## Websocket接口
Websocket是HTTP为了补充长链接，而增加一个特性，概括来说就可以认为这个是一条TCP长链接。Solana通过
这条长连接来给客户端推送消息。

只是这里的消息的内容也是采用了JSONRPC的格式，如：

    {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "accountSubscribe",
        "params": [
            "CM78CPUeXjn8o3yroDHxUtKsZZgoy4GPkPPXfouKNH12",
            {
            "encoding": "jsonParsed",
            "commitment": "finalized"
            }
        ]
    }

这样的消息订阅了Account("CM78CPUeXjn8o3yroDHxUtKsZZgoy4GPkPPXfouKNH12")的变化消息。

当有变化时，也是将结果打包成一个JSONRPC的格式推送给客户端：

    {
        "jsonrpc": "2.0",
        "method": "accountNotification",
        "params": {
            "result": {
            "context": {
                "slot": 5199307
            },
            "value": {
                "data": {
                "program": "nonce",
                "parsed": {
                    "type": "initialized",
                    "info": {
                    "authority": "Bbqg1M4YVVfbhEzwA9SpC9FhsaG83YMTYoR4a8oTDLX",
                    "blockhash": "LUaQTmM7WbMRiATdMMHaRGakPtCkc2GHtH57STKXs6k",
                    "feeCalculator": {
                        "lamportsPerSignature": 5000
                    }
                    }
                }
                },
                "executable": false,
                "lamports": 33594,
                "owner": "11111111111111111111111111111111",
                "rentEpoch": 635,
                "space": 80
            }
            },
            "subscription": 23784
        }
    }

每个Subscribe方法，都对应的有一个Unsubscribe方法，当发送改方法时，服务器后续不再推送消息。