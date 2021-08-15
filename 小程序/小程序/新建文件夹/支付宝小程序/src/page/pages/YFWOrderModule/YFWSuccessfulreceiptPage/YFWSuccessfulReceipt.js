import { Block, View, Image, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
// pages/YFWOrderModule/YFWSuccessfulreceiptPage/YFWSuccessfulReceipt.js
import { SearchApi, OrderPaymentApi, OrderApi } from '../../../../apis/index.js'
const searchApi = new SearchApi()
const orderPaymentApi = new OrderPaymentApi()
const orderApi = new OrderApi()
import { getItemModel } from '../../../../components/GoodsItemView/model/YFWGoodsItemModel.js'
import { isNotEmpty, safeObj } from '../../../../utils/YFWPublicFunction.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { config } from '../../../../config.js'
import CollectionGoodsItem from '../../../../components/GoodsItemView/CollectionGoodsItem'
import './YFWSuccessfulReceipt.scss'

let RequestOrderInfo = function (that, orderNo, type) {
    Taro.showLoading({
        title: '加载中...'
    })
    if (type == 'paySuccess') {
        orderPaymentApi.getPayInfo(orderNo).then(
            res => {
                Taro.hideLoading()
                HandlerButtons(that, res, orderNo)
                HandlerLargeBtn(that, res)
            },
            error => {
                Taro.hideLoading()
            }
        )
    } else {
        orderApi.getOrderStatus(orderNo, type).then(
            res => {
                Taro.hideLoading()
                HandlerButtons(that, res, orderNo)
                HandlerLargeBtn(that, res)
            },
            error => {
                Taro.hideLoading()
            }
        )
    }
}

let HandlerButtons = function (that, res, orderNo) {
    let buttonObj = {
        text: '查看订单',
        type: 'get_order_detail',
        value: safeObj(orderNo)
    }
    let btArray =
        isNotEmpty(res.items['0'].buttons) && res.items['0'].buttons.length > 0
            ? res.items['0'].buttons
            : [buttonObj]
    if (btArray.length <= 1) {
        let button = {
            text: '回到首页',
            type: 'get_main_page'
        }
        btArray.push(button)
    }
    that.setState({
        buttonArray: btArray,
        prompt: res.prompt,
        payInfo: res.items[0],
        invite_win_cash_url_share: res.invite_win_cash_url_share,
        content: res.content_share,
        title_share: res.title_share
    })
}

let HandlerLargeBtn = function (that, res) {
    let text1 = '抽奖送好礼，积分领不停'
    let text2 = '邀请好友注册，最多赚500元/人'
    let adBadge = res.ad_app_payment[0]
    let img_url = adBadge.img_url.replace('https', 'http')
    let ad_name = adBadge.name ? adBadge.name : text1
    that.setState({
        adsImage: img_url,
        topText: ad_name,
        bottomText: text2,
        adBadge: adBadge
    })
}

export default class YFWSuccessfulReceipt extends Taro.Component {
    constructor(props) {
        super(props)
        this.state = {
            title: '',
            orderNo: '',
            recommendData: [],
            buttonArray: [
                {
                    text: '订单详情',
                    type: 'get_order_detail'
                },
                {
                    text: '回到首页',
                    type: 'get_main_page'
                }
            ],
            adsImage: '',
            topText: '',
            bottomText: '',
            adBadge: {},
            prompt: '',
            type: '',
            payInfo:[],
            invite_win_cash_url_share: '',
            content: '',
            title_share: '',
            img_url: '',
            shop_title: '',
            order_total: '',
            env_type: process.env.TARO_ENV
        }
    }

    componentWillMount() {
        let options = this.$router.params
        let screenData = JSON.parse(options.params)
        this.state.orderNo = screenData.orderNo
        this.state.type = screenData.type
        this.state.img_url = screenData.img_url
        this.state.shop_title = screenData.shop_title
        this.state.order_total = screenData.order_total
        this.setState({
            title: screenData.title,
            type: screenData.type
        })
        RequestOrderInfo(this, this.state.orderNo, this.state.type)
        searchApi.getAssociationGoods().then(response => {
            let recommendDatas = []
            recommendDatas = response.map((info) => {
                return getItemModel(info, 'cart_list_recommend')
            })
            this.setState({
                recommendData: recommendDatas,
            })
        }, error => {

        })
    }

    onShareAppMessage = () => {
        let params = {
            value: this.state.invite_win_cash_url_share
        }
        let urls = params.value.split('?')
        params.value = urls[0]
        if (urls[1] && urls[1].includes('=')) {
            params.extraValue = {
                key: urls[1].split('=')[0],
                value: urls[1].split('=')[2]
            }
        }
        return {
            title: this.state.title_share,
            path:
                '/components/YFWWebView/YFWWebView?params=' + JSON.stringify(params),
            imageUrl: config.share_image_url
        }
    }
    onButtonClick = parms => {
        let item = parms.currentTarget.dataset.item
        if (item.type === 'get_order_detail' || item.type === 'get_order') {
            pushNavigation('get_order_detail', {
                order_no: this.state.orderNo
            })
        } else if (item.type === 'get_comment_detail') {
            pushNavigation(
                'get_order_evaluation',
                {
                    order_no: this.state.orderNo,
                    shop_title: this.state.shop_title,
                    img_url: this.state.img_url,
                    order_total: this.state.order_total
                },
                'redirect'
            )
        } else if (item.type === 'get_main_page') {
            pushNavigation('get_home')
        }
    }
    onLargeBtClick = () => {
        if (isNotEmpty(this.state.adBadge)) {
            pushNavigation(this.state.adBadge.type, {
                value: this.state.adBadge.value
            })
        }
    }
    config = {
        navigationBarTextStyle: 'white',
        navigationBarTitleText: '',
        navigationBarBackgroundColor: '#49ddb8',
        enablePullDownRefresh: false
    }

    /** 精选商品 */
    renderRecommendList() {
        const { recommendData, env_type } = this.state
        return (
            <View className={env_type == 'alipay' ? 'shopcar-wrap_alipay' : 'shopcar-wrap'}>
                {recommendData.map(recommendItem => {
                    return (
                        <View className='shopcar-recommend-item'>
                            <CollectionGoodsItem data={recommendItem} showcar={false} />
                        </View>
                    )
                })}
            </View>
        )
    }

    render() {
        const {
            prompt,
            title,
            payInfo,
            type,
            buttonArray,
            recommendData,
            topText,
            bottomText
        } = this.state
        return (
            <View>
                <View className="top_image_bg">
                    <View className="topTips">
                        {prompt.length > 0 && <View className="topTipsText">{prompt}</View>}
                    </View>
                    <View
                        className="order_status"
                        style={'margin-top: ' + (prompt.length > 0 ? 10 : 70) + 'rpx'}
                    >
                        <Image
                            src={require('../../../../images/order_status_icon_success.png')}
                            className="icon"
                        ></Image>
                        <Text className="text">{title}</Text>
                    </View>
                    {type == 'paySuccess' && (
                        <View className="pay_status">
                            <View className="pay_info_content">
                                <Image
                                    src={require('../../../../images/icon_wallet.png')}
                                    className="pay_info_icon"
                                ></Image>
                                <Text className="pay_info_text">
                                    {'支付方式:' + payInfo.payment_name}
                                </Text>
                            </View>
                            <View className="pay_info_content">
                                <Image
                                    src={require('../../../../images/icon_price.png')}
                                    className="pay_info_icon"
                                ></Image>
                                <Text className="pay_info_text">
                                    {'支付金额:' + payInfo.total_price}
                                </Text>
                            </View>
                        </View>
                    )}
                    <View
                        className="top_buttons"
                        style={type == 'paySuccess' ? 'margin-top:20rpx' : ''} >
                        {buttonArray.map((item, index) => {
                            return (
                                <Block>
                                    <View
                                        className="left_button"
                                        onClick={this.onButtonClick}
                                        data-item={item}>
                                        {item.text}
                                    </View>
                                </Block>
                            )
                        })}
                    </View>
                </View>
                <View className="bottom_ads">
                    <View className="ad_tips_text">精选商品</View>
                    <View className="ad_tips_text_bottom"></View>
                </View>
                {this.renderRecommendList()}
            </View>
        )
    }
}