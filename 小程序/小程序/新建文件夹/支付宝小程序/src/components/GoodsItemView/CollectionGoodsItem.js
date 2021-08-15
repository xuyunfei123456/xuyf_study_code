import Taro, { Component } from '@tarojs/taro'
import { 
    Block, View, Image, Text
} from '@tarojs/components'
import { pushNavigation } from '../../apis/YFWRouting.js'
import { ShopCarApi } from '../../apis/index.js'
import YFWPriceView from '../YFWPriceView/YFWPriceView'
const shopCarApi = new ShopCarApi()
import './CollectionGoodsItem.scss'
export default class CollectionGoodsItem extends Component {
    config = {  
        component: true
    }
    static defaultProps = {
        data: {
          goods_image:'',
          goods_name:'',
          goods_standard:'',
          goods_price:'',
          goods_discount:'',
          store_title:'',
          goods_stories:'',
          intro_image:'',
          showCoupon:'',

        },
        showstanders: true,
        showfree: false,
        showcar: true,
        showstore: false,
        onCallBack: null
    }
    componentWillReceiveProps(nextProps){
    }
    
    toGoodsDetail (e) {
      let a = e.currentTarget.id
      if (a == 'father') {
        pushNavigation(this.props.data.navitation_params.type, this.props.data.navitation_params)
      } else {
        this.addCar()
      }
    }

    addCar(){
      this.addToShopCar(this.props.data.navitation_params)
    }

    addToShopCar(item) {
      let goodsID = item.value
      let goodsPrice = item.price
      shopCarApi.addGoodsToShopCar(1, goodsID, '', false).then(response => {
        Taro.showToast({
          title: "添加成功",
          icon: 'none',
          duration: 2000
        })
        if(this.props.onCallBack) {
          this.props.onCallBack({price: goodsPrice})
        }
        // this.triggerEvent('callBack', { price: goodsPrice });
      })
    }

    showMoreAction () {
      let info = event.currentTarget.dataset.info
      pushNavigation(info.navitation_params.anotherType, { value: info.navitation_params.anotherValue })
    }
    render() {
        const { data, showstanders, showfree, showstore,showtrocheType,showCompany,showCoupon } = this.props
        return (
          <View
            className="collectionItemViews"
            onClick={this.toGoodsDetail}
            id="father"
          >
            <View className="imageView">
              <Image
                className="image"
                src={data.goods_image ? data.goods_image : data.intro_image}
              ></Image>
            </View>
            <View className="nameView">
              <View className="name">{data.goods_name}</View>
            </View>
            {showstanders && (
              <View className="standards">{data.goods_standard}</View>
            )}
            {showtrocheType && (
                <View className='standards'>{data.troche_type || ''}</View>
            )}
            {showCompany && (
                <View className='standards'>{data.companyName || ''}</View> 
            )}
            <View className="bottomView">
              <View className="priceView">
                <YFWPriceView
                  price={data.goods_price}
                  fontSize={34}
                  discount={data.goods_discount}
                ></YFWPriceView>
              </View>
              <View className="rightview">
                {showfree && (
                  <View className="freeView">
                    <Text className="free">包邮</Text>
                  </View>
                )}
              </View>
            </View>
            {showCoupon ==2 &&(
              <Block>
              <View className="coupon">
                {data.model.free_logistics_desc&&<View className="freeShip">{data.model.free_logistics_desc}</View>}
                {data.model.coupons_desc&&<View className="couponitem">{data.model.coupons_desc}</View>}
              </View>
              <View className='companyname'>{data.model.title || ''}</View> 
              </Block>
            )}
            {data.store_title.length > 0 ? (
              <View className="shop_container">
                <View className="shop_default">推荐</View>
                <View className="shop_title">{data.store_title}</View>
                <Block>
                  <View
                    className="shop_more"
                    onClick={this.showMoreAction}
                    data-info={data}
                  >
                    更多
                  </View>
                  <Image
                    className="shop_arrow"
                    src={require('../../images/around_detail_icon.png')}
                  ></Image>
                </Block>
              </View>
            ) : (
              showstore &&data.goods_stories&& (
                <View className="stores">
                  <Text className="storetext">{data.goods_stories}</Text>个商家在售
                </View>
              )
            )}
          </View>
        )
      }
}