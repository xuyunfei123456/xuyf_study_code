import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import {OrderApi} from '../../../../apis/index.js'
const orderApi = new OrderApi()
import {isNotEmpty,isEmpty} from '../../../../utils/YFWPublicFunction.js'
import PromptBox from '../../../../components/YFWPromptBoxModal/YFWPromptBoxModal'
import './YFWSendReturnGoods.scss'
class YFWSendReturnGoods extends Component {

    config = {
        navigationBarTextStyle: 'white',
        navigationBarTitleText: '寄回商品',
        navigationBarBackgroundColor: '#49ddb8',
        enablePullDownRefresh: false
    }

    constructor (props) {
        super (props)
        this.state = {
            orderNo:'',
            returnType:'orderReturnSend',
            trafficName:'',
            trafficNum:''
        }
    }
    componentWillMount () { 
        let options = this.$router.params
        let screenData = JSON.parse(options.params)
        let type = screenData.type
        this.state.orderNo = screenData.order_no
        this.setState({
            returnType:type
        })
        if (type == 'orderReturnSend'){
        Taro.setNavigationBarTitle({
            title: '寄回商品',
        })
        }else{
        Taro.setNavigationBarTitle({
            title: '变更退货信息',
        })
        }
        // this.cimfirmModel = this.selectComponent("#cimfirmModel");
    }

    onLogisticsNumberInput (e){
        this.state.trafficNum = e.detail.value

    }

    onLogisticsCompanyInput (e) {
        this.state.trafficName = e.detail.value
    }
    post () {
        if(isEmpty(this.state.trafficName)){
          Taro.showToast({
            title: '发货物流不能为空',
            icon:'none'
          })
          return
        }
        if(isEmpty(this.state.trafficNum)){
          Taro.showToast({
            title: '寄回物流单号不能为空',
            icon:'none'
          })
          return
        }
        Taro.showLoading({
          title: '提交中',
        })
        orderApi.submitRefundGoodsTrafficInfo(this.state.orderNo, this.state.trafficName,this.state.trafficNum).then(res=>{
          Taro.hideLoading()
          let promptOrderModal = this.promptOrderModal.$component?this.promptOrderModal.$component:this.promptOrderModal
          this.promptOrderModal&&this.promptOrderModal.showView(this.state.returnType == 'orderReturnSend' ? '录入成功，商家确认收货后将\n为您操作退款，请耐心等待。' :'更新成功，商家确认收货后将\n为您操作退款，请耐心等待')
        //   this.cimfirmModel.showView(this.state.returnType == 'orderReturnSend' ? '录入成功，商家确认收货后将\n为您操作退款，请耐心等待。' :'更新成功，商家确认收货后将\n为您操作退款，请耐心等待')
        },error=>{
          Taro.hideLoading()
        })
    }
    rightButtonClick () {
        Taro.navigateBack()
    }
    componentDidMount () { }

    render() {
        const { returnType } = this.state
        return (
          <Block>
            <View className="topWarning">
              <Text className="warningText">
                {returnType == 'orderReturnSend'
                  ? '请填写真实的退货信息'
                  : '商家已同意您的退货申请，请在7个工作日内退回商品'}
              </Text>
            </View>
            <View className="logisticsCompany">
              <View className="tips">发货物流</View>
              <Input
                className="logisticsCompanyInput"
                placeholderClass="logisticsCompanyInputHolder"
                placeholder="请填写物流名称"
                focus={true}
                confirmType="done"
                onInput={this.onLogisticsCompanyInput}
              ></Input>
            </View>
            <View className="logisticsNumber">
              <Input
                className="logisticsNumberInput"
                placeholderClass="logisticsNumberInputHolder"
                placeholder="请填写寄回的物流单号"
                confirmType="done"
                onInput={this.onLogisticsNumberInput}
              ></Input>
            </View>
            <View className="postButton" onClick={this.post}>
              <View className="text">提交</View>
            </View>
            <PromptBox ref={this.refPromptOrder} onTest={this.rightButtonClick} needLeftButton={false}/>
          </Block>
        )
    }

    refPromptOrder = (modal) => this.promptOrderModal = modal
}

export default YFWSendReturnGoods