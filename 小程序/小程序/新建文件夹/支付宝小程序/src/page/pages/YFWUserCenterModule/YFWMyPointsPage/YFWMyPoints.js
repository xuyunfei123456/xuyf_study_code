import { Block, Image, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
var util = require('../../../../utils/util.js')
import { UserCenterApi } from '../../../../apis/index.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import './YFWMyPoints.scss'
const healthAskApi = new UserCenterApi()

export default class YFWMyPoints extends Taro.Component {
  constructor(props) {
    super(props)
    this.state = {
      myJF: ''
    }
  }

  componentWillMount() {
    healthAskApi.getUserPoint().then(res => {
      console.log(res, 'res')
      this.setState({
        myJF: res
      })
    })
  }

  config = {
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTitleText: '我的积分',
    navigationBarTextStyle: 'white'
  }
  rankDetail(){
    pushNavigation('rankDetail')
  }
  render() {
    const { myJF } = this.state
    return (
      <View>
        <Image
          src="https://c1.yaofangwang.net/common/images/miniapp/dingdan_bj.png"
          className="bgc"
        ></Image>
        <View className="integral">
          <View className="integral_F">当前积分</View>
          <View className="integral_S">
            <Image
              src="https://c1.yaofangwang.net/common/images/miniapp/jifen.png"
              mode="widthFix"
            ></Image>
            <View className="integral_Txt">{myJF}</View>
          </View>
        </View>
        <View className="integral explain">
          <View className="explain_txt">
            什么是商城积分<View className="under"></View>
          </View>
          <View className="explain_Del">
            商城积分是指用户在网站及客户端购物、评价、参加活动等情况下给予的奖励。在消费时，积分可直接用于抵扣订单金额，每单最高抵扣订单金额的90%
          </View>
        </View>
        <View className="rankDetail" onClick={this.rankDetail}>
          查看积分明细
        </View>
      </View>
    )
  }
}