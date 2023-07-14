# Solana核心概念

## Account
在Solana中，"Everythin is an Account" 类似Linux世界里面把所有的资源都抽象成"文件"一样。

Solana作为一个分布式区块链系统，所有的信息都存储在Account对象中，如合约（Solana叫Onchain Program）,
账号信息，合约中存储的内容等都是存储在一个个Account对象中。

Account的定义如下：

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

其中的lamports表示账号余额，data表示存储的内容，owner表示这个Account可以被谁来操作，类似文件所有者。
如果是合约账号，这里data的内容就是合约编译后的代码，同时executable为true。

## 账号和签名
Solana的签名系统使用的是 [Ed25519](https://en.wikipedia.org/wiki/EdDSA#Ed25519) ,说人话就是：
Ed25519是一种计算快，安全性高，且生成的签名内容小的一种不对称加密算法。新一代公链几乎都支持这个算法。

所以Solana的，我们用户理解的账号，就是一串Ed25519的私钥，各种钱包里面的助记词，会被转换成随机数种子，
再用随机数种子来生成一个私钥，所以助记词最终也是换算成私钥。所以用户账号的本质就是私钥，而用户账号的地址
则是这私钥对应的公钥,优于公钥是二进制的，为了可读性，将其进行Base58编码后的值，就是这个账号的地址。
如：HawRVHh7t4d3H3bitWHFt25WhhoDmbJMCfWdESQQoYEy

把这里的公钥和私钥放一起，就是所谓的Keypair，或者叫公私钥对。假设这里把私钥进行加密，并由用户来设置密码，
公钥作为这个私钥的索引。就实现了一个简单的钱包系统了。

通过用户选择的公钥，加上密码，得到对应的私钥，再用私钥去操作的他的账号



## 交易
交易就是链外数据和链上数据产生的一次交互。比如发起一笔转账，在StepN里面发起一次Claim动作。
交易是对多个交易指令的打包，所以起内容主要就是各个交易指令，以及相应指令对应的发起人和签名。

Transaction的定义为：

    pub struct Message {
        /// The message header, identifying signed and read-only `account_keys`.
        /// Header values only describe static `account_keys`, they do not describe
        /// any additional account keys loaded via address table lookups.
        pub header: MessageHeader,

        /// List of accounts loaded by this transaction.
        #[serde(with = "short_vec")]
        pub account_keys: Vec<Pubkey>,

        /// The blockhash of a recent block.
        pub recent_blockhash: Hash,

        /// Instructions that invoke a designated program, are executed in sequence,
        /// and committed in one atomic transaction if all succeed.
        ///
        /// # Notes
        ///
        /// Program indexes must index into the list of message `account_keys` because
        /// program id's cannot be dynamically loaded from a lookup table.
        ///
        /// Account indexes must index into the list of addresses
        /// constructed from the concatenation of three key lists:
        ///   1) message `account_keys`
        ///   2) ordered list of keys loaded from `writable` lookup table indexes
        ///   3) ordered list of keys loaded from `readable` lookup table indexes
        #[serde(with = "short_vec")]
        pub instructions: Vec<CompiledInstruction>,

        /// List of address table lookups used to load additional accounts
        /// for this transaction.
        #[serde(with = "short_vec")]
        pub address_table_lookups: Vec<MessageAddressTableLookup>,
    }

    pub enum VersionedMessage {
        Legacy(LegacyMessage),
        V0(v0::Message),
    }

    pub struct VersionedTransaction {
        /// List of signatures
        #[serde(with = "short_vec")]
        pub signatures: Vec<Signature>,
        /// Message to sign.
        pub message: VersionedMessage,
    }

从中可以简单理解为，交易就是一连串的交易指令，以及需要签名的指令的签名内容。

## 交易指令

上面说到的交易指令又是什么呢？先来看下定义：

    pub struct CompiledInstruction {
        /// Index into the transaction keys array indicating the program account that executes this instruction.
        pub program_id_index: u8,
        /// Ordered indices into the transaction keys array indicating which accounts to pass to the program.
        #[serde(with = "short_vec")]
        pub accounts: Vec<u8>,
        /// The program input data.
        #[serde(with = "short_vec")]
        pub data: Vec<u8>,
    }

从这些成员变量名就可以猜到。交易指令就是 执行哪个合约(program_id_index),输入为数据data,执行过程
中需要用到哪些Account: accounts

类似函数调用一样，program_id_index是函数名，因为合约都是用地址标识的，所以这里指在accounts数组中
的第几个地址。传入的参数包含两部分，二进制数据data和需要使用到的Account资源：accounts。

## 合约
合约分为两类，一类是普通合约一类是系统合约，前者在Solana中称为"On Chain Program" 
后者称为"Native Program" 其实本质都是类似其他公链上所说的合约。

### 系统合约
系统合约是由节点在部署的时候生成的，普通用户无法更新，他们像普通合约一样，可以被其他合约或者RPC进行调用

系统合约有

* System Program: 创建账号，转账等作用
* BPF Loader Program: 部署和更新合约
* Vote program: 创建并管理用户POS代理投票的状态和奖励
* ...

### 普通合约
一般我们说的合约都是普通合约，或者叫 "On Chain Program"。普通合约是由用户开发并部署，Solana官方也有
一些官方开发的合约，如Token、ATA账号等合约。

当用户通过"BPF Loader Program"部署一个新合约的时候，新合约Account中的被标记为true，表示他是一个可以
被执行的合约账号。不同于有些公链，Solana上的合约是可以被更新的，也可以被销毁。并且当销毁的时候，用于存储
代码的账号所消耗的资源也会归还给部署者。

## 合约与Account
在上面的Account介绍中，我们有个owner的成员，这个就表示这个Account是被哪个合约管理的，或者说哪个
合约可以对这个Account进行读写，类似Linux操作系统中，文件属于哪个用户。

比如一般合约，他的Owner都是BPF Loader：

![](./assets/images/a_program.png)

而存放我们代币余额的内容的ower都是Token合约：

![](./assets/images/a_program_curl.png)

对应的代币为：

![](./assets/images/spl_account.png)

## 租约