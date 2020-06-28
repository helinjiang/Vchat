const apiModel = require("../model/apiModel");
const jwt = require('jsonwebtoken') //jwt 生成token
const SECRET = 'jim' //密钥

const getTodoList = (req, res) => {
    const raw = String(req.headers.authorization.split(' ').pop())
    let userName
    jwt.verify(raw, SECRET, (err, decoded) => {
        if (err) {
            // console.log(err)
            return callback({
                code: -1,
                data: 'token错误'
            })
        } else {
            userName = decoded.id
        }

    })
    apiModel.getTodoList({userName:userName}, (r) => { // 查询日程
        res.json(r);
    })
};
const addTodo = (req, res) => {
    const raw = String(req.headers.authorization.split(' ').pop())
    let userName
    jwt.verify(raw, SECRET, (err, decoded) => {
        if (err) {
            // console.log(err)
            return callback({
                code: -1,
                data: 'token错误'
            })
        } else {
            userName = decoded.id
        }

    })
    let params = req.body;
    apiModel.addTodo({userName: userName, ...params}, (r) => { // 添加日程
        res.json(r);
    })
};
const upTodo = (req, res) => {
    let params = req.body;
    apiModel.upTodo(params, (r) => { // 修改日程
        res.json(r);
    })
};
const delTodo = (req, res) => {
    let params = req.body;
    apiModel.delTodo(params, (r) => { // 删除日程
        res.json(r);
    })
};

module.exports = {
    getTodoList,
    addTodo,
    upTodo,
    delTodo
};