# 接口RPC

## 节点相关接口
### 获取集群节点信息

通过getClusterNodes方法可以获得当前网络内，集群节点的相关信息，比如验证者的key，节点IP，节点版本等。

    curl https://api.testnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc": "2.0", "id": 1,
        "method": "getClusterNodes"
    }
    '

得到的输出类似这样：

    {
        "jsonrpc": "2.0",
        "result": [
            {
            "featureSet": 2891131721,
            "gossip": "67.209.54.46:8001",
            "pubkey": "8pgVP32abaxodvpJx3iXo4o9FUWzarudQ7RHZAkkqEKi",
            "pubsub": null,
            "rpc": null,
            "shredVersion": 28353,
            "tpu": "67.209.54.46:8004",
            "tpuQuic": "67.209.54.46:8010",
            "version": "1.16.2"
            }
        ...
        ]
    }

从结果字段名，也可以比较直观的推出这些字段的意义

## 区块相关接口

### 获取当前区块高度
通过getBlockHeight可以获取当前的区块高度

    curl https://api.testnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc":"2.0","id":1,
        "method":"getBlockHeight"
    }
    '

得到输出：

    {
        "jsonrpc": "2.0",
        "result": 174302040,
        "id": 1
    }

可以看到，当前测试网的高度到了174302040。


### 获取最近的Block Hash
通过getLatestBlockhash可以获得连上最近的一个Block的Hash值和高度

    curl https://api.testnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "id":1,
        "jsonrpc":"2.0",
        "method":"getLatestBlockhash",
        "params":[
        {
            "commitment":"processed"
        }
        ]
    }
    '

得到结果：

    {
        "jsonrpc": "2.0",
        "result": {
            "context": {
                "apiVersion": "1.16.2",
                "slot": 207172864
            },
            "value": {
            "blockhash": "2rSgjtXjKDcMYZTdSErwSz9bPXota73uecdJXUxEz2a5",
            "lastValidBlockHeight": 174481567
            }
        },
        "id": 1
    }

这里根据字面意思，可以看到最近的一个区块的slot,hash以及block height。
### 获取指定高度block的信息

获取指定高度block的信息，通过getBlock方法。如

    curl https://api.testnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc": "2.0","id":1,
        "method":"getBlock",
        "params": [
            174302734,
            {
                "encoding": "jsonParsed",
                "maxSupportedTransactionVersion":0,
                "transactionDetails":"full",
                "rewards":false
            }
        ]
    }
    '


这里结果太多，不再罗列。在请求中，我们加入了 `"encoding": "jsonParsed"`，将结果按照json的格式
进行展示。transactionDetails 设置返回的交易信息的内容复杂等级，设置有"full","accounts","signatures","none",
默认是"full"。maxSupportedTransactionVersion这个参数和后面介绍的带版本号的交易有关，表示返回最大的版本号，当前
可以传0即可，默认也是0。布尔值rewards表示是否携带rewards信息。

### 获取指定block的确认状态
有时候在上面获得当前最高区块，但是查询区块信息的时候却又查询不到，这里可以通过getBlockCommitment查看下对应区块的状态。

    curl https://api.testnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc": "2.0", "id": 1,
        "method": "getBlockCommitment",
        "params":[174302734]
    }
    '

得到结果：

    {
        "jsonrpc": "2.0",
        "result": {
            "commitment": null,
            "totalStake": 144333782793465543
        },
        "id": 1
    }
    
这里totalStake表示提交确认的节点总共Stake的SOL数目，也就是POS的权重。如果commitment不为null的时候，将是一个数组
表示各个集群中Stake的数量分布。

### 一次性获取多个Block的信息

前面的getBlock获得了单个Block的信息，还可以通过getBlocks一次性获得多个Block的信息。

    curl https://api.testnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc": "2.0", "id": 1,
        "method": "getBlocks",
        "params": [
            174302734, 174302735
        ]
    }
    '

其余参数都是一样的，这里参数中，前面的部分是block number的数组

### 分页获取Block
前面两个获取Block信息的方法，分别可以获得单个Block和多个指定Block号的信息。因为Block Number是递增且不一定连续的，因此
还Solana还提供了一个分页查询的方式getBlocksWithLimit，从起始号查询多少个。

curl https://api.testnet.solana.com -X POST -H "Content-Type: application/json" -d '
  {
    "jsonrpc": "2.0",
    "id":1,
    "method":"getBlocksWithLimit",
    "params":[174302734, 3]
  }
'

得到：

    {
        "jsonrpc": "2.0",
        "result": [
            174302734,
            174302735,
            174302736
        ],
        "id": 1
    }

三个BlockNumber，接着我们可以前面的GetBlocks来获得这三个Block的详细信息。


## Slot和Epoch相关接口

### 获取当前Epoch信息
首先Epoch是什么，在前面也有介绍到，epoch在一般POS中比较常见，表示这个周期内，一些参与验证的节点信息是固定的，如果有新
节点或者节点权重变更，将在下一个epoch中生效。

    curl https://api.testnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {"jsonrpc":"2.0","id":1, "method":"getEpochInfo"}
    '

输出类似：

    {
        "jsonrpc": "2.0",
        "result": {
            "absoluteSlot": 207170348,
            "blockHeight": 174478875,
            "epoch": 492,
            "slotIndex": 150092,
            "slotsInEpoch": 432000,
            "transactionCount": 258177341740
        },
        "id": 1
    }
里面有当前周期的区块高度，slot数目，以及transaction的数目。

而getEpochSchedule方法则是获取Epoch的调度信息，

    curl https://api.testnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc":"2.0","id":1,
        "method":"getEpochSchedule"
    }
    '

可以看到输出中：

    {
        "jsonrpc": "2.0",
        "result": {
            "firstNormalEpoch": 14,
            "firstNormalSlot": 524256,
            "leaderScheduleSlotOffset": 432000,
            "slotsPerEpoch": 432000,
            "warmup": true
        },
        "id": 1
    }

从字面意思也能看到，这里有Epoch中slot的数目，起始值等信息。


### 获取最新Slot
和Epoch类似，可以获得当前的Slot:

    curl https://api.testnet.solana.com -X POST -H "Content-Type: application/json" -d '
        {"jsonrpc":"2.0","id":1, "method":"getSlot"}
    '

直接得到slot值：

    {"jsonrpc":"2.0","result":209119756,"id":1}


## 账号相关接口

### 获取Account信息
第一章有介绍，Solana上存储的内容，都是一个Account对象，有基础的元数据信息：

    pub struct Account {
        /// lamports in the account
        pub lamports: u64,
        /// data held in this account
        #[serde(with = "serde_bytes")]
        pub data: Vec<u8>,
        /// the program that owns this account. If executable, the program that loads this account.
        pub owner: Pubkey,
        /// this account's data contains a loaded program (and is now read-only)
        pub executable: bool,
        /// the epoch at which this account will next owe rent
        pub rent_epoch: Epoch,
    }

我们可以通过getAccountInfo RPC请求来查看,比如查看我们前面的测试账号：

    curl https://api.testnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getAccountInfo",
        "params": [
            "5pWae6RxD3zrYzBmPTMYo1LZ5vef3vfWH6iV3s8n6ZRG",
            {
                "encoding": "base58",
                "commitment": "finalized"
            }
        ]
    }
    '

这里我们通过curl来直接发起HTTP请求，最直观的看发生什么。请求中我们指定了测试网的RPC地址。
https://api.testnet.solana.com
得到

    {
    "jsonrpc": "2.0",
    "result": {
        "context": {
            "apiVersion": "1.16.1",
            "slot": 206885329
        },
        "value": {
            "data": [
                "",
                "base58"
            ],
            "executable": false,
            "lamports": 59597675320,
            "owner": "11111111111111111111111111111111",
            "rentEpoch": 349,
            "space": 0
        }
    },
    "id": 1
    }

在result里面可以看到value里面的值项目，和Rust的结构体是一一对应的，其中data表示数据内容，
这里我们的普通账号不是合约账号，因此其为空，后面的"base58"表示如果这里有值，那么他将是二进制
内容的base58格式编码。这个编码格式是我们在请求里面的"encoding"来指定的。"executable"表示
是否为可执行合约，"lamports"表示余额，这里精度*10^9。所有普通账号的Owner都是系统根账号：
"11111111111111111111111111111111"。

### 获取账号余额
在上面的Account信息里面，我们已经可以知道账号余额lamports了，同时RPC还提供了getBalance可以更
简洁的得到余额信息：

    curl https://api.testnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc": "2.0", "id": 1,
        "method": "getBalance",
        "params": [
            "5pWae6RxD3zrYzBmPTMYo1LZ5vef3vfWH6iV3s8n6ZRG"
        ]
    }
    '
得到：

    {
        "jsonrpc": "2.0",
        "result": {
            "context": {
                "apiVersion": "1.16.1",
                "slot": 206886725
            },
            "value": 989995000
        },
        "id": 1
    }

可以看到是989995000,因为SOL的精度是10^9.所以也就是0.989995个SOL。


### 获取某个合约管理的所有Account
类似Linux查询某个用户所有的文件。Solana提供了一个查询owener为某个合约的RPC方法。该方法的作用就是罗列出
某个合约管理的Account，比如SPL Token合约记录的所有用户的余额信息。

    curl  https://api.testnet.solana.com  -X POST -H "Content-Type: application/json" -d '
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getProgramAccounts",
            "params": [
            "namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX",
            {
                "encoding": "jsonParsed",
                "filters": [
                {
                    "dataSize": 128
                }
                ]
            }
            ]
        }
    '

获取所有NameService服务管理的名字且记录空间大小为128字节的记录：

    {"jsonrpc":"2.0","result":[{"account":{"data":["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADHgMUi7LJb6+YQzBNlYJYu4QoAPOPzOY6F9NasCG9howAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaGVsbG8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","base64"],"executable":false,"lamports":1781761,"owner":"namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX","rentEpoch":349,"space":128},"pubkey":"5mBDoMGJvQTQhgAK2LtjKmG3TGV8J1m3LoEHRMXqits9"},{"account":{"data":
    ...
    {"account":{"data":["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADHgMUi7LJb6+YQzBNlYJYu4QoAPOPzOY6F9NasCG9howAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaGVsbG8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","base64"],"executable":false,"lamports":1781761,"owner":"namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX","rentEpoch":349,"space":128},"pubkey":"8worhyBqrHu1MYYQdQ3zpg5ByuhUge4rYHHhN8E8Vc3j"}],"id":1}

这里的data还需要用相应的序列化方法进行解析才能知道具体的记录是什么。

## SPL-Token相关接口

### 按照需求查询账号
我们知道SPL Token的结构为：

    pub struct Account {
        /// The mint associated with this account
        pub mint: Pubkey,
        /// The owner of this account.
        pub owner: Pubkey,
        /// The amount of tokens this account holds.
        pub amount: u64,
        /// If `delegate` is `Some` then `delegated_amount` represents
        /// the amount authorized by the delegate
        pub delegate: COption<Pubkey>,
        /// The account's state
        pub state: AccountState,
        /// If is_native.is_some, this is a native token, and the value logs the rent-exempt reserve. An
        /// Account is required to be rent-exempt, so the value is used by the Processor to ensure that
        /// wrapped SOL accounts do not drop below this threshold.
        pub is_native: COption<u64>,
        /// The amount delegated
        pub delegated_amount: u64,
        /// Optional authority to close the account.
        pub close_authority: COption<Pubkey>,
    }

我们可以查询某个Token下，所有owner为某人的Token账号，或者delegate为某人的所有账号。

    curl  https://api.testnet.solana.com -X POST -H "Content-Type: application/json" -d '
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTokenAccountsByOwner",
            "params": [
            "CnjrCefFBHmWnKcwH5T8DFUQuVEmUJwfBL3Goqj6YhKw",
            {
                "mint": "7dyTPp6Jd1nWWyz3y7CXqdSG86yFpVF7u45ARKnqDhRF"
            },
            {
                "encoding": "jsonParsed"
            }
            ]
        }
    '

这里查询到这个token：7dyTPp6Jd1nWWyz3y7CXqdSG86yFpVF7u45ARKnqDhRF ower为CnjrCefFBHmWnKcwH5T8DFUQuVEmUJwfBL3Goqj6YhKw所有账号。

    {
        "jsonrpc": "2.0",
        "result": {
            "context": {
            "apiVersion": "1.16.3",
            "slot": 209133543
            },
            "value": [
            {
                "account": {
                "data": {
                    "parsed": {
                    "info": {
                        "isNative": false,
                        "mint": "7dyTPp6Jd1nWWyz3y7CXqdSG86yFpVF7u45ARKnqDhRF",
                        "owner": "CnjrCefFBHmWnKcwH5T8DFUQuVEmUJwfBL3Goqj6YhKw",
                        "state": "initialized",
                        "tokenAmount": {
                        "amount": "2000000000000000000",
                        "decimals": 9,
                        "uiAmount": 2000000000.0,
                        "uiAmountString": "2000000000"
                        }
                    },
                    "type": "account"
                    },
                    "program": "spl-token",
                    "space": 165
                },
                "executable": false,
                "lamports": 2039280,
                "owner": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                "rentEpoch": 0,
                "space": 165
                },
                "pubkey": "CdJp6W7S8muM85UXq7u2P42ryytDacqEo8JgoHENSiUi"
            }
            ]
        },
        "id": 1
    }

而通过：

    curl https://api.testnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTokenAccountsByDelegate",
        "params": [
        "CnjrCefFBHmWnKcwH5T8DFUQuVEmUJwfBL3Goqj6YhKw",
        {
            "mint": "7dyTPp6Jd1nWWyz3y7CXqdSG86yFpVF7u45ARKnqDhRF"
        },
        {
            "encoding": "jsonParsed"
        }
        ]
    }
    '

因为我们没有设置代理操作。所以这里得到的结果为空。




### 获取某个ATA账号的余额

查询SPL Token的余额，有个ATA账号需要了解。本质上就是对应Token的账号：

    curl  https://api.testnet.solana.com  -X POST -H "Content-Type: application/json" -d '
        {
            "jsonrpc": "2.0", "id": 1,
            "method": "getTokenAccountBalance",
            "params": [
                "CdJp6W7S8muM85UXq7u2P42ryytDacqEo8JgoHENSiUi"
            ]
        }
    '

返回的值，会列出数量：

        {
            "jsonrpc": "2.0",
            "result": {
                "context": {
                "apiVersion": "1.16.3",
                "slot": 209132550
                },
                "value": {
                "amount": "2000000000000000000",
                "decimals": 9,
                "uiAmount": 2000000000.0,
                "uiAmountString": "2000000000"
                }
            },
            "id": 1
        }


这里可以看到，uiAmount是可以显示的数量，做了精度转换的。精度和真实amount都有列出来。



## 交易相关接口
### 获取交易手续费
针对某个交易，需要预估其手续费时，可以借助节点的预计算：

    curl https://api.testnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "id":1,
        "jsonrpc":"2.0",
        "method":"getFeeForMessage",
        "params":[
            "AQABAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAA",
            {
                "commitment":"processed"
            }
        ]
    }
    '

得到：

    {
    "jsonrpc": "2.0",
    "result": {
        "context": {
        "apiVersion": "1.16.3",
        "slot": 209111155
        },
        "value": null
    },
    "id": 1
    }

这里参数中的字符串，是Transaction打包后的结果。也就是RawTransaction的序列化结果。


### 获取交易详细信息


查询某个交易的详细信息：

    curl  https://api.testnet.solana.com  -X POST -H "Content-Type: application/json" -d '
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTransaction",
            "params": [
                "4TxuymgwqTFyj8HTdSFQhTGUBT7jNqA28dtoqZV9eoxeexxzPENFiqxtPsfkFCNHrsM2LX7eazVBfuwD1qqNQ6ig",
                "jsonParsed"
            ]
        }
    '

可以看到，结果跟浏览器中的结果基本是对应的：

    {
    "jsonrpc": "2.0",
    "result": {
        "blockTime": 1689322275,
        "meta": {
        "computeUnitsConsumed": 2862,
        "err": null,
        "fee": 25000,
        "innerInstructions": [],
        "logMessages": [
            "Program ComputeBudget111111111111111111111111111111 invoke [1]",
            "Program ComputeBudget111111111111111111111111111111 success",
            "Program ComputeBudget111111111111111111111111111111 invoke [1]",
            "Program ComputeBudget111111111111111111111111111111 success",
            "Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr invoke [1]",
            "Program log: Memo (len 4): \"ping\"",
            "Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr consumed 2862 of 200000 compute units",
            "Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr success"
        ],
        "postBalances": [
            403383651707,
            1,
            521498880
        ],
        "postTokenBalances": [],
        "preBalances": [
            403383676707,
            1,
            521498880
        ],
        "preTokenBalances": [],
        "rewards": [],
        "status": {
            "Ok": null
        }
        },
        "slot": 209121091,
        "transaction": {
        "message": {
            "accountKeys": [
            {
                "pubkey": "tKeYE4wtowRb8yRroZShTipE18YVnqwXjsSAoNsFU6g",
                "signer": true,
                "source": "transaction",
                "writable": true
            },
            {
                "pubkey": "ComputeBudget111111111111111111111111111111",
                "signer": false,
                "source": "transaction",
                "writable": false
            },
            {
                "pubkey": "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
                "signer": false,
                "source": "transaction",
                "writable": false
            }
            ],
            "instructions": [
            {
                "accounts": [],
                "data": "Fj2Eoy",
                "programId": "ComputeBudget111111111111111111111111111111",
                "stackHeight": null
            },
            {
                "accounts": [],
                "data": "3gJqkocMWaMm",
                "programId": "ComputeBudget111111111111111111111111111111",
                "stackHeight": null
            },
            {
                "parsed": "ping",
                "program": "spl-memo",
                "programId": "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
                "stackHeight": null
            }
            ],
            "recentBlockhash": "AkyAk3Q5ziRSWsjC4ipFmJ2xGpWyx5uU9GjiEke4LibX"
        },
        "signatures": [
            "4TxuymgwqTFyj8HTdSFQhTGUBT7jNqA28dtoqZV9eoxeexxzPENFiqxtPsfkFCNHrsM2LX7eazVBfuwD1qqNQ6ig"
        ]
        }
    },
    "id": 1
    }

我们可以通过这个代替去查看浏览器。


### 发送交易

发送交易通过 `sendTransaction` 接口。这个接口里面需要对Transaction对象做编码，所以不做演示。在Javascript/rust的SDK中操作会比较直观。

除了发送请求外，还可以通过模拟请求来判断是否可能执行成功，接口为`simulateTransaction`。

在发送交易的时候，还可以通过`getFeeForMessage`来预估手续费