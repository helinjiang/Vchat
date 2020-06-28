<template>
  <div class="vchat-apply">
    <v-apheader title="验证信息" back="-1">
      <!--<router-link :to="{name: 'sendGroupValidate'}">发送</router-link>-->
      <span @click="send">发送</span>
    </v-apheader>
    <el-form  class="introduceForm">
      <el-form-item label="个人介绍">
        <el-input
          v-model="introduce"
          placeholder="请输入不超过90个字"
          type="textarea"
          aotusize
          resize="none"
          :maxlength="90"
        ></el-input>
      </el-form-item>
    </el-form>
    <i>{{introduce.length}}/90</i>
  </div>
</template>

<script>
import api from "@/api";
import vApheader from "@/components/header/vApheader";
import { mapState } from "vuex";
import utils from "@/utils/utils";
export default {
  name: "applyFriend",
  data() {
    return {
      introduce: ""
    };
  },
  computed: {
    ...mapState(["user", "Vchat"])
  },
  components: {
    vApheader
  },
  methods: {
    send() {
      let friend = JSON.parse(localStorage.friend);
      let val = {
        name: this.user.name,
        mes: this.introduce,
        time: utils.formatTime(new Date()),
        avatar: this.user.photo,
        nickname: this.user.nickname,
        signature: this.user.signature,
        read: [],
        userM: this.user._id,
        userY: this.$route.params.id,
        userYname: friend.userYname,
        userYphoto: friend.userYphoto,
        userYloginName: friend.userYloginName,
        friendRoom: this.user._id + "-" + this.$route.params.id,
        roomid: this.$route.params.id + "-" + this.Vchat.id.split("-")[1],
        state: "friend",
        type: "validate",
        status: "0"
      };
      // console.log(val.roomid)
      this.$socket.emit("sendValidate", val);
      // console.log('发送')
      // this.$router.push({
      //   name: "sendFriendValidate",
      //   query: { name: "searchFriend" }
      // });
    }
  },
  mounted() {}
};
</script>

<style lang="scss" scoped>
.vchat-apply {
  width: 100%;
  height: 100%;
  background-color: #f7f7f7;
  text-align: left;
  .introduceForm {
      padding: 10px;
    .el-form-item {
      margin-bottom: 0;
    }
    .el-form-item__label {
      font-size: 12px;
      display: block;
      color: #d5d5d5;
      margin: auto;
      float: none;
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