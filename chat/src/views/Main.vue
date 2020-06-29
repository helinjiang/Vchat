<template>
  <div class="vchat-main">
    <v-header />
    <div class="vchat-content">
      <div class="vchat-content-nav">
        <ul>
          <li v-for="v in nav" :key="v.id" :class="{active: $route.path.indexOf(v.link) > -1}">
            <router-link :to="{name: v.link}">
              <i class="iconfont" :class="[v.class]"></i>
              <p>{{v.name}}</p>
            </router-link>
          </li>
        </ul>
      </div>
      <div class="vchat-content-sub">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import utils from "@/utils/utils";
import vHeader from "@/components/header/vHeader";
import { mapState } from "vuex";
export default {
  data() {
    return {
      nav: [
        {
          name: "主页",
          class: "icon-daohangshouye",
          activeClass: "icon-group_fill",
          id: 3,
          link: "personalMain"
        }
      ]
    };
  },
  components: {
    vHeader
  },
  computed: {
    ...mapState(["user", "conversationsList", "Vchat"])
  },
  methods: {
    joinRoom() {
      if (!this.user.name) {
        return;
      }
      this.conversationsList.forEach(v => {
        let val = {
          name: this.user.name,
          time: utils.formatTime(new Date()),
          avatar: this.user.photo,
          roomid: v.id
        };
        console.log(val.roomid);
        // let room = { roomid: v.id, offset: 1, limit: 200 };
        this.$socket.emit("join", val);
        // this.$socket.emit("getHistoryMessages", room);
      });
    }
  },
  sockets: {
    connect: function(val) {
      console.log(this.$socket.id);
      console.log("连接成功");
    },
    customEmit: function(val) {
      console.log("连接失败");
    },
    joined(OnlineUser) {
      console.log("加入了", OnlineUser);
      // this.$store.commit("setOnlineUser", OnlineUser);
    },
    takeValidate(r) {
      console.log(r);
      this.$store.commit("setUnRead", {
        roomid: r.roomid,
        add: true,
        count: 1
      });
      if (r.type === "info") {
        this.$store.dispatch("getUserInfo");
      }
    },
    getHistoryMessages(mesdata) {
      // 获取未读消息数量
      let data = mesdata.filter(v => v.read.indexOf(this.user.name) === -1);
      if (data.length) {
        this.$store.commit("setUnRead", {
          roomid: data[0].roomid,
          count: data.length
        });
      }
    },
    mes(r) {
      //更改未读消息数量
      this.$store.commit("setUnRead", {
        roomid: r.roomid,
        add: true,
        count: 1
      });
    }
  },
  watch: {
    conversationsList: {
      handler() {
        this.joinRoom();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style lang="scss" scoped>
.vchat-main {
  width: 100%;
  height: 100%;
  .vchat-content {
    width: 100%;
    height: calc(100% - 80px);
    min-height: 600px;
    display: flex;
    justify-content: flex-start;
    background-color: #fff;
    .vchat-content-nav {
      width: 120px;
      height: 100%;
      ul {
        width: 100%;
        li {
          padding: 15px 0;
          cursor: pointer;
          a {
            display: block;
            text-decoration: none;
            i {
              font-size: 32px;
              margin-bottom: 5px;
            }
            p {
              font-size: 12px;
            }
          }
        }
      }
    }
    .vchat-content-sub {
      width: calc(100% - 120px);
      height: 100%;
      min-width: 1170px;
    }
  }
}
</style>