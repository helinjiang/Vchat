const apiModel = require("../model/apiModel");


const login = async (req, res) => {
    let params = req.body
    apiModel.login(params, (r) => {
        res.cookie('username', r.data.name)
        res.json(r)
    })
    // res.json({'name':'name'})
}
const signUp = (req, res) => {
    let params = req.body;
    apiModel.signUp(params, (r) => { // 注册
        if (r.code === 1) {
            res.json({
                code: 1,
                data: '账号已存在'
            })
        } else if (r.code === 0) {
            res.json({
                code: 0,
                data: r.data
            })
        } else {
            res.json({
                code: -1,
                data: '注册失败'
            })
        }
    })
};

const profile = async (req, res) => {
    apiModel.profile(req, r => {
        res.json(r)
    })
}

const gitLogin = async (req, res) => {
    apiModel.gitLogin(req, r => {
        res.cookie('token', r.data.token)
        res.cookie('userAvatar', r.data.avatar_url)
        res.cookie('username', r.data.name)
        res.redirect(301, 'http://localhost:8903')
    })
}

const huntFriends = async (req, res) => {
    let params = req.body
    apiModel.huntFriends(params, r => {
        res.json(r)
    })
}
const searchFriend = async (req, res) => {
    let params = req.body
    apiModel.searchFriend(params, r => {
        res.json(r)
    })
}
const getVchatInfo = (req, res) => {
    apiModel.getVchatInfo((r) => { // 获取vchat官方账号信息
        if (r.code === 0) {
            res.json({
                code: 0,
                data: r.data
            })
        } else {
            res.json({
                code: -1,
                data: ''
            })
        }
    })
};

const ServeraddConversitionList = (userName, params, callback = function () {}) => {
    apiModel.addConversitionList(userName, params, callback);
};
module.exports = {
    login,
    signUp,
    profile,
    gitLogin,
    huntFriends,
    searchFriend,
    getVchatInfo,
    ServeraddConversitionList
}