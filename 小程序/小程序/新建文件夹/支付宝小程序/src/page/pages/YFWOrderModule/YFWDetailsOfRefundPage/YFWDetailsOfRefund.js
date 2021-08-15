import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import {
    OrderApi
} from '../../../../apis/index.js'
const orderApi = new OrderApi()
import {
    isNotEmpty,
    toDecimal,
    safeArray,
    sublie,
    subAfter
} from '../../../../utils/YFWPublicFunction.js'
import { pushNavigation} from '../../../../apis/YFWRouting.js'
const WxNotificationCenter = require("../../../../utils/WxNotificationCenter.js");
import PromptBox from '../../../../components/YFWPromptBoxModal/YFWPromptBoxModal'
import './YFWDetailsOfRefund.scss'
const RequstReturnInfo = function(that) {
    orderApi.getRefundInfo(that.state.orderNo).then(res => {
      if (isNotEmpty(res)) {
        that.setState({
          button_list: safeArray(res.button_list).reverse(),
          status_name: res.status_name,
          return_reason: res.return_reason,
          return_name: res.return_name,
          return_mobile: res.return_mobile,
          return_phone: res.return_phone,
          return_address: res.return_address,
          return_reply: res.return_reply.replace(/[\r\n]/g),
          return_money: toDecimal(res.return_money),
          order_returnno: res.order_returnno,
          status_id: res.status_id,
          voucher_images: HandlerImageArray(res.voucher_images),
          report_images: HandlerImageArray(res.report_images),
          need_return_status: res.need_return_status
        })
      }
    }, error => {
  
    })
}
const HandlerImageArray = function(parms){
    let array = []
    parms.forEach((path,index)=>{
      array.push('https://c1.yaofangwang.net'+path)
    })
    return array
}
  
const RequestReturnGoodsDetailData = function(that) {
    orderApi.getReturnGoodsInfo(that.state.orderNo).then(res => {
      if (isNotEmpty(res)) {
        res.forEach((item, index) => {
          if (isNotEmpty(item.short_title)) {
            item.medicine_name = item.name + '(' + item.standard + ')' + '-' + item.short_title
          } else {
            item.medicine_name = item.name + '(' + item.standard + ')'
          }
          item.price = toDecimal(item.price)
        })
      }
      if (isNotEmpty(res)) {
        that.setState({
          goodsList: res
        })
      }
    }, error => {
  
    })
}
class YFWDetailsOfRefund extends Component {

    config = {
        navigationBarTitleText: '退货单详情',
        navigationBarBackgroundColor: '#49ddb8',
        navigationBarTextStyle: 'white'
    }

    constructor (props) {
        super (props)
        this.state = {
            orderNo: "",
            button_list: [],
            status_name: '',
            return_reason: '',
            return_name: '',
            return_mobile: '',
            return_phone: '',
            return_address: '',
            return_reply: '',
            return_money: '',
            order_returnno: '',
            status_id: '',
            voucher_images: [],
            report_images: [],
            goodsList: [],
            order_total:'',
            need_return_status:'',
            packaging_total:'',
            shipping_total:'',

        }
    }
    componentWillMount () {
        let options = this.$router.params
        let screenData = JSON.parse(options.params);
        this.state.orderNo = screenData.order_no;
        this.state.order_total = screenData.order_total
        this.state.packaging_total = screenData.packaging_total
        this.state.shipping_total = screenData.shipping_total
        RequstReturnInfo(this)
        RequestReturnGoodsDetailData(this)
     
    }
    componentDidShow () {
        RequstReturnInfo(this)
        RequestReturnGoodsDetailData(this)
    }

    showBigPIC (e) {
        let src = e.currentTarget.dataset.item
        Taro.previewImage({
          current: src,
          urls: e.currentTarget.dataset.type == "voucher" ? this.state.voucher_images : this.state.report_images
        })
    }

    onButtonClick (e) {
        let type = e.currentTarget.dataset.type
        switch (type) {
          case 'updateReturnGoods': //更改退货/款
            pushNavigation('get_choose_return_type', {
              orderNo: this.state.orderNo,
              order_total: this.state.order_total,
              packaging_total: this.state.packaging_total,
              shipping_total: this.state.shipping_total,
              status:'returnType'})
            break
          case 'orderReturnSend': //发出退货
            pushNavigation('get_send_return_goods',{
              order_no: this.state.orderNo,
              type:'orderReturnSend'
            })
            break
          case 'orderReturnSendUpdate': //修改单号
            pushNavigation('get_send_return_goods', {
              order_no: this.state.orderNo,
              type:'orderReturnSendUpdate'
            })
            break
          case 'cancelReturnGoods': // 取消退货/款
           this.promptBoxModal && this.promptBoxModal.showView("取消退货/款后，将无法再次发起")
            break
        }
    }

    onBaseModalRightButtonClick =()=> {
        orderApi.cancelRefundGoods(this.state.orderNo).then(res=>{
          WxNotificationCenter.postNotificationName('refreshScreen', "refreshAll")
        //   this.applayReturnModal.closeView()
          Taro.navigateBack()
        })
    }
    render() {
        const {
          order_returnno,
          need_return_status,
          return_reason,
          return_reply,
          voucher_images,
          report_images,
          return_name,
          return_mobile,
          return_address,
          goodsList,
          return_money,
          button_list
        } = this.state
        return (
          <Block>
            <View className="topLayout"></View>
            <View className="topOrderInfoLayout">
              <View className="itemLayout">
                <View className="type">退货单号：</View>
                <View className="value">{order_returnno}</View>
              </View>
              <View className="itemLayout">
                <View className="type">退货类型：</View>
                <View className="value">{need_return_status}</View>
              </View>
              <View className="itemLayout">
                <View className="type">申请理由：</View>
                <View className="value">{return_reason}</View>
              </View>
              {return_reply.length > 0 && (
                <View className="itemLayout">
                  <View className="type">商家回复：</View>
                  <View className="value">{return_reply}</View>
                </View>
              )}
            </View>
            {voucher_images.length > 0 && (
              <View className="voucherImageLayout">
                <View className="title">
                  <View className="text">举证图片</View>
                  <View className="bottom"></View>
                </View>
                <View className="imageParent">
                  {voucher_images.map((item, idx) => {
                    return (
                      <Block>
                        <Image
                          className="images"
                          src={item}
                          style={'margin-left:' + (idx == 0 ? 0 : 30) + 'rpx'}
                          onClick={this.showBigPIC}
                          data-item={item}
                          data-type="voucher"
                        ></Image>
                      </Block>
                    )
                  })}
                </View>
              </View>
            )}
            {report_images.length > 0 && (
              <View className="voucherImageLayout">
                <View className="title">
                  <View className="text">检验报告</View>
                  <View className="bottom"></View>
                </View>
                <View className="imageParent">
                  {report_images.map((item, idx) => {
                    return (
                      <Block>
                        <Image
                          className="images"
                          src={item}
                          style={'margin-left:' + (idx == 0 ? 0 : 30) + 'rpx'}
                          onClick={this.showBigPIC}
                          data-item={item}
                          data-type="report"
                        ></Image>
                      </Block>
                    )
                  })}
                </View>
              </View>
            )}
            {return_name.length > 0 && (
              <View className="addressInfoLayout">
                <View className="nameAndPhone">
                  <View>{return_name}</View>
                  <View style="margin-left:30rpx">{return_mobile}</View>
                </View>
                <View className="address">
                  <View>退货地址:</View>
                  <View style="margin-left:30rpx">{return_address}</View>
                </View>
              </View>
            )}
            {goodsList.length > 0 && (
              <View className="returnGoodsListLayout">
                <View className="title">
                  <View className="text">退货商品及数量</View>
                  <View className="bottom" style="width:220rpx"></View>
                </View>
                <View className="goodsList">
                  {goodsList.map((item, idx) => {
                    return (
                      <Block>
                        <View className="goodsListItem">
                          <Image
                            className="goodsImage"
                            src={item.image + '_300x300.jpg'}
                          ></Image>
                          <View className="goodsInfoText">
                            <View className="top">
                              <View className="medicien_name">
                                {(item.dict_medicine_type == 1 ||
                                  item.dict_medicine_type == 3) && (
                                  <Image
                                    src={require('../../../../images/ic_drug_track_label.png')}
                                    className="medicine_type_icon"
                                  ></Image>
                                )}
                                {item.dict_medicine_type == 2 && (
                                  <Image
                                    src={require('../../../../images/ic_drug_track_label.png')}
                                    className="medicine_type_icon"
                                  ></Image>
                                )}
                                {item.dict_medicine_type == 0 && (
                                  <Image
                                    src={require('../../../../images/ic_OTC.png')}
                                    className="medicine_type_icon"
                                  ></Image>
                                )}
                                {item.medicine_name}
                              </View>
                              <View style="flex:1"></View>
                              <Text className="smallPrice">
                                ¥
                                <Text className="Goodsprice">
                                  {sublie(item.price) + '.'}
                                </Text>
                                <Text className="smallPrice">
                                  {subAfter(item.price)}
                                </Text>
                              </Text>
                            </View>
                            <View className="bottom">
                              <View className="qty">{item.quantity}</View>
                              <View className="tips">退货数量:</View>
                            </View>
                          </View>
                        </View>
                      </Block>
                    )
                  })}
                </View>
              </View>
            )}
            <View className="returnMoneyLayout">
              <View className="tips">退款金额:</View>
              <View className="money">{'￥' + return_money}</View>
            </View>
            <View className="buttonsLayout">
              {button_list.map((item, idx) => {
                return (
                  <Block>
                    <View
                      className={
                        item.value == 'updateReturnGoods' ||
                        item.value == 'orderReturnSend' ||
                        item.value == 'orderReturnSendUpdate'
                          ? 'buttonLight'
                          : 'buttonDark'
                      }
                      onClick={this.onButtonClick}
                      data-type={item.value}
                    >
                      {item.name}
                    </View>
                  </Block>
                )
              })}
            </View>
            <View className="fillBottomView"></View>
            <PromptBox ref={this.refsPromptBoxModal} onTest={this.onBaseModalRightButtonClick}/>
          </Block>
        )
    }
    refsPromptBoxModal = (modal) => this.promptBoxModal = modal
}

export default YFWDetailsOfRefund