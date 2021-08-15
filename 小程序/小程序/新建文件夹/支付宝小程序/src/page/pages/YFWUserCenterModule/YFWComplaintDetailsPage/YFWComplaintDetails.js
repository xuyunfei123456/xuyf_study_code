import { Block, View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { OrderApi } from '../../../../apis/index.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { isNotEmpty } from '../../../../utils/YFWPublicFunction.js'
import Canclecomplaitmodal from './Conponents/CancelCompolaintModal'
import Titleview from '../../../../components/YFWTitleView/YFWTitleView'
import './YFWComplaintDetails.scss'
const orderApi = new OrderApi()

export default class YFWComplaintDetails extends Taro.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataArray: [],
            dataProofImages: [], //举证图片
            dataReplyImages: [], //商家图片
            orderId: '',
            type: '',
            canCancel: false
        }
    }

    componentWillMount() {
        let options = this.$router.params
        let orderno = JSON.parse(options.params)
        this.state.orderId = orderno.order_no
        this.requsetData()
        // this.cancleComplaitModal = this.selectComponent('#cancleComplaitModal')
    }

    componentWillUnmount() {
        clearTimeout(this.timer)
    }

    bigProofPicture = event => {
        var src = event.currentTarget.dataset.src //获取data-src
        var imgList = event.currentTarget.dataset.list //获取data-list
        //图片预览
        Taro.previewImage({
            current: src, // 当前显示图片的http链接
            urls: imgList // 需要预览的图片http链接列表
        })
    }

    bigReplyImages = event => {
        var src = event.currentTarget.dataset.src
        var imgList = event.currentTarget.dataset.list
        Taro.previewImage({
            current: src,
            urls: imgList
        })
    }

    onCancelComplaint = () => {
        var pages = Taro.getCurrentPages()
        var prevPage = pages[pages.length - 2]
        prevPage.setState({
            isCancelComplain: true
        })
        orderApi.cancelComplaints(this.state.orderId).then(res => {
            Taro.showToast({
                title: '取消成功',
                icon: 'none',
                duration: 500
            })
            this.timer = setTimeout(function () {
                Taro.navigateBack({
                    delta: 1
                })
            }, 400)
        })
        this.requsetData()
    }

    requsetData = () => {
        orderApi.getComplaintsDetail(this.state.orderId).then(res => {
            let dataArray, type
            let introImages = []
            let replyImages = []
            dataArray = res
            console.log(dataArray)
            if (dataArray.dict_complaints_type == '1') {
                type = '商家服务问题'
            } else {
                type = '商品质量问题'
            }
            //投诉内容图片
            if (dataArray.intro_image != '') {
                for (let uri of dataArray.intro_image.split('|')) {
                    let imageUri
                    var imgUri = uri.substring(0, 1)
                    if (imgUri == '/') {
                        imageUri = 'http://c1.yaofangwang.net' + uri.trim()
                    } else if (imgUri == 'h') {
                        imageUri = uri.trim()
                    } else {
                        imageUri = 'http://c1.yaofangwang.net' + '/' + uri.trim()
                    }

                    introImages.push(imageUri)
                }
            }
            //商家解释图片
            if (dataArray.reply_image.length != '') {
                for (let uri of dataArray.reply_image.split('|')) {
                    let imageUri
                    var imgUri = uri.substring(0, 1)
                    if (imgUri == '/') {
                        imageUri = 'http://c1.yaofangwang.net' + uri.trim()
                    } else if (imgUri == 'h') {
                        imageUri = uri.trim()
                    } else {
                        imageUri = 'http://c1.yaofangwang.net' + '/' + uri.trim()
                    }
                    replyImages.push(imageUri)
                }
            }
            let canCancel = false
            if (isNotEmpty(dataArray.buttons) && dataArray.buttons.length > 0) {
                canCancel = true
            }
            this.setState({
                dataArray: dataArray,
                type: type,
                dataProofImages: introImages,
                dataReplyImages: replyImages,
                canCancel: canCancel
            })
        })
    }
    config = {
        navigationBarTitleText: '我的投诉',
        navigationBarBackgroundColor: '#49ddb8',
        navigationBarTextStyle: 'white'
    }

    render() {
        const {
            dataArray,
            type,
            dataProofImages,
            dataReplyImages,
            canCancel
        } = this.state
        return (
            <Block>
                <View>
                    <View className="list">
                        <View className="item"  data-item={item}>
                            <View className="view-item">
                                <View className="view-complant">
                                    <Text>投诉:</Text>
                                    <Text className="text-complant">{dataArray.title}</Text>
                                </View>
                                <View className="view-complant">
                                    <Text>编号:</Text>
                                    <Text className="text-complant">{dataArray.orderno}</Text>
                                </View>
                                <View className="view-complant">
                                    <Text>类型:</Text>
                                    <Text className="text-complant">{type}</Text>
                                </View>
                                <View className="view-complant">
                                    <Text>状态:</Text>
                                    <Text
                                        className={
                                            (dataArray.dict_complaints_status == '0'
                                                ? 'text-yellow'
                                                : dataArray.dict_complaints_status == '1'
                                                    ? 'text-bule'
                                                    : dataArray.dict_complaints_status == '3'
                                                        ? 'text-bule'
                                                        : 'text-stateother')
                                        }
                                    >
                                        {dataArray.dict_complaints_status_name}
                                    </Text>
                                </View>
                                <View className="view-complant">
                                    <Text>时间:</Text>
                                    <Text className="text-complant">{dataArray.create_time}</Text>
                                </View>
                                <View className="view-complant-content">
                                    <View className="title-content">
                                        <Titleview title="投诉内容:" fontWeight="700"></Titleview>
                                    </View>
                                    <Text className="text-content">{dataArray.content}</Text>
                                </View>
                                {<View
                                    className={'scroll-images'}
                                    style={dataProofImages.length == 0?{display:'none'}:{}}
                                >
                                    <View className="proof-imgs">
                                        <Titleview title="举证图片:" fontWeight="700"></Titleview>
                                    </View>
                                    <ScrollView
                                        scrollX="true"
                                        className="scrollview"
                                        scrollWithAnimation="true"
                                    >
                                        {dataProofImages.map((item, index) => {
                                            return (
                                                <Block key="index">
                                                    <Image
                                                        className="item-images"
                                                        onClick={this.bigProofPicture}
                                                        data-list={dataProofImages}
                                                        data-src={item}
                                                        src={item}
                                                    ></Image>
                                                </Block>
                                            )
                                        })}
                                    </ScrollView>
                                </View>}
                            </View>
                        </View>
                        <View
                            className={
                                'view-business-inter'
                            }style={dataArray.length <= 0 || dataArray.reply_content == ''?{display:'none'}:{}}
                        >
                            <View className="busness-title-content">
                                <Titleview title="商家解释:" fontWeight="700"></Titleview>
                            </View>
                            <Text className="busness-inter-content">
                                {dataArray.reply_content}
                            </Text>
                            <View
                                className={
                                    'scroll-images ' +
                                    (dataReplyImages.length == 0 ? 'hidden' : '')
                                }
                            >
                                <View className="reply-imgs">
                                    <Titleview title="举证图片:" fontWeight="700"></Titleview>
                                </View>
                                <ScrollView
                                    scrollX="true"
                                    className="scrollview"
                                    scrollWithAnimation="true"
                                >
                                    {dataReplyImages.map((item, index) => {
                                        return (
                                            <Block key="index">
                                                <Image
                                                    className="reply-item-images"
                                                    onClick={this.bigReplyImages}
                                                    data-list={dataReplyImages}
                                                    data-src={item}
                                                    src={item}
                                                ></Image>
                                            </Block>
                                        )
                                    })}
                                </ScrollView>
                            </View>
                            <Text className="busness-inter-time">{dataArray.reply_time}</Text>
                        </View>
                        <View
                          className={'view-mall-process'}
                          style={ dataArray.length <= 0 || dataArray.admin_reply_content  == ''?{display:'none'}:{}}
                        >
                            <View className="busness-title-content">
                                <Titleview title="商城处理:" fontWeight="700"></Titleview>
                            </View>
                            <Text className="busness-inter-content">
                                {dataArray.admin_reply_content}
                            </Text>
                            <Text className="busness-inter-time">
                                {dataArray.admin_reply_time}
                            </Text>
                        </View>
                        {canCancel&&<View
                            className={'view-cancel-complaint '}
                            onClick={this.onCancelComplaint}>
                            <Text className="text-cancel-complaint">撤销投诉</Text>
                        </View>}
                    </View>
                </View>
                <Canclecomplaitmodal
                    id="cancleComplaitModal"
                    onCancelComplaint={this.onCancelComplaint}
                ></Canclecomplaitmodal>
            </Block>
        )
    }
}


