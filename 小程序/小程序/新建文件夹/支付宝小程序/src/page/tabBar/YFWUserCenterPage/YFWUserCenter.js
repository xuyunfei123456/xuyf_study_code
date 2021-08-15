import { Block, ScrollView, Image, View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/homepage/homepage.js
import { pushNavigation } from '../../../apis/YFWRouting.js'
import { UserCenterApi, OrderPaymentApi,PublicApi } from '../../../apis/index.js'
const userCenterApi = new UserCenterApi()
const orderPaymentApi = new OrderPaymentApi()
const publicApi = new PublicApi()
import { getUserInfo } from './Model/YFWUserInfoModel'
import { config } from '../../../config.js'
import { upadataTabBarCount, isLogin, isEmpty,getAppSystemConfig } from '../../../utils/YFWPublicFunction.js'
import YfwMessageRedPointView from '../../../components/YFWMessageRedPointView/YFWMessageRedPointView'
import TitleView from '../../../components/YFWTitleView/YFWTitleView'
import AuthenTication from '../../../components/YFMauthentication/YFMauthentication'
import { set as setGlobalData, get as getGlobalData } from '../../../global_data'
import './YFWUserCenter.scss'
let ph = 1

export default class YFWUserCenter extends Taro.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasMove:false,
      userHeaderInfo: {},
      trafficnoArray: [],
      recentCount: 0,
      currentIndex: 0,
      nickName:"", //授权之后的名称
      avatar:"",//授权之后的头像
      loginStatus:false,
      sign_url:"",
      issigntody:"",
      inviteFlag:false,
      ads_itemImage:"",
      turnyyrFlag:false,
    }
  }

  componentWillMount() {
    getAppSystemConfig().then((info) => {
      setGlobalData("appSystemConfig", info);
      if (info && info.ads_item && info.ads_item.image) {
        this.setState({
          ads_itemImage: info.ads_item.image
        })
      }
    }, (error) => {})
  }

  componentDidShow() {
    //判断是否登录
    if (!isLogin()) {
      return;
    }else{
      this.setState({loginStatus:true})
      if(this.state.turnyyrFlag){
        this.state.turnyyrFlag = false;
        pushNavigation('get_medicine_person')
      }
      if(this.state.policyFlag){
        this.state.policyFlag = false;
        this.toMyPolicy()
      }
      upadataTabBarCount()
    }
    this.handleRecentData()
    this.getData()
    let certificationFlag = getGlobalData('certificationFlag'),
    certification = getGlobalData('certification');
    if(certificationFlag){
      setGlobalData('certificationFlag',false)
      if(certification == '_unCertification'){
        userCenterApi.getUserAccountInfo().then(res=>{
          if(!res || res.dict_bool_certification != 1){
            this.authenTication.setState({
              isShow:true,
            })
          }else{
            setGlobalData('certification',res.dict_bool_certification)
          }
        })
      }else{
        this.authenTication.setState({
          isShow:certification == 1 ? false:true,
        })
      }
    }
    
    let that = this
    setTimeout(() => {
      if (this.state.currentIndex == this.state.trafficnoArray.length - 1) {
        this.state.currentIndex = 0
      } else {
        this.state.currentIndex++
      }
      this.setState({
        currentIndex: this.state.currentIndex
      })
    }, 4000) //循环时间
  }

  onPullDownRefresh = () => {
    if (!isLogin()) {
      return;
    }else{
      this.getData()
    }
    //this.handleRecentData()
  }

  onShareAppMessage = () => {
    return {
      title: config.share_title,
      imageUrl: config.share_image_url
    }
  }

  nextPage = () => {
    // console.log('滚动到底部')
  }
  onScrollListenner = event => {
    if (!this.state.hasMove) {
      this.state.hasMove = true;
      this.setState({
        hasMove: true,
      });
    }
    let _this = this;

    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer);
      this.scrollEndTimer = null;
    }

    this.scrollEndTimer = setTimeout(function () {
      _this.state.hasMove = true;
      _this.setState({
        hasMove: false,
      });
    }, 300);
  }

  toMessageHome = () => {
    pushNavigation('get_message_home')
  }

  toSetting = () => {
    if (isLogin()) {
      pushNavigation('get_set')
    } else {
      pushNavigation('get_author_login')
    }
  }

  toUserInfoManager = () => {
    if (isLogin()) {
      pushNavigation('get_account_management')
    } else {
      pushNavigation('get_author_login')
    }
  }

  toHistory = () => {
    // let test = Taro.getEnv()
    // if(test == 'ALIPAY'){
    //   test = 'hualihushao'
    // }
    // console.log(test+ph)
    // ph++
    if(isLogin()){
      pushNavigation('get_rechent_browse')
    }else{
      pushNavigation('get_author_login')
    }
  
  }

  toFaverate = () => {
    if (isLogin()) {
      pushNavigation('get_my_collection')
    } else {
      pushNavigation('get_author_login')
    }
  }

  toPoint = () => {
    if (isLogin()) {
      pushNavigation('get_my_points')
    } else {
      pushNavigation('get_author_login')
    }
  }

  toConpon = () => {
    if (isLogin()) {
      pushNavigation('get_my_coupon')
    } else {
      pushNavigation('get_author_login')
    }
  }
  gotoInvite() {
    if (isLogin()) {
      pushNavigation("yyyj");
    } else {
      this.state.inviteFlag = true;
      pushNavigation("get_author_login");
    }
  }
  toAddress = () => {
    if (isLogin()) {
      pushNavigation('get_address_list')
    } else {
      pushNavigation('get_author_login')
    }
  }

  toRating = () => {
    if (isLogin()) {
      pushNavigation('get_my_evaluation')
    } else {
      pushNavigation('get_author_login')
    }
  }

  toComplaint = () => {
    if (isLogin()) {
      pushNavigation('get_my_complaint')
    } else {
      pushNavigation('get_author_login')
    }
  }

  toDrugRemind = () => {
    pushNavigation('get_medication_reminder_list')
  }

  toLogistics = e => {
    let item = e.currentTarget.dataset.item
    pushNavigation('get_logistics_detail', {
      order_no: item.orderno,
      medecine_image: item.imageurl
    })
  }

  toWinCash = e => {
    let item = e.currentTarget.dataset.item
    pushNavigation(item.type, item)
  }

  toStoreSettledIn = e => {
    let item = e.currentTarget.dataset.item
    item = {
      backgroundcolor: null,
      end: null,
      img_height: '243',
      img_url:
        'http://c1.yaofangwang.net/4/3516/320ef381a51ebbdd58f9fc6e8dc729aa.png',
      img_width: '1125',
      is_login: '0',
      is_sellout: '0',
      name: '商家入驻',
      price: '0.00',
      share: 'https://m.yaofangwang.com/JoinIn.html',
      start: null,
      type: 'get_h5',
      value: 'https://m.yaofangwang.com/JoinIn.html'
    }
    pushNavigation(item.type, item)
  }

  orderList = e => {
    if (isLogin()) {
      let index = e.currentTarget.dataset.index
      pushNavigation('get_order_list', { index: index })
    } else {
      pushNavigation('get_author_login')
    }
  }
  toMyPolicy() {
    if(!isLogin()){
      this.state.policyFlag = true;
      pushNavigation('get_author_login')
      return
    }
    userCenterApi.getMyPolicy().then(res=>{
      if(res){
        pushNavigation('get_h5',{value:res})
      }else{
        Taro.showToast({
          title:'未获取到保单,请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    },()=>{
      Taro.showToast({
        title:'未获取到保单,请稍后重试',
        icon: 'none',
        duration: 2000
      })
    })
  }
  /**
   * 点击签到
   */
  toSign() {
    publicApi.getSignUrl().then((result) => {
      let info = {
        value:result.sign_url,
        share:result.sign_share,
        type:'get_h5',
        name:'签到'
      }
      pushNavigation(info.type, info)
    }, (error) => {})
  }
  /**浏览历史数据 */
  handleRecentData = () => {
    let totalCount = 0
    try {
      let value = Taro.getStorageSync('recentBrowse')
      if (value) {
        Object.entries(value).forEach(([key, value], index) => {
          console.log(`${key}: ${value}`)
          let length = Object.keys(value).length
          totalCount += length
        })
        this.setState({
          recentCount: totalCount
        })
      }
    } catch (e) { }
  }
  /**
   * 跳转用药人
   */
  toMedicinePerson() {
    if(isLogin()){
      pushNavigation('get_medicine_person')
    }else{
      this.state.turnyyrFlag = true;
      pushNavigation('get_author_login')
    }
   
  }
  /**获取用户信息与最新物流 */
  getData = () => {
    userCenterApi
      .getAccountHeaderInfo()
      .then(response => {
        let data = getUserInfo(response);
        data.account_real_name = data.account_real_name || this.state.nickName;
        data.account_img_url = data.account_img_url || this.state.avatar;
        let issigntody=response.issigntody
        this.setState({
          userHeaderInfo: data,
          issigntody,
        })
        Taro.stopPullDownRefresh()
      })
      .then(error => {
        if (error) {
          Taro.stopPullDownRefresh()
        }
      })
    userCenterApi
      .getTrafficnoInfo()
      .then(response => {
        let data = response
        this.setState({ trafficnoArray: data })
        Taro.stopPullDownRefresh()
      })
      .then(error => {
        if (error) {
          Taro.stopPullDownRefresh()
        }
      })
  }

  getCount = (num) => {
    if (num > 99) {
      return '99+'
    } else {
      return num
    }
  }

  config = {
    navigationBarTitleText: '个人中心',
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true,
  }

  render() {
    const {
      userHeaderInfo,
      recentCount,
      trafficnoArray,
      currentIndex,
      issigntody,
      loginStatus,
      ads_itemImage,
    } = this.state
    const minwidth = issigntody ? 'min-width:1.5rem':'min-width:1.9rem'
    return (
      <ScrollView
        className="root_scroll"
        scrollX="false"
        scrollY="true"
        onScrollToLower={this.nextPage}
        onScroll={this.onScrollListenner}
      >
        <Image
          src={require('../../../images/personal_center_bg.png')}
          className="top_image_bg"
        ></Image>
        <View className="setting_mssage_parent">
          <View className="message">
            <YfwMessageRedPointView
              darkstyle="true"
              messagecount={userHeaderInfo.to_view_message_count}
            ></YfwMessageRedPointView>
          </View>
          <View className="setting_parent" onClick={this.toSetting}>
            <Image
              src={require('../../../images/icon_setup.png')}
              className="setting_image_icon"
            ></Image>
            <Text className={process.env.TARO_ENV == 'alipay' ? 'setting_text_alipay' : "setting_text"}>设置</Text>
          </View>
        </View>
        <View className="user_info">
          <Image
          onClick={this.toUserInfoManager}
            src={
              isEmpty(userHeaderInfo.account_img_url)
                ? (require('../../../images/user_icon_default.png'))
                : userHeaderInfo.account_img_url
            }
            className="user_icon"
          ></Image>
          {!loginStatus && (
            <View className="loginWrapper" onClick={this.toUserInfoManager}>点击登录</View>
          )}
          {loginStatus && (
            <View className="user_account_name" onClick={this.toUserInfoManager}>
              <Text className="name_text">{userHeaderInfo.account_real_name}</Text>
              <Text className="tips_text">{userHeaderInfo.greeting}</Text>
          </View>
          )}
          {loginStatus && (
            <View className="invite_parent" onClick={this.toSign} style={minwidth}>
              <Image
                src={require('../../../images/check-in.png')}
                className="icon"
              ></Image>
              <Text className="text">{issigntody ? '已签到':'签到赢积分'}</Text>
            </View>
          )}

        </View>
        <View className="usercenter_header_bottom">
          <View className="item" onClick={this.toHistory}>
            <Text className="number">{recentCount}</Text>
            <Text className="tips">浏览历史</Text>
          </View>
          <View className="item" onClick={this.toFaverate}>
            <Text className="number">{userHeaderInfo.user_favorite}</Text>
            <Text className="tips">收藏</Text>
          </View>
          <View className="item" onClick={this.toPoint}>
            <Text className="number">{userHeaderInfo.point}</Text>
            <Text className="tips">积分</Text>
          </View>
          <View className="item" onClick={this.toConpon}>
            <Text className="number">{userHeaderInfo.coupon_count}</Text>
            <Text className="tips">优惠券</Text>
          </View>
        </View>
        {userHeaderInfo.invite_win_cash_items &&  <Image className="banner_one"  src={userHeaderInfo.invite_win_cash_items[0].img_url}    onClick={this.gotoInvite} />}
        {!userHeaderInfo.invite_win_cash_items &&<View className="banner_one_empty"></View>}
        <View className="usercenter_order_items">
          <View
            className="usercenter_order_items_header"
            onClick={this.orderList}
            data-index="0"
          >
            <TitleView fontWeight={500} title="我的订单" lineHeight={15}></TitleView>
            <Text className="rightTitle">全部订单</Text>
            <Image
              className="rightImage"
              src={require('../../../images/uc_next.png')}
            ></Image>
          </View>
          <View className="usercenter_order">
            <View
              className="order_item"
              onClick={this.orderList}
              data-index="1"
            >
              <Image
                className="order_item_image"
                src={require('../../../images/uc_icon0.png')}
              ></Image>
              <Text className="order_item_title">待付款</Text>
              {userHeaderInfo.order_unpaid_count > 0 && (
                <Text className={process.env.TARO_ENV == 'alipay' ? 'order_item_tips_alipay' : 'order_item_tips'}>
                  {this.getCount(userHeaderInfo.order_unpaid_count)}
                </Text>
              )}
            </View>
            <View
              className="order_item"
              onClick={this.orderList}
              data-index="2"
            >
              <Image
                className="order_item_image"
                src={require('../../../images/uc_icon1.png')}
              ></Image>
              <Text className="order_item_title">待发货</Text>
              {userHeaderInfo.order_unsent_count > 0 && (
                <Text className={process.env.TARO_ENV == 'alipay' ? 'order_item_tips_alipay' : 'order_item_tips'}>
                  {this.getCount(userHeaderInfo.order_unsent_count)}
                </Text>
              )}
            </View>
            <View
              className="order_item"
              onClick={this.orderList}
              data-index="3"
            >
              <Image
                className="order_item_image"
                src={require('../../../images/uc_icon2.png')}
              ></Image>
              <Text className="order_item_title">待收货</Text>
              {userHeaderInfo.order_unreceived_count > 0 && (
                <Text className={process.env.TARO_ENV == 'alipay' ? 'order_item_tips_alipay' : 'order_item_tips'}>
                  {this.getCount(userHeaderInfo.order_unreceived_count)}
                </Text>
              )}
            </View>
            <View
              className="order_item"
              onClick={this.orderList}
              data-index="4"
            >
              <Image
                className="order_item_image"
                src={require('../../../images/uc_icon3.png')}
              ></Image>
              <Text className="order_item_title">待评价</Text>
              {userHeaderInfo.order_unevaluated_count > 0 && (
                <Text className={process.env.TARO_ENV == 'alipay' ? 'order_item_tips_alipay' : 'order_item_tips'}>
                  {this.getCount(userHeaderInfo.order_unevaluated_count)}
                </Text>
              )}
            </View>
            <View
              className="order_item"
              onClick={this.orderList}
              data-index="5"
            >
              <Image
                className="order_item_image"
                src={require('../../../images/uc_icon4.png')}
              ></Image>
              <Text className="order_item_title">退货/款</Text>
              {userHeaderInfo.return_goods_count > 0 && (
                <Text className={process.env.TARO_ENV == 'alipay' ? 'order_item_tips_alipay' : 'order_item_tips'}>
                  {this.getCount(userHeaderInfo.return_goods_count)}
                </Text>
              )}
            </View>
          </View>
        </View>
        {trafficnoArray.length > 0 && (
          <View className="trafficnoview">
            <View className="trafficnoview_header">
              <Text className="leftTitle">最新物流</Text>
            </View>
            <View
              className="trafficnoview_item"
              onClick={this.toLogistics}
              data-item={trafficnoArray[currentIndex]}
            >
              <Image
                className="trafficnoview_item_image"
                src={
                  trafficnoArray[currentIndex].imageurl.length > 0
                    ? trafficnoArray[currentIndex].imageurl
                    : '/images/default_img.png'
                }
              ></Image>
              <View className="trafficnoview_item_info">
                <View className="trafficnoview_item_info_header">
                  <Text className="trafficnoview_item_info_status">
                    {trafficnoArray[currentIndex].status}
                  </Text>
                  <Text className="trafficnoview_item_info_time">
                    {trafficnoArray[currentIndex].time}
                  </Text>
                </View>
                <Text className="trafficnoview_item_info_logistics">
                  {trafficnoArray[currentIndex].content}
                </Text>
              </View>
            </View>
          </View>
        )}
        <View className="separateView"></View>
        <View className="usercenter_bottom_bottons">
          <View className="bottom_botton_item" onClick={this.toAddress}>
            <Image
              className="bottom_botton_item_image"
              src={require('../../../images/user_icon_shdz.png')}
            ></Image>
            <Text className="bottom_botton_item_title">收货地址</Text>
          </View>
          <View className="bottom_botton_item" onClick={this.toRating}>
            <Image
              className="bottom_botton_item_image"
              src={require('../../../images/user_icon_wdpj.png')}
            ></Image>
            <Text className="bottom_botton_item_title">我的评价</Text>
          </View>
          <View className="bottom_botton_item" onClick={this.toComplaint}>
            <Image
              className="bottom_botton_item_image"
              src={require('../../../images/user_icon_wdts.png')}
            ></Image>
            <Text className="bottom_botton_item_title">我的投诉</Text>
          </View>
          <View
              className="bottom_botton_item"
              onClick={this.toMedicinePerson}
            >
              <Image
                className="bottom_botton_item_image"
                src={require('../../../images/user_icon_yyr.png')}
              ></Image>
              <Text className="bottom_botton_item_title">用药人</Text>
            </View>
            <View className="bottom_botton_item" onClick={this.toMyPolicy}>
            <Image
              className="bottom_botton_item_image"
              src={require('../../../images/bao.png')}
            ></Image>
            <Text className="bottom_botton_item_title">我的保单</Text>
          </View>
        </View>

        {userHeaderInfo.customer_join_items[0] && <Image
          className="banner_two"
          src={userHeaderInfo.customer_join_items[0].img_url}
          onClick={this.toStoreSettledIn}
          data-item={userHeaderInfo.customer_join_items[0]}
        ></Image>}
        <AuthenTication ref={this.RefreshCompant} />
        <Image
          onClick={this.gotoInvite}
          className={hasMove ? "dis_ads_itemImage" : "ads_itemImage"}
          src={ads_itemImage}
        ></Image>
      </ScrollView>
    )
  }
  RefreshCompant = (modal) => this.authenTication = modal
}