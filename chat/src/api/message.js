import fetch from './fetch';

export default {
    removeMessage(params) { //删除消息
        return fetch.post('v/mes/removeMessage', params);
    },
    loadMoreMessages(params) { //加载更多消息
        return fetch.post('v/mes/loadMoreMessages', params);
    }
}