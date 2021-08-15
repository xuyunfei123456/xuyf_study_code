import { Block, View, Image, Text, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import { OrderApi } from '../../../../apis/index.js'
const orderApi = new OrderApi()
import { tcpImage,removeEmoji,isEmpty } from '../../../../utils/YFWPublicFunction.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import Starscore from '../../../../components/YFWStarScore/YFWStarScore'
import './YFWOrderEvaluation.scss'
var WxNotificationCenter = require('../../../../utils/WxNotificationCenter.js')

export default class YFWOrderEvaluation extends Taro.Component {
    constructor(props) {
        super(props)
        this.state = {
            orderno: '',
            shop_title: '',
            img_url: '',
            order_total: '',
            inputText: '',
            servieceStar: 5,
            sendStar: 5,
            logistStar: 5,
            packageStar: 5
        }
    }

    componentWillMount() {
        let options = this.$router.params
        let screenData = JSON.parse(options.params)
        let image = tcpImage(screenData.img_url)
        this.setState({
            orderno: screenData.order_no,
            shop_title: screenData.shop_title,
            img_url: image,
            order_total: screenData.order_total
        })

    }

    onTextChange = eventhandle => {
        let text = eventhandle.detail.value.replace(removeEmoji, '')
        this.setState({
            inputText: text
        })
    }

    postEvaluation = () => {
        if (isEmpty(this.state.inputText)) {
            Taro.showToast({
                title: '评价的内容不能为空',
                icon: 'none'
            })
        }
        orderApi.evaluateOfOrder(
            this.state.orderno,
            this.state.inputText,
            this.state.servieceStar,
            this.state.sendStar,
            this.state.logistStar,
            this.state.packageStar
        ).then(
            res => {
                WxNotificationCenter.postNotificationName(
                    'refreshScreen',
                    'refreshAll'
                )
                let params = {
                    title: '评价成功',
                    orderNo: this.state.orderno,
                    type: 'evaluate'
                }
                // params = JSON.stringify(params)
                pushNavigation('get_success_receipt',params,'redirect')
            },
            error => {
                Taro.showToast({
                    title: error.msg,
                    icon: 'none'
                })
            }
        )
    }

    config = {
        navigationBarTitleText: '订单评价'
    }

    onStar = (e) => {
        let that = this
        if (e.title === 'service') {
            that.state.servieceStar = e.star
        } else if (e.title === 'send') {
            that.state.sendStar = e.star
        } else if (e.title === 'logist') {
            that.state.logistStar = e.star
        } else if (e.title === 'package') {
            that.state.packageStar = e.star
        }
    }

    render() {
        const { img_url, orderno, shop_title, order_total, inputText } = this.state
        return (
            <Block>
                <View className="parent_css">
                    <View className="medicine_info">
                        <Image className="medicine_image" src={img_url}></Image>
                        <View className="info">
                            <Text>
                                订单：<Text className="order_no">{orderno}</Text>
                            </Text>
                            <Text style="margin-top:10rpx">
                                商家：<Text className="order_no">{shop_title}</Text>
                            </Text>
                            <Text className="price">{'¥' + order_total}</Text>
                        </View>
                    </View>
                    <View className="dash_line"></View>
                    <View className="evaluation_item">
                        <Text className="type_text">客户服务</Text>
                        <Starscore title="service" onGetStar={this.onStar}  ></Starscore>
                    </View>
                    <View className="evaluation_item">
                        <Text className="type_text">发货速度</Text>
                        <Starscore title="send" onGetStar={this.onStar}></Starscore>
                    </View>
                    <View className="evaluation_item">
                        <Text className="type_text">物流速度</Text>
                        <Starscore title="logist" onGetStar={this.onStar}></Starscore>
                    </View>
                    <View className="evaluation_item">
                        <Text className="type_text">商品包装</Text>
                        <Starscore title="package" onGetStar={this.onStar}></Starscore>
                    </View>
                    <View className="input_parent">
                        <Textarea
                            value={inputText}
                            placeholder="写下本次的购物体验，您的评价内容和打分都将是其他网友的参考依据，并影响该商家的服务评分。"
                            placeholderClass="input_placeholde"
                            className={process.env.TARO_ENV == 'tt' ? "input_edite_tt" : "input_edite"}
                            adjustPosition="true"
                            autoHeight="true"
                            onInput={this.onTextChange}
                        ></Textarea>
                    </View>
                    <Text className="tips_text">*您的评价内容将匿名展示</Text>
                    <View></View>
                </View>
                <View className="post_button" onClick={this.postEvaluation}>
                    <Text className="text">提交</Text>
                </View>
            </Block>
        )
    }
}