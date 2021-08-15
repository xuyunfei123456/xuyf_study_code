import { Block, View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { UserCenterApi } from '../../../../apis/index.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { isNotEmpty, safe } from '../../../../utils/YFWPublicFunction.js'
import './YFWMyComplaint.scss'
const userCenterApi = new UserCenterApi()

export default class YFWMyComplaint extends Taro.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataArray: [],
            pageIndex: 1,
            loading: false,
            showFoot: 0,
            isCancelComplain: false
        }
    }

    componentWillMount() {
        this.requsetData()
    }

    componentDidShow() {
        this.requsetData()
    }

    onPullDownRefresh = () => {
        this.setState({
            showFoot: 0,
            pageIndex: 1
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

    /**获取投诉信息 */
    requsetData = () => {
        this.setState({
            loading: true
        })
        userCenterApi.getMyComplaints(this.state.pageIndex).then(
            res => {
                Taro.stopPullDownRefresh()
                let dataArray
                let showFoot = 0
                if (isNotEmpty(res.dataList) && res.dataList.length == 0) {
                    showFoot = 1
                }
                if (this.state.pageIndex > 0  && res.dataList!=null ) {
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

    /**跳转投诉详情 */
    clickCompBtn = e => {
        let item = e.currentTarget.dataset.item
        this.jumpDetail(item)
    }

    jumpDetail = item => {
        pushNavigation('get_complaint_Details', {
            order_no: item.orderno
        })
    }

    config = {
        navigationBarTitleText: '我的投诉',
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
                        <Text>暂无投诉</Text>
                    </View>) : (<View className="list">
                        {dataArray.map((item, index) => {
                            return (
                                <Block key="key">
                                    <View
                                        className="item"
                                        onClick={this.clickCompBtn}
                                        data-item={item}>
                                        <View className="view-item">
                                            <View className="view-order">
                                                <Text className="text-order">订单:</Text>
                                                <Text className="text-orderNum">{item.orderno}</Text>
                                                <Text
                                                    className={
                                                        (item.dict_complaints_status == '0'
                                                            ? 'text-yellow'
                                                            : item.dict_complaints_status == '1'
                                                                ? 'text-bule'
                                                                : item.dict_complaints_status == '3'
                                                                    ? 'text-bule'
                                                                    : 'text-stateother')}>
                                                    {item.dict_complaints_status_name}
                                                </Text>
                                            </View>
                                            <View className="view-complant">
                                                <Text>投诉:</Text>
                                                <Text className="text-orderNum">{item.title}</Text>
                                            </View>
                                            <View className="view-content">
                                                <Text className="date-text">内容:</Text>
                                                <Text className="text-orderNum">{item.content}</Text>
                                                <Image
                                                    style="width:28rpx;height:28rpx"
                                                    className="to-jump"
                                                    src={require('../../../../images/icon_arrow_right_gary.png')}
                                                ></Image>
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
                            ) : (<Text className="text"></Text>)}
                        </View>
                    </View>
                    )}
            </View>
        )
    }
}