import Taro, { Component } from '@tarojs/taro'
import { Block, View, Image, Textarea } from '@tarojs/components'
import {
    OrderApi,
    UploadImageApi
} from '../../../../apis/index.js'
const orderApi = new OrderApi()
const uploadImageApi = new UploadImageApi()
import {
    isEmpty,
    isNotEmpty
} from '../../../../utils/YFWPublicFunction.js'
import './YFWComplaintOrder.scss'
const ChooseImage = function(that) {
    let sourceType = process.env.TARO_ENV=='tt' ? ['album'] : ['album', 'camera'] 
    Taro.chooseImage({
      sizeType: ['compressed'],
      sourceType: sourceType,
      count:3-that.state.postPicArray.length,
      success: function(res) {
        if(process.env.TARO_ENV =='alipay'){
          let tempFiles =res.apFilePaths
          tempFiles.forEach((item, index) => {
            uploadImageApi.upload(item).then(file => {
              that.state.postSucMap.set(item, file)
            })
          })
          tempFiles.forEach((item,index)=>{
            that.state.postPicArray.push(item)
          })
          that.setState({
            postPicArray: that.state.postPicArray
          })
        }else{
          res.tempFiles.forEach((item, index) => {
            uploadImageApi.upload(item.path).then(file => {
              that.state.postSucMap.set(item.path, file)
            })
          })
          res.tempFiles.forEach((item,index)=>{
            that.state.postPicArray.push(item.path)
          })
          that.setState({
            postPicArray: that.state.postPicArray
          })
        }
        
      },
    })
}
class YFWComplaintOrder extends Component {

    config = {
        navigationBarTitleText: '我要投诉',
        navigationBarBackgroundColor: '#49ddb8',
        navigationBarTextStyle: 'white'
    }
    constructor (props) {
        super (props)
        this.state = {
            orderNo: '',
            shopTitle: '',
            complaintType: ['商家服务问题', '商品质量问题'],
            checkedIndex: 0,
            inputText: '',
            postPicArray: [],
            postSucMap: '',
            position:-1
        }
    }

    componentWillMount () { 
        let options = this.$router.params
        let screenData = JSON.parse(options.params);
        this.state.position = screenData.position
        this.setState({
            orderNo: screenData.order_no,
            shopTitle: screenData.shop_title
        })
        this.repeatTime = 0
        this.state.postSucMap = new Map()
    }

    showBigPic (e) {
        let src = e.currentTarget.dataset.item
        Taro.previewImage({
          current: src, 
          urls: this.state.postPicArray 
        })
    }
    chooseReason (e) {
        this.setState({
          checkedIndex: e.currentTarget.dataset.index,
        })
    }
    onTextInput (text) {
        let input = text.detail.value;
        this.state.inputText = input
    }
    postComplaint () {
        if (isEmpty(this.state.inputText)) {
          Taro.showToast({
            title: '请输入您的描述',
            icon: 'none'
          })
          return
        }
        Taro.showLoading({
          title: '提交中...',
        })
        let uploadSuccessArray = this.letLocalMapToArray()
        if (this.state.postPicArray.length == uploadSuccessArray.length) {
          this.postiInfo()
        } else {
          this.repeatTime = 0
          this.postPic()
        }
    }
    getPostImage () {
        let localArray = []
        this.state.postSucMap.forEach(function (value, key, map) {
          localArray.push(value)
        });
        return localArray
      }
    choosePic () {
        let that = this
        ChooseImage(that)
    }
    deletePic (e) {
        let index = e.currentTarget.dataset.index;
        if (isNotEmpty(this.state.postSucMap.get(this.state.postPicArray[index]))) {
          this.state.postSucMap.delete(this.state.postPicArray[index])
        }
        this.state.postPicArray.splice(index, 1)
        this.setState({
          postPicArray: this.state.postPicArray
        })
    }
    letLocalMapToArray () {
        let localArray = []
        this.state.postSucMap.forEach(function(value, key, map) {
          localArray.push(key)
        });
        return localArray
    }

    postPic () {
        if (this.repeatTime >= 3) {
          Taro.showToast({
            title: '上传失败，请稍后重试',
            icon: 'none'
          })
        } else {
          let uploadSuccessArray = this.letLocalMapToArray()
          let uploadFailureArray = this.state.postPicArray.concat(uploadSuccessArray).filter(function(v, i, arr) {
            return arr.indexOf(v) === arr.lastIndexOf(v);
          });
          if (uploadFailureArray.length == 0){
            this.postiInfo()
          }
          uploadFailureArray.forEach((item, index) => {
            uploadImageApi.upload(item).then(res => {
              console.log(res,'cxcx')
              if (index == uploadFailureArray.length - 1) {
                this.state.postSucMap.set(item, res)
                this.repeatTime++;
                this.postPic()
              }
            }, error => {
              if (index == uploadFailureArray.length - 1) {
                this.repeatTime++;
                this.postPic()
              }
            })
          })
        }
    }
    postiInfo () {
        let type = this.state.checkedIndex == 0 ? '1' : '2'
        let postImageArray = this.getPostImage()
        orderApi.complaintsToTheBusinessman(this.state.orderNo, type, this.state.inputText, postImageArray).then(res => {
          Taro.hideLoading()
          Taro.showToast({
            title: '提交成功',
            icon: 'none'
          })
          Taro.navigateBack()
        }, error => {
            Taro.hideLoading()
            if (isNotEmpty(error.msg)) {
                Taro.showToast({
                    title: error.msg,
                    icon: 'none'
                })
            }
        })
    }
    componentDidMount () { }

    render() {
        const {
          orderNo,
          shopTitle,
          complaintType,
          checkedIndex,
          postPicArray
        } = this.state
        return (
          <Block>
            <View className="topLayout"></View>
            <View className="topOrderInfoLayout">
              <View className="orderNumLayout">
                <View className="type">订单号：</View>
                <View>{orderNo}</View>
              </View>
              <View className="orderShopLayout">
                <View className="type">投诉商家：</View>
                <View>{shopTitle}</View>
              </View>
            </View>
            <View className="chooseComplaintReason">
              <View className="reasonTitle">
                <View className="reasonTitleText">投诉类型</View>
                <View className="reasonBottom"></View>
              </View>
              <View className="complaintType">
                {complaintType.map((item, idx) => {
                  return (
                    <Block>
                      <View
                        className="reasonItem"
                        onClick={this.chooseReason}
                        data-index={idx}
                      >
                        <View
                          className={
                            checkedIndex == idx ? 'checkedReasonText' : 'reasonText'
                          }
                        >
                          {item}
                        </View>
                        {checkedIndex == idx && (
                          <Image
                            src={require('../../../../images/check_checked.png')}
                            className="checkedIcon"
                          ></Image>
                        )}
                      </View>
                      {idx != 1 && <View className="splite"></View>}
                    </Block>
                  )
                })}
              </View>
            </View>
            <View className="complaintInputLayout">
              <View className="reasonTitle">
                <View className="reasonTitleText">投诉内容</View>
                <View className="reasonBottom"></View>
              </View>
              <Textarea
                placeholderClass="tips"
                className="inputClass"
                placeholder="在此填写您的投诉内容"
                onInput={this.onTextInput}
              ></Textarea>
              <View className="postPic">
                {postPicArray.map((item, idx) => {
                  return (
                    <Block>
                      <View className="postPicLayout">
                        <Image
                          className="addPicIcon"
                          src={item}
                          onClick={this.showBigPic}
                          data-item={item}
                          mode ='aspectFit'
                        ></Image>
                        <Image
                          className="deletPic"
                          src={require('../../../../images/ic_pic_del.png')}
                          onClick={this.deletePic}
                          data-index={idx}
                        ></Image>
                      </View>
                    </Block>
                  )
                })}
                {postPicArray.length < 3 && (
                  <Image
                    className="addPicIcon"
                    src={require('../../../../images/upload_photo2.png')}
                    onClick={this.choosePic}
                  ></Image>
                )}
              </View>
            </View>
            <View className="postButton" onClick={this.postComplaint}>
              <View className="text">提交</View>
            </View>
            <View className="fillBottom"></View>
          </Block>
        )
      }
}

export default YFWComplaintOrder