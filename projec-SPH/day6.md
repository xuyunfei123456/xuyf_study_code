1)交易页面完成（商品清单）
动态展示服务器的数据完成

2）提交订单
2.1 先把支付静态组件先搞定
2.2 点击提交订单的按钮的时候，还需要向服务器发起一次请求【把支付一些信息传递给服务器】

3）获取支付信息
3.1 不允许给生命周期函数当中加 async
3.2 获取支付信息

4）elementUI 使用+按需引入
已经学习过的组件库：
React:antd[PC] antd-mobile[移动端]
Vue: elementUI[pc] vant[移动端]

4.1elementUI 按需引入，配置文件发生变化需重启

5)二维码生成
npm i qrcode

6)个人中心完成
面试的时候问是否封装过组件：分页器，日历

7）全局守卫

未登录访问,交易相关（trade）,支付相关（pay、paysuccess）、用户中心（center）相关跳转到 登录页面

8）路由独享守卫
只有从购物车才能跳转到交易页面（创建订单）
只有从交易页面（创建订单）页面才能跳转到支付页面
只有从支付页面才能跳转到支付成功页面

9)图片懒加载
https://www.npmjs.com/package/vue-lazyload

10)vee-validate 基本使用
npm i vee-validate@2 --save 安装的插件 2 版本的

//vee-validate 插件：表单验证区域’
import Vue from "vue";
import VeeValidate from "vee-validate";
//中文提示信息
import zh_CN from "vee-validate/dist/locale/zh_CN";
Vue.use(VeeValidate);

//表单验证
VeeValidate.Validator.localize("zh_CN", {
messages: {
...zh_CN.messages,
is: (field) => `${field}必须与密码相同`, // 修改内置规则的 message，让确认密码和密码相同
},
attributes: {
phone: "手机号",
code: "验证码",
password: "密码",
password1: "确认密码",
agree: '协议'
},
});

//自定义校验规则
VeeValidate.Validator.extend("tongyi", {
validate: (value) => {
return value;
},
getMessage: (field) => field + "必须同意",
});

        <input
          placeholder="请输入你的手机号"
          v-model="phone"
          name="phone"
          v-validate="{ required: true, regex: /^1\d{10}$/ }"
          :class="{ invalid: errors.has('phone') }"
        />
        <span class="error-msg">{{ errors.first("phone") }}</span>

const success = await this.$validator.validateAll(); 全部表单验证成功

10）打包上线
6.1 打包 npm run build
项目打包后，到吗都是经过压缩加密的，如果运行时报错，输出的错误信息无法得知是哪里代码报错。
有了 map 就可以像未加密的代码一样，准确的输出是哪一行哪一列出错。
所以该文件如果项目不需要是可以去除掉的
vue.config.js 配置
productionSourceMap:false

6.2 购买云服务器
1：阿里云 腾讯云
2：设置安全组，让服务器一些端口号打开
3：利用 xshell 工具登录服务器

6.3 nginx?
1:为什么访问服务器 IP 地址就可以访问到咱们项目？ -----配置一些东西
2：项目的数据来自于http://39.98.123.211

nginx 配置：
1，xshell 进入根目录下的 etc
2，进入 etc 目录，这个目录下有一个 nginx 目录，进入这个目录【已经安装过 nginx,如果没有安装过，四五个文件】
3，如果想安装 nginx:yum install nginx
4，安装完 nginx 服务器以后，你会发现在 nginx 目录下，多了一个 nginx.conf 文件，在这个文件进行配置。
5，vim nginx.conf 进行编辑
