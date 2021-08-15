import { Block, View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { OrderApi, SearchApi } from '../../../../apis/index.js'
const orderApi = new OrderApi()
const searchApi = new SearchApi()

import { isNotEmpty, isEmpty } from '../../../../utils/YFWPublicFunction.js'
import { getItemModel } from '../../../../components/GoodsItemView/model/YFWGoodsItemModel.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import CollectionGoodsItem from '../../../../components/GoodsItemView/CollectionGoodsItem'
import './YFWLogisticsDetails.scss'


export default class YFWLogisticsDetails extends Taro.Component {
  constructor(props) {
    super(props)
    this.state = {
      logo: '',
      medecineImage: '',
      trafficNum: '',
      web: '',
      trafficStatus: '',
      trafficList: [],
      trafficListIsOpen: false,
      recommendData: [],
      partOfListData: [],
      phone: '',
      orderNo: '',
      goodsImage: '',
      env_type: process.env.TARO_ENV
    }
  }

  componentWillMount() {
    let options = this.$router.params
    let screenData =  JSON.parse(decodeURIComponent(options.params))
    this.state.orderNo = screenData.order_no
    this.setState({
      medecineImage:
        screenData.medecine_image.replace('_300x300.jpg', '') + '_300x300.jpg'
    })
    this.RequestTrafficData()
    searchApi.getAssociationGoods().then(res => {
      let recommendData = []
      recommendData = res.map(info => {
        return getItemModel(info, 'cart_list_recommend')
      })
      this.setState({
        recommendData: recommendData
      })
    })
  }

  trafficListChange = () => {
    this.setState({
      trafficListIsOpen: !this.state.trafficListIsOpen
    })
  }

  HandlerTrafficList = function (that, list) {
    if (isNotEmpty(list) && list.length > 0) {
      this.state.trafficList = list
      if (that.state.trafficList.length > 3) {
        let data = []
        that.state.trafficList.forEach((item, index) => {
          if (index <= 2) {
            data.push(item)
          }
        })
        that.setState({
          partOfListData: data
        })
      }
    }
  }

  /**刷新物流信息 */
  RequestTrafficData = () => {
    Taro.showLoading({
      title: '加载中...'
    })
    orderApi.getLogisticsDetails(this.state.orderNo, true).then(
      res => {
        Taro.hideLoading()
        this.HandlerTrafficList(this, res.data)
        this.setState({
          logo: res.logo,
          trafficNum: res.trafficno,
          web: res.web,
          trafficStatus: res.state_name,
          phone: res.phone
        })
      },
      error => {
        Taro.hideLoading()
        Taro.showToast({
          title: error.msg,
          iocn: 'none'
        })
      }
    )
  }

  /**复制快递单号 */
  copyNum = () => {
    Taro.setClipboardData({
      data: this.state.trafficNum,
      success: function () {
        Taro.showToast({
          title: '复制成功',
          icon: 'none'
        })
      }
    })
  }

  /**物流客服 */
  callSer = () => {
    Taro.makePhoneCall({
      phoneNumber: this.state.phone
    })
  }

  jumpToQuere = () => {
    if (isEmpty(this.state.web)) {
      return
    }
    pushNavigation('get_h5', { value: this.state.web })
  }

  refreshMessage = () => {
    this.RequestTrafficData()
  }

  config = {
    navigationBarTitleText: '物流详情',
    navigationBarTextStyle: 'white',
    navigationBarBackgroundColor: '#49ddb8'
  }

  render() {
    const {
      logo,
      trafficStatus,
      medecineImage,
      trafficNum,
      web,
      trafficListIsOpen,
      trafficList,
      partOfListData,
      recommendData,
      env_type 
    } = this.state
    return (
      <View className = "coniner">
          <View className="topview">
          <View className="topInfo">
            <View className="coverTopView">
              <View className="status">
                <View className="logo">
                  <Image src={logo} className="image"></Image>
                </View>
                <View className="text_tips">
                  {'物流状态：' + trafficStatus}
                </View>
              </View>
              <View className="message">
                <View className="parent">
                  <Image className="image" src={medecineImage}></Image>
                  <View className="detail">
                    <View className="tarfficeNumParent">
                      <Text className="trafficNumTips">
                        快递单号：
                        <Text className="trafficNumValue">{trafficNum}</Text>
                      </Text>
                      <Image
                        className="fz_icon"
                        src={require('../../../../images/Wl_icon_fz.png')}
                        onClick={this.copyNum}
                      ></Image>
                    </View>
                    <Text className="trafficNumTips" onClick={this.jumpToQuere}>
                      物流网站：<Text className="trafficNumValue">{web}</Text>
                    </Text>
                  </View>
                  <View style="flex:1"></View>
                  <View className="customerService" onClick={this.callSer}>
                    <Image
                      src={require('../../../../images/Wl_icon_kf.png')}
                      className="image_icon"
                    ></Image>
                    <View className="text">物流客服</View>
                  </View>
                </View>
              </View>
            </View>
          </View>
          </View>
        <View className ={process.env.TARO_ENV == 'tt'?"bottom-view-tt":"bottom-view"}>
        <View className={process.env.TARO_ENV=='alipay' ? "fillView_alipay" : "fillView"}></View>
        {trafficList.length > 0 && (
          <View className="trafficInfoList">
            <View className="titleParent">
              <View className="tips">物流跟踪</View>
              <Image
                src={require('../../../../images/Wl_icon_sx.png')}
                className="refreshIcon"
                onClick={this.refreshMessage}
              ></Image>
            </View>
            <View className="splite"></View>
            <View className="trafficListParent">
              {trafficListIsOpen ? trafficList.map(
                (item, index) => {
                  return (
                    <View >
                      <View className="trafficItem">
                        <View className="left">
                          <View
                            className={index == 0 ? 'pointLight' : 'pointDark'}
                          ></View>
                          {index != trafficList.length && (
                            <View className="line"></View>
                          )}
                        </View>
                        <View className="right">
                          <View className={index == 0 ? 'tipsLight' : 'tipsDark'}>
                            {item.status + ' ' + item.context}
                          </View>
                          <View className="times">{item.time}</View>
                        </View>
                      </View>
                    </View>
                  )
                }
              ) : partOfListData.map(
                (item, index) => {
                  return (
                    <View >
                      <View className="trafficItem">
                        <View className="left">
                          <View
                            className={index == 0 ? 'pointLight' : 'pointDark'}
                          ></View>
                          {index != trafficList.length && (
                            <View className="line"></View>
                          )}
                        </View>
                        <View className="right">
                          <View className={index == 0 ? 'tipsLight' : 'tipsDark'}>
                            {item.status + ' ' + item.context}
                          </View>
                          <View className="times">{item.time}</View>
                        </View>
                      </View>
                    </View>
                  )
                }
              )}
            </View>
            {trafficList.length > 3 && (
              <View className="bottomTips" onClick={this.trafficListChange}>
                <Image
                  src={
                    trafficListIsOpen
                      ? require('../../../../images/Wl_icon_dropup.png')
                      : require('../../../../images/Wl_icon_dropdown.png')
                  }
                  className="image_icon_bottom"
                ></Image>
                <View className="texts">
                  {trafficListIsOpen ? '收起快递详情' : '点击查看物流详情'}
                </View>
              </View>
            )}
          </View>
        )}
        {trafficList.length <= 0 && (
          <View className="trafficEmptyView">
            <Image
              className="image"
              src="https://c1.yaofangwang.net/common/images/miniapp/ic_no_shipping.png"
              mode="aspectFit"
            ></Image>
            <View className="text">暂无物流信息</View>
          </View>
        )}
        <View className="bottom_ads">
          <View className="ad_tips_text">精选商品</View>
          <View className="ad_tips_text_bottom"></View>
        </View>
        <View className={env_type == 'alipay' ? 'shopcar-wrap_alipay' : 'shopcar-wrap shopcar-row'}>
          {recommendData.map(recommendItem => {
            return (
              <View className='shopcar-recommend-item'>
                <CollectionGoodsItem data={recommendItem} showcar={false} />
              </View>
            )
          })}
        </View>
        </View>
      </View>
    )
  }
}