<template>
  <div class="vchat-login" v-bgInmage="bg">
    <div class="logo" :class="{active:showSign}">
      <h3 class="title">Hi, This's VChat</h3>
      <span class="begin" @click="toggle">立即体验</span>
    </div>
    <div class="sign" v-if="showSign">
      <div class="title">
        <span :class="{active:islogin}" @click="choose(true)">登录</span>
        <span :class="{active:!islogin}" @click="choose(false)">注册</span>
      </div>
      <!-- rules 表单验证的规则 -->
      <el-form
        ref="signForm"
        label-width="0px"
        class="signForm"
        :rules="signRules"
        :model="signForm"
      >
        <el-form-item prop="name">
          <el-input v-model="signForm.name" placeholder="账号">
            <i class="iconfont icon-zhanghao" slot="prepend"></i>
          </el-input>
        </el-form-item>

        <el-form-item prop="pass">
          <el-input
            v-model="signForm.pass"
            placeholder="密码"
            type="password"
            @keyup.enter.native="enter(islogin)"
          >
            <i class="iconfont icon-mima3" slot="prepend"></i>
          </el-input>
        </el-form-item>

        <el-form-item prop="repass" v-if="!islogin">
          <el-input
            v-model="signForm.repass"
            placeholder="确认密码"
            type="password"
            @keyup.enter.native="enter(islogin)"
          >
            <i class="iconfont icon-mima2" slot="prepend"></i>
          </el-input>
        </el-form-item>

        <el-form-item prop="regcode" class="regcode-box">
          <el-input
            v-model="signForm.regcode"
            placeholder="验证码"
            @keyup.enter.native="enter(islogin)"
          >
            <i class="iconfont icon-mima3" slot="prepend"></i>
          </el-input>
          <canvas ref="regcode" width="90" height="38"></canvas>
        </el-form-item>
      </el-form>
      <el-button
        :loading="isloading"
        round
        @click="enter(islogin)"
        plain
        type="success"
      >{{islogin ? '点击登录' : '点击注册'}}</el-button>
      <div class="login-foot" v-if="islogin">
        <span></span>
        <a href="https://github.com/login/oauth/authorize?client_id=2363bdafb2f941bb355c">Github登录</a>
        <span></span>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../api";
import bg from "../assets/img/bgt.jpg";
import Canvas from "vchat-regcode";
import utils from "../utils/utils";

export default {
  name: "login",
  data() {
    let validateName = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入账号"));
      } else {
        let reg = /^[a-zA-Z0-9_-]{2,20}$/;
        if (!reg.test(value)) {
          callback(new Error("请输入2~20位数字字母下划线"));
          return;
        }
        callback();
      }
    };
    let validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        let reg = /^[a-zA-Z0-9]{6,12}$/;
        if (!reg.test(value)) {
          callback(new Error("请输入6~12位数字字母组合"));
          return;
        }
        callback();
      }
    };
    let validateRePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入确认密码"));
      } else {
        if (value !== this.signForm.pass) {
          callback(new Error("两次密码输入不一致"));
          return;
        }
        callback();
      }
    };
    let validateRegcode = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入验证码"));
      } else {
        if (value.toLowerCase() !== this.regcode.toLowerCase()) {
          this.regCodeClass.drawAgain();
          callback(new Error("验证码错误"));
          return;
        }
        callback();
      }
    };
    return {
      signForm: {
        name: "",
        pass: "",
        regcode: "",
        repass: ""
      },
      isloading: false,
      islogin: true,
      bg: bg,
      showSign: false, //登录框提示
      signRules: {
        name: [{ validator: validateName, trigger: "blur" }],
        pass: [{ validator: validatePass, trigger: "blur" }],
        repass: [{ validator: validateRePass, trigger: "blur" }],
        regcode: [{ validator: validateRegcode, trigger: "blur" }]
      }
    };
  },
  watch: {
    showSign() {
      if (this.showSign) {
        this.initRegcode();
      }
    }
  },
  methods: {
    initRegcode() {
      this.$nextTick(() => {
        this.regCodeClass = new Canvas(this.$refs["regcode"], {
          fontSize: 20,
          lineNum: 2,
          dotNum: 10
        });
        this.regCodeClass.draw(r => {
          this.regcode = r;
        });
      });
    },
    //跳出login窗口
    toggle() {
      this.showSign = true;
    },
    choose(flag) {
      this.$refs["signForm"].resetFields(); //改变窗口清空内容
      this.islogin = flag;
    },
    enter(islogin) {
      this.$refs["signForm"].validate(valid => {
        if (valid) {
          if (islogin) {
            this.login();
          } else {
            this.signUp();
          }
        } else {
          return false;
        }
      });
    },
    login() {
      let params = {
        name: this.signForm.name,
        pass: this.signForm.pass
      };
      this.isloading = true;
      api.login(params).then(r => {
        console.log(r);
        if (r.code === 0) {
          //登录成功
          this.isloading = false;
          this.$message.success("登录成功");
          localStorage.setItem("token", r.token);
          this.$store.dispatch("getUserInfo", this);
          this.$router.replace("/Main");
          console.log(localStorage);
        } else {
          this.isloading = false;

          this.$message.error("账号不存在或密码错误");
        }
      });
      // api.login({
      //   name:'user4411',
      //   pass:'123456'
      // })
    },
    signUp() {
      let params = {
        name: this.signForm.name,
        pass: this.signForm.pass
      };
      this.loading = true;
      api.signUp(params).then(r => {
        console.log(r);
        if (r.code === 0) {
          this.$refs["signForm"].resetFields();
          this.$notify({
            title: "注册成功",
            message: `您的Vchat号为：${r.data}，您可以凭此登录，祝您生活愉快！`,
            duration: 5000,
            type: "success"
          });
          this.islogin = true;
        } else {
          this.$message.error("账号已存在");
        }
        this.isloading = false;
      });
    }
  },
  created() {
    // if (document.cookie.indexOf("token=")) {
    //   //判断cookie是否存在
    //   localStorage.setItem("token", utils.getCookie("token"));
    //   localStorage.setItem("userAvatar", utils.getCookie("userAvatar"));
    //   localStorage.setItem("userName", utils.getCookie("username"));
    //   this.$store.dispatch("getUserInfo", this);
    //   this.$router.replace("/Main");

      // api.getUserInfo().then(r=>{
      //   if(r.code===1) {
      //     console.log(r)
      //   } else {
      //     console.log(r)
      //   }
      // })
    }
  // }
};
</script>

<style lang="scss" scoped>
.vchat-login {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.logo {
  margin-top: 15%;
  transform: translateY(0%);
  transition: transform 0.5s;
  h3.title {
    font-size: 40px;
    color: aliceblue;
    font-weight: 500;
    margin-bottom: 20px;
  }
  span.begin {
    color: #fff;
    font-size: 25px;
    animation: fide 2s infinite;
    cursor: pointer;
  }
}

.sign .title {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}
.sign .title span {
  width: 100px;
  border-right: 1px solid #d5d5d5;
  cursor: pointer;
}
.sign .title span:nth-of-type(2) {
  border-right: none;
}
.sign .title span.active {
  color: #1fbeca;
}
@keyframes fide {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
}
.logo.active {
  transform: translateY(-100%);
}
.login-foot {
  width: 100%;
  font-size: 12px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #d5d5d5;
}
.login-foot span {
  width: 100px;
  height: 1px;
  background-color: #d5d5d5;
  display: inline-block;
  margin: 0 10px;
}

.sign {
  width: 350px;
  // height: 370px;
  padding: 15px 25px 25px;
  background-color: #fff;
  border-radius: 10px;
  box-sizing: border-box;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -175px;
  margin-top: -175px;
  animation: move 1.2s;
}
.signForm {
  margin: auto;
}
.common-item {
  display: flex;
  justify-content: center;
  width: 200px !important;
  border-radius: 10px;
  padding-bottom: 20px;
}
.regcode-box {
  .el-input {
    width: 205px;
  }
  canvas {
    display: inline-block;
    vertical-align: middle;
  }
}
@keyframes move {
  0% {
    left: 0;
  }
  40% {
    left: 80%;
  }

  90% {
    -webkit-transform: translate(-5px, -5px);
  }
  80% {
    -webkit-transform: translate(5px, 5px);
  }
  100% {
    -webkit-transform: translate(0, 0);
  }
}
</style>