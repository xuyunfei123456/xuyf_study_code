import Taro, { Component } from '@tarojs/taro'
import {
    pushNavigation
} from '../../../../apis/YFWRouting.js'
import {
    OrderApi,
    UploadImageApi
} from '../../../../apis/index.js'
const orderApi = new OrderApi()
const uploadImageApi = new UploadImageApi()

import {
    isNotEmpty,
    isEmpty,
    strMapToObj,
    toDecimal,
    sublie,
    subAfter
} from '../../../../utils/YFWPublicFunction.js'
import './YFWEditeReturnPage.scss'
import { Block, View, Text, Image, RichText, Input  } from '@tarojs/components'
const HandlerReturnGoodsInfo = function(that, orderNo) {
    orderApi.getRefundGoodsInfo(orderNo).then(res => {
      res.forEach((item, index) => {
        let showEditeBox = false
        if (parseInt(item.quantity) > 1) {
          showEditeBox = true
        }
        item.checked = true
        item.showEditeBox = showEditeBox
        item.defaultReturnQty = item.quantity,
          item.price =toDecimal(item.price)
      })
      that.setState({
        goodsList: res
      })
    })
  }
  
  const HandlerReturnGoodsReasonType = function(that, orderNo) {
    orderApi.getRefundGoodsReasonType(orderNo).then(res => {
      let data = [];
      if (isNotEmpty(res)) {
        data.push(res.a)
        data.push(res.b)
        data.push(res.d)
        that.setState({
          reasonType: data
        })
        HandlerReturnGoodsReason(that, orderNo, data[0])
      }
    })
  }
  
const HandlerReturnGoodsReason = function(that, orderNo, reason) {
    orderApi.getRefundGoodsReason(orderNo, reason).then(res => {
      that.setState({
        reasonList: res,
        reasonListLength: res.length,
        needRenderVoucher: res[0].is_upload_img,
        needRenderReport: res[0].is_show_upload_img_report,
        promptinfo: res[0].promptinfo,
        prompt_info_report: res[0].prompt_info_report
      })
    })
}
  
const ChooseImage = function(that, froms) {
    let sourceType = process.env.TARO_ENV=='tt' ? ['album'] : ['album', 'camera'] 
    Taro.chooseImage({
      count: froms == 'Voucher' ? 3 - that.state.voucherImageArray.length : 3 - that.state.reportImageArray.length,
      sizeType: ['compressed'],
      sourceType: sourceType,
      success: function(res) {
        if(process.env.TARO_ENV == 'alipay'){
          let tempFiles =res.apFilePaths
          tempFiles.forEach((item,index)=>{
            uploadImageApi.upload(item).then(path => {
              if (froms == 'Voucher') {
                that.state.voucherImgSucMap.set(item, path)
              } else {
                that.state.reportImgSucMap.set(item, path)
              }
            })
          })
          if (froms == 'Voucher') {
            tempFiles.forEach((item,index)=>{
              that.state.voucherImageArray.push(item)
            })
            that.setState({
              voucherImageArray: that.state.voucherImageArray
            })
          } else {
            tempFiles.forEach((item, index) => {
              that.state.reportImageArray.push(item)
            })
            that.setState({
              reportImageArray: that.state.reportImageArray
            })
          }
        }else{
          res.tempFiles.forEach((item,index)=>{
            uploadImageApi.upload(item.path).then(path => {
              if (froms == 'Voucher') {
                that.state.voucherImgSucMap.set(item.path, path)
              } else {
                that.state.reportImgSucMap.set(item.path, path)
              }
            })
          })
          if (froms == 'Voucher') {
            res.tempFiles.forEach((item,index)=>{
              that.state.voucherImageArray.push(item.path)
            })
            that.setState({
              voucherImageArray: that.state.voucherImageArray
            })
          } else {
            res.tempFiles.forEach((item, index) => {
              that.state.reportImageArray.push(item.path)
            })
            that.setState({
              reportImageArray: that.state.reportImageArray
            })
          }
        }
        
      },
    })
}
class YFWEditeReturnPage extends Component {

    config = {
        navigationBarTitleText: '申请退货/款',
        navigationBarBackgroundColor: '#49ddb8',
        navigationBarTextStyle: 'white'
    }

    constructor (props) {
        super (props)
        this.state = {
            returnType: '',
            orderNo: '',
            goodsList: [],
            reasonType: [],
            checkedReasonTypePosition: 0,
            reasonList: [],
            reasonListLength: 0,
            checkedReasonPosition: 0,
            needRenderVoucher: false,
            needRenderReport: false,
            order_total: '',
            package_shipping_total: '',
            voucherImageArray: [],
            reportImageArray: [],
            promptinfo: '',
            prompt_info_report: '',
            voucherImgSucMap: '',
            reportImgSucMap: '',
            otherMoney: '',
            pageFrom:'orderDetail'
        }
    }

    componentWillMount () {
        let options = this.$router.params
        let screenData = JSON.parse(options.params);
        this.state.orderNo = screenData.orderNo;
        let package_total = isNotEmpty(screenData.packaging_total) ? parseFloat(screenData.packaging_total) : 0
        let shipping_total = isNotEmpty(screenData.shipping_total) ? parseFloat(screenData.shipping_total) : 0
        let package_shipping_total = package_total + shipping_total
        this.setState({
            returnType: screenData.type,
            order_total: screenData.order_total,
            package_shipping_total: toDecimal(package_shipping_total)
        })
        this.promptBoxModal
        this.state.voucherImgSucMap = new Map()
        this.state.reportImgSucMap = new Map()
        HandlerReturnGoodsInfo(this, this.state.orderNo)
        HandlerReturnGoodsReasonType(this, this.state.orderNo)
    }

    componentDidMount () { }

    showBigPic (e) {
        let src = e.currentTarget.dataset.item
        Taro.previewImage({
          current: src,
          urls: e.currentTarget.dataset.type == "voucher" ? this.state.voucherImageArray : this.state.reportImageArray
        })
    }

    postApplyReturnInfo () {
        if (isEmpty(this.state.otherMoney)) {
          Taro.showToast({
            title: '请填写退款金额',
            icon: 'none'
          })
          return
        }
        if (parseFloat(this.state.otherMoney) > parseFloat(this.state.order_total)) {
          Taro.showToast({
            title: '金额不能超过可退款金额',
            icon: 'none'
          })
          return
        }
    
        if (this.state.needRenderVoucher && this.state.voucherImageArray.length==0){
          Taro.showToast({
            title: '请上传凭证图片',
            icon: 'none'
          })
          return
        }
    
        if (this.state.needRenderReport && this.state.reportImageArray.length == 0){
          Taro.showToast({
            title: '请上检验报告',
            icon: 'none'
          })
          return
        }
    
        if (this.state.returnType == "returnGoods" && !this.checkGoods()){
          Taro.showToast({
            title: '请选择要退的商品',
            icon: 'none'
          })
          return
        }
        this.requstTorefundGoods()
    }

    getOrderInfo () {
        let info = new Map();
        for (let i = 0; i < this.state.goodsList.length; i++) {
          if (this.state.goodsList[i].checked){
            let order_medicineno = this.state.goodsList[i].order_medicineno;
            let quantity = this.state.goodsList[i].quantity;
            info.set(order_medicineno, quantity);
          }
        }
        return info
    }

    checkGoods () {
        let goodsCkecked = false
        for (let i = 0; i < this.state.goodsList.length; i++) {
          if (this.state.goodsList[i].checked) {
           goodsCkecked = true
          }
        }
        return goodsCkecked
    }

    requstTorefundGoods () {
        this.repotVoucherTime = 0
        this.repotRepeatTime = 0
        let reportSucArray = this.letLocalMapToArray(this.state.reportImgSucMap,'value');
        let voucherSucArray = this.letLocalMapToArray(this.state.voucherImgSucMap,'value')
        if (reportSucArray.length == this.state.reportImageArray.length && voucherSucArray.length == this.state.voucherImageArray.length) {
          let postVoucherArray = []
          if (voucherSucArray.length > 0 ) {
            postVoucherArray = voucherSucArray
          }
          let postReportArray = []
          if (reportSucArray.length > 0 && this.state.needRenderReport) {
            postReportArray = reportSucArray
          }
          let orderInfo = ''
          if (this.state.returnType == "returnGoods") {
            orderInfo = this.getOrderInfo()
          }
          if(isNotEmpty(orderInfo)){
            orderInfo = strMapToObj(orderInfo)
          }
          Taro.showLoading({
            title: '提交中...',
          })
          orderApi.applyForRefundGoods(this.state.orderNo, this.state.reasonList[this.state.checkedReasonPosition].reason, orderInfo, postVoucherArray, postReportArray, this.state.otherMoney).then(res => {
            Taro.hideLoading()
            let params = {
              title: '申请退货/款',
              tips: '您的申请已经提交，请等待商家确认',
              orderNo: this.state.orderNo,
              pageFrom: this.state.pageFrom
            }
            // params = JSON.stringify(params)
            pushNavigation('get_check_order_status',params,'redirect')
          },error=>{
            Taro.hideLoading()
            Taro.showToast({
              title: error.msg,
              icon:'none'
            })
          })
        } else {
          this.postVoucher()
        }
    }

    postRepot (){
        if (this.repotRepeatTime >= 3) {
          Taro.showToast({
            title: '上传失败，请稍后重试',
            icon: 'none'
          })
        } else {
          let uploadSuccessArray = this.letLocalMapToArray(this.state.reportImgSucMap, 'key')
          let uploadFailureArray = this.state.reportImageArray.concat(uploadSuccessArray).filter(function (v, i, arr) {
            return arr.indexOf(v) === arr.lastIndexOf(v);
          });
          if (uploadFailureArray.length == 0) {
            this.requstTorefundGoods()
          }
          uploadFailureArray.forEach((item, index) => {
            uploadImageApi.upload(item).then(res => {
              this.state.reportImgSucMap.set(item, res)
              if (index == uploadFailureArray.length - 1) {
                this.repotRepeatTime++;
                this.postRepot()
              }
            }, error => {
              if (index == uploadFailureArray.length - 1) {
                this.repotRepeatTime++;
                this.postPic()
              }
            })
          })
        }
    }

    postVoucher () {
        if (this.repotVoucherTime >= 3) {
          Taro.showToast({
            title: '上传失败，请稍后重试',
            icon: 'none'
          })
        } else {
          let uploadSuccessArray = this.letLocalMapToArray(this.state.voucherImgSucMap, 'key')
          let uploadFailureArray = this.state.voucherImageArray.concat(uploadSuccessArray).filter(function (v, i, arr) {
            return arr.indexOf(v) === arr.lastIndexOf(v);
          });
          if (uploadFailureArray.length == 0) {
            if (this.state.needRenderReport) {
              this.postRepot()
            }else{
              this.requstTorefundGoods()
            }
          }
          uploadFailureArray.forEach((item, index) => {
            uploadImageApi.upload(item).then(res => {
              this.state.reportImgSucMap.set(item, res)
              if (index == uploadFailureArray.length - 1) {
                this.repotVoucherTime++;
                this.postVoucher()
              }
            }, error => {
              if (index == uploadFailureArray.length - 1) {
                this.repotVoucherTime++;
                this.postVoucher()
              }
            })
          })
        }
    }
    letLocalMapToArray (map, type) {
        let localArray = []
        map.forEach(function(value, key, map) {
          if (type == 'key') {
            localArray.push(key)
          } else if (type == 'value') {
            localArray.push(value)
          }
        });
        return localArray
    }
    onInputChange (e) {
        let input = e.detail.value;
        // let inputMoney = input.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
        let inputMoney = input
        this.setState({
          otherMoney: inputMoney
        })
    }
    deleteReportPic (e) {
        let index = e.currentTarget.dataset.index;
        if (isNotEmpty(this.state.reportImgSucMap.get(this.state.reportImageArray[index]))) {
          this.state.reportImgSucMap.delete(this.state.reportImageArray[index])
        }
        this.state.reportImageArray.splice(index, 1)
        this.setState({
          reportImageArray: this.state.reportImageArray
        })
    }

    postReportImage () {
        let that = this
        ChooseImage(this, 'report')
    }

    deleteVoucherPic (e) {
        let index = e.currentTarget.dataset.index;
        if (isNotEmpty(this.state.voucherImgSucMap.get(this.state.voucherImageArray[index]))) {
          this.state.voucherImgSucMap.delete(this.state.voucherImageArray[index])
        }
        this.state.voucherImageArray.splice(index, 1)
        this.setState({
          voucherImageArray: this.state.voucherImageArray
        })
    }

    postVoucherImage () {
        let that = this
        ChooseImage(this, 'Voucher')
    }

    changeReasonType (parm) {
        this.setState({
          checkedReasonTypePosition: parm.currentTarget.dataset.index,
          checkedReasonPosition: 0,
          needRenderVoucher: this.state.reasonList[0].is_upload_img,
          needRenderReport: this.state.reasonList[0].is_show_upload_img_report
        })
        let reasonType = this.state.reasonType[parm.currentTarget.dataset.index]
        HandlerReturnGoodsReason(this, this.state.orderNo, reasonType)
    }

    chooseReturnReason (parm) {
        this.setState({
          checkedReasonPosition: parm.currentTarget.dataset.index,
          needRenderVoucher: this.state.reasonList[parm.currentTarget.dataset.index].is_upload_img,
          needRenderReport: this.state.reasonList[parm.currentTarget.dataset.index].is_show_upload_img_report,
          promptinfo: this.state.reasonList[parm.currentTarget.dataset.index].promptinfo,
          prompt_info_report: this.state.reasonList[parm.currentTarget.dataset.index].prompt_info_report
        })
    }

    chooseReturnGoods (e) {
        let position = e.currentTarget.dataset.index
        this.state.goodsList[position].checked = !this.state.goodsList[position].checked
        this.setState({
          goodsList: this.state.goodsList
        })
    }
    onIputTextChange (e) {
        let position = e.currentTarget.dataset.index
        let text = e.detail.value
        if (parseInt(text) <= 0) {
          text = 1
        } else if (parseInt(text) > parseInt(this.state.goodsList[position].quantity)) {
          text = this.state.goodsList[position].quantity
        } else if (isEmpty(text)) {
          text = 1
        }
        this.state.goodsList[position].defaultReturnQty = text
        this.setState({
          goodsList: this.state.goodsList
        })
    }

    subtract (e) {
        let position = e.currentTarget.dataset.index
        if (parseInt(this.state.goodsList[position].defaultReturnQty) <= 1) {
          return
        }
        this.state.goodsList[position].defaultReturnQty = parseInt(this.state.goodsList[position].defaultReturnQty) - 1;
        this.setState({
          goodsList: this.state.goodsList
        })
    }

    add (e) {
        let position = e.currentTarget.dataset.index
        if (parseInt(this.state.goodsList[position].defaultReturnQty) >= parseInt(this.state.goodsList[position].quantity)) {
          return
        }
        this.state.goodsList[position].defaultReturnQty = parseInt(this.state.goodsList[position].defaultReturnQty) + 1;
        this.setState({
          goodsList: this.state.goodsList
        })
    }
    render() {
        const {
          returnType,
          goodsList,
          reasonType,
          checkedReasonTypePosition,
          reasonList,
          checkedReasonPosition,
          reasonListLength,
          promptinfo,
          voucherImageArray,
          needRenderVoucher,
          prompt_info_report,
          reportImageArray,
          needRenderReport,
          order_total,
          package_shipping_total,
          otherMoney
        } = this.state
        return (
          <Block>
            <View className="topLayout">
              <View className="topReturnTypeLayout">
                <Text className="tips">
                  退货类型：
                  <Text className="typeValue">
                    {returnType == 'returnGoods'
                      ? '我要退货'
                      : '我要退款（无需退货）'}
                  </Text>
                </Text>
              </View>
            </View>
            <View className="returnGoodsInfo">
              <View className="title">
                <View className="text">退货商品及数量</View>
                <View className="bottom"></View>
              </View>
              <View className="goodsList">
                {goodsList.map((item, idx) => {
                  return (
                    <Block key={item.order_medicineno}>
                      <View className="goodsListItem">
                        {item.checked && (
                          <Image
                            src={require('../../../../images/chooseBtn.png')}
                            className="checkStatus"
                            mode="aspectFit"
                            onClick={this.chooseReturnGoods}
                            data-index={idx}
                          ></Image>
                        )}
                        {!item.checked && (
                          <Image
                            src={require('../../../../images/icon_unchoose.png')}
                            className="unCheckStatus"
                            mode="aspectFit"
                            onClick={this.chooseReturnGoods}
                            data-index={idx}
                          ></Image>
                        )}
                        <Image
                          src={item.image + '_300x300.jpg'}
                          className="goodsImage"
                        ></Image>
                        <View className="medicienInfoLayout">
                          <View className="top">
                            <RichText className="medicien_name">
                              {item.dict_medicine_type == 1 && (
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
                              {item.name}
                            </RichText>
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
                            {!item.showEditeBox && (
                              <View className="quantity">{item.quantity}</View>
                            )}
                            {item.showEditeBox && (
                              <View className="editeReturnQty">
                                <View
                                  className="subtract"
                                  style={
                                    'color:' +
                                    (item.defaultReturnQty > 1 ? '#333' : '#999')
                                  }
                                  onClick={this.subtract}
                                  data-index={idx}
                                >
                                  -
                                </View>
                                <View className="editeSplite"></View>
                                <Input
                                  className="numberInput"
                                  value={item.defaultReturnQty}
                                  onConfirm={this.onIputTextChange}
                                  onBlur={this.onIputTextChange}
                                  type="number"
                                  confirmType="done"
                                  data-index={idx}
                                ></Input>
                                <View className="editeSplite"></View>
                                <View
                                  className="add"
                                  style={
                                    'color:' +
                                    (item.defaultReturnQty == item.quantity
                                      ? '#999'
                                      : '#333')
                                  }
                                  onClick={this.add}
                                  data-index={idx}
                                >
                                  +
                                </View>
                              </View>
                            )}
                            {item.showEditeBox && <View>退货数量:</View>}
                            {!item.showEditeBox && <View>退货数量:</View>}
                          </View>
                        </View>
                      </View>
                    </Block>
                  )
                })}
              </View>
            </View>
            <View className="returnReason">
              <View className="returnReasonType">
                {reasonType.map((item, idx) => {
                  return (
                    <Block>
                      <View
                        className="reasonItem"
                        onClick={this.changeReasonType}
                        data-index={idx}
                      >
                        <View className="reasonTitle">
                          <View className="reasonText">{item}</View>
                          {checkedReasonTypePosition == idx && (
                            <View className="reasonBottom"></View>
                          )}
                        </View>
                      </View>
                    </Block>
                  )
                })}
              </View>
              <View className="returnDetailReason">
                {reasonList.map((item, idx) => {
                  return (
                    <Block>
                      <View
                        className="ItemLayout"
                        onClick={this.chooseReturnReason}
                        data-index={idx}
                      >
                        <View
                          className={
                            checkedReasonPosition == idx
                              ? 'checkedTips'
                              : 'unCheckedTips'
                          }
                        >
                          {item.reason}
                        </View>
                        {checkedReasonPosition == idx && (
                          <Image
                            src={require('../../../../images/chooseBtn.png')}
                            className="checkedImage"
                          ></Image>
                        )}
                      </View>
                      {idx != reasonListLength - 1 && (
                        <View className="splite"></View>
                      )}
                    </Block>
                  )
                })}
              </View>
            </View>
            {needRenderVoucher && (
              <View className="upLoadVoucher">
                <View className="title" style="margin-bottom:20rpx">
                  <View className="text">上传凭证</View>
                  <View className="bottom" style="width:130rpx;"></View>
                </View>
                <View className="tips">{promptinfo}</View>
                <View className="voucherLayout">
                  {voucherImageArray.map((item, idx) => {
                    return (
                      <Block>
                        <View className="postPicLayout">
                          <Image
                            className="uploadIcon"
                            src={item}
                            mode ='aspectFit'
                            onClick={this.showBigPic}
                            data-item={item}
                            data-type="voucher"
                          ></Image>
                          <Image
                            className="deletPic"
                            src={require('../../../../images/ic_pic_del.png')}
                            onClick={this.deleteVoucherPic}
                            data-index={idx}
                          ></Image>
                        </View>
                      </Block>
                    )
                  })}
                  {voucherImageArray.length < 3 && (
                    <Image
                      src={require('../../../../images/upload_photo2.png')}
                      className="uploadIcon"
                      onClick={this.postVoucherImage}
                    ></Image>
                  )}
                </View>
              </View>
            )}
            {needRenderReport && (
              <View className="upLoadVoucher">
                <View className="title" style="margin-bottom:20rpx">
                  <View className="text">上传检验报告</View>
                  <View className="bottom" style="width:180rpx;"></View>
                </View>
                <View className="tips">{prompt_info_report}</View>
                <View className="voucherLayout">
                  {reportImageArray.map((item, idx) => {
                    return (
                      <Block>
                        <View className="postPicLayout">
                          <Image
                            className="uploadIcon"
                            src={item}
                            onClick={this.showBigPic}
                            data-item={item}
                            data-type="report"
                          ></Image>
                          <Image
                            className="deletPic"
                            src={require('../../../../images/ic_pic_del.png')}
                            onClick={this.deleteReportPic}
                            data-index={idx}
                          ></Image>
                        </View>
                      </Block>
                    )
                  })}
                  <Image
                    src={require('../../../../images/upload_photo3.png')}
                    className="uploadIcon"
                    onClick={this.postReportImage}
                  ></Image>
                </View>
              </View>
            )}
            <View className="moneyInfo">
              <View className="top">
                <View className="tips">退款金额：</View>
                <Text className="value-normal">
                  最多<Text className="value">{order_total}</Text>元（含运费及包装费
                  <Text className="value">{package_shipping_total}</Text>元）
                </Text>
              </View>
              <View className="top" style="margin-top:40rpx;">
                <View className="tips">其他金额：</View>
                <Input
                  className="value"
                  style="color:#333333"
                  placeholder="请填写准确退款金额"
                  placeholderClass="inputHolder"
                  type="digit"
                  onInput={this.onInputChange}
                  value={otherMoney}
                ></Input>
              </View>
            </View>
            <View className="postButton" onClick={this.postApplyReturnInfo}>
              <View className="text">提交</View>
            </View>
            <View className="fillBottom"></View>
          </Block>
        )
    }
}

export default YFWEditeReturnPage