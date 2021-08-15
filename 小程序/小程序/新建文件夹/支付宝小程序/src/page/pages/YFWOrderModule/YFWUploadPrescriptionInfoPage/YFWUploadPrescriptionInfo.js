import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { OrderApi, UploadImageApi} from '../../../../apis/index.js'
import './YFWUploadPrescriptionInfo.scss'
const orderApi = new OrderApi()
const uploadImageApi = new UploadImageApi()
const WxNotificationCenter = require("../../../../utils/WxNotificationCenter.js")

class YFWUploadPrescriptionInfo extends Component {

    config = {
        navigationBarTitleText: '处方提交'
    }

    constructor (props) {
        super (props)
        this.state = {
            dataInfo:{},
            imagePath:null,
            position:-1
        }
    }
    componentWillMount () { 
        let options = this.$router.params
        let orderID = JSON.parse(options.params).orderID
        this.state.position = JSON.parse(options.params).position
        orderApi.getUploadRXInfo(orderID).then((result)=>{
            console.log(result)
            this.setState({
                dataInfo:result
            })
        }).then((error)=>{

        })
    }

    uploadImageAction () {
        console.log('up')
        let that = this
        let sourceType = process.env.TARO_ENV=='tt' ? ['album'] : ['album', 'camera'] 
        Taro.chooseImage({
          count:1,
          sizeType: ['compressed'],
          sourceType: sourceType,
          success: function(res) {
            let path = res.tempFilePaths[0]
            that.setState({
              imagePath:path
            })
          },
        })
    }
    delectImageAction () {
        console.log('dele')
        this.setState({
          imagePath:null
        })
    }
    commitAction () {
        if(!this.state.imagePath){
          Taro.showToast({
            title: '请上传处方图片!',
            icon:'none',
          })
          return
        }
        Taro.showLoading({
          title: '加载中...',
        })
        uploadImageApi.upload(this.state.imagePath).then((path)=>{
          this.uploadInfo(path)
        }).then((error)=>{
          Taro.hideLoading()
          if(!error){
            Taro.showToast({
              title: '请上传正确的处方图片!',
              icon:'none',
            })
          }
        })
    
    }

    uploadInfo (imageUrl) {
        orderApi.uploadRXInfo(this.state.dataInfo.orderno,imageUrl).then((result)=>{
          Taro.hideLoading()
          if(result){
            if(this.state.position != -1){
              WxNotificationCenter.postNotificationName('refreshScreen', "refreshAll")
            }
            Taro.navigateBack({})
          }
        }).catch((error)=>{
          Taro.hideLoading()
          if (error) {
            Taro.showToast({
              title: error.msg?error.msg:'操作失败',
              icon:'none',
            })
          }
        })
    }
    componentDidMount () { }

    render() {
        const { dataInfo, imagePath } = this.state
        return (
          <Block>
            <View className="top_tip">{dataInfo.prompt_info}</View>
            <View className="container">
              <View className="content">
                商家:<View className="shop_name">{dataInfo.title}</View>
              </View>
              <View className="line"></View>
              <View className="content">
                订单:<Text className="gray">{dataInfo.orderno}</Text>
              </View>
              <View className="line"></View>
              <View className="drug_container">
                {dataInfo.medicine_list.map((item, index) => {
                  return (
                    <Block>
                      <View className="drug_content">
                        <View className="drug_content_left">{item.goods_name}</View>
                        <View className="drug_content_right">{'x' + item.qty}</View>
                      </View>
                    </Block>
                  )
                })}
              </View>
            </View>
            <View className="container">
              <View className="upload_title">上传处方照片</View>
              <View className="upload_image">
                {!imagePath ? (
                  <Image
                    onClick={this.uploadImageAction}
                    className="upload_image"
                    src={require('../../../../images/upRx_photo.png')}
                  ></Image>
                ) : (
                  <Image className="upload_image" src={imagePath} mode ='aspectFit'></Image>
                )}
                {imagePath && (
                  <Image
                    onClick={this.delectImageAction}
                    className="upload_delect"
                    src={require('../../../../images/search_del.png')}
                  ></Image>
                )}
              </View>
            </View>
            <View onClick={this.commitAction} className="btnBtom">
              <View className="address-add">提交</View>
            </View>
          </Block>
        )
      }
}

export default YFWUploadPrescriptionInfo