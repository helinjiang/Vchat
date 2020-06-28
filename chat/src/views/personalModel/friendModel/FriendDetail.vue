<template>
  <div class="vchat-Detail">
    <v-apheader back="-1" bgcolor="transparent" class="vchat-Detail-header">
      <!-- <v-icon name="erweima" color="#f5f5f5" cursor="pointer" @clickIcon="showFriendQr = true"></v-icon> -->
    </v-apheader>
    <el-carousel
      trigger="click"
      height="200px"
      arrow="never"
      :indicator-position="friendInfo.cover.length > 1 ? '' : 'none'"
      :autoplay="false"
    >
      <el-carousel-item v-for="item in friendInfo.cover" :key="item">
        <a class="DetailImage-a" :style="{backgroundImage: 'url('+ IMG_URL + item +')'}"></a>
      </el-carousel-item>
      <div class="DetailImage-bg">
        <p class="title">{{friendInfo.code}}</p>
        <p>{{friendInfo.signature}}</p>
      </div>
    </el-carousel>
    <div class="vchat-Detail-container friend-detail-container">
      <a class="detail-avatar">
        <img :src="friendInfo.photo.slice(0,1)==='h'? friendInfo.photo:IMG_URL+ friendInfo.photo" alt />
      </a>
      <div class="firend-info">
        <p>Vchat：{{friendInfo.code}}</p>
        <p>性别：{{friendInfo.sex === '1' ? '男' : friendInfo.sex === '2' ? '女' : '保密'}}</p>
        <p>所在地：{{friendInfo.province.name + (friendInfo.city.name === '市辖区' ? '' : ' - ' + friendInfo.city.name) + ' - ' + friendInfo.town.name}}</p>
      </div>
      <div class="detail-item" v-if="friendInfo.code === user.code" @click="toPhoto">
        <span>照片墙</span>
        <p>
          <v-icon name="enter" color="#d5d5d5"></v-icon>
        </p>
      </div>
      <div class="detail-button" v-if="friendInfo.code !== user.code">
        <button @click="apply" class="vchat-full-button minor" v-if="!myFriendFlag">加为好友</button>
        <button @click="remove" class="vchat-full-button error" v-else>删除好友</button>
      </div>
    </div>
    <!-- <div class="Qr-dialog" :class="{active: showFriendQr}">
      <v-icon
        class="el-icon-circle-close-outline QrClose"
        @clickIcon="showFriendQr = false"
        color="#f5f5f5"
        :size="28"
        cursor="pointer"
      ></v-icon>
    </div>-->
  </div>
</template>

<script>
import vApheader from "@/components/header/vApheader";
import api from "@/api";
import utils from "@/utils/utils";
import { mapState } from "vuex";
export default {
  data() {
    return {
      IMG_URL: process.env.IMG_URL,
      friendInfo: { cover: [], province: {}, city: {}, town: {} }, // user详情
      showFriendQr: false, // 二维码开关
      myFriendFlag: false // 是否为我的好友
    };
  },
  components: {
    vApheader
  },
  computed: {
    ...mapState(["user"])
  },
  methods: {
    apply() {
      localStorage.friend = JSON.stringify({
        userYname: this.friendInfo.code,
        userYloginName: this.friendInfo.name,
        userYphoto: this.friendInfo.photo
      });
      this.$router.push({
        name: "applyFriend",
        params: { id: this.$route.params.id },
        query: {}
      });
    },
    remove() {},
    getUserInfo() {
      let params = {
        id: this.$route.params.id
      };
      api.searchFriend(params).then(r => {
        console.log(r)
        if (r.code === 0) {
          this.friendInfo = r.data;
        }
      });
    },
    toPhoto() {
      this.$router.push({ name: "photoWall", params: this.$route.params });
    },
    checkMyfriends() {
      let params = {
        userM: this.$route.params.id,
        userY: this.user._id
      };
      api.checkMyfriends(params).then(r => {
        // console.log(r)
        if (r.code === 0) {
          this.myFriendFlag = r.data;
        }
      });
    }
  },
  created() {
    this.getUserInfo();
    // console.log('detail start')
    this.checkMyfriends();
  }
};
</script>

<style lang="scss" scoped>
.vchat-Detail {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f5f5f5;
  overflow-y: auto;
  .vchat-Detail-header {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 3;
  }
  .DetailImage-bg {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    padding: 50px 15px 0;
    box-sizing: border-box;
    p {
      color: #fff;
      font-size: 12px;
      text-align: left;
      margin-bottom: 5px;
    }
    p.title {
      font-size: 18px;
    }
  }
  .Qr-dialog {
    width: 100%;
    height: 0;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.6);
    position: absolute;
    left: 0;
    top: 0;
    z-index: 5;
    transition: height 0.5s cubic-bezier(0, 0.97, 0, 0.98);
    .QrClose {
      position: absolute;
      right: 30px;
      top: 30px;
    }
  }
  .Qr-dialog.active {
    height: 100%;
  }
  .vchat-Detail-container {
    width: 100%;
    position: relative;
    .detail-item {
      display: flex;
      height: 38px;
      justify-content: space-between;
      align-items: center;
      font-weight: 400;
      padding: 8px 10px 8px 15px;
      box-sizing: border-box;
      background-color: #fff;
      font-size: 14px;
      i {
        margin: 0;
      }
      .many {
        color: #6d6d6d;
        font-size: 12px;
        display: flex;
        align-items: center;
        span {
          margin-right: 2px;
        }
      }
    }
    .detail-item:hover {
      opacity: 0.8;
    }
    .firend-info {
      padding: 20px 10px 8px 15px;
      box-sizing: border-box;
      background-color: #fff;
      font-size: 13px;
      text-align: left;
      margin-bottom: 5px;
    }
    .group-users {
      width: 100%;
      background-color: #fff;
      color: #323232;
      box-sizing: border-box;
      margin-bottom: 5px;
      .group-users-title {
        border-bottom: 1px solid #f5f5f5;
        margin-bottom: 10px;
        > span {
          font-size: 14px;
        }
      }
      .group-users-liitte-list {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        li {
          width: 64px;
          display: flex;
          flex-flow: column;
          justify-content: center;
          align-items: center;
          margin-bottom: 10px;
          span {
            max-width: 64px;
            font-size: 12px;
            color: #6d6d6d;
          }
        }
      }
    }
    .group-card {
      margin-bottom: 5px;
    }
    .group-tag {
      margin-bottom: 5px;
      > span {
        font-size: 14px;
        color: #323232;
      }
      > p {
        display: flex;
        justify-content: flex-start;
      }
    }
    .group-managers {
      justify-content: space-between;
      > div {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        a {
          width: 28px;
          height: 28px;
          margin-right: 5px;
        }
        span {
          font-size: 14px;
          color: #323232;
          margin-right: 15px;
        }
      }
    }
    .detail-button {
      padding: 0 15px;
      box-sizing: border-box;
    }
    //
    .detail-avatar {
      display: block;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: -60px;
      width: 80px;
      height: 80px;
      overflow: hidden;
      border-radius: 50%;
      border: 2px solid #f5f5f5;
      z-index: 5;
      img {
        width: 80px;
      }
    }
  }
}
.vchat-apply {
  width: 100%;
  height: 100%;
  background-color: #f7f7f7;
  text-align: left;
  .introduceForm {
    .el-form-item {
      margin-bottom: 0;
    }
    .el-form-item__label {
      font-size: 12px;
      color: #d5d5d5;
    }
  }
  span {
    font-size: 13px;
    color: #b7b7b7;
    padding-left: 15px;
    cursor: pointer;
  }
  i {
    display: block;
    padding-right: 10px;
    box-sizing: border-box;
    font-style: normal;
    color: #6c6c6c;
    text-align: right;
  }
}
</style>