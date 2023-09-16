# Solana的NFT事实标准Metaplex
我来看下当前Solana官方对于NFT的定义[Non-Fungible tokens](https://spl.solana.com/token#non-fungible-tokens)：

> Non-Fungible tokens
> An NFT is simply a token type where only a single token has been minted.

这段话出自 [SPL Token](https://spl.solana.com/token) 的官方文档。也就是说，Solana上的
NFT标准，也是由"SPL Token"来实现的，但是他是一个特殊的Token，这个Token的 

* supply 一定为1
* 精度为0
* mint Authority为空，也就是不能再mint新的token

根据我们前面的介绍，大家已经知道了 "SPL Token" 的几个基本属性，但是这里作为NFT，他最典型的
小图片地址在哪里呢？总的供应量在哪里呢？

我们来看Solana域名的下的 [NFT](https://solana.com/developers/nfts)

在这个页面，随便点击，我们会发现，官方站点将我们引导到了 [Metaplex](https://www.metaplex.com/)。
这个metaplex是什么呢？

> Metaplex is a collection of tools, smart contracts, and more designed to make the process of creating and launching NFTs easier. While initially focused on supporting the needs of the arts and entertainment industry our plans extend far beyond that to all use cases where an NFT may add value.

> Currently, our three major projects are:

> Token Metadata - the NFT standard for Solana
> Candy Machine v3™ - a Profile Picture (PFP) focused tool that works like the gumball-style candy machines of old
> Auction House - a decentralized sales protocol for NFT marketplaces


简而言之，就是Metaplex是一套NFT系统，他包含了一套NFT标准，一个发布NFT的工具和一套NFT交易市场协议。

从这里我们可以看到，Solana官方基本是认可这里定义的这套NFT标准了。那么我们就来介绍下这个标准是怎样的。

## NFT标准
首先Metaplex也一样要遵循前面Solana官方的"SPL Token"里面说的，一个NFT就是一个特殊的"SPL Token"
这个基础原则。然后Metaplex在这个基础之上做了一些扩展，为这个supply为1的token增加了如下属性：

![](./assets/images/nft_meta.png)

用JSON表示就是：

```
{
  "name": "SolanaArtProject #1",
  "description": "Generative art on Solana.",
  "image": "https://arweave.net/26YdhY_eAzv26YdhY1uu9uiA3nmDZYwP8MwZAultcE?ext=jpeg",
  "animation_url": "https://arweave.net/ZAultcE_eAzv26YdhY1uu9uiA3nmDZYwP8MwuiA3nm?ext=glb",
  "external_url": "https://example.com",
  "attributes": [
    {
      "trait_type": "trait1",
      "value": "value1"
    },
    {
      "trait_type": "trait2",
      "value": "value2"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "https://www.arweave.net/abcd5678?ext=png",
        "type": "image/png"
      },
      {
        "uri": "https://watch.videodelivery.net/9876jkl",
        "type": "unknown",
        "cdn": true
      },
      {
        "uri": "https://www.arweave.net/efgh1234?ext=mp4",
        "type": "video/mp4"
      }
    ],
    "category": "video",
  }
}
```

这里有了name/image/attributes 是不是就比较像一个正常的NFT了。

这里只要有个地方记录上面的这个meta信息和我们的"SPL Token"的对应关系就可以了。在Solana中，我们很容易就想到了PDA： 由合约和seeds管理的单向Hash

![](./assets/images/nft_pda_meta.png)

图中的信息可以和上面标准中定义的字段意义匹配上，这里将基本信息，放入到Solana的Account的进行链上存储，而内容
比较多的，复杂的信息，则以一个JSON格式存储在链下，这里可以是一个s3静态文件，也可以是ipfs的存储。而用来存储扩展Meta信息的Account，我们叫做 "Metadata Account",其地址是经由 这个管理合约，以及"SPL Token" 的Mint Account，推导出来的PDA唯一地址。因此知道 "SPL Token"也就知道了这里的Metadata。


上面的逻辑定义了单个NFT，到这里，我们还只是实现了我们前面作业里面的相关逻辑，那这样就够了么？

我们知道Mint Account还可以通过Authority和Freezen来控制增发和冻结，那么这个时候，这个权限还在创建
者手里，我们怎么来保证其不会被随意的触发呢？

为此Metaplex引入了一个"Master Edition Account"来作为某NFT的管理者：

![](./assets/images/erc721.png)

这里，同样，在此以PDA为基础，推导出一个"Master Edition Account"地址出来，然后在这个Account里面来记录
Supply等信息。同时将"SPL Token"的"mint" 和 "freeze" 都设置成这个Account，这样就可以使得没人在此修改
这个NFT对应的“SPL Token”。

但是在现实中，我们还会对NFT做集合归类，比如游戏里面 的宝物集合，装备结合，药水集合等，ERC1155定义了这样的逻辑。
而Metaplex定义了 [Certified Collections](https://docs.metaplex.com/programs/token-metadata/certified-collections)。

为了将 NFT（或任何代币）分组在一起，Metaplex首先创建一个 "Collection" NFT，其目的是存储与该集合相关的任何元数据。 也就是"Collection "本身就是 NFT。 它与任何其他 NFT 具有相同的链上数据布局，也就是类似的PDA推导还有其配套的“SPL Token” 账号。

Collection NFT 和常规 NFT 之间的区别在于，前者提供的信息将用于定义其包含的 NFT 组，而后者将用于定义 NFT 本身。

在上面的PDA生成的 “Metadata Account”里面有一个Collection属性，如果其有值，那么这个NFT就是从属于这个组
的NFT，如果这个属性没有值，那么这个NFT可能就是普通NFT或者是“Collection” NFT。如果其"CollectionDetails"还有值，那么就是一个“Collection” 了。

下面图描述了 NFT组和组内普通NFT的关系：

![](./assets/images/collection_nft.png)

## NFT 实例

来看个NFT的例子，Solana手机[Saga](https://magiceden.io/marketplace/saga)。

点开其中一个NFT，比如1927：

![](./assets/images/saga_1927.png)


我们可以在浏览器中看到对应的这里的 "MINT Account" [BBDajxrF4KJdmXredbz8BtCBF5b5HFrAPxX5xqtysAJC](https://solscan.io/token/BBDajxrF4KJdmXredbz8BtCBF5b5HFrAPxX5xqtysAJC#holders) 

![](./assets/images/solscan_1927_mintaccount.png)

而对应的真实"SPL Token"为 [BVhF7uWD4LYKZmwWMk7KwohZbC7vUNzQPD953h5atjb8](https://solscan.io/account/BVhF7uWD4LYKZmwWMk7KwohZbC7vUNzQPD953h5atjb8)

![](./assets/images/solscan_1927_tokenaccount.png)

对应的Collection为 [1yPMtWU5aqcF72RdyRD5yipmcMRC8NGNK59NvYubLkZ](https://solscan.io/token/1yPMtWU5aqcF72RdyRD5yipmcMRC8NGNK59NvYubLkZ) 这个Collection的 Mint Account:

![](./assets/images/solscan_saga_collection_mintaccount.png) 

其对应的 MasterEdition 为 [BpayZvFKEudXfv5NAKyuGoBDvuagCfmz3zDLm2Q1rc8P](https://solscan.io/account/BpayZvFKEudXfv5NAKyuGoBDvuagCfmz3zDLm2Q1rc8P)






## Token Metadata Program 

Metaplex的NFT标准实现，在一个叫做[Token Metadata Program](https://docs.metaplex.com/programs/token-metadata/overview) 合约中。也就是上面的用于生成PDA的合约。

当我们需要创建一个NFT的时候，我们通过Token Metadata Program的"Create a Metadata account" 指令来
创建 一个NFT，他会依次创建"Metadata Account"以及 "SPL Token"的"Mint Account"。

具体Accounts参数为：

![](./assets/images/create_metaaccount_args_account.png)

参数为：
![](./assets/images/create_metaaccount_args.png)

直接来看，太复杂了。

创建完单个NFT后，我们可以创建"Master Edition Account"来进行管理。我们使用"CreateMasterEditionV3"指令
Account参数为：

![](./assets/images/create_master_edtion_accounts.png)

参数为：

![](./assets/images/create_master_edition_args.png)

这里还是以 Saga的NFT来举例，来看一个NFT的创建过程：
首先创建 MasterEdition ：

[321ytzCAk2JAWwBEKKSCnk4w717UA6PWMtEfLxQQ5Pz4gS3xZA9AMUbXShU7s4ekLCkqC8s5WLhkHhtid5VCF5hD](https://solscan.io/tx/321ytzCAk2JAWwBEKKSCnk4w717UA6PWMtEfLxQQ5Pz4gS3xZA9AMUbXShU7s4ekLCkqC8s5WLhkHhtid5VCF5hD)

* I1-I2 创建了 MintAccount
* I3-I4 创建ATA作为 TokenAccount并Mint
* I5 创建 Metadata Account
* I6 创建 Master Edition Account

其次创建具体的NFT:

[3P8MgszvGDmzVV3yByQnPLQ1t7p7jC9ZvtQeRs4nZxmSoWvDV2MBx9A1sCMbrZosRdXBfRZTXj6YjXimVLQuW5Rf](https://solscan.io/tx/3P8MgszvGDmzVV3yByQnPLQ1t7p7jC9ZvtQeRs4nZxmSoWvDV2MBx9A1sCMbrZosRdXBfRZTXj6YjXimVLQuW5Rf)

这里主要关注 I5,因为这里通过Metaplex的Canndy来进行Mint也就是5.2中，并且这里传递了"1yPMtWU5aqcF72RdyRD5yipmcMRC8NGNK59NvYubLkZ"作为Collection。而 5.3 创建了 Metadata。
并在5.10和5.11设置了mint和frezzen的权限。在5.12中完成对这个NFT的Mint逻辑。最后在5.19中，将
这个NFT和这个Collection做Verify，从而确保他是归属于这个NFT集合的。
