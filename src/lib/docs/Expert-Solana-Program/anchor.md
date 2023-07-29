# Solana序列化标准Anchor协议
Anchor是什么？

> Anchor is a framework for Solana's Sealevel runtime providing several convenient developer tools for writing smart contracts.

Anchor现在是Solana合约开发的一套框架，但是Anchor在建立之初，其实只是一个序列化协议。

Long Long Ago，我们来看之前的Token代码，关于Mint的对象的序列化存储是这样的：

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, 82];
        let (
            mint_authority_dst,
            supply_dst,
            decimals_dst,
            is_initialized_dst,
            freeze_authority_dst,
        ) = mut_array_refs![dst, 36, 8, 1, 1, 36];
        let &Mint {
            ref mint_authority,
            supply,
            decimals,
            is_initialized,
            ref freeze_authority,
        } = self;
        pack_coption_key(mint_authority, mint_authority_dst);
        *supply_dst = supply.to_le_bytes();
        decimals_dst[0] = decimals;
        is_initialized_dst[0] = is_initialized as u8;
        pack_coption_key(freeze_authority, freeze_authority_dst);
    }

而Instruction的打包是这样的：

        /// Packs a [TokenInstruction](enum.TokenInstruction.html) into a byte buffer.
    pub fn pack(&self) -> Vec<u8> {
        let mut buf = Vec::with_capacity(size_of::<Self>());
        match self {
            &Self::InitializeMint {
                ref mint_authority,
                ref freeze_authority,
                decimals,
            } => {
                buf.push(0);
                buf.push(decimals);
                buf.extend_from_slice(mint_authority.as_ref());
                Self::pack_pubkey_option(freeze_authority, &mut buf);
            }
            ...

这里都是自定义的,比如上面这些，用第一个字节作为类型判断，后续需要代码进行手动大解包。在传统的
Web2领域，这个是非常low且不工程化的实践，Web2领域有成熟的Protobuf/Thift等方案。但是这些方案
一来性能较差，二来序列化的结果较大，并不适用区块链的场景。因此在区块链领域就有了各种各样的实现，
比如Ethereum的rlp编码。

在Rust实现的公链领域中，主要有两种方案，一种是[BCS](https://docs.rs/bcs/latest/bcs/)，他出生
与Libra/Diem，现在主要用于Aptos和Sui。而另外一种则是[Borsh](https://borsh.io/) 他是Near
开发团队的一大力作，在今年的Rust China上，他们也做了比较详细的一个分享，当前Borsh已经在性能，支持的语言，
压缩率上有一个比较好的表现。因此Solana官方实现也很多都采用了Borsh的序列方式。

所以Anchor也改变了他的命题，将其定义为一套开发框架。那么Anchor是不是必须的？当然不是，我们前面介绍
的代码组织形式，加上Borsh的能力，其实已经很好的覆盖了Anchor的功能。但是Anchor除了这些功能外，
还通过IDL对instruction交互协议进行描述，更方便非Rust得语言的接入，比如在钱包测显示交互的内容。
同时还提供了项目管理如构建，发布等工具，以及合约逻辑结构的框架，方便做客户端接入以及rust客户端和测试。
可以类比以太生态里面的hardhat/truffle

## 安装
现在的Anchor定位是一整套开发工具，其大部分是用rust实现的，因此我们可以通过cargo来进行安装，
前提条件是你已经按照我们前面的步骤按照好了Rust和Solana命令行。

```
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
```
安装完成后，通过Anchor的工具安装最新的avm，avm是"Anchor Version Manager"，类似rustup
管理rustc的版本，又或者pyenv管理python版本。

```
avm install latest
avm use latest
```
然后查看anchor的版本
```
anchor --version
```


## 创建工程

通过anchor的命令创建工程

```
anchor init helloworld
```

这将创建一个您可以移入的新锚定工作区。 

```
.
├── Anchor.toml
├── Cargo.toml
├── app
├── migrations
├── node_modules
├── package.json
├── programs
├── tests
├── tsconfig.json
└── yarn.lock
```


以下是该文件夹中的一些重要文件：

*  .anchor文件夹：它包含最新的程序日志和用于测试的本地分类帐
* app目录：如果您使用 monorepo，则可以使用它来保存前端的空文件夹
* programs目录：此文件夹包含您的程序。 它可以包含多个，但最初只包含一个与 <new-workspace-name> 同名的程序。 该程序已经包含一个 lib.rs 文件和一些示例代码。
* tests目录：包含 E2E 测试的文件夹。 它已经包含一个用于测试programs/<new-workspace-name>中的示例代码的文件。
* migrations目录：在此文件夹中，您可以保存程序的部署和迁移脚本。
* Anchor.toml 文件：此文件为您的程序配置工作区范围的设置。 最初，它配置
    * 合约在本地网络上的地址 ([programs.localnet])
    * 合约可以推送到的注册表 ([registry])
    * 测试中使用的provider ([provider])
    * 通过Anchor 执行的脚本 ([scripts])。 测试脚本在运行锚点测试时运行。 可以使用`anchor run <script_name> `运行自己的脚本。


执行build命令便可以完成对合约的构建：

```
anchor build
```

## Anchor程序结构


一个Anchor工程主要包含了

* "declare_id"宏声明的合约地址，用于创建对象的owner
* #[derive(Accounts)] 修饰的Account对象，用于表示存储和指令
* "program" 模块，这里面写主要的合约处理逻辑

对应到我们之前的HelloWorld，就是要将state和instruction部分用 ` #[derive(Accounts)] `
修饰，将process逻辑放到program模块中，并增加一个合约地址的修饰。

### 处理指令

### 自动序列化

### 错误处理
在我们之前的结构中，我们专门用了error.rs来枚举错误，在Anchor中提供了两类错误

* Anchor自身错误
* 自定义错误

Anchor自身错误，可以参考具体的[错误码](https://docs.rs/anchor-lang/latest/anchor_lang/error/enum.ErrorCode.html)

自定义错误通过"err!"和"error_code!"宏来抛出和定义：

```
#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: MyAccount) -> Result<()> {
        if data.data >= 100 {
            return err!(MyError::DataTooLarge);
        }
        ctx.accounts.my_account.set_inner(data);
        Ok(())
    }
}




#[error_code]
pub enum MyError {
    #[msg("MyAccount may only hold data below 100")]
    DataTooLarge
}
```

Anchor提供了一个类似assert的 `requre!`宏，用于判断条件，并打印错误码，返回错误：

```
  require!(data.data < 100, MyError::DataTooLarge);
```

如果条件不满足，则返回后面的错误。


### 合约间调用

### PDA生成


## 发布和调试


## 客户端调用

## 改造之前的HelloWorld