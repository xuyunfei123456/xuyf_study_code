import {
    Block,
    View,
    ScrollView,
    Swiper,
    SwiperItem,
    Image,
    Text
  } from '@tarojs/components'
  import Taro, { Component, Config } from "@tarojs/taro";
  import { UserCenterApi,PublicApi } from '../../../../apis/index.js'
  const userCenterApi = new UserCenterApi()
  const publicApi=new PublicApi()
  import { isNotEmpty,tcpImage } from '../../../../utils/YFWPublicFunction.js'
  import { pushNavigation } from '../../../../apis/YFWRouting.js'
  import Titleview from '../../../../components/YFWTitleView/YFWTitleView';
  import NoHasCoupon from '../../../../components/YFWNoHasCoupon/YFWNoHasCoupon'
  import './YFWMYCouponType.scss'
  
  export default class YFWMYCouponType extends Taro.Component {
    constructor(props) {
      super(props)
      this.state = {
        selectIndex: 0,
        flagArr:[0,1],
        dataSource: [
          {
            id: 0,
            name: '已使用',
            items: []
          },
          {
            id: 1,
            name: '已过期',
            items: []
          }
        ],
        listHeight: 600,
        ratio: 1,
        isEdit: false,
        pageEnd: false,
        pageEndLeft: false,
        pageEndRight: false,
        pageIndexLeft: 1,
        pageIndexRight: 1,
  
        pageEndOne: false,
        pageEndTwo: false,
        pageEndThree: false,
        pageEndFour: false,
  
        pageIndexOne: 1,
        pageIndexTwo: 1,
        pageIndexThree: 1,
        pageIndexFour: 1,
  
        isSelectAll: false,
        env_type: process.env.TARO_ENV
      }
    }
  
    componentWillMount() {
      let that = this
      Taro.getSystemInfo({
        success: function (res) {
          let clientHeight = res.windowHeight
          let clientWidth = res.windowWidth
          let ratio = 750 / clientWidth
          that.state.ratio = ratio
          let query = Taro.createSelectorQuery()
          query.select('#separateView').boundingClientRect()
          query.selectViewport().scrollOffset()
          query.exec(function (res) {
            let height = (clientHeight - res[0].bottom) * ratio
            let _listHeight=clientHeight*ratio-180
            that.setState({
              listHeight: _listHeight
            })
          })
        }
      })
      this.getData()
    }
  
    showMore = () => {
      let that = this
      let query = Taro.createSelectorQuery()
      query.select('#more_image').boundingClientRect()
      query.selectViewport().scrollOffset()
      query.exec(function (res) {
        let bottom = res[0].bottom * that.state.ratio
        that.selectComponent('#moreview').showModal(bottom + 30)
      })
    }
  
    /**跳转商家 */
    itemClick = e => {
      let item = e.currentTarget.dataset.item
      if (item.dict_bool_status != 0) {
        return
      }
      if (item.dict_coupons_type == 1) {
        pushNavigation('get_shop_detail', { value: item.storeid })
      } else if (item.dict_coupons_type == 2) {
        if (isNotEmpty(item.medicineid)) {
          pushNavigation('get_goods_detail', { value: item.medicineid })
        } else {
          pushNavigation('get_shop_goods_detail', {
            value: item.store_medicineid
          })
        }
      } else {
        pushNavigation('get_home')
      }
    }
  
    /**顶部点击事件 */
    changeIndex = event => {
      let index = event.currentTarget.dataset.index
      if(this.state.flagArr[index]){
        this.state.flagArr[index] = 0;
        this.getData()
      }
      this.setState({
        selectIndex:index
      })
    }
      // 跳转到领取中心页面
      _goCoupon(){
    publicApi.getCouponUrl().then((res) =>{
      pushNavigation("get_h5",{value:res.coupon_url})
    },(error) =>{
      console.log(error)
    })

  }
    /**侧滑 */
    swiperChangIndex = event => {
      if (event.detail.source == 'touch') {
        let index=event.detail.current
        // this.state.selectIndex = event.detail.current
        if(this.state.flagArr[index]){
          this.state.flagArr[index] = 0;
          this.getData()
        }
        this.setState({
          selectIndex:index
        })
      }
    }
  
    requestNextPage = e => {
  
      if (this.state.selectIndex == 0) {
        this.state.pageEnd = this.state.pageEndLeft
      } else {
        this.state.pageEnd = this.state.pageEndRight
      }
      if (!this.state.pageEnd) {
        if (this.state.selectIndex == 0) {
          this.state.pageIndexLeft = this.state.pageIndexLeft + 1
        } else {
          this.state.pageIndexRight = this.state.pageIndexRight + 1
        }
        this.getData()
      } 
    }
  
    hideLoadingView = () => {
      this.setState({
        pageEnd: true
      })
    }
  
    getTimeString(startStr, endStr) {
      let time_start = startStr.split(" ")[0]
      let time_end = endStr.split(" ")[0]
      let start_time = time_start.replace(/-/ig, '.')
      let end_time = time_end.replace(/-/ig, '.')
      return start_time + '-' + end_time
    }
  
    setType(type) {
      if (type == 1) {
        return '店铺'
      } else if (type == 2) {
        return '单品'
      } else {
        return '平台'
      }
    }
  
    /**获取优惠劵信息 */
    getData = (_index) => {
  
  
  
      
      if (this.state.selectIndex == 0) {
        userCenterApi
          .getMyCoupons(this.state.pageIndexLeft, '1')
          .then(response => {
            let data = response.dataList || []
            if (data.length < 20) {
              this.state.pageEndLeft = true
              this.hideLoadingView()
            }
            if (this.state.pageIndexLeft == 1) {
              this.state.dataSource[0].items = data
            } else {
              data = this.state.dataSource[0].items.concat(data)
            }
            this.state.dataSource[0].items = data
            this.setState({
              dataSource: this.state.dataSource
            })
          })
      } else {
        userCenterApi
          .getMyCoupons(this.state.pageIndexRight, '2')
          .then(response => {
            let data = response.dataList || []
            if (data.length < 20) {
              this.state.pageEndRight = true
               this.hideLoadingView()
              
            }
            if (this.state.pageIndexRight == 1) {
              this.state.dataSource[1].items = data
            } else {
              data = this.state.dataSource[1].items.concat(data)
            }
            this.state.dataSource[1].items = data
            this.setState({
              dataSource: this.state.dataSource
            })
          })
      }
    }
  
    config = {
      navigationBarTitleText: '我的优惠券',
      navigationBarBackgroundColor: '#49ddb8',
      navigationBarTextStyle: 'white',
      onReachBottomDistance: 90,
    }
  
    render() {
      const { selectIndex, dataSource, listHeight, pageEnd, env_type } = this.state
      return (
        <View className="container">
          <View className="goodsView">
            <ScrollView
              className="goodsView-top"
              scrollX
              scrollIntoView={'item-' + selectIndex}
            >
              {dataSource.map((item, index) => {
                return (
                  <Block>
                    <View
                      className="goodsView-top-item"
                      onClick={this.changeIndex}
                      data-index={index}
                      id={'item-' + index}
                    >
                      <Titleview
                        title={item.name}
                        showLine={index == selectIndex}
                      ></Titleview>
                    </View>
                  </Block>
                )
              })}
            </ScrollView>
            <View className="separate" id="separateView"></View>
            <Swiper
              current={selectIndex}
              className="goodsView-content"
              onChange={this.swiperChangIndex}
              style={'height:' + listHeight + 'rpx;'}
            >
              {dataSource.map((info, swiperIndex) => {
                return (
                  <Block>
                    <SwiperItem>
                      <ScrollView
                        className="goodsView-swiper-item"
                        scrollY="true"
                        onScrollToLower={this.requestNextPage}
                        style={'height:' + listHeight + 'rpx;'}
                      >
                        { dataSource[swiperIndex].items.length>0 ? <View>
                          {dataSource[swiperIndex].items.map((item, index) => {
                          return (
                            <View
                              className="coupon"
                              key
                              onClick={this.itemClick}
                              data-item={item}
                            >
                              <View className="cou_left">
                             <View className="cou_sum">¥<Text className="cou_figure">{item.price}</Text></View>
                             <View className="cou_full">{item.use_condition_price_desc}</View>
                              </View>
                              <View className="cou_center">
                        
                                  <View className="mony">
                                    <Text>¥</Text>
                                    {item.price}
                                    <Text className="fullR">
                                      {item.use_condition_price_desc}
                                    </Text>
                                  </View>
  
                                  <View className="rg_one">
                                    <View
                                      className={'evem'}
                                    >
                                      {this.setType(item.dict_coupons_type)}
                                    </View>
                                    <View
                                      className={
                                        'rg_oneSec'
                                      }
                                    >
                                      {item.store_title}
                                    </View>
                                    <View className="cear"></View>
                                  </View>
                                  <View className="rg_three myflex">
                                    <Text className="rg_threeO">
                                      {this.getTimeString(item.start_time, item.expire_time)}
                                    </Text>
  
  
  
                                  </View>
                         
                          
                              </View>
                              <View className="cou_right"><Image mode="widthFix" className="used_img" src={item.dict_bool_status===1 ? require("../../../../images/coupon_used.png") : require("../../../../images/coupon_overdue.png")}></Image></View>
                            </View>
                          )
                        })}
                                 <View className={env_type == 'alipay' ? "onloading" : "onloading-alipay"}>
                          <View className="load-wrap">
                            {(pageEnd ? (
                              false
                            ) : (
                              true
                            )) ? (
                              <View className='loading-more'>
                                <Image
                                  src={require('../../../../images/loading_cycle.gif')}
                                  className="loading"
                                ></Image>
                                <View className="text">加载更多...</View>
                              </View>
                            ) : (
                              <View className="load-wrap">
                                <View className="loadover">没有更多数据了~</View>
                              </View>
                            )}
                          </View>
                        </View>
                        </View> : <NoHasCoupon goCoupon={this._goCoupon.bind(this)}></NoHasCoupon>}
                       
                        {/* <View className= {process.env.TARO_ENV == 'alipay' ? "onloading-alipay" : "onloading"}></View> */}
               
                      </ScrollView>
                    </SwiperItem>
                  </Block>
                )
              })}
            </Swiper>
         
          </View>
        </View>
      )
    }
  }