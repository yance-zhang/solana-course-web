# 通过WalletAdatper与钱包交互


> 目标就是做成一个类似这样的Demo：https://solana.com/news/solana-scaffold-part-1-wallet-adapter

为了给DApp提供一套统一的兼容钱包的接口。Solana设计了一套 Wallet Adapter。
Solana要求，钱包方需要按照该套接口设计，提供实现。这样DApp使用方，只需要按照一套
接口，就可以轻松支持多个钱包。接口包含了

* 网络选择
* 账号选择
* 账号签名

等

除了统一的接口，Adapter还设计了一套基础UI，其包括了弹出钱包的选择列表，以及链接钱包后的的账号地址显示。

![](./assets/images/wallets_select_ui.png)



## 安装

在你的工程总安装Wallet_Adapter依赖：

    npm install --save \
    @solana/wallet-adapter-base \
    @solana/wallet-adapter-react \
    @solana/wallet-adapter-react-ui \
    @solana/wallet-adapter-wallets \
    @solana/web3.js 

这里我们还会用到一些web3.js里面的变量，所以也将其install上。

在使用地方先import相关SDK

    import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
    import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
   
    import {
        WalletModalProvider,
        WalletDisconnectButton,
        WalletMultiButton
    } from '@solana/wallet-adapter-react-ui';
    import { clusterApiUrl } from '@solana/web3.js';

这里因为我们的示例demo是react的，所以使用了react-ui，Wallet-adapter同时也提供了 Material UI	
和Ant Design的组件。

已经实现了Adapter的钱包参见[列表](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets)。

这里我们使用：

    import {SolongWalletAdapter} from '@solana/wallet-adapter-solong'
    import {PhantomWalletAdapter} from '@solana/wallet-adapter-phantom';


## 链接钱包

链接钱包的步骤，是在用户界面设置一个"Connect"的按钮，当点击时，弹出一个钱包选择list界面。
可使用钱包，通过数组参数参数。

    this.network = WalletAdapterNetwork.Testnet;

    // You can also provide a custom RPC endpoint.
    this.endpoint =  clusterApiUrl(this.network);

    this.wallets =[
        new SolongWalletAdapter(),
        new PhantomWalletAdapter(),
    ];

然后再弹出UI将钱包罗列出来

        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <WalletMultiButton />
                    <WalletDisconnectButton />
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>

这里主要使用了ConnectionProvider来指定相应的网络。endpoint参数为使用的RPC环境。
通过WalletProvider来选择实现了Adapter的插件钱包，示例中我们设置了Phantom。

最后在WalletModalProvider通过相应的按钮触发对钱包的选择。也就是我们上面传递的Solong和Phantom。

当用户点击WalletMultiButton的时候，会自动弹出钱包选择界面。选择钱包后，会弹出钱包的链接界面。
当用户点击链接后，这里的ModalProvider会得到选择的账号的信息，并将地址显示在按钮上。

当点击WalletDisconnectButton后，会断开链接。


## 发送请求
前面介绍了web3.js的使用，在发送请求的时候，我们需要用账号的私钥对交易内容做签名。那么
在使用钱包的情况下该如何操作呢？

首先import相关库

    import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
    import { useConnection, useWallet } from '@solana/wallet-adapter-react';
    import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
    import React, { FC, useCallback } from 'react';

然后先取出链接和公钥：

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

这里通过useConnection可以得到我们前面钱包里面选择的RPC链接，useWallet返回的结果为选中的
钱包的地址，以及使用该钱包发送交易的方法。

        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, { minContextSlot });

通过connection.getLatestBlockhashAndContext可以得到minContextSlot信息，然后再调用sendTransaction
方法，就可以出发钱包弹出UI，并提示用户确认，当用户点击确认后，既完成请求的发送。

## 切换账号
如果用户需要切换账号，那么通过UI提供的Disconnect入口，先取消当前账号的链接。然后再通过链接界面，选择其他的
钱包账号。所以切换账号就是先断开，再重新链接的过程。
