import Taro, { Component } from '@tarojs/taro'
import { Block, View, Image, ScrollView, Swiper, SwiperItem, Text } from '@tarojs/components'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { isNotEmpty, safe, sublie, subAfter } from '../../../../utils/YFWPublicFunction.js'
const WxNotificationCenter = require('../../../../utils/WxNotificationCenter.js')

const mtabW = 150

import { IndexApi, OrderApi } from '../../../../apis/index.js'
const indexApi = new IndexApi()
const orderApi = new OrderApi()
import { YFWOrderListModel } from './Model/YFWOrderListModel.js'
const orderListModel = new YFWOrderListModel()
import TitleView from '../../../../components/YFWTitleView/YFWTitleView'
import EmptyView from './Components/YFWOrderListEmptyView/YFWOrderListEmptyView'
import ButtonList from './Components/YFWOderListBottomTips/OrderBottomTips'
import MedicineList from './Components/YFWorderListComponent/YFWOrderListItemComponent'
import PromptBox from '../../../../components/YFWPromptBoxModal/YFWPromptBoxModal'
import OrderApplayReturnModal from '../../../../components/YFWOrderApplyReturnModal/YFWOrderApplyReturnModal'
import HideButtons from '../YFWOrderListPage/Components/YFWOrderListHideButtonsModel/YFWOrderListHideButtonsModel'
import './YFWOrderLis.scss'

const RequestOrderData =(orderStatus, that, pageindex, position, needRefreshPosition)=> {
    orderApi.getOrderListData( orderStatus, isNotEmpty(pageindex) ? pageindex : that.state.pageIndex ).then( goods => {
        Taro.hideLoading()
        if (isNotEmpty(goods)) {
          let modelData = orderListModel.getModelData(goods)
          if (isNotEmpty(pageindex)) {
            that.onReceiveEvent(modelData, position, needRefreshPosition)
            return
          }
          if (that.state.pageIndex == 1 && modelData.length == 0) {
            //展示空视图
            that.setState({
              showEmptyView: true,
              loading:false

            })
            return
          }
          if (modelData.length === 0 || modelData.length < 10) {
            that.setState({
              loadType: 2
            })
          }
          if (that.state.pageIndex > 1) {
            modelData = that.state.tabs[that.state.activeIndex].datas.concat(
              modelData
            )
          }
          that.state.tabs[that.state.activeIndex].datas = modelData
          that.setState({
            tabs: that.state.tabs,
            showEmptyView: false,
            loadMore: true,
            canRequestMore: true,
            loading: false
          })
        }
      },
      error => {
        Taro.hideLoading()
        Taro.showToast({
          title: error.msg,
          icon: 'none'
        })
      }
    )
}
class YFWOrderLis extends Component {

    config = {
        navigationBarTextStyle: 'white',
        navigationBarTitleText: '我的订单',
        navigationBarBackgroundColor: '#49ddb8',
        enablePullDownRefresh: false
    }

    constructor (props) {
        super(props)
        this.state = {
            list: [],
            tabs: [
            {
                name: '全部',
                value: '',
                id: 'a',
                datas: []
            },
            {
                name: '待付款',
                value: 'unpaid',
                id: 'b',
                datas: []
            },
            {
                name: '待发货',
                value: 'unsent',
                id: 'c',
                datas: []
            },
            {
                name: '待收货',
                value: 'unreceived',
                id: 'd',
                datas: []
            },
            {
                name: '待评价',
                value: 'unevaluated',
                id: 'e',
                datas: []
            },
            {
                name: '退货/款',
                value: 'return_goods',
                id: 'f',
                datas: []
            }
            ],
            topView:'',
            destHeight: 0,
            activeIndex: 0, //swiper被选中的position
            index: 0,
            pageIndex: 1,
            orderStatus: '',
            loadMore: true,
            canRequestMore: true,
            mScrollTop: 0,
            lastTimeScrollTop: 0,
            checkPhoneModalShow: false,
            orderListLength: 0,
            showEmptyView: false,
            loadType: 1,
            topNum: 0,
            loading: false,
            selectBox:'',
            code:''
        }
        
    }
    
    componentWillMount () { 
        this.needRefreshScreen = false
        this.refreshAll = false
        this.needRefreshPosition = -1;
        this.applayReturnModal
        let that = this;
        Taro.getSystemInfo({
            success: function(res) {
                let clientHeight = res.windowHeight;
                let clientWidth = res.windowWidth;
                let ratio = 750 / clientWidth;
                let height = clientHeight * ratio;
                that.setState({
                    destHeight: height - 250
                });
            }
        });
        let options = this.$router.params
        let screenData = JSON.parse(options.params);
        if (isNotEmpty(screenData.index)) {
        this.state.orderStatus = this.state.tabs[parseInt(screenData.index)].value
        this.setState({
            activeIndex: parseInt(screenData.index)
        })
        //选择组件对象
        }
        RequestOrderData(this.state.orderStatus, this)
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
        this.state.loading = true
        if (info == "refreshAll") {
            this.state.pageIndex = 1
            // this.state.list = []
            this.state.tabs[this.state.activeIndex].datas = []
            this.goTop()
            RequestOrderData(this.state.orderStatus, this)
        } else if (info.substr(0, 8) == "position") {
            let array = info.split(":")
            if (array.length > 1) {
            this.needRefreshPosition = array[1]
            let pageIndex, position;
            if (Number.isInteger(this.needRefreshPosition / 10)) {
                pageIndex = this.needRefreshPosition / 10 + 1;
                position = 0;
            } else {
                pageIndex = Math.ceil(this.needRefreshPosition / 10)
                position = this.needRefreshPosition % 10;
            }
            RequestOrderData(this.state.orderStatus, this, pageIndex, position, this.needRefreshPosition)
            }
        }
    }
    goTop(e) {
        this.setState({
          topNum: this.state.topNum = 0
        });
    }

    onHideButtonsClick = (position) => {
        let that = this;
        if (this.state.destHeight - position.position.top * 2 < 120) {
          position.position.top = position.position.top - 170
          position.position.showDirection = 'bottom'
        } else {
          position.position.top = position.position.top - 20;
          position.position.showDirection = 'top'
        }
        position.position.hideButtons = this.state.tabs[this.state.activeIndex].datas[position.position.itemIndex].hide_buttons
        let hideButtonsModel = that.hideButtonsModal.$component?that.hideButtonsModal.$component:that.hideButtonsModal
        hideButtonsModel.setDatas(this.state.tabs[this.state.activeIndex].datas[position.position.itemIndex].orderBottomTipsData)
        hideButtonsModel.showView(position.position,'')
        // that.hideButtonsModel.setDatas(this.state.tabs[this.state.activeIndex].datas[position.detail.position.itemIndex].orderBottomTipsData)
        // that.hideButtonsModel.showView(position.detail.position)
      }
    checkPhoneNum =(parm) => {
        let arrary = parm.phone.split('****')
        let pheone = safe(arrary[0]) + this.state.code + safe(arrary[1])
        Taro.showLoading({
          title: '加载中...',
        })
        orderApi.verifyMobile(pheone).then(res => {
          Taro.hideLoading()
          if (res == 1) {
            this.applayReturnModal && this.applayReturnModal.closeView()
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
          } else {
            this.applayReturnModal && this.applayReturnModal.closeView()
            Taro.showToast({
              title: '手机号验证失败',
              icon: 'none'
            })
          }
        }, error => {
          Taro.hideLoading()
          Taro.showToast({
            title: error.msg,
            icon: 'none'
          })
        })
    }
    jumpToOrderSearchPage () {
        this.goBackFromPage = 'get_order_search'
        pushNavigation('get_order_search')
        
    }
    onOrderListItemClick (e) {
        if (!this.pageLoading) {
          this.pageLoading = !0;
          pushNavigation('get_order_detail', {
            order_no: e
          })
        }
    }
    jumpToShopDetail (e) {
        let shopId = e.currentTarget.dataset.shopId
        pushNavigation('get_shop_detail', {
          value: shopId
        })
    }
    /* 确认收货 */
    orderReceived = (e)=>{
        console.log(e,'确认收货')
        this.state.selectBox = 'orderReceived'
        this.setState({
            selectBox: this.state.selectBox
        })
        this.promptBoxModal && this.promptBoxModal.showViewTypeTwo("请确认您已经收到与订单记录相符的商品，确认收货后将无法发起退换货申请。", e)
    }
    
    //确认收货 model点击确认按钮
    onBaseModalRightButtonClick = (parm) => {
        console.log('确认收货')
        this.promptBoxModal && this.promptBoxModal.closeView()
        let orderNo = parm.orderNo
        let img_url = parm.img_url
        let order_total = parm.order_total
        let shop_title = parm.shop_title
        Taro.showLoading({
            title: '加载中...',
        })
        orderApi.confirmReceiving(orderNo).then(res => {
        WxNotificationCenter.postNotificationName('refreshScreen', "refreshAll")
        Taro.hideLoading()
        pushNavigation('get_success_receipt', {
            title: '收货成功',
            orderNo: orderNo,
            type: 'received',
            img_url: img_url,
            order_total: order_total,
            shop_title: shop_title
        })
        }, error => {
            Taro.hideLoading()
            Taro.showToast({
                title: error.msg,
                icon: 'none'
            })
        })
    }

    onOrderPayNotMpdelRightButtonClick (parm) {
        this.promptBoxModal && this.promptBoxModal.closeView()
        pushNavigation('get_upload_rx_info', {
          orderID: parm.orderNo
        })
    }
    /* 申请退款 */
    applyReturn =(parm) => {
        console.log(parm,'通信')
        let that = this
        let applayReturnModal = that.applayReturnModal&&(that.applayReturnModal.$component?that.applayReturnModal.$component:that.applayReturnModal)
        Taro.showLoading({
          title: '加载中...',
        })
        orderApi.getAccountMobile().then(res => {
          Taro.hideLoading()
          applayReturnModal&&applayReturnModal.showView({
            phone: res.value,
            orderNo: parm.orderNo,
            orderTotal: parm.order_total,
            packagingTotal: parm.packaging_total,
            shippingTotal: parm.shipping_total,
            type: parm.type,
            inputSuccess: function(phoneCode) {
              that.setState({
                  code:phoneCode
              })
            },
          });
        }, error => {
          Taro.hideLoading()
          Taro.showToast({
            title: error.msg,
            icon: 'none'
          })
        })
    }
    onOrderPayNot = (parms) => {
        console.log('xc',parms)
        let orderNo = parms.orderNo
        let prompt_info = parms.prompt_info
        this.state.selectBox = 'orderPayNot'
        this.setState({
            selectBox: this.state.selectBox
        })
        this.promptBoxModal && this.promptBoxModal.showView(prompt_info, orderNo)
    }
    componentDidMount () { }
    componentDidHide () {
        this.needRefreshPosition = -1
    }
    componentDidShow () {
        this.pageLoading = !1;
        if (this.goBackFromPage == 'get_order_search') {
        this.goBackFromPage = ""
        this.refreshPage()
        }
        if (this.needRefreshScreen) {
        this.needRefreshScreen = false
        this.setState({
            loading: true
        })
        if (this.refreshAll) {
            this.refreshPage()
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
            RequestOrderData(this.state.orderStatus, this, pageIndex, position, this.needRefreshPosition)
        }
        }
    }
    refreshPage () {
        // this.refreshAll = false
        // this.state.pageIndex = 1
        // // this.state.list = []
        // this.state.tabs[this.state.activeIndex].datas = []
        // this.goTop()
        RequestOrderData(this.state.orderStatus, this)
    }
    /**
   * table切换 滑动监听
   */
    bindChange (e){
        if (e.detail.source == "touch") {
        var current = e.detail.current;
        var offsetW = current * mtabW;
        this.state.pageIndex = 1
        // this.state.list = []
        this.state.orderStatus = this.state.tabs[current].value
        this.setState({
            activeIndex: current,
            index: current,
            topView: this.state.tabs[current].id,
            showEmptyView: false,
            loadType: 1,
            loading: true,
        });
        console.log(this.state.topView + ' ' + offsetW)
        RequestOrderData(this.state.orderStatus, this)
        }
    }

    /**
   * 点击顶部切换table监听
   */
    tabClick (e) {
        console.log(e)
        let that = this;
        let index = 0;
        for (let i = 0; i < this.state.tabs.length; i++) {
            if (this.state.tabs[i].id === e.currentTarget.dataset.item.id) {
                index = i
                break
            }
        }
        var offsetW = e.currentTarget.offsetLeft;
        this.state.pageIndex = 1
        this.state.orderStatus = this.state.tabs[index].value
        // this.state.list = []
        this.setState({
            activeIndex: index,
            showEmptyView: false,
            loadType: 1,
            loading: true
        });
        RequestOrderData(this.state.orderStatus, this)
    }

    /**
   * 分页加载
   */
    requestNextPage (e) {
        if (!this.state.canRequestMore) {
        return
        }
        // if (Math.abs(this.state.mScrollTop - this.state.lastTimeScrollTop) < 200){
        //   return
        // }
        this.state.lastTimeScrollTop = this.state.mScrollTop;

        this.state.getNowScrollTop = true
        this.state.canRequestMore = false
        this.state.pageIndex++;
        this.state.loadMore = false;
        RequestOrderData(this.state.orderStatus, this)
    }

    /**
   * 滑动监听
   * deltax:相对上一次滚动的x轴上的偏移量
   * scrollHeight:scrollview的高度
   * scrollLeft:水平方向总的已经滚动的距离
   * scrollTop:垂直方向总的已经滚动的距离
   */
    onScrollListenner (event){
        this.state.mScrollTop = event.scrollTop;
    }

    render () {
        const { topView } = this.state
        const { tabs } = this.state
        const { activeIndex } = this.state
        const { destHeight } = this.state
        const { showEmptyView } = this.state
        const { selectBox } = this.state
        const { loading } = this.state
        return (
            <View>
                <View className='container'>
                    {this.renderSearchTopView()}
                    <ScrollView className='scroll_tabel' scrollX scrollIntoView={topView} scrollWithAnimation={true}>
                        {tabs.map((info, infoIndex) => {
                            const selected = infoIndex == activeIndex
                            const fontSize = selected ? 36 : 30;
                            const fontColor = selected ? '#1fdb9b': '#333'
                            return (
                                <View className='sele' id={info.id} data-item={info} onClick={this.tabClick}>
                                    <TitleView title={info.name} fontWeight="500"  fontColor={fontColor} fontSize={fontSize} largeStyle={infoIndex == activeIndex} showLine={infoIndex == activeIndex} lineHeight={25}/>
                                </View>
                            )
                        })}
                    </ScrollView>
                    <Swiper current={activeIndex} className='order_list' duration={100} onChange={this.bindChange} style={'height:' + destHeight + 'rpx'}>
                        {tabs.map((secondinfo, secondIndex) => {
                            return (
                                <Block key={secondinfo.orderno}>
                                    <SwiperItem>
                                        {showEmptyView == true ? (
                                            <EmptyView/>
                                        ) : (
                                            showEmptyView == false && (this.renderContextView(secondinfo))
                                        )}
                                    </SwiperItem>
                                </Block>
                            )
                        })}
                    </Swiper>
                </View>
                <OrderApplayReturnModal ref={this.refApplayReturnModal} onCheckPhone={this.checkPhoneNum}/>
                <PromptBox ref={this.refPromptBoxModal} onTest={selectBox=='orderReceived' ? this.onBaseModalRightButtonClick : this.onOrderPayNotMpdelRightButtonClick} needLeftButton={selectBox=='orderReceived'?true:false}/>
                <HideButtons ref={this.refHideButtons}
                    onRequestApplyReturn={this.applyReturn} 
                    onOrderReceived={this.orderReceived}
                    onOrderDelete={this.onOrderDelete}
                    onOrderPayNot={this.onOrderPayNot}/>
                {loading&&(<Image src={require('../../../../images/loading_cycle.gif')} className='order-list-loading'/>)}
            </View>
        )
    }
    refPromptBoxModal = (modal) => this.promptBoxModal = modal
    refApplayReturnModal = (modal) => this.applayReturnModal = modal
    refHideButtons = (modal) => this.hideButtonsModal = modal
    renderSearchTopView() {
        return(
            <View className='serchLayout'>
                <View className='serchParent' onClick={this.jumpToOrderSearchPage}>
                    <View className='serchView'>
                        <Image className='icon' src={require('../../../../images/search.png')} />
                        <View className="tips">输入关键词搜索</View>
                    </View>
                    <View className="tips">搜索</View>
                </View>
            </View>
        )
    }
    renderContextView (secondinfo) {
        const { orderStatus } = this.state
        const { topNum } = this.state
        const { destHeight } = this.state
        const { loadType } = this.state
        let height = orderStatus == 'unpaid'?(destHeight-20):destHeight
        return (
            <View>
                {orderStatus == 'unpaid' && (
                    <View className='payTipsLayout'>
                        因商品的库存实时在变化，请您尽快完成付款，以免订单交易不成功
                    </View>
                )}
                <ScrollView scrollY style={'height:' + height + 'rpx;-webkit-overflow-scrolling: touch;'}
                            onScrollToLower={this.requestNextPage}
                            onScroll={this.onScrollListenner}
                            lowerThreshold={10}
                            scrollTop={topNum}>
                    {secondinfo.datas.map((nextInfo, idx) => {
                        

                        return (
                            <Block>
                                <View className='item' style={ 'margin-top:' + (orderStatus == 'unpaid' && idx == 0 ? 0 : 20) + 'rpx' }>
                                    <View className='shop_title_info' onClick={this.jumpToShopDetail} data-shopId={nextInfo.shop_id} >
                                        <Image className='shop_icon' src={require('../../../../images/bottom_icon_dianpu.png')}/>
                                        <Text className="shop_title">{nextInfo.shop_title}</Text>
                                        < View style="flex:1"></View>
                                      <Text className={nextInfo.status_name == '交易取消' || nextInfo.status_name == '交易失败' || nextInfo.status_name == '失效' ? 'order_status_dark' : 'order_status_green'
                                        }>
                                        {nextInfo.status_name}
                                      </Text>
                                    </View>
                                    <View className='listParent' onClick={this.onOrderListItemClick.bind(this,nextInfo.order_no)} data-orderNo={nextInfo.order_no} >
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
                                        {nextInfo.package_goods_items.map((packInfo, index) => {
                                            return (
                                                <Block key={packInfo.packageid}>
                                                <View className='package_name'>
                                                    <View className='packge_type_tips'>{packInfo.package_type_name}</View>
                                                    <View className='packge_name'>{packInfo.package_name}</View>
                                                </View>
                                                {packInfo.data.map((paInfo, index) => {
                                                    return (
                                                        <Block key={paInfo.package_id}>
                                                            <MedicineList listData={paInfo} />
                                                        </Block>
                                                    )
                                                })}
                                                </Block>
                                            )
                                            }
                                        )}
                                        {/*  疗程装  */}
                                        {nextInfo.course_pack_goods_items.map((courseInfo, index) => {
                                            return (
                                                <Block key={courseInfo.packageid}>
                                                    <View className='package_name'>
                                                        <View className='course_costume'>{courseInfo.package_type_name}</View>
                                                        <View className='packge_name'>{courseInfo.package_name}</View>
                                                    </View>
                                                    {courseInfo.data.map((courInfo, index) => {
                                                        return (
                                                        <Block key={courInfo.package_id}>
                                                            <View className='listParent' onClick={this.onOrderListItemClick.bind(this,nextInfo.order_no)}>
                                                            <MedicineList listData={courInfo}/>
                                                            </View>
                                                        </Block>
                                                        )
                                                    })}
                                                </Block>
                                            )
                                            }
                                        )}
                                        <View className='medicine_total'>
                                            <Text className='smallPrice'>¥
                                            <Text className='right_text'>
                                                {sublie(nextInfo.order_total) + '.'}
                                            </Text>
                                            <Text className='smallPrice'>{subAfter(nextInfo.order_total)}</Text>
                                            </Text>
                                            <Text className='left_text'>{'共' + nextInfo.goods_count + '件商品 总价：'}</Text>
                                        </View>
                                    </View>
                                    {/*  底部按钮  */}
                                    {nextInfo.send_info.button_items.length > 0 && (
                                      <View className='scheduled_days_itemLayout'>
                                        <View className='tips'>
                                          {nextInfo.send_info.desc}
                                        </View>
                                        <View className='scheduledButtonLayout'>
                                          {nextInfo.send_info.button_items.map((tap, idx) => {
                                              return (
                                                <Block>
                                                  <View
                                                    className='buttons'
                                                    onClick={
                                                      this
                                                        .onScheduledButtonClick
                                                    }
                                                    data-position={idx}
                                                    data-index={nextInfo.itemIndex}
                                                    data-orderNo={nextInfo.order_no}
                                                  >
                                                    {tap.text}
                                                  </View>
                                                </Block>
                                              )
                                            }
                                          )}
                                        </View>
                                      </View>
                                    )}
                                    <View className='fillView'></View>
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
                        <View className='onloading'>
                            <View className='load-wrap'>
                                {loadType == 1 && (
                                    <View className='loading-icon'>
                                        <View className='hide-block'></View>
                                    </View>
                                )}
                            </View>
                            <View style="margin-left:10rpx">
                                {loadType == 1
                                ? '正在加载更多数据...'
                                : '查看更多历史数据请至网页端查看'}
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        )
    }
}

export default YFWOrderLis