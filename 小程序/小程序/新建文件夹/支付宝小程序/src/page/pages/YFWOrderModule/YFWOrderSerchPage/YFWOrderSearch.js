import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Block, Input } from '@tarojs/components'
const WxNotificationCenter = require("../../../../utils/WxNotificationCenter.js");
import {
  OrderApi
} from '../../../../apis/index.js'
const orderApi = new OrderApi();
import {
  isNotEmpty, safe, sublie, subAfter
} from '../../../../utils/YFWPublicFunction.js'
import {
  YFWOrderListModel
} from '../YFWOrderListPage/Model/YFWOrderListModel.js'
const orderListModel = new YFWOrderListModel()
import {
  pushNavigation
} from '../../../../apis/YFWRouting.js'
import EmptyView from '../YFWOrderListPage/Components/YFWOrderListEmptyView/YFWOrderListEmptyView'
import ButtonList from '../YFWOrderListPage/Components/YFWOderListBottomTips/OrderBottomTips'
import MedicineList from '../YFWOrderListPage/Components/YFWorderListComponent/YFWOrderListItemComponent'
import PromptBox from '../../../../components/YFWPromptBoxModal/YFWPromptBoxModal'
import OrderApplayReturnModal from '../../../../components/YFWOrderApplyReturnModal/YFWOrderApplyReturnModal'
import HideButtons from '../YFWOrderListPage/Components/YFWOrderListHideButtonsModel/YFWOrderListHideButtonsModel'
import './YFWOrderSearch.scss'

const RequestOrderListDatas = (that,pageindex, position, needRefreshPosition) => {
    orderApi.searchOrder(that.state.keywords, isNotEmpty(pageindex) ? pageindex : that.state.pageIndex).then(goods => {
        Taro.hideLoading()
        if (isNotEmpty(goods)) {
          let modelData = orderListModel.getModelData(goods)
          if (isNotEmpty(pageindex)) {
            that.onReceiveEvent(modelData, position, needRefreshPosition);
            return
          }
          let type = 1;
          if (that.state.pageIndex == 1 && modelData.length == 0) {
            //展示空视图
            that.setState({
              showEmptyView: true
            })
            return
          }
          if (modelData.length === 0 || modelData.length < 20) {
            type = 2
          }
          if (that.state.pageIndex > 1) {
            modelData = that.state.dataArray.concat(modelData);
          }
          that.setState({
            dataArray: modelData,
            showEmptyView: false,
            loadMore: true,
            canRequestMore: true,
            showBottomLoading:true,
            loadType: type
          })
        }
      }, error => {
        Taro.hideLoading()
        if (isNotEmpty(error.msg)) {
          Taro.showToast({
            title: error.msg,
            icon: 'none',
            duration: 2000
          })
        }
    })
}
class YFWOrderSearch extends Component {

    config = {
        navigationBarTextStyle: 'white',
        navigationBarTitleText: '订单搜索',
        navigationBarBackgroundColor: '#49ddb8',
        enablePullDownRefresh: false
    }

    constructor (props) {
        super (props)
        this.state = {
            dataArray: [],
            keywords: '',
            pageIndex: 1,
            showEmptyView: false,
            showBottomLoading: false,
            loadType:1,
            canRequestMore: true,
            loadMore: true,
            showDeletIcon:false,
            focus:true,
            selectBox: '',
            code: ''
        }
    }
    componentWillMount () { 
        this.needRefreshScreen = false
        this.refreshAll = false
        this.needRefreshPosition = -1;
        let that = this;
        // this.applayReturnModal = this.selectComponent("#applyReturnOrderModal");
        // this.orderReceivedModal = this.selectComponent('#orderReceived');
        // this.hideButtonsModel = this.selectComponent('#hideButtons');
        // this.orderPayNot = this.selectComponent('#orderPayNot');
        WxNotificationCenter.addNotification('refreshScreen', that.refreshScreen, that)
        WxNotificationCenter.addNotification('refreshScreenNow', that.refreshScreenNow, that)
    }
    refreshScreen = (info) => {
        this.needRefreshScreen = true
        if (info == "refreshAll") {
          this.refreshAll = true
        } else if (info.substr(0, 8) == "position") {
          let array = info.split(":")
          if (array.length > 1) {
            this.needRefreshPosition = array[1]
          }
        }
    }

    refreshScreenNow = (info) => {
        Taro.showLoading({
          title: '',
        })
        if (info == "refreshAll") {
          this.state.pageIndex = 1
          this.state.list = []
          // this.goTop()
          RequestOrderListDatas(this)
        } else if (info.substr(0, 8) == "position") {
          let array = info.split(":")
          if (array.length > 1) {
            let pageIndex, position;
            this.needRefreshPosition = array[1]
            if (Number.isInteger(this.needRefreshPosition / 10)) {
              pageIndex = this.needRefreshPosition / 10 + 1;
              position = 0;
            } else {
              pageIndex = Math.ceil(this.needRefreshPosition / 10)
              position = this.needRefreshPosition % 10;
            }
            RequestOrderListDatas(this, pageIndex, position, this.needRefreshPosition)
          }
        }
    }

    jumpToShopDetail(e) {
        let shopId = e.currentTarget.dataset.shopid
        pushNavigation('get_shop_detail', {
          value: shopId
        })
    }

    componentDidShow () {
        this.pageLoading = !1;
        if (this.needRefreshScreen) {
        this.needRefreshScreen = false
        Taro.showLoading({
            title: '',
        })
        if (this.refreshAll) {
            this.refreshAll = false
            this.state.pageIndex = 1
            this.state.list = []
            RequestOrderListDatas(this)
        }
        if (this.needRefreshPosition != -1) {
            //计算position处于哪一页 计算pageIndex
            let pageIndex, position;
            if (Number.isInteger(this.needRefreshPosition / 10)) {
            pageIndex = this.needRefreshPosition / 10 + 1;
            position = 0;
            } else {
                pageIndex = Math.ceil(this.needRefreshPosition / 10)
                position = this.needRefreshPosition % 10;
            }
            RequestOrderListDatas(this, pageIndex, position, this.needRefreshPosition)
        }
        }
    }

    componentDidHide () {
        this.needRefreshPosition = -1;
    }

    componentDidMount () { }
    onSearchClick (){
        RequestOrderListDatas(this)
    }
    serchOrder () {
        Taro.showLoading({
          title: '搜索中...',
          icon:'none'
        })
        RequestOrderListDatas(this)
      }
    listenKeyInput(text) {
        var input = text.detail.value;
        this.state.keywords = input;
        if (input.length>0){
          this.setState({
            showDeletIcon:true
          })
        }else{
          this.setState({
            showDeletIcon:false
          })
        }
    }
    clearInputText () {
        this.setState({
          keywords:'',
          showDeletIcon:false
        })
    }
    onOrderPayNotMpdelRightButtonClick = (parm) => {
      this.orderPayNot.closeView()
      pushNavigation('get_upload_rx_info', { orderID: parm.orderNo })
    }
    onOrderListItemClick (e) {
        if (!this.pageLoading) {
          this.pageLoading = !0
          pushNavigation('get_order_detail', {
            order_no: e
          })
        }
    }
    applyReturn = (parm) => {
      console.log('通信')
      let that = this
      Taro.showLoading({
        title:'加载中...',
      })
      orderApi.getAccountMobile().then(res => {
        Taro.hideLoading()
        let applayReturnModal = that.applayReturnModal&&(that.applayReturnModal.$component?that.applayReturnModal.$component:that.applayReturnModal)
        that.applayReturnModal&&applayReturnModal.showView({
          phone: res.value,
          orderNo: parm.orderNo,
          orderTotal: parm.order_total,
          type: parm.type,
          inputSuccess: function (phoneCode) {
            that.setState({
              code:phoneCode
            })
          },
        });
      },error=>{
        Taro.hideLoading()
        Taro.showToast({
          title: error.msg,
          icon:'none'
        })
      })
  }
    //确认收货  按钮点击
  orderReceived = (parm) => {
    let that = this;
    this.state.selectBox = 'orderReceived'
    this.setState({
        selectBox: this.state.selectBox
    })
    let promptBoxModal = that.promptBoxModal&&(that.promptBoxModal.$component?that.promptBoxModal.$component:that.promptBoxModal)
    promptBoxModal.showViewTypeTwo("请确认您已经收到与订单记录相符的商品，确认收货后将无法发起退换货申请。", parm)
    // that.orderReceivedModal.showViewTypeTwo("请确认您已经收到与订单记录相符的商品，确认收货后将无法发起退换货申请。", parm)
  }
  //确认收货 model点击确认按钮
  onBaseModalRightButtonClick = (parm) => {
    console.log('确认收货')
    let promptBoxModal = this.promptBoxModal&&(this.promptBoxModal.$component?this.promptBoxModal.$component:this.promptBoxModal)
    promptBoxModal.closeView()
    // this.orderReceivedModal.closeView()
    let orderNo = parm.orderNo
    let img_url = parm.img_url
    let order_total = parm.order_total
    let shop_title = parm.shop_title
    Taro.showLoading({
      title: '加载中...',
    })
    orderApi.confirmReceiving(orderNo).then(res => {
      Taro.hideLoading()
      pushNavigation('get_success_receipt', {
        title: '收货成功',
        orderNo: orderNo,
        type: 'received',
        img_url: img_url,
        order_total: order_total,
        shop_title: shop_title
      })
    },error=>{
      Taro.hideLoading()
      Taro.showToast({
        title: error.msg,
      })
    })
  }

  onHideButtonsClick = (position) => {
    let that = this;
    if (this.state.destHeight - position.position.top * 2 < 120) {
      position.position.top = position.position.top - 120
      position.position.showDirection = 'bottom'
    } else {
      position.position.top = position.position.top + 20
      position.position.showDirection = 'top'
    }
    position.position.hideButtons = this.state.list[position.position.itemIndex].hide_buttons
    that.hideButtonsModel.showView(position.position)
  }
  checkPhoneNum = (parm) => {
    let arrary = parm.phone.split('****')
    let pheone = safe(arrary[0]) + this.state.code + safe(arrary[1])
    Taro.showLoading({
      title: '加载中...',
    })
    orderApi.verifyMobile(pheone).then(res => {
      Taro.hideLoading()
      let applayReturnModal = this.applayReturnModal.$component?this.applayReturnModal.$component:this.applayReturnModal
      if(res == 1){
        this.applayReturnModal&&applayReturnModal.closeView()
        if (parm.type == 'order_apply_return_pay') {
          pushNavigation('get_application_return', {
            orderNo: parm.orderNo,
            order_total: parm.order_total
          })
        } else {
          pushNavigation('get_choose_return_type', {
            orderNo: parm.orderNo,
            order_total: parm.order_total
          })
        }
      }else{
        this.applayReturnModal&&applayReturnModal.closeView()
        Taro.showToast({
          title: '手机号验证失败',
          icon: 'none'
        })
      }
    },error=>{
      Taro.hideLoading()
      Taro.showToast({
        title: error.msg,
        icon:'none'
      })
    })
  }

  onOrderPayNot = (parms) =>{
    let orderNo = parms.orderNo
    let prompt_info = parms.prompt_info
    this.state.selectBox = 'orderPayNot'
    this.setState({
            selectBox: this.state.selectBox
    })
    this.promptBoxModal && (this.promptBoxModal.$component?this.promptBoxModal.$component.showView(prompt_info, orderNo):this.promptBoxModal.showView(prompt_info, orderNo))
    // this.orderPayNot.showView(prompt_info, orderNo)
  }
  onReceiveEvent(modelData, position, needRefreshPosition) {
    let newItemData = modelData[position];
    this.state.dataArray[needRefreshPosition] = newItemData;
    this.setState({
      dataArray: this.state.dataArray
    })
  }
    render() {
        const { keywords, focus, showDeletIcon, showEmptyView, dataArray, orderStatus, loadType, showBottomLoading,selectBox
        } = this.state
        return (
          <Block>
            <View className="serch-layout">
              <View className="serch-parent">
                <View className="serch-view">
                  <Image
                    className="icon"
                    src={require('../../../../images/search.png')}
                  ></Image>
                  <Input
                    value={keywords}
                    className="tip-s"
                    placeholder="商品名称/批准文号/商家名称"
                    placeholderClass="placeHodle"
                    confirmType="search"
                    onInput={this.listenKeyInput}
                    focus={focus}
                    onConfirm={this.onSearchClick}
                  ></Input>
                  {showDeletIcon && (
                    <Image
                      className="icon"
                      src={require('../../../../images/search_del.png')}
                      onClick={this.clearInputText}
                    ></Image>
                  )}
                </View>
                <View className="tips" onClick={this.serchOrder}>
                  搜索
                </View>
              </View>
            </View>
            <View className="fillView"></View>
            <View className="serchOrderList">
              {showEmptyView == true ? (
                <EmptyView type='search'/>
              ) : (
                showEmptyView == false && (
                  <View>
                    {dataArray.map((nextInfo, idx) => {
                      return (
                        <Block key="key">
                          <View
                            className="item"
                            style={
                              'margin-top:' +
                              (orderStatus == 'unpaid' && idx == 0 ? 0 : 20) +
                              'rpx'
                            }
                          >
                            <View
                              className="shop_title_info"
                              onClick={this.jumpToShopDetail}
                              data-shopId={nextInfo.shop_id}
                            >
                              <Image
                                className="shop_icon"
                                src={require('../../../../images/bottom_icon_dianpu.png')}
                              ></Image>
                              <Text className="shop_title">{nextInfo.shop_title}</Text>
                              <View style="flex:1"></View>
                              <Text
                                className={
                                    nextInfo.status_name == '交易取消' ||
                                    nextInfo.status_name == '交易失败' ||
                                    nextInfo.status_name == '失效'
                                    ? 'order_status_dark'
                                    : 'order_status_green'
                                }
                              >
                                {nextInfo.status_name}
                              </Text>
                            </View>
                            <View className='listParent' onClick={this.onOrderListItemClick.bind(this,nextInfo.order_no)}  >
                                {nextInfo.goods_items.length > 0 && (nextInfo.goods_items[0].map((innerItem, index) => {
                                    return (
                                        <Block key={innerItem.shop_goods_id} >
                                            <View className='listParent' onClick={this.onOrderListItemClick.bind(this,nextInfo.order_no)} data-orderNo={innerItem.order_no} >
                                                <MedicineList listData={innerItem}/>
                                            </View>
                                        </Block>
                                    )
                                    })
                                )}
                              {/*  套餐  */}
                              {nextInfo.package_goods_items.map((item, index) => {
                                return (
                                  <Block key={item.packageid}>
                                    <View className="package_name">
                                      <View className="packge_type_tips">
                                        {item.package_type_name}
                                      </View>
                                      <View className="packge_name">
                                        {item.package_name}
                                      </View>
                                    </View>
                                    {item.data.map((info, index) => {
                                      return (
                                        <Block key={info.package_id}>
                                          <MedicineList
                                            listData={info}
                                          ></MedicineList>
                                        </Block>
                                      )
                                    })}
                                  </Block>
                                )
                              })}
                              {/*  疗程装  */}
                              {nextInfo.course_pack_goods_items.map((item, index) => {
                                return (
                                  <Block key={item.packageid}>
                                    <View className="package_name">
                                      <View className="course_costume">
                                        {item.package_type_name}
                                      </View>
                                      <View className="packge_name">
                                        {item.package_name}
                                      </View>
                                    </View>
                                    {item.data.map((info, index) => {
                                      return (
                                        <Block key={info.package_id}>
                                          <View
                                            className="listParent"
                                            onClick={this.onOrderListItemClick}
                                          >
                                            <MedicineList
                                              listData={info}
                                            ></MedicineList>
                                          </View>
                                        </Block>
                                      )
                                    })}
                                  </Block>
                                )
                              })}
                              <View className="medicine_total">
                                <Text className="smallPrice">
                                  ¥
                                  <Text className="right_text">
                                    {sublie(nextInfo.order_total) + '.'}
                                  </Text>
                                  <Text className="smallPrice">
                                    {subAfter(nextInfo.order_total)}
                                  </Text>
                                </Text>
                                <Text className="left_text">
                                  {'共' + nextInfo.goods_count + '件商品 总价：'}
                                </Text>
                              </View>
                            </View>
                            {/*  底部按钮  */}
                            {nextInfo.send_info.button_items.length > 0 && (
                              <View className="scheduled_days_itemLayout">
                                <View className="tips">{nextInfo.send_info.desc}</View>
                                <View className="scheduledButtonLayout">
                                  {nextInfo.send_info.button_items.map((tap, idx) => {
                                    return (
                                      <Block>
                                        <View
                                          className="buttons"
                                          onClick={this.onScheduledButtonClick}
                                          data-position={idx}
                                          data-index={nextInfo.itemIndex}
                                          data-orderNo={nextInfo.order_no}
                                        >
                                          {tap.text}
                                        </View>
                                      </Block>
                                    )
                                  })}
                                </View>
                              </View>
                            )}
                            <View className="fillView" style="height:40rpx;"></View>
                            <ButtonList
                                      datas={nextInfo.orderBottomTipsData}
                                      showButtons={nextInfo.show_butons}
                                      onOrderReceived={this.orderReceived}
                                      onOrderPayNot={this.onOrderPayNot}
                                      onRequestApplyReturn={this.applyReturn}
                                      hideButtons={nextInfo.hide_buttons}
                                      onShowHideButtons={this.onHideButtonsClick}
                                      showHideButtonsTips={
                                        false
                                      }
                            />
                          </View>
                        </Block>
                      )
                    })}
                    <View>
                      {showBottomLoading && (
                        <View className="onloading">
                          <View className="load-wrap">
                            {loadType == 1 && (
                              <View className="loading-icon">
                                <View className="hide-block"></View>
                              </View>
                            )}
                          </View>
                          <View style="margin-left:10rpx">
                            {loadType == 1 ? '正在加载更多数据...' : '没有更多了'}
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                )
              )}
            </View>
            <OrderApplayReturnModal ref={this.refApplayReturnModal} onCheckPhone={this.checkPhoneNum}/>
            <PromptBox ref={this.refPromptBoxModal} onTest={selectBox=='orderReceived' ? this.onBaseModalRightButtonClick : this.onOrderPayNotMpdelRightButtonClick} needLeftButton={selectBox=='orderReceived'?true:false}/>
            <HideButtons ref={this.refHideButtonModal}/>
          </Block>
        )
    }
    refPromptBoxModal = (modal) => this.promptBoxModal = modal
    refApplayReturnModal = (modal) => this.applayReturnModal = modal
    refHideButtonModal = (modal) => this.hideButtonsModel = modal
}

export default YFWOrderSearch