import Taro, { Component } from '@tarojs/taro'
import { 
    Block, View, Image, Text
} from '@tarojs/components'
import { pushNavigation } from '../../apis/YFWRouting.js'
import { ShopCarApi } from '../../apis/index.js'
import YFWPriceView from '../YFWPriceView/YFWPriceView'
const shopCarApi = new ShopCarApi()
import './ListGoodsItem.scss'

class ListGoodsItem extends Component {

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
            goods_authorized_code:''
  
        },
        showstanders: true,
        showfree: false,
        showcar: true,
        showstore: false,
        showCode: true,
        onCallBack: null
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
    componentWillMount () { }

    componentDidMount () { }

    render () {
        const { data, showstanders, showfree, showstore, showCode,showtrocheType,showCompany } = this.props
        
        return (
            <View className='listItemView' onClick={this.toGoodsDetail} id='father'>
                <View className='leftView'>
                    <Image className='itemImage' src={data.goods_image}/>
                </View>
                <View className='rightView'>
                    <View className='medicineName'>{data.goods_name}</View>
                    {showstanders && (
                        <View className='medicineAuthorizedCode'>{data.goods_standard}</View>
                    )}
                    {showtrocheType && (
                        <View className='medicineAuthorizedCode'>{data.troche_type||''}</View>
                    )}
                    {showCode && (
                        <View className='medicineAuthorizedCode'>{data.goods_authorized_code}</View> 
                    )}
                    {showCompany && (
                        <View className='medicineAuthorizedCode'>{data.companyName|| ''}</View> 
                    )}
                    <View className='itemRightBottomView'>
                        <View className='priceViews'>
                            <YFWPriceView price={data.goods_price} fontSize={34} discount={data.goods_discount}></YFWPriceView>
                        </View>
                        {data.store_title.length>0 && (
                            <View/>
                        )}
                        {showstore && (
                            <View className='store'>
                                <Text className='storetext'>{data.goods_stories}</Text>个商家在售</View>
                        )}
                    </View>
                    {data.store_title.length > 0 && (
                        <View className='shop_container'>
                            <View className='shop_default'>推荐</View>
                            <View className='shop_title'>{data.store_title}</View>
                            <Block>
                                <View className='shop_more' onClick={this.showMoreAction} data-info={data}>查看更多商家</View>
                                <Image className='shop_arrow' src={require('../../images/around_detail_icon.png')}/>
                            </Block>
                        </View>
                    )}
                </View>

            </View>
        )
    }
}

export default ListGoodsItem
