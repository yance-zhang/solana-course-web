# 课后练习
扩充Token合约，为Token合约增加Meta信息，如

* icon: 代币图标
* name: 代币名称
* symbol: 代币符号缩写
* home: 代币主页

> 提示：
> * 1. 增加一个Token管理合约
> * 2. 当通过Token合约Mint新SPL Token的时候，同时在这个新合约里面注册Token合约地址
> 以及对应的Meta信息
> * 3. 用Mint的SPL Token的地址去这个合约中去查询Meta信息