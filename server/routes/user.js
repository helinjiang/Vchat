let api = require('../controller/apiList');
let express = require('express');
let router = express.Router();
router.post('/login', api.login); // 登录

router.post('/signUp', api.signUp); // 注册

router.get('/profile', api.profile) //个人信息

router.get('/github-login', api.gitLogin) //git登录

router.post('/searchFriend',api.searchFriend)

router.post('/huntFriends', api.huntFriends); // 搜索好友

router.post('/getVchatInfo', api.getVchatInfo)


module.exports = router;
