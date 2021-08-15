import Taro, { Component } from '@tarojs/taro'
import { View, Image, ScrollView, Text } from '@tarojs/components'
import TitleView from '../YFWTitleView/YFWTitleView'
import YFWPriceView from '../YFWPriceView/YFWPriceView'
import { pushNavigation } from '../../apis/YFWRouting'
import './YFWSearchShopResult.scss'
class YFWSearchShopResult extends Component {

    config = {
        component: true
    }
    static defaultProps = {
        model: [],
        isResult: false,
        pageEnd: false,
        onRequestNextPage: null,
    } 
    requestNextPage() {
      if(this.props.onRequestNextPage){
        this.props.onRequestNextPage()
      }
        // this.triggerEvent('requestNextPage')
    }
    requestNext () {
      
    }

    toShopDetail(e) {
        pushNavigation('get_shop_detail', { value: e.currentTarget.dataset.id+'' })
    }

    toShopGoodDetail(e) {
        pushNavigation('get_shop_goods_detail', { 'value': e.currentTarget.dataset.id })
    }

    componentWillMount () { }

    componentDidMount () { }

    render () {
        const { isResult, model, pageEnd } = this.props

        return (
            <View className='container'>
              <ScrollView className={process.env.TARO_ENV=='alipay'?'scroll scroll-s':'scroll'} scrollY onScrollToLower={isResult == true ? this.requestNextPage : this.requestNext} >
                {!isResult && (
                  <View>
                    <View className='no-result'>
                      <Image src='https://c1.yaofangwang.net/common/images/miniapp/ic_no_goods_shops.png'></Image>
                      <Text>抱歉，没有找到商家哦~</Text>
                    </View>
                    <View className="about-shop-view">
                      <TitleView title="相关商家" ></TitleView>
                    </View>
                  </View>
                )}
                {model.map((item, index) => {
                  return (
                    <Block key="{{}}">
                      <View className='result-view'>
                        <View className='topView'>
                          <Image src={item.logo_img_url} className='logo-url'></Image>
                          <Text className='title'>{item.title}</Text>
                          <View className='kind'></View>
                          <View className='clickshop' onClick={this.toShopDetail} data-id={item.id} >
                            <Text>进入店铺</Text>
                          </View>
                        </View>
                        <View className='context'>
                          {item.goods_items.map((info, index) => {
                            return (
                              <Block key>
                                <View className='goods-view' onClick={this.toShopGoodDetail} data-id={info.id} >
                                  <Image src={info.intro_image}></Image>
                                  <Text className='goods-view-title'>{info.namecn}</Text>
                                  <View className='goods-view-price'>
                                    <YFWPriceView price={info.price} fontSize={22}></YFWPriceView>
                                  </View>
                                </View>
                              </Block>
                            )
                          })}
                        </View>
                      </View>
                    </Block>
                  )
                })}
                {isResult == true && (
                  <View className='onloading'>
                    <View className='load-wrap'>
                      {(pageEnd ? ( false ) : ( true )) ? (
                        <View className='loading-icon'>
                          <View className='hide-block'></View>
                        </View>
                      ) : (
                        <View className='load-wrap'>
                          <View className='loadover'>没有更多商家了~</View>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          )
    }
}

export default YFWSearchShopResult