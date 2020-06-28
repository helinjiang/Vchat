import api from '../api'

export default {
  getUserInfo({
    commit,
    state,
    dispatch
  }, that) {
    api.getUserInfo().then(r => {
      // console.log(r)
      if (r.code === 1) {
        //录入用户信息
        //每次用户数据刷新都是调用此
        commit('setUser', r.data)
        commit('setConversationsList', r.data.conversationsList);
        dispatch('getVchatInfo');
      }
    })
  },
  setTransitionName({
    state
  }) { // 设置页面过渡动画类型
    state.transitionName = 'moveOut';
    setTimeout(_ => {
      state.transitionName = '';
    }, 500)
  },
  getVchatInfo({
    commit,
    state
  }) { // 获取官方账号信息
    api.getVchatInfo().then(r => {
      if (r.code === 0) {
        // console.log(r)
        let id = state.user._id + '-' + r.data.id;
        // console.log('ok')
        // console.log(state.user._id)
        state.Vchat = Object.assign({}, r.data, {
          type: 'vchat'
        }, {
          id
        });
        commit('setConversationsList', state.Vchat);
      }
    })
  }
}
