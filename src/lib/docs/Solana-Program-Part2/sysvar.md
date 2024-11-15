# 系统变量
Solana作为一个24h小时运行的系统，其中一些系统变量可以通过接口直接获取，而另外一些变量
则要需要将特定的Account通过指令传递给合约。

* Clock
* EpochSchedule
* Fees
* Rent

这几个变量，可以在合约里面直接通过`get()`方法得到。比如：

    let clock = Clock::get()

即可得到Clock对象。而其他的变量，则需要在指令中传入该变量的地址，然后再合约里面解析：

    let clock_sysvar_info = next_account_info(account_info_iter)?;
    let clock = Clock::from_account_info(&clock_sysvar_info)?;

## Clock

Clock的内容为：

    #[repr(C)]
    pub struct Clock {
        pub slot: Slot,
        pub epoch_start_timestamp: UnixTimestamp,
        pub epoch: Epoch,
        pub leader_schedule_epoch: Epoch,
        pub unix_timestamp: UnixTimestamp,
    }

其意义有：

* Slot：当前槽位
* epoch_start_timestamp：该纪元中第一个槽的 Unix 时间戳。 在纪元的第一个时隙中，此时间戳与 unix_timestamp（如下）相同。
* epoch：当前纪元
* leader_schedule_epoch：已生成领导者调度的最新纪元
* unix_timestamp：该槽的 Unix 时间戳。
* 
每个时段都有基于历史证明的估计持续时间。 但实际上，时隙的流逝速度可能比这个估计更快或更慢。 因此，槽的 Unix 时间戳是根据投票验证器的预言机输入生成的。 该时间戳计算为投票提供的时间戳估计的权益加权中位数，以自纪元开始以来经过的预期时间为界限。

更明确地说：对于每个槽，每个验证器提供的最新投票时间戳用于生成当前槽的时间戳估计（假设自投票时间戳以来经过的槽为 Bank::ns_per_slot）。 每个时间戳估计都与委托给该投票账户的权益相关联，以按权益创建时间戳分布。 时间戳中位数用作 unix_timestamp，除非自 epoch_start_timestamp 以来的经过时间与预期经过时间的偏差超过 25%。

## EpochSchedule

包含在创世纪中设置的纪元调度常量，并允许计算给定纪元中的时隙数、给定时隙的纪元等

    #[repr(C)]
    pub struct EpochSchedule {
        pub slots_per_epoch: u64,
        pub leader_schedule_slot_offset: u64,
        pub warmup: bool,
        pub first_normal_epoch: Epoch,
        pub first_normal_slot: Slot,
    }

## Fees
当前系统的fee设置，结构为：

    #[repr(C)]
    pub struct Fees {
        pub fee_calculator: FeeCalculator,
    }

    pub struct FeeCalculator {
        pub lamports_per_signature: u64,
    }

## Instructions

包含正在处理消息时消息中的序列化指令。这允许程序指令引用同一事务中的其他指令

    pub struct Instructions();

## Rent
租金系统变量包含租金率。目前，该比率是静态的并在创世时设定。租金消耗百分比通过手动功能激活进行修改。

    #[repr(C)]
    pub struct Rent {
        pub lamports_per_byte_year: u64,
        pub exemption_threshold: f64,
        pub burn_percent: u8,
    }


## SlotHashes
    
包含插槽父银行的最新哈希值。每个插槽都会更新。

## SlotHistory
    
包含上一个纪元中存在的插槽的位向量。每个插槽都会更新。

## StakeHistory
    
包含每个时期集群范围内权益激活和停用的历史记录。它在每个纪元开始时更新。


## 系统变量地址

|系统变量| 地址|
|---|---|
|Clock|SysvarC1ock11111111111111111111111111111111|
|EpochSchedule|SysvarEpochSchedu1e111111111111111111111111|
|Fees|SysvarFees111111111111111111111111111111111|
|Instructions|Sysvar1nstructions1111111111111111111111111|
|RecentBlockhashes|SysvarRecentB1ockHashes11111111111111111111|
|Rent|SysvarRent111111111111111111111111111111111|
|SlotHashes|SysvarS1otHistory11111111111111111111111111|
|SlotHistory|SysvarS1otHistory11111111111111111111111111|
|StakeHistory|SysvarStakeHistory1111111111111111111111111|

## 实例

在我们创建PDA账号的时候，需要给其传递多少lamports来维持其的生存呢？

    /// Creates associated token account using Program Derived Address for the given seeds
    pub fn create_pda_account<'a>(
        payer: &AccountInfo<'a>,
        rent: &Rent,
        space: usize,
        owner: &Pubkey,
        system_program: &AccountInfo<'a>,
        new_pda_account: &AccountInfo<'a>,
        new_pda_signer_seeds: &[&[u8]],
    ) -> ProgramResult {
        if new_pda_account.lamports() > 0 {
            let required_lamports = rent
                .minimum_balance(space)
                .max(1)
                .saturating_sub(new_pda_account.lamports());

            if required_lamports > 0 {
                invoke(
                    &system_instruction::transfer(payer.key, new_pda_account.key, required_lamports),
                    &[
                        payer.clone(),
                        new_pda_account.clone(),
                        system_program.clone(),
                    ],
                )?;
            }

            invoke_signed(
                &system_instruction::allocate(new_pda_account.key, space as u64),
                &[new_pda_account.clone(), system_program.clone()],
                &[new_pda_signer_seeds],
            )?;

            invoke_signed(
                &system_instruction::assign(new_pda_account.key, owner),
                &[new_pda_account.clone(), system_program.clone()],
                &[new_pda_signer_seeds],
            )
        } else {
            invoke_signed(
                &system_instruction::create_account(
                    payer.key,
                    new_pda_account.key,
                    rent.minimum_balance(space).max(1),
                    space as u64,
                    owner,
                ),
                &[
                    payer.clone(),
                    new_pda_account.clone(),
                    system_program.clone(),
                ],
                &[new_pda_signer_seeds],
            )
        }
    }

这里我们通过：

    rent.minimum_balance(space).max(1),

来计算，因为rent的值可以通过：

    Rent::get()

获取，所以这里，我们传递它即可。