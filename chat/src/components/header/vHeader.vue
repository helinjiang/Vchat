<template>
  <div class="vchat-header">
    <div class="vchat-main-header" v-if="isMainHeader">
      <div class="vchat-main-header">
        <div class="vchat-log">Vchat</div>
        <div class="vchat-mine">
          <nav class="vchat-noUser">
            <div>
              <el-badge
                :value="unReadCount"
                :max="99"
                :hidden="unReadCount === 0"
                class="headerBadg"
              >
                <span class="nav-btn">消息</span>
              </el-badge>
              <ul class="handleList">
                <li @click="showChat = !showChat">
                  <span>会话列表</span>
                </li>
                <!-- <li @click="reset"> -->
                <!-- <span>会话窗口复位</span> -->
                <!-- </li> -->
              </ul>
            </div>
          </nav>
          <div>
            <!-- 头像 -->
            <a href="javascript:;">
              <img :src="avatar" alt />
            </a>
            <ul class="handleList">
              <li v-for="(v, i) in handleList" :key="i">
                <router-link :to="v.link">
                  <i class="iconfont" :class="[v.icon ? v.icon : '']"></i>
                  {{v.name}}
                </router-link>
              </li>
            </ul>
          </div>
          <div>
            <!-- 退出 +签名 -->
            <p>
              <span class="vchat-line1">{{name}}</span>
              <span class="logout">[退出]</span>
            </p>
            <p
              class="vchat-line2"
              :title="user.signature"
            >{{user.signature ? '个性签名：' + user.signature : '这个人很懒，暂时没有签名哦！'}}</p>
          </div>
        </div>
      </div>
      <transition name="chat">
        <vue-draggable-resizable
          v-if="showChat"
          :w="w"
          :h="h"
          @resizestop="onResizestop "
          @dragstop="onDragstop"
          :minh="460"
          :minw="736"
          :handles="['tl', 'tr', 'bl', 'br']"
          :draggable="draggable"
          :resizable="true"
          :x="x"
          :y="y"
          :z="2001"
          :drag-handle="'.chat-header, .chat-conversation-ul'"
          :drag-cancel="'a, .chat-conversation-li, .chat-handel, .vchat-scroll'"
        >
          <chat @closeChat="showChat = false"></chat>
        </vue-draggable-resizable>
      </transition>
    </div>
    <div class="vchat-little-header" v-else>
      <div>
        <router-link to="/main/personalMain">vchat</router-link>
        <span class="logout" @click="$router.push({name: 'personalMain'})">[返回]</span>
      </div>
      <div class="avatar">
        <a href="javascipt:;">
          <img :src="avatar" alt />
        </a>
        <span @click="loginOut" class="logout">[退出]</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import VueDraggableResizable from "vue-draggable-resizable";
import chat from "@/components/chat/vChat.vue";

export default {
  props: {
    isMainHeader: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      draggable: true,
      avatar: process.env.IMG_URL + "/img/picture.png",
      name: null,
      showChat: false,
      x: Number(window.localStorage.x) || 100,
      y: Number(window.localStorage.y) || 100,
      w: Number(window.localStorage.w) || 736,
      h: Number(window.localStorage.h) || 460,
      handleList: [
        // {
        //   name: "个人空间",
        //   icon: "icon-zhanghaoguanli1",
        //   link: "/mine"
        // },
        {
          name: "日程管理",
          icon: "icon-huihuajilu",
          link: "/Todo"
        },
        // {
        //   name: "设置",
        //   icon: "icon-shezhi1",
        //   link: "/mySetting"
        // }
      ]
    };
  },
  methods: {
    loginOut() {
      this.leaveRoom();
      api.loginOut().then(r => {
        if (r.code === 0) {
          this.$message.success("退出成功");
          this.$store.commit("setUser", "out");
          this.$router.replace("/");
        }
      });
    },
    leaveRoom() {
      this.conversationsList.forEach(v => {
        let val = {
          name: this.user.name,
          time: utils.formatTime(new Date()),
          avatar: this.user.photo,
          roomid: v.id
        };
        this.$socket.emit("leave", val);
      });
    },
    onResizestop(x, y, w, h) {
      window.localStorage.w = w;
      window.localStorage.h = h;
    },
    onDragstop(x, y) {
      window.localStorage.x = x;
      window.localStorage.y = y;
    },
    reset() {
      this.x = 100;
      this.y = 100;
      this.w = 736;
      this.h = 460;
      window.localStorage.w = 736;
      window.localStorage.h = 460;
      window.localStorage.x = 100;
      window.localStorage.y = 100;
    }
  },
  computed: {
    ...mapState(["user", "conversationsList"]),
    ...mapGetters(["unReadCount"])
  },
  components: {
    chat,
    VueDraggableResizable
  },
  mounted() {
    // if (localStorage.getItem('userAvatar')) {
    //   //gitLogin 登录
    //   this.avatar = localStorage.userAvatar;
    this.name = this.$store.state.user.name || localStorage.userName;
    // } else {
    //   this.avatar = process.env.IMG_URL + this.$store.state.user.photo;
    //   this.name = this.$store.state.user.name;
    //   // console.log(this.$store.state.user.photo)
    // }
    console.log(this.$store.state.user);
    if (this.user.isGitLogin) {
      this.avatar = this.user.gitPhoto || localStorage.userAvatar;
    } else {
      this.avatar =
        process.env.IMG_URL + this.user.photo || localStorage.userAvatar;
    }
  },
  watch: {
    showChat() {
      this.x = Number(window.localStorage.x) || 100;
      this.y = Number(window.localStorage.y) || 100;
      this.w = Number(window.localStorage.w) || 736;
      this.h = Number(window.localStorage.h) || 460;
    }
  }
};
</script>

<style lang="scss" scoped>
.vchat-header {
  .vchat-main-header {
    width: 100%;
    height: 80px;
    background-color: 28828f;
    display: flex;
    justify-content: space-between;
    .vchat-log {
      width: 120px;
      height: 80px;
      color: #fff;
      font-size: 28px;
      line-height: 80px;
    }
    .vchat-mine {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding-right: 45px;
      > div:nth-of-type(1) {
        width: 80px;
        height: 70px;
        padding: 5px 10px;
        box-sizing: border-box;
        margin-right: 20px;
        border-radius: 2px;
        position: relative;
      }
      > div:nth-of-type(1) > a {
        display: block;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 50%;
        border: 1px solid #d5d5d5;
        cursor: default;
        img {
          width: 100%;
        }
      }
      > div:nth-of-type(1):hover {
        background-color: #f5f5f5;
      }
      .handleList {
        width: 128px;
        background-color: #fff;
        position: absolute;
        left: 0;
        top: 85px;
        display: none;
        z-index: 100;
        border-radius: 2px;
        /*box-shadow: 0 0 8px #d5d5d5;*/
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
          0 0 6px 0 rgba(0, 0, 0, 0.04);
        padding: 10px 0;
        box-sizing: border-box;
      }
      .handleList:before {
        //   箭头三角
        display: block;
        content: "";
        width: 0;
        height: 0;
        border-bottom: 15px solid #f2f2f2;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: none;
        position: absolute;
        left: 20px;
        top: -15px;
        z-index: 2;
      }
      .handleList:after {
        //方框
        display: block;
        content: "";
        width: 100%;
        height: 15px;
        position: absolute;
        left: 0;
        top: -15px;
        z-index: 1;
      }
      .handleList li {
        width: 100%;
        line-height: 32px;
        font-size: 13px;
        text-align: left;
        padding: 0 20px;
        box-sizing: border-box;
        cursor: pointer;
        i {
          font-size: 16px;
          margin-right: 10px;
        }
      }
      .handleList li a {
        display: block;
      }
      > div:nth-of-type(1):hover .handleList {
        display: block;
      }
      > div:nth-of-type(2) {
        height: 50px;
        font-size: 16px;
        color: #fff;
        text-align: left;
        p:nth-of-type(1) {
          margin-bottom: 5px;
          padding-right: 10px;
          display: flex;
          align-items: center;
          span:nth-of-type(1) {
            max-width: 200px;
            display: inline-block;
          }
          span:nth-of-type(2) {
            margin-left: 10px;
            cursor: pointer;
            line-height: 1;
          }
        }
        p:nth-of-type(2) {
          font-size: 12px;
          max-width: 200px;
        }
      }
      nav {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-right: 10px;
        height: 70px;
        line-height: 70px;
        box-sizing: border-box;
        > div {
          color: #fff;
          font-size: 16px;
          width: 80px;
          height: 100%;
          border-radius: 2px;
          position: relative;
        }
        > div:nth-of-type(1):hover .handleList {
          display: block;
        }
        .handleList {
          width: 120px;
          li {
            line-height: 32px;
            border-bottom: 1px solid #f5f5f5;
            font-size: 13px;
          }
          li:hover {
            color: #52d5d2;
          }
        }
        > div:hover {
          //字体change
          background-color: #f5f5f5;
          color: #323232;
        }
        > div:hover .nav-btn {
          color: #52d5d2;
        }
      }
    }
  }
 .vchat-little-header{
            width:100%;
            height: 40px;
            padding: 0 30px;
            text-align: left;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            align-items: center;
            >div{
                a{
                    font-size: 20px;
                    line-height: 40px;
                    color: #fff;
                }
                span{
                    margin-left: 10px;
                    color: #fff;
                    font-size: 12px;
                }
            }
            .avatar{
                display: flex;
                justify-content: flex-start;
                align-items: center;
                a{
                    display: block;
                    width:32px;
                    height: 32px;
                    margin-right: 10px;
                    border-radius: 50%;
                    overflow: hidden;
                    img{
                        width:100%;
                    }
                }
            }
            span{
                cursor: pointer;
            }
        }
}
</style>