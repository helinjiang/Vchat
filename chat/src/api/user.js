import fetch from './fetch';

export default {
    login(params) { // 登录
        return fetch.post('v/user/login', params);
    },
    signUp(params) { // 注册
        return fetch.post('v/user/signUp', params);
    },
    getUserInfo(params) { //获取用户信息
        return fetch.get('v/user/profile', params);
    },
    test() {
        return fetch.get('v/hhh')
    },
    huntFriends(params) {
        //查找用户
        return fetch.post('v/user/huntFriends',params)
    },
    searchFriend(params) { //根据id查找好友
        return  fetch.post('v/user/searchFriend',params)
    },
    getVchatInfo() { // 获取vchat官方账号信息
        return fetch.post('v/user/getVchatInfo');
    }
}