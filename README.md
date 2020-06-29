## Vchat[聊天室] Vue+node+webpack+mongodb

#### 说明
这是自己学习 node、webpack 的时候决定练手的项目，也并未上线。

```handlebars
前端主要采用了vue全家桶，学习 Webpack 于是采用其搭建的项目，vuex状态管理，vue-
router控制路由，axios进行前后端交互。后端是基于node搭的服务，用的是express。本来
是准备 express 和 koa 都写一版去熟悉的，但是后来于是时间关系，只基于了 express
聊天最重要的是通信，项目用socket.io来进行前后端通信。
数据库是mongoDB，主要有用户、好友、消息、账号等。
```
##### 功能设计

 - 登录注册

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200628222443760.gif)
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020062822250324.gif)

```c
// 号码池设计
    * code 号码
    * name 账号
    * pass 密码
    * avatar 头像
    * signature 个性签名
    * nickname 昵称
    * email 邮件
    * phone 手机
    * sex 性别
    * wallpaper 聊天壁纸
    * signUpTime 注册时间
    * conversationsList 会话列表
    * cover 封面列表
```
### 注册：
1、利用用户表用户名字段判断是否已经被注册了
2、没有注册的话，就在用户表里面去 create 一个用户(用户名、密码、默认头像、个性签名...)

```c
   // md5 密码加密
    const md5 = pass => { 
        let md5 = crypto.createHash('md5');
        return md5.update(pass).digest("hex");
    };
```
### 登录：
###### 1、gitLogin OAuth 授权第三方登录
a. 用户首先跳转到github 提供的第三方登录的链接，询问是否授权第三方登录
b. 同意后 重定向到登录页面并返回 code
c.利用这个 code 加上我们需要去 github 的官网注册拿到 客户端密钥、客户端 id
d. 换取 token
e.去拿到 github 返回的用户信息

```c
const gitLogin = async (req, callback) => {
    const code = req.query.code
    const tokenResponse = await axios({
        method: 'post',
        url: 'https://github.com/login/oauth/access_token?' +
            `client_id=${clientID}&` +
            `client_secret=${clientSecret}&` +
            `code=${code}`,
        headers: {
            accept: 'application/json'
        }
    });

    const accessToken = tokenResponse.data.access_token
    const result = await axios({
        method: 'get',
        url: `https://api.github.com/user`,
        headers: {
            accept: 'application/json',
            Authorization: `token ${accessToken}`
        }
    });

    await baseList.users.findOne({
        name: result.data.login
    }).then(r => {
        if (!r) {
            //用户没有注册过
            baseList.users.create({
                name: result.data.login, //res.data.login
                pass: '111111',
                code: Date.now(),
                nickname: 'vChat' + (Date.now() + '').slice(6),
                photo: result.data.avatar_url,
                isGitLogin:true,
                gitPhoto:result.data.avatar_url
            })
        }
    })
    const token = jwt.sign({
        //前端发送token 后台根据token携带的信息确认用户
        id: String(result.data.login)
    }, SECRET)
    callback({
        code: 1,
        data: {
            name: result.data.login,
            avatar_url: result.data.avatar_url,
            token
        }
    })

}
```

###### 2、账号密码登录

```c
const login = async (params, callback) => {
    const users = await baseList.users
        .find({
            $or: [{
                "name": params.name
            }, {
                "code": params.name
            }]
        })
    if (users.length == 0) {
        return callback({
            //用户不存在
            code: -1,
            message: '账号不存在或者密码错误'
        })
    }
    const isPasswordValid = require('bcrypt').compareSync(
        params.pass,
        users[0].pass
    )
    if (isPasswordValid) {
        const token = jwt.sign({
            //前端发送token 后台根据token携带的信息确认用户
            id: String(users[0].name)
        }, SECRET)
        //密码正确
        callback({
            code: 0,
            data: {
                name: users[0].name,
                photo: users[0].photo
            },
            token
        })
    } else {
        callback({
            code: -1,
            message: '密码错误'
        })
    }

}
```

###### 3、前端用axios统一设置拦截器

```c
// http request 请求拦截器，有token值则配置上token值
instance.interceptors.request.use(
  config => {
    let token = localStorage.getItem("token");
    if (token) { // 每次发送请求之前判断是否存在token，如果存在，则统一在http请求的header都加上token，不用每次请求都手动添加了
      config.headers.Authorization = token;
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  });
```
### 消息

```c
消息种类包括好友、回复申请（同意or拒绝）、聊天消息
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200628223628613.gif)
在实现消息发送之前，需要大体的了解一些socket.io的api。

```c
 // 所有的消息请求都是建立在已连接的基础上的
    io.on('connect', onConnect);
    // 发送给当前客户端
    socket.emit('hello', 'can you hear me?', 1, 2, 'abc');
    // 发送给所有客户端，除了发送者
    socket.broadcast.emit('broadcast', 'hello friends!');
    // 发送给同在 'game' 房间的所有客户端，除了发送者
    socket.to('game').emit('nice game', "let's play a game");
    // 发送给同在 'game' 房间的所有客户端，包括发送者
    io.in('game').emit('big-announcement', 'the game will start soon');
```
###### 1、加入房间

```c
// 前端 发起加入房间的请求
    this.conversationsList.forEach(v => {
        let val = {
            name: this.user.name,
            time: utils.formatTime(new Date()),
            avatar: this.user.photo,
            roomid: v.id
        };
        this.$socket.emit('join', val);
    });
    // 后端 接受请求后执行加入操作，记录每个房间加入的成员，以及回信告知指定房间已上线成员
    socket.on('join', (val) => {
        socket.join(val.roomid, () => {
            if (OnlineUser[val.name]) {
                return;
            }
            OnlineUser[val.name] = socket.id;
            io.in(val.roomid).emit('joined', OnlineUser); // 包括发送者
        });
    });
```
###### 2、发消息

```c
 // 前端
    send(params, type = 'mess') { // 发送消息
        if (!this.message && !params) {
            return;
        }
        let val = {
            name: this.user.name,
            mes: this.message,
            time: utils.formatTime(new Date()),
            avatar: this.user.photo,
            nickname: this.user.nickname,
            read: [this.user.name],
            roomid: this.currSation.id,
            style: 'mess',
            userM: this.user.id
        };
        this.chatList.push(Object.assign({},val,{type: 'mine'})); // 更新视图
        this.$socket.emit('mes', val);
        this.message = '';
    }
    // 后端 接收消息后存储到数据库，并转发消息给好友。
    socket.on('mes', (val) => { // 聊天消息
        apiList.saveMessage(val);
        socket.to(val.roomid).emit('mes', val);
    });
```

###### 3、消息记录

所有的消息都会存到mongodb中，当切换房间的时候，会获取历史消息。而处在当前房间时，只会把最新消息追加到dom中，不会从数据库获取。聊天窗口默认只展示最新100条消息，更多消息可在聊天记录中查看。

```c
// 前端 获取指定房间的历史消息
    this.$socket.emit('getHistoryMessages', {roomid: v.id, offset: 1, limit: 100});
    // 后端 关联表、分页、排序
    messages.find({roomid: params.roomid})
        .populate({path: 'userM', select: 'signature photo nickname'}) // 关联用户基本信息
        .sort({'time': -1})
        .skip((params.offset - 1) * params.limit)
        .limit(params.limit)
        .then(r => {
            callback({code: 0, data: r, count: count});
        }).catch(err => {
        callback({code: -1});
    });
```
