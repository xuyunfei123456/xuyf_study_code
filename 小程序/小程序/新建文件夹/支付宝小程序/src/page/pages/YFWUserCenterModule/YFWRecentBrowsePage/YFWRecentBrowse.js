import { Block, View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { isNotEmpty } from '../../../../utils/YFWPublicFunction.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import YfwSidebar from '../../../../components/YFWSidebar/YFWSidebar'
import Titleview from '../../../../components/YFWTitleView/YFWTitleView'
import Priceview from '../../../../components/YFWPriceView/YFWPriceView'
import ItemBottomTmpl from '../../../../imports/ItemBottomTmplView/ItemBottomTmpl'
import MedicinesInfoTmpl from '../../../../imports/MedicineTypeIconTmpl'
import './YFWRecentBrowse.scss'

export default class YFWRecentBrowse extends Taro.Component {

    constructor(props) {
        super(props)
        this.state = {
            dataInfo: {},
            dateArray: [],
            goodsArray: [],
            lastOpenSiderId: ''
        }
    }

    componentWillMount(options = this.$router.params || {}) {
        try {
            let value = Taro.getStorageSync('recentBrowse')
            if (value) {
                this.state.dataInfo = value
                this.handleData()
            }
        } catch (e) { }
    }
    /** 获取浏览历史数据 */
    handleData = () => {
        this.state.dateArray = []
        this.state.goodsArray = []
        Object.entries(this.state.dataInfo).forEach(([key, value], index) => {
            this.state.dateArray.push(key)
            let goods = []
            Object.entries(value).forEach(([key, value], index) => {
                goods.push(value)
            })
            this.state.goodsArray.push(goods)
        })
        this.state.dateArray.reverse()
        this.state.goodsArray.reverse()
        this.setState({
            dateArray: this.state.dateArray,
            goodsArray: this.state.goodsArray
        })
    }

    /** 清空历史记录 */
    clearAll = () => {
        let that = this
        Taro.showModal({
            content: '确定要清空浏览记录吗?',
            cancelColor: '#999999',
            cancelText: '取消',
            confirmColor: '#49ddb8',
            confirmText: '确定',
            success(res) {
                if (res.confirm) {
                    that.state.dataInfo = {}
                    Taro.setStorageSync('recentBrowse', that.state.dataInfo)
                    that.handleData()
                } else if (res.cancel) {
                }
            }
        })
    }

    toHome = () => {
        pushNavigation('get_home')
    }

    config = {
        navigationBarBackgroundColor: '#49ddb8',
        navigationBarTitleText: '浏览历史',
        navigationBarTextStyle: 'white'
    }

    getImageUrl(url) {
        if (url.indexOf("default") >= 0) {
          return url
        } else {
          return url + '_300x300.jpg'
        }
      }

    render() {
        const { dateArray, goodsArray, height } = this.state
        return (
            <View className="container">
                {dateArray.map((info, infoindex) => {
                    return (
                        <View className="itemView">
                            <View className="titleview">
                                <Titleview title={info}></Titleview>
                            </View>
                            {goodsArray[infoindex].map((item, index) => {
                                return (
                                    <View className='listItemView '
                                        onClick={() => {pushNavigation('get_shop_goods_detail',{ value: item.shop_goods_id })}} >
                                        <Image
                                            className='shop_image'
                                            src={this.getImageUrl(item.img_url)}></Image>
                                        <View
                                            className='rightView '>
                                            <Text className='goods_shop_name'>
                                                {item.name_cn}
                                            </Text>
                                            <Text className='shop_address'>
                                                {'商家: ' + item.shop_name}
                                            </Text>
                                            <View className="goods_price">
                                                <Priceview
                                                    price={item.medicine_price}
                                                    fontSize="34"
                                                    discount={item.goods_discount}
                                                ></Priceview>
                                            </View>
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                    )
                })}
                {dateArray.length > 0 && (
                    <View className="clearAll" onClick={this.clearAll}>
                        清空
                    </View>
                )}
                {dateArray.length == 0 && (
                    <View className="emptyView">
                        <Image
                            src="https://c1.yaofangwang.net/common/images/miniapp/ic_no_footprint.png"
                            className="emptyImage"
                        ></Image>
                        <View className="emptyTitle">暂无浏览记录</View>
                        <View className="emptyBottom" onClick={this.toHome}>
                            去首页逛逛
                        </View>
                    </View>
                )}
            </View>
        )
    }
}

