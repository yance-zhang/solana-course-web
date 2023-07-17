# Rust基本语法


## 变量和类型

### 基本数据类型
基本数据类型主要有整形、浮点、布尔以及字符类型。

整形按照所占空间大小被分为1、2、4、8、16 字节大小的整数。每个大小又有有符号和无符号的差别。
具体的定义如下：


|Length|Signed|Unsigned|
|---|---|---|
|8-bit	|i8	|u8|
|16-bit	|i16	|u16|
|32-bit	|i32	|u32|
|64-bit	|i64	|u64|
|128-bit	|i128	|u128|
|arch	|isize	|usize|

而浮点型包括f32和f64两个分别使用4字节和8字节的IEEE-754 浮点格式的浮点数。

布尔类型和其他语言的布尔类型类似，用`true`和`false`来表示。

字符类型是用`''`单引号括起来的字符。rust天生支持utf-8,所以任何单引号括起来的utf-8字符都是合法的字符类型变量。

### 复合类型
复合类型是基本类型和复合类型的组合，典型的有

元组：

    let tup: (i32, f64, u8) = (500, 6.4, 1);

单纯的把几个类型放在一起。访问的时候通过下标索引来访问 比如 这里的500：`tup.0`

数组：

    let arr = [1, 2, 3, 4, 5];

和元组不通的是，这里每个元素的类型必须是同样的。访问的时候，下标用中括号表示: `arr[0]`

struct:

    struct User {
        active: bool,
        username: String,
        email: String,
        sign_in_count: u64,
    }

    let user = User {
        email: String::from("someone@example.com"),
        username: String::from("someusername123"),
        active: true,
        sign_in_count: 1,
    };

struct类似C语言里的struct，将多个类型组合在一起，通过成员名进行访问：`user.email`

### 变量

变量定义为：

    let x = 5;

这里x的类型是由系统推到而来的。也可以显示指定类型

    let x:u32 = 5;

这里x被赋值为5后，区别与其他语言的点。变量默认是不可以修改的，也就是：

    let x = 5;
    x=6;

会导致报错：

    error[E0384]: cannot assign twice to immutable variable `x`
    --> src/main.rs:4:5
    |
    2 |     let x = 5;
    |         -
    |         |
    |         first assignment to `x`
    |         help: consider making this binding mutable: `mut x`
    3 |     println!("The value of x is: {x}");
    4 |     x = 6;
    |     ^^^^^ cannot assign twice to immutable variable

但是可以用如下形式：

    let x = 5;
    let x=6;

甚至如下形式：

    let x = 5;
    let x="6";

这里，第二个`let`相当于重新定义一个变量，可以重新定义其类型。

如果要修改变量，可以这样定义：

    let mut x = 5;
    x=5;

## 语句和表达式
语句是指执行一段逻辑动作的代码，比如if语句，while语句。而表达式，是可以得到结果值的代码。比如`1+1`。
虽然表达式也可以执行逻辑，但是区别是表达式可以作为返回值，或者别的变量的赋值。而语句不行。

### let表达式

`let` 主要用于变量的定义：

     let condition = true;

`let`还可以和if组合：

    let number = if condition { 5 } else { "six" };

这里if语句里面的值类似返回值。

### match表达式

match可以做类型匹配和解包：


    let config_max = Some(3u8);
    match config_max {
        Some(max) => println!("The maximum is configured to be {}", max),
        _ => (),
    }

等同于上面的if let：

    let config_max = Some(3u8);
    if let Some(max) = config_max {
        println!("The maximum is configured to be {}", max);
    }

### 条件 语句
if和Go语言的if比较类似，都是去除了传统语言里面的括号

    let number = 3;

    if number < 5 {
        println!("only if");
    }

    if number < 5 {
        println!("if else: condition was true");
    } else {
        println!("if else: condition was false");
    }

    if number < 5 {
        println!("if else if : number < 5 ");
    } else if number == 5 { 
        println!("if else if : number == 5 ");
    } else{
        println!("if else if : number > 5 ");
    }

### 循环语句

rust给无限循环增加了一个loop,约等于 while 1：

    loop {
        println!("again and again!");
    }

但是loop可以通过break来返回一个结果：

    let mut counter = 0;

    let result = loop {
        counter += 1;

        if counter == 10 {
            break counter * 2;
        }
    };

    println!("The result is {result}");

在循环中，可以通过类似goto的label定义，break到对应层级：

    let mut count = 0;
    'counting_up: loop {
        println!("count = {count}");
        let mut remaining = 10;

        loop {
            println!("remaining = {remaining}");
            if remaining == 9 {
                break;
            }
            if count == 2 {
                break 'counting_up;
            }
            remaining -= 1;
        }

        count += 1;
    }
    println!("End count = {count}");

除了loop，常见的while也是有的：

    while true {
        println!("again and again!");
    }

以及for语句，不同于c-like语言，for语句是迭代器风格的，而不是两个";"三语句模式。

    let a = [10, 20, 30, 40, 50];

    for element in a {
        println!("the value is: {element}");
    }

    // 模拟 int i=1; i<4; i++
     for number in (1..4).rev() {
        println!("{number}!");
    }

## 函数
函数分为`main`函数和普通函数。`main`函数是可执行程序的入口函数。对于库是不需要的。`main`函数本身也是个普通函数
只是函数名为`main`。

    fn main() {
        println!("Hello, world!");

        another_function();
    }

    fn another_function() {
        println!("Another function.");
    }

上面这个是不带参数，没有返回值的函数的最基本定义结构。首先用 `fn`开始，然后跟函数名以及`()`。最后用`{}`,括起来
的函数逻辑.

    fn main() {
        print_labeled_measurement(5, 'h');
    }

    fn print_labeled_measurement(value: i32, unit_label: char) {
        println!("The measurement is: {value}{unit_label}");
    }

带参数的函数，在`()`中定义参数，参数为`参数名:类型`这样的格式。

带返回的函数如：

    fn main() {
        let x = plus_one(5);

        println!("The value of x is: {x}");
    }

    fn plus_one(x: i32) -> i32 {
        x + 1
    }

在参数`()`和函数体`{}`中间用`->` 分割，罗列返回值类型。

这里体现了语句和表达式的区别。语句是执行一个动作，不具有可以作为直的结果。而表达式是可以作为值的结果的。
因此这里表达式`x+1`，作为值，直接进行范围。注意，此时后面不可以加`;`。

## struct和enum

### struct
定义结构体如下：

    struct User {
        active: bool,
        username: String,
        email: String,
        sign_in_count: u64,
    }

结构为`struct`关键字加上大写开头的类型名,后面跟`{}`包裹的成员变量，每个成员变量为`成员名：类型,`。

struct的初始化：

    let user1 = User {
        email: String::from("someone@example.com"),
        username: String::from("someusername123"),
        active: true,
        sign_in_count: 1,
    };

如果用其他struct来初始化同类型时，可以用：

    let user2 = User {
        email: String::from("another@example.com"),
        ..user1
    };

有一种特殊的struct,元组struct:

    struct Color(i32, i32, i32);
    struct Point(i32, i32, i32);

    fn main() {
        let black = Color(0, 0, 0);
        let origin = Point(0, 0, 0);

        println!("black 0:{}", black.0)
    }

还有种更特殊的struct：

    struct AlwaysEqual;

    fn main() {
        let subject = AlwaysEqual;
    }

他的值可以是`{}`,所以在代码中看到`{}`就可以认为是一个不占空间的struct的值，比如:

    Ok({})


### enum
rust中的enum比任何其他语言的都强大。

简单版本：

    enum IpAddrKind {
        V4,
        V6,
    }

这个容易理解，使用的时候就是 `let four = IpAddrKind::V4;`。

指定类型版本：

    enum IpAddr {
        V4(String),
        V6(String),
    }

使用的时候：`let home = IpAddr::V4(String::from("127.0.0.1"));` 这就有点不像传统enum了。更像一个struct定义。
这里"V4","V6"同样的类型，还不直观。

    struct Ipv4Addr {
        // --snip--
    }

    struct Ipv6Addr {
        // --snip--
    }

    enum IpAddr {
        V4(Ipv4Addr),
        V6(Ipv6Addr),
    }

V4是一个类型，V6是一个类型。这个时候enum更像union。也还好理解。

来个不容易看的：

    enum IpAddr {
        V4(u8, u8, u8, u8),
        V6(String),
    }

    let home = IpAddr::V4(127, 0, 0, 1);

这里V4变成了一个元组类型。虽然可读性差一点，但是写法方便。

最复杂的：

    enum Message {
        Quit,
        Move { x: i32, y: i32 },
        Write(String),
        ChangeColor(i32, i32, i32),
    }

`Message`定义了一个游戏的消息指令，这里在传统语言如C++中，可能要定义个Message基类，然后每个命令消息再去定义子类。

而这里一个enum搞定。这个时候，这个enum真不好说他是什么功能。

### 给struct/enum定义方法

给struct定义方法：

    #[derive(Debug)]
    struct Rectangle {
        width: u32,
        height: u32,
    }

    impl Rectangle {
        fn area(&self) -> u32 {
            self.width * self.height
        }
    }

    fn main() {
        let rect1 = Rectangle {
            width: 30,
            height: 50,
        };

        println!(
            "The area of the rectangle is {} square pixels.",
            rect1.area()
        );
    }

使用`impl Xxx {}` 语法，在`{}`的方法，就是成员方法。

其中不带(&self)参数的是类方法，第一个参数为(&self)的为类方法。这个类似python2。

给enum定义也是一样，用`impl Xxx {}`
    impl Message {
        fn call(&self) {
            // method body would be defined here
        }
    }

    let m = Message::Write(String::from("hello"));
    m.call();

枚举的强大还体现在他的使用上，再不需要上面的类继承来做反射：

    pub enum NameRegistryInstruction {
        Create {
            hashed_name: Vec<u8>,
            lamports: u64,
            space: u32,
        },

        Update { offset: u32, data: Vec<u8> },

        Transfer { new_owner: Pubkey },

        Delete,

        Realloc {
            space: u32,
        },
    }
        
    match instruction {
        NameRegistryInstruction::Create {
            hashed_name,
            lamports,
            space,
        } => {
            msg!("Instruction: Create");
            Processor::process_create(program_id, accounts, hashed_name, lamports, space)?;
        }
        NameRegistryInstruction::Update { offset, data } => {
            msg!("Instruction: Update Data");
            Processor::process_update(accounts, offset, data)?;
        }
        NameRegistryInstruction::Transfer { new_owner } => {
            msg!("Instruction: Transfer Ownership");
            Processor::process_transfer(accounts, new_owner)?;
        }
        NameRegistryInstruction::Delete => {
            msg!("Instruction: Delete Name");
            Processor::process_delete(accounts)?;
        }
        NameRegistryInstruction::Realloc { space } => {
            msg!("Instruction: Realloc Name Record");
            Processor::process_realloc(accounts, space)?;
        }
    }

通过`match`语句，首先能对enum做类型匹配，匹配的同时，还可以对类型做解包, 如NameRegistryInstruction::Create

        {
            hashed_name,
            lamports,
            space,
        } 

这里其实是一个没有给名字的struct。

## 容器

### list/vector 

    Vec<T>

vec是std提供的链表类型。可以用来存放相同类型的数组。

创建指定类型的vector：

     let v: Vec<i32> = Vec::new();

也可以通过`vec!`宏直接赋值初始化：

    let v = vec![1, 2, 3];

增加元素：

    let mut v = Vec::new();

    v.push(5);
    v.push(6);
    v.push(7);
    v.push(8);

这里`mut`表示vector是可以做增删修改的。

通过`remove`进行删除元素：

    let mut v = vec![1, 2, 3];
    assert_eq!(v.remove(1), 2);
    assert_eq!(v, [1, 3]);

可以通过`get`给定下标，获取vector的元素，通过Option来做判断是否存在：

    let v = vec![1, 2, 3, 4, 5];

    let third: &i32 = &v[2];
    println!("The third element is {third}");

    let third: Option<&i32> = v.get(2);
    match third {
        Some(third) => println!("The third element is {third}"),
        None => println!("There is no third element."),
    }

通过迭代器，遍历：

    let v = vec![100, 32, 57];
    for n_ref in &v {
        // n_ref has type &i32
        let n_plus_one: i32 = *n_ref + 1;
        println!("{n_plus_one}");
    }

上面这个是只读的，如果需要修改，使用：

    let mut v = vec![100, 32, 57];
    for n_ref in &mut v {
        // n_ref has type &mut i32
        *n_ref += 50;
    }


### String
rust的String不是基础类型，是由std提供的类型。创建字符串可以用：

    let mut s = String::new();

    let data = "initial contents";
    let s = data.to_string();


    let s = String::from("initial contents");

三种方法。

修改字符串：

    let mut s = String::from("foo");
    s.push_str("bar");

    let mut s1 = String::from("foo");
    let s2 = "bar";
    s1.push_str(s2);
    println!("s2 is {s2}");

    let mut s = String::from("lo");
    s.push('l');

    let s1 = String::from("Hello, ");
    let s2 = String::from("world!");
    let s3 = s1 + &s2; // note s1 has been moved here and can no longer be used

可以使用`push_str`、`push`甚至是"+"来修改字符串。注意"+"会borrow变量。当然要修改字符串前提是字符串是"mut"的。

可以通过下标操作。或者字符串中的字符：

    let s1 = String::from("hello");
    let h = s1[0];

### Map

rust中的map也不是基础类型，而是std提供的，并且也和一般语言中不一样，类似Java里面明确的命名为"HashMap"

创建：

    use std::collections::HashMap;

    let mut scores = HashMap::new();

    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);

访问：

    use std::collections::HashMap;

    let mut scores = HashMap::new();

    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);

    let team_name = String::from("Blue");
    let score = scores.get(&team_name).copied().unwrap_or(0);

遍历：

     use std::collections::HashMap;

    let mut scores = HashMap::new();

    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);

    for (key, value) in &scores {
        println!("{key}: {value}");
    }

插入修改：

    use std::collections::HashMap;

    let mut scores = HashMap::new();

    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Blue"), 25);

    println!("{:?}", scores);

判断是否存在，存在才插入：

 use std::collections::HashMap;

    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);

    scores.entry(String::from("Yellow")).or_insert(50);
    scores.entry(String::from("Blue")).or_insert(50);

    println!("{:?}", scores);



## trait
trait 类似其他语言中的接口，但是就好比enum一样，他不仅类似其他语言的接口，他更强大。
更复杂。很多继承的特性都是通过 trait 来实现。

trait 的定义类似struct:

    pub trait Summary {
        fn summarize(&self) -> String;
    }

trait主要是定义方法。这里方法就是个普通的函数定义。但是去掉了参数名。

trait只是定义了接口方法，而具体实现需要再struct中实现：

    pub struct NewsArticle {
        pub headline: String,
        pub location: String,
        pub author: String,
        pub content: String,
    }

    impl Summary for NewsArticle {
        fn summarize(&self) -> String {
            format!("{}, by {} ({})", self.headline, self.author, self.location)
        }
    }

    pub struct Tweet {
        pub username: String,
        pub content: String,
        pub reply: bool,
        pub retweet: bool,
    }

    impl Summary for Tweet {
        fn summarize(&self) -> String {
            format!("{}: {}", self.username, self.content)
        }
    }

使用`impl`关键字，跟要实现的trait名加上"for Xxx"给具体的struct视线。

这里还可以再trait中给出默认实现：

    pub trait Summary {
        fn summarize(&self) -> String {
            String::from("(Read more...)")
        }
    }

这样，在"impl"里面没有"summarize"方法实现时，就默认用trait里面的定义。

trait的作用主要要结合泛型限制，和参数专递才能体现。比如类似其他语言中基本的OOP的动态：

    pub fn notify(item: &impl Summary) {
        println!("Breaking news! {}", item.summarize());
    }

这里将参数声明为trait，任何实现了这个traint的类型都可以传递进来。具体的summarize是
传入进来的类型的实现。

除了可以限制参数，还可以限制返回值。这个就有点类似其他语言的基类、接口。

    fn returns_summarizable() -> impl Summary {
        Tweet {
            username: String::from("horse_ebooks"),
            content: String::from(
                "of course, as you probably already know, people",
            ),
            reply: false,
            retweet: false,
        }
    }

和泛型的结合，见下一章。


## 泛型
泛型是rust最强的地方，也是rust最难的地方，更是学习rust的拦路虎。

来看个定义：

    pub struct Iter<'a, K, V> {
        db_iter: rocksdb::DBIterator<'a>,
        _phantom: PhantomData<(K, V)>,
    }

    impl<'a, K: DeserializeOwned, V: DeserializeOwned> Iter<'a, K, V> {
        pub(super) fn new(db_iter: rocksdb::DBIterator<'a>) -> Self {
            Self {
                db_iter,
                _phantom: PhantomData,
            }
        }
    }

    impl<'a, K: DeserializeOwned, V: DeserializeOwned> Iterator for Iter<'a, K, V> {
        type Item = (K, V);

        fn next(&mut self) -> Option<Self::Item> {
            let (key, value) = self.db_iter.next()?;
            let key = bincode::deserialize(&key[PREFIX_LEN..]).ok()?;
            let value = bincode::deserialize(&value).ok()?;

            Some((key, value))
        }
    }

感觉正常人都看不懂这个是什么。

回到泛型基础语法上来。先来看定义函数：

    fn largest<T>(list: &[T]) -> &T {
        let mut largest = &list[0];

        for item in list {
            if item > largest {
                largest = item;
            }
        }

        largest
    }

    fn main() {
        let number_list = vec![34, 50, 25, 100, 65];

        let result = largest(&number_list);
        println!("The largest number is {}", result);

        let char_list = vec!['y', 'm', 'a', 'q'];

        let result = largest(&char_list);
        println!("The largest char is {}", result);
    }

这里定义的largest函数，后面接了"<T>"这个还算正常，学过C++都知道这里是一个模板定义，或者说类型定义。后续T
代表着一种类型。

还可以出现在结构体中：

    struct Point<T> {
        x: T,
        y: T,
    }

    impl<T> Point<T> {
        fn x(&self) -> &T {
            &self.x
        }
    }

    fn main() {
        let p = Point { x: 5, y: 10 };

        println!("p.x = {}", p.x());
    }

这里"impl"也要加上"<T>"

以及枚举中，如典型的Result：

    enum Result<T, E> {
        Ok(T),
        Err(E),
    }

在后面有介绍生命周期，生命周期也类似类型，也需要放在这里'<>' 如：


    pub struct Iter<'a, K, V> {
        db_iter: rocksdb::DBIterator<'a>,
        _phantom: PhantomData<(K, V)>,
    }

