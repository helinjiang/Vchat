const express = require('express')
const apiList = require('./controller/apiList');
const app = express()
let path = require('path');
let bodyParser = require('body-parser');
let utils = require('./utils/utils');
let cookieParser = require('cookie-parser'); // cookie
let cors = require('cors')



// let server = require('http').Server(app);
var server = require('http').Server(app);
let io = require('socket.io')(server);




// view engine setup
//设置 views 文件夹为存放视图文件的目录, 即存放模板文件的地方,__dirname 为全局变量,存储当前正在执行的脚本所在的目录
app.set('views', path.join(__dirname, 'views'));

//设置视图模板引擎
app.set('view engine', 'jade');

app.use(bodyParser.json()); //加载解析json的中间件。
app.use(bodyParser.urlencoded({
    extended: false
})); //加载解析urlencoded请求体的中间件
app.use(cookieParser());
let options = { // 解决静态资源跨域问题（或者使用cors模块）
    setHeaders: function (res, path, stat) {
        res.set('Access-Control-Allow-Origin', '*')
    }
};
app.use(express.static(path.join(__dirname, 'public'), options)); // 静态资源中间件 设置public文件夹为存放静态文件的目录。

// app.all('*', function (req, res, next) {
//     // res.header('Access-Control-Allow-Origin',request.environ['HTTP_ORIGIN']) 
//     res.header("Access-Control-Allow-Origin", "http://localhost:8903");
//     res.header('Access-Control-Allow-Methods', "PUT,POST,GET,DELETE,OPTIONS");
//     //header 每个方法再写在一行 不然只有最后的生效
//     res.header("Access-Control-Allow-Headers", "Origin,No-Cache, X-Requested-With, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type , Authorization");
//     res.header("Access-Control-Allow-Credentials", "true");
//     next();
// });
app.use(cors({
    origin: ['http://localhost:8903'], //允许该域名下的请求
    methods: ["GET", "POST"], //　　允许接受的 请求类型
    alloweHeaders: ['Conten-Type', 'Authorization', 'Accept', 'Origin'], //请求头
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    credentials: true, // 发送cookie
}));
const user = require('./routes/user');
const friend = require('./routes/friendly');
const messages = require('./routes/messages');
const todo = require('./routes/todo');

app.use('/v/user', user);
app.use('/v/friend', friend);
app.use('/v/mes', messages);
app.use('/v/todo', todo);

app.get('/', (req, res) => {
    res.sendfile(__dirname + '/index.html');
});
const OnlineUser = {};

const onconnection = (socket) => {
    console.log('启动了Socket.io' + socket.id);
    //加入房间 实现私聊 或者群聊
    socket.on('join', (val) => {
        console.log('join--' + val.roomid)
        socket.join(val.roomid, () => {
            OnlineUser[val.name] = socket.id;
            io.in(val.roomid).emit('joined', OnlineUser); // 包括发送者
        });
    })
    socket.on('mes', (val) => { // 聊天消息
        apiList.saveMessage(val);
        // console.log('OnlineUser', val.roomid);
        socket.to(val.roomid).emit('mes', val);
    });

    socket.on('getHistoryMessages', (pramas) => { // 获取历史消息
        apiList.getHistoryMessages(pramas, 1, (res) => { // 1 正序
            if (res.code === 0) {
                socket.emit('getHistoryMessages', res.data); // 发送给发送者（当前客户端）
            } else {
                console.log('查询历史记录失败');
            }
        });
    });

    socket.on('getSystemMessages', (pramas) => { // 获取历史消息
        apiList.getHistoryMessages(pramas, -1, (res) => { // -1 倒序
            if (res.code === 0) {
                socket.emit('getSystemMessages', res.data); // 发送给发送者（当前客户端）
            } else {
                console.log('查询vchat历史记录失败');
            }
        });
    });

    socket.on('sendValidate', (val) => { // 发送验证消息
        apiList.saveMessage(val);
        socket.to(val.roomid).emit('takeValidate', val);
    });

    // console.log(apiList.addFriend())
    socket.on('agreeValidate', (val) => {
        // console.log(val)
        if (val.state === 'friend') {
            apiList.addFriend(val, r => {
                // console.log(r)
                if (r.code === 0) {
                    let pr = {
                        status: '1',
                        userM: val['userM']
                    };
                    apiList.setMessageStatus(pr);
                    //通知申请人验证已同意
                    let value = {
                        name: '',
                        mes: val.userYname + '同意了你的好友请求！',
                        time: utils.formatTime(new Date()),
                        avatar: val.userYphoto,
                        nickname: val.userYname,
                        read: [],
                        state: 'friend',
                        type: 'info',
                        status: '1', // 同意
                        roomid: val.userM + '-' + val.roomid.split('-')[1]
                    };
                    apiList.saveMessage(value); // 保存通知消息
                    let userMparams = { // 申请人信息
                        name: val.nickname,
                        photo: val.avatar,
                        id: val.friendRoom,
                        type: 'friend'
                    };
                    let userYparams = { // 好友信息
                        name: val.userYname,
                        photo: val.userYphoto,
                        id: val.friendRoom,
                        type: 'friend'
                    };
                    apiList.ServeraddConversitionList(val.name, userYparams, () => {
                        apiList.ServeraddConversitionList(val.userYloginName, userMparams, () => {
                            socket.to(value.roomid).emit('takeValidate', value);
                            socket.emit('ValidateSuccess', 'ok');
                        }); // 添加到自己会话列表
                    }); // 添加到申请人会话列表
                }
            })
        }
    })

}

io.on('connection', onconnection);

server.listen(3001, () => {
    console.log('服务器在3001启动')
});