# 合约调用
在前面的例子中，我们通过web3.js提供的SystemProgram来帮助我们实现了转账的功能。

但是对于一个陌生的合约，我们要怎么来发起调用请求呢？

## 合约的入口

这里我们以SPL Token合约来举例。SPL Token合约类似web3.js一样，其实已经封装好了
一套JS库给我们来直接使用。这里我们不使用库，而以一个前端的身份，来看这样的一个合约，
我们要怎么来交互。

我们以transfer函数作为例子。

首先要理解合约的作用和参数，这个可以跟合约开发去沟通。比如我们从注释了解到 transfer为

    /// Transfers tokens from one account to another either directly or via a
    /// delegate.  If this account is associated with the native mint then equal
    /// amounts of SOL and Tokens will be transferred to the destination
    /// account.
    ///
    /// Accounts expected by this instruction:
    ///
    ///   * Single owner/delegate
    ///   0. `[writable]` The source account.
    ///   1. `[writable]` The destination account.
    ///   2. `[signer]` The source account's owner/delegate.
    ///
    ///   * Multisignature owner/delegate
    ///   0. `[writable]` The source account.
    ///   1. `[writable]` The destination account.
    ///   2. `[]` The source account's multisignature owner/delegate.
    ///   3. ..3+M `[signer]` M signer accounts.
    Transfer {
        /// The amount of tokens to transfer.
        amount: u64,
    },  

总共需要3个key，分别是，发送方，接收方以及发送方的ower/delegate。然后有一个类型u64的参数。

知道了这些我们才可以构造我们的Instruction。Instruction的定义为：

    /**
    * Transaction Instruction class
    */
    export class TransactionInstruction {
        /**
        * Public keys to include in this transaction
        * Boolean represents whether this pubkey needs to sign the transaction
        */
        keys: Array<AccountMeta>;
        /**
        * Program Id to execute
        */
        programId: PublicKey;
        /**
        * Program input
        */
        data: Buffer;
        constructor(opts: TransactionInstructionCtorFields);
    }

所以我们主要就是要从合约的定义中知道这里的keys是什么， data是什么，programId自然就是合约的地址。



## 构造 Instruction
在上面，我们知道了Instruction的定义。那么要如何来构造呢？

如果你是用TypeScript,那么比较醒目。keys是AccountMeta的数组，AccountMeta的定义为：

    /**
    * Account metadata used to define instructions
    */
    type AccountMeta = {
        /** An account's public key */
        pubkey: PublicKey;
        /** True if an instruction requires a transaction signature matching `pubkey` */
        isSigner: boolean;
        /** True if the `pubkey` can be loaded as a read-write account. */
        isWritable: boolean;
    };

总共就三个成员，一个PublicKey表示Account的地址， 一个isSigner表示是否为签名者，说白了就是是不是你自己。
以及isWritable，表示这个Account的Data部分是否可以修改。

这里PublicKey的定义为：

    export class PublicKey extends Struct {
        /**
        * Create a new PublicKey object
        * @param value ed25519 public key as buffer or base-58 encoded string
        */
        constructor(value: PublicKeyInitData);

        ...
    }

    /**
    * Value to be converted into public key
    */
    type PublicKeyInitData = number | string | Uint8Array | Array<number> | PublicKeyData;

其实就是用公钥的字符串就可以进行构造了。

所以如果是用TypeScript。就严格按照类型来定义就好了。

如果是Javascript，可以用字典来进行显式初始化：


而data部分是一个Buffer，其实本质是一段二进制，其格式是根据合约来定义的，也可以参考标准，比如"Anchor"。
而SPL Token的二进制定义为：

![](./assets/images/data_bin.png)

这里我们可以借助 web.js提供的"encodeData"方法来进行序列化。而web3.js的指令定义依赖了solana提供
的buffer-layout，因此需要这样来定义：

这样实际上就是定义了上面的这个序列化的图。当调用`encodeData`方法时，就可以按照这里定义的格式进行序列化了。



## 构造Transaction
有了TransactionInstruction之后，就可以构造Transaction了。前面已经说过，现在用的是
VersionedTransaction。他的定义为：

    export class VersionedTransaction {
        signatures: Array<Uint8Array>;
        message: VersionedMessage;
        get version(): TransactionVersion;
        constructor(message: VersionedMessage, signatures?: Array<Uint8Array>);
        serialize(): Uint8Array;
        static deserialize(serializedTransaction: Uint8Array): VersionedTransaction;
        sign(signers: Array<Signer>): void;
        addSignature(publicKey: PublicKey, signature: Uint8Array): void;
    }

可以通过一个VesionedMessage来构建，定义为：

    type VersionedMessage = Message | MessageV0;
    export const VersionedMessage: {
        deserializeMessageVersion(serializedMessage: Uint8Array): 'legacy' | number;
        deserialize: (serializedMessage: Uint8Array) => VersionedMessage;
    };

Message是为了兼容以前的Message，现在的都是用MessageV0：

    export class MessageV0 {
        header: MessageHeader;
        staticAccountKeys: Array<PublicKey>;
        recentBlockhash: Blockhash;
        compiledInstructions: Array<MessageCompiledInstruction>;
        addressTableLookups: Array<MessageAddressTableLookup>;
        constructor(args: MessageV0Args);
        get version(): 0;
        get numAccountKeysFromLookups(): number;
        getAccountKeys(args?: GetAccountKeysArgs): MessageAccountKeys;
        isAccountSigner(index: number): boolean;
        isAccountWritable(index: number): boolean;
        resolveAddressTableLookups(addressLookupTableAccounts: AddressLookupTableAccount[]): AccountKeysFromLookups;
        static compile(args: CompileV0Args): MessageV0;
        serialize(): Uint8Array;
        private serializeInstructions;
        private serializeAddressTableLookups;
        static deserialize(serializedMessage: Uint8Array): MessageV0;
    }

看上去超级复杂。因此web3.js给我们提供了一个简单的方法，通过`TransactionMessage`来构造：

    export class TransactionMessage {
        payerKey: PublicKey;
        instructions: Array<TransactionInstruction>;
        recentBlockhash: Blockhash;
        constructor(args: TransactionMessageArgs);
        static decompile(message: VersionedMessage, args?: DecompileArgs): TransactionMessage;
        compileToLegacyMessage(): Message;
        compileToV0Message(addressLookupTableAccounts?: AddressLookupTableAccount[]): MessageV0;
    }

其`compileToV0Message`可以转换道得到对应的MessageV0。

因此只需要提供TransactionMessageArgs即可，其定义为：

    type TransactionMessageArgs = {
        payerKey: PublicKey;
        instructions: Array<TransactionInstruction>;
        recentBlockhash: Blockhash;
    };

    /**
    * Blockhash as Base58 string.
    */
    type Blockhash = string;

终于到正主了，这里我们看到payerKey是付gas人的地址。instructions是我们前面介绍的Instruction。
recentBlockhash是最近的Blockhash这个不能太久远。可以通过RPC进行请求。

这样我们连起来就是：

    const txInstructions = 

    const message = new TransactionMessage({
      payerKey: this.keypair.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: txInstructions
    }).compileToV0Message();

    const trx = new VersionedTransaction(messageV0);

## 构造SPL Token的 转账交易

前面我们已经搞清楚了SPL Token合约转账指令的结构，3个账号一个数目。账号比较容易。我们自己账号
对应的SPL Token的ATA账号，对方接收的账号。这两个都是不需要前面的，并且需要修改的。还有个我们
自己的SOL账号，这个需要签名。

按照上面说的，我们依靠web3.js提供的buffer-layout我们来定义这个transfer的指令。

    abc

定义好指令，我们就可以开始构建了。

按照上面说先构建指令:

    abc

然后构建交易：

    abc

最后利用前面学的通过钱包来发送交易：

    abc

这样我们就完成了通过前端来和特定的合约进行交互。

