import Vue from 'vue'
import Router from 'vue-router'
import _import from './_import'
Vue.use(Router)

export default new Router({
    routes:[
        {
            path:'/',
            name:'login',
            component:_import('Login')
        },
        {
            path:'/main',
            name:'main',
            component:_import('Main'),
            redirect: 'main/personalMain',
            children: [
                {
                    path: 'personalMain',
                    name: 'personalMain',
                    component: _import('PersonalMain'),
                    redirect: 'personalMain/friendly',
                    children : [
                        {
                            path: 'friendly',
                            name: 'friendly',
                            component: _import('personalModel/Friendly'),
                            redirect: 'friendly/own',
                            children : [
                                {
                                    path:'own',
                                    name: 'ownFriend',
                                    component: _import('personalModel/friendModel/MyFriend')
                                },
                                {
                                    path:'search',
                                    name:'search',
                                    component:_import('personalModel/friendModel/SearchFriend')
                                },
                                {
                                    path: 'detail/:id',
                                    name: 'friendDetail',
                                    component: _import('personalModel/friendModel/FriendDetail')
                                },
                                {
                                    path: 'apply',
                                    name: 'applyFriend',
                                    component: _import('personalModel/friendModel/ApplyFriend')
                                },
                                {
                                    path: 'send',
                                    name: 'sendFriendValidate',
                                    component: _import('personalModel/SendValidateSuccess')
                                },
                            ]
                        }
                    ]
                }
            ]
        },
        {
            path: '/todo',
            name: 'todo',
            component: _import('Todo')
        },
    ]
})