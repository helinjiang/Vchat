const db = require('../utils/database');
const baseList = require('./baseList');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken') //jwt 生成token
const SECRET = 'jim' //密钥
const axios = require('axios')
const clientSecret = "0e7cf932bcd8bacbe15c63babc49004eba028406"
const clientID = "2363bdafb2f941bb355c"

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
    // callback(isPasswordValid)
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

const signUp = async (params, callback) => {
    baseList.users.find({
        name: params.name
    }).then(r => {
        //r 是一个数组 查询的结果
        if (r.length) {
            callback({
                code: 1
            })
        } else {
            //create account
            let code = Date.now()
            baseList.users.create({
                name: params.name,
                pass: params.pass,
                code: code,
                nickname: 'vChat' + (Date.now() + '').slice(6)
            }).then(r => {
                //["_id"] 插入数据库成功时自动的编号
                if (r["_id"]) {
                    callback({
                        //0注册成功
                        code: 0,
                        data: code
                    })
                } else {
                    callback({
                        code: -1
                    })
                }
            })

        }
    })

}

const profile = async (req, callback) => {
    const raw = String(req.headers.authorization.split(' ').pop())
    let id
    jwt.verify(raw, SECRET, (err, decoded) => {
        if (err) {

            return callback({
                code: -1,
                data: 'token错误'
            })
        } else {
            id = decoded.id
        }

    })
    // console.log(id)
    const users = await baseList.users.findOne({
        name: id
    }, (err, res) => {
        if (err) {
            return callback({
                code: -1
            })
        }
    })
    callback({
        code: 1,
        data: users
    })
}

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
    // console.log(result)
    // return
    await baseList.users.findOne({
        name: result.data.login
    }).then(r => {
        if (!r) {
            //用户没有注册过
            console.log(result.data.login)
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

const huntFriends = async (params, callback) => {
    const userName = params.userName
    const users = await baseList.users
        .find({
            $or: [{
                "name": params.userName
            }, {
                "code": params.userName
            }]
        })
    if (users.length === 1) {
        callback({
            code: 1,
            data: users[0]
        })
    } else {
        callback({
            code: 0
        })
    }
}

const searchFriend = async (params, callback) => {
    // console.log(params)
    baseList.users.find({
        _id: params.id
    }).then(r => {
        if (r.length) {
            let response = {
                name: r[0].name,
                photo: r[0].photo,
                nickname: r[0].nickname,
                signature: r[0].signature,
                code: r[0].code,
                cover: r[0].cover,
                sex: r[0].sex,
                province: r[0].province,
                city: r[0].city,
                town: r[0].town
            };
            callback({
                code: 0,
                data: response
            });
        } else {
            callback({
                code: -1
            });
        }
    })
}

const getVchatInfo = (callback) => { // 获取vchat官方账号信息
    baseList.users.find({
        name: 'Vchat'
    }).then(r => {
        if (r.length) {
            callback({
                code: 0,
                data: {
                    name: r[0].name,
                    photo: r[0].photo,
                    nickname: r[0].nickname,
                    signature: r[0].signature,
                    id: r[0]._id
                }
            });
        } else {
            callback({
                code: -1
            });
        }
    })
};
const addConversitionList = (userName, params, callback) => { // 添加会话
    baseList.users.update({
        name: userName
    }, {
        $push: {
            conversationsList: params
        }
    }).then(raw => {
        // console.log(raw)
        if (raw.nModified > 0) {
            callback({
                code: 0
            });
        } else {
            callback({
                code: -1
            });
        }
    });
};
module.exports = {
    signUp,
    login,
    profile,
    gitLogin,
    huntFriends,
    searchFriend,
    getVchatInfo,
    addConversitionList
}