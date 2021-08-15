import { Block, View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import { UserCenterApi } from '../../../../apis/index.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { isNotEmpty, safe } from '../../../../utils/YFWPublicFunction.js'
import Starscore from '../../../../components/YFWStar/YFWStar'
import './YFWMyEvaluation.scss'
const userCenterApi = new UserCenterApi()

export default class YFWMyEvaluation extends Taro.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataArray: [],
      pageIndex: 0,
      loading: false,
      showFoot: 0
    }
  }

  componentDidShow(){
    this.requsetData()
  }

  onPullDownRefresh = () => {
    this.setState({
      showFoot: 0,
      pageIndex: 0
    })
    this.requsetData()
  }

  onReachBottom = () => {
    if (this.state.showFoot == 1 || this.state.showFoot == 2) {
      return
    }
    let pageIndex = this.state.pageIndex + 1
    this.setState({
      showFoot: 2,
      pageIndex: pageIndex
    })
    this.requsetData()
  }

  /**获取评价列表 */
  requsetData = () => {
    this.setState({
      loading: true
    })
    userCenterApi.getMyEvaluation(this.state.pageIndex).then(
      res => {
        Taro.stopPullDownRefresh()
        let dataArray
        let showFoot = 0
        if (isNotEmpty(res.dataList) && res.dataList.length == 0) {
          showFoot = 1
        }
        if (this.state.pageIndex > 0) {
          dataArray = this.state.dataArray.concat(res.dataList)
        } else {
          dataArray = res.dataList
        }
        this.setState({
          loading: false,
          dataArray: dataArray,
          showFoot: showFoot
        })
      },
      error => {
        Taro.showToast({
          title: '获取数据失败',
          icon: 'none'
        })
        this.setState({
          loading: false
        })
      }
    )
  }

  /**跳转订单详情 */
  clickEvaBtn = e => {
    let item = e.currentTarget.dataset.item
    this.jumpDetail(item)
  }

  jumpDetail = item => {
    pushNavigation('get_order_detail', { order_no: item.orderno })
  }
  
  config = {
    navigationBarTitleText: '我的评价',
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true
  }

  render() {
    const { loading, dataArray, showFoot } = this.state
    return (
      <View>
        {!loading && (dataArray == null || dataArray.length == 0) ? (
          <View className="view-no-data">
            <Image
              className="image-no-data"
              src="https://c1.yaofangwang.net/common/images/miniapp/ic_no_message.png"
            ></Image>
            <Text>暂无评价</Text>
          </View>
        ) : (
            <View className="list">
              {dataArray.map((item, index) => {
                return (
                  <Block >
                    <View className="item">
                      <View className="view-item">
                        <View
                          className="view-order"
                          onClick={this.clickEvaBtn}
                          data-item={item}
                        >
                          <Text className="text-order">订单:</Text>
                          <Text className="text-orderNum">{item.orderno}</Text>
                          <Image
                            style="width:28rpx;height:28rpx"
                            className="to-jump"
                            src={require('../../../../images/icon_arrow_right_gary.png')}
                          ></Image>
                        </View>
                        <View className="view-business">
                          <Text>商家:</Text>
                          <Text className="text-business">{item.title}</Text>
                        </View>
                        <View className="item-item">
                          <View className="customer-servce">
                            <Text className="title_text">客户服务</Text>
                            <Starscore
                              stars={item.services_star}
                              starSize={24}
                              starSpacing={30}
                              className="stars"
                            ></Starscore>
                          </View>
                          <View className="customer-servce">
                            <Text className="title_text">发货速度</Text>
                            <Starscore
                              stars={item.send_star}
                              starSize={24}
                              starSpacing={30}
                              className="stars"
                            ></Starscore>
                          </View>
                          <View className="customer-servce">
                            <Text className="title_text">物流速度</Text>
                            <Starscore
                              stars={item.logistics_star}
                              starSize={24}
                              starSpacing={30}
                              className="stars"
                            ></Starscore>
                          </View>
                          <View className="customer-servce">
                            <Text className="title_text">商品包装</Text>
                            <Starscore
                              stars={item.package_star}
                              starSize={24}
                              starSpacing={30}
                              className="stars"
                            ></Starscore>
                          </View>
                        </View>
                        <View className="view-comment">
                          <Text className="text-comment">评价内容:</Text>
                          <Text className="context">{item.content}</Text>
                        </View>
                      </View>
                    </View>

                  </Block>
                )
              })}
              <View className="foot">
                {showFoot == 1 ? (
                  <Text className="text">没有更多了</Text>
                ) : showFoot == 2 ? (
                  <View className='loading-more'>
                    <Image
                      src={require('../../../../images/loading_cycle.gif')}
                      className="loading"
                    ></Image>
                    <View className="text">加载更多...</View>
                  </View>
                ) : (
                      <Text className="text"></Text>
                    )}
              </View>
            </View>
          )}
      </View>
    )
  }
}