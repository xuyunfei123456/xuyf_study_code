import Taro, { Component } from '@tarojs/taro'
import { 
  View, 
  Image,
  Text,
  ScrollView,
  Swiper,
  SwiperItem
} from '@tarojs/components'
import './YFWShopDetailHome.scss'
import { ShopDetailApi, GoodsDetailApi } from '../../../../apis/index'
import { getShopInfo } from '../Model/YFWShopDetailInfoModel'
import { isNotEmpty, safe } from '../../../../utils/YFWPublicFunction'
import { getModelArray } from '../../../../components/GoodsItemView/model/YFWGoodsListModel'
import { pushNavigation } from '../../../../apis/YFWRouting'
import CollectionGoodsItem from '../../../../components/GoodsItemView/CollectionGoodsItem'
import YFWMoreModal from '../../../../components/YFWMoreModal/YFWMoreModal'
import YFWFooterRefresh from '../../../../components/YFWFooterRefresh/YFWFooterRefresh'
import {get as getGlobalData } from '../../../../global_data'
const shopDetailApi = new ShopDetailApi()
const goodsDetailApi = new GoodsDetailApi()

export default class YFWShopDetailHome extends Component {

  config = {
    navigationBarTitleText: '商家详情'
  }

  constructor (props) {
    super(props)
    this.state = {
      imgWidth:0,
      storeId: 0,
      isOpenMore: false,
      isIphoneX: getGlobalData('isIphoneX'),
      storeInfo: {},
      storeCategoryIndex: 0,
      storeCategory: [
        {
          id: 0,
          pageIndex: 1,
          moreData: false,
          loading: false,
          refreshStatus: 'hidden',
          name: "商家推荐",
          items: []
        },
        {
          id: 1,
          pageIndex: 1,
          moreData: true,
          loading: false,
          refreshStatus: 'hidden',
          name: "中西药品",
          items: []
        },
        {
          id: 2,
          pageIndex: 1,
          moreData: true,
          loading: false,
          refreshStatus: 'hidden',
          name: "医疗器械",
          items: []
        },
        {
          id: 3,
          pageIndex: 1,
          moreData: true,
          loading: false,
          refreshStatus: 'hidden',
          name: "养生保健",
          items: []
        },
        {
          id: 4,
          pageIndex: 1,
          moreData: true,
          loading: false,
          refreshStatus: 'hidden',
          name: "美容护肤",
          items: []
        },
        {
          id: 5,
          pageIndex: 1,
          moreData: true,
          loading: false,
          refreshStatus: 'hidden',
          name: "计生用品",
          items: []
        },
        {
          id: 6,
          pageIndex: 1,
          moreData: true,
          loading: false,
          refreshStatus: 'hidden',
          name: "中药饮片",
          items: []
        }
      ]
    }
  }
  componentWillMount(){
    let res = Taro.getSystemInfoSync();
    this.windowWidth = res.windowWidth
    this.windowHeight = res.windowHeight
    this.statusBarHeight = res.statusBarHeight 
    this.titleBarHeight = res.titleBarHeight 
  }
  componentDidMount () {
    
    const params = this.$router.params.params
    if (isNotEmpty(params)) {
      const value = JSON.parse(decodeURIComponent(params))
      this.state.storeId = value.value || 0 
    }

    this.fetchStoreDetail()
    this.fetchStoreRecommendMedicine()
  }

  /** 获取商店详情数据 */
  fetchStoreDetail () {
    const { storeId } = this.state
    if (storeId === 0) {
      return
    }

    shopDetailApi.getShopInfo(storeId).then(response => {
      const storeInfo = getShopInfo(response)
      this.setState({
        storeInfo: storeInfo
      })
    }, error => {

    })
  }

  /** 获取药店推荐商品 */
  fetchStoreRecommendMedicine () {
    const { storeId } = this.state
    if (storeId === 0) {
      return
    }

    shopDetailApi.getShopRecommendGoods(storeId).then(response => {
      let { storeCategory } = this.state
      const recommendList = getModelArray(response, 'shop_medicine_recomand')
      storeCategory[0].items = recommendList
      storeCategory[0].refreshStatus = 'nomore'
      this.setState({
        storeCategory: storeCategory
      })
    }, error => {

    })
  }

  /** 获取药店其他分类商品 */
  fetchStoreCategoryMedicine (categoryIndex) {
    const { storeId } = this.state
    if (storeId === 0) {
      return
    }

    let { storeCategory } = this.state
    let categoryItem = storeCategory[categoryIndex]
    if (categoryItem.loading || !categoryItem.moreData) {
      return
    }
    categoryItem.refreshStatus = 'loading'
    categoryItem.loading = true
    storeCategory[categoryIndex] = categoryItem
    this.setState({ storeCategory: storeCategory})

    let { pageIndex } = categoryItem
    const { id } = categoryItem
    shopDetailApi.getShopGoods(storeId, id, 'sale_count', pageIndex, '').then(response => {
      const medicineList = getModelArray(response.dataList, 'shop_medicine_recomand')
      if (pageIndex === 1) {
        categoryItem.items = medicineList
      } else {
        let { items } = categoryItem
        items = items.concat(medicineList)
        categoryItem.items = items
      }

      if (medicineList.length < 20) {
        // 无更多数据
        categoryItem.moreData = false
        categoryItem.refreshStatus = 'nomore'
      } else {
        categoryItem.refreshStatus = 'hidden'
        categoryItem.moreData = true
      }
      categoryItem.loading = false
      storeCategory[categoryIndex] = categoryItem

      this.setState({
        storeCategory: storeCategory
      })
    }, error => {
      if (pageIndex > 1) {
        pageIndex--
      }
      categoryItem.loading = false
      categoryItem.pageIndex = pageIndex
      categoryItem.refreshStatus = 'hidden'
      categoryItem.moreData = true
      storeCategory[categoryIndex] = categoryItem
      this.setState({
        storeCategory: storeCategory
      })
    })
  }
  imgonload(e){
    const {detail} = e;
    if(detail.height&&detail.width){
      let ratio = detail.width/detail.height,_width = 100*ratio;
      this.setState({
        imgWidth:_width
      })
    }

  }
  render () {
    const { isOpenMore } = this.state

    return (
      <View className='container'>
        {this.renderBackgroundImage()}
        {this.renderTopView()}
        {this.renderStoreView()}
        {this.renderStoreScoreView()}
        {this.renderStoreCouponView()}
        {this.renderStoreCategoryView()}
        {this.renderStoreMedicineView()}
        {this.renderBottomActionView()}
        <YFWMoreModal isOpened={isOpenMore} onClose={() => this.setState({ isOpenMore: false })} />
      </View>
    )
  }

  /** 渲染背景图片 */
  renderBackgroundImage () {
    return(
      <Image className='store-back-image' src={require('../../../../images/shop_bg.jpg')}/>
    )
  }

  /** 渲染顶部搜索、更多 */
  renderTopView () {
    return(
      <View className='flex-row flex-content-between flex-align-center width-screen height-50'>
        <View className='store-search-view flex-row flex-align-center' onClick={this.onSearchClick.bind(this)}>
          <Image className='store-search-icon' src={require('../../../../images/YFWStoreModule/top_bar_search.png')} />
          <Text className='store-search-text'>搜索店铺内商品</Text>
        </View>
        <View className='store-more-view flex-row flex-content-center flex-align-center' onClick={this.onMoreIconClick.bind(this)}>
          <Image className='store-more-icon' src={require('../../../../images/more_white.png')} />
        </View>
      </View>
    )
  }

  /** 渲染药店图片、名称、收藏 */
  renderStoreView () {
    const { storeInfo,imgWidth } = this.state
    console.log('storeInfo',storeInfo)
    const collectionIcon = storeInfo.is_favorite 
      ? require('../../../../images/sx_image_collect_sellected.png') 
      : require('../../../../images/sx_image_collect.png')

    return(
      <View className='flex-row store-info-view flex-content-between flex-align-center height-50'>
        <View className='flex-row' style="align-items: center;">
          <Image className='store-logos margin-right-10' src={storeInfo.logo_img_url} style={`width:${imgWidth}rpx`} onLoad={this.imgonload} />
          <Text className='store-title'>{storeInfo.title}</Text>
        </View>
        <Image className='store-collection' src={collectionIcon} mode='widthFix' onClick={this.onCollectionStore.bind(this)} />
      </View>
    )
  }

  /** 渲染评分 */
  renderStoreScoreView () {
    const { storeInfo } = this.state

    return(
      <View className='store-score-view flex-row flex-content-evenly flex-align-center'>
        {this.renderScoreItem(storeInfo.service_star, '客户服务')}
        {this.renderScoreItem(storeInfo.delivery_star, '发货速度')}
        {this.renderScoreItem(storeInfo.shipping_star, '物流速度')}
        {this.renderScoreItem(storeInfo.package_star, '商品包装')}
      </View>
    )
  }
  
  /** 评分item */
  renderScoreItem (score, name) {
    return(
      <View className='store-score-item flex-column flex-content-around flex-align-center'>
        <Text className='text-15 text-red'>{safe(score)+'分'}</Text>
        <Text className='text-11 text-black'>{name}</Text>
      </View>
    )
  }

  /** 渲染优惠券 */
  renderStoreCouponView () {
    const { storeInfo } = this.state
    const { coupons_list } = storeInfo

    if (coupons_list && coupons_list.length > 0) {
      return(
        <View className='store-coupon-view'>
          <ScrollView className='container flex-row flex-nowrap' scrollX>
            {coupons_list.map(couponItem => {
              return(
                <View className='store-coupon-item' taroKey={couponItem.id} onClick={this.onCouponItemClick.bind(this, couponItem)}>
                  <View className='store-coupon-back flex-row'>
                    <View className='store-coupon-content flex-column flex-content-around flex-align-center'>
                      <Text className='store-coupon-money'>{'¥'+couponItem.money}</Text>
                      <Text className='store-coupon-name'>{couponItem.title}</Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </ScrollView>
        </View>
      )
    }
  }

  /** 渲染分类标题 */
  renderStoreCategoryView () {
    const { storeCategory } = this.state
    const { storeCategoryIndex } = this.state
    const scrollItemId = 'category-'+storeCategoryIndex.toString()

    return(
      <View className='flex-column flex-1 height-50'>
        <ScrollView className='container flex-row flex-nowrap' scrollX scrollIntoView={scrollItemId}>
          {storeCategory.map((categoryItem, categoryIndex) => {
            const isSelected = storeCategoryIndex === categoryIndex
            const labelClass = isSelected ? 'store-category-labe-selected' : 'store-category-labe-normal'
            const itemId = 'category-'+categoryIndex.toString()
            
            return(
              <View id={itemId} className='store-category-item' taroKey={categoryIndex} onClick={this.onCategoryItemClick.bind(this, categoryIndex)}>
                <View className='store-category-item-content flex-column flex-align-center'>
                  <Text className='store-category-name'>{categoryItem.name}</Text>
                  <View className={labelClass}></View>
                </View>
              </View>
            )
          })}
        </ScrollView>
      </View>
    )
  }

  /** 渲染商品 */
  renderStoreMedicineView() {
    const { storeInfo } = this.state
    const { isIphoneX } = this.state
    const { coupons_list } = storeInfo
    const _ratio = this.windowWidth/750;
    const spaceHeight = (coupons_list && coupons_list.length > 0) ? 140*_ratio : 0;
    const swiperHeight = this.windowHeight -(560*_ratio)-30
    const medicineViewHeight =(swiperHeight-spaceHeight)/_ratio
    const { storeCategory } = this.state
    const { storeCategoryIndex } = this.state

    return(
      <View className='store-medicine-view' style={'height:'+medicineViewHeight+'rpx'}>
        <Swiper className='container' current={storeCategoryIndex} onChange={this.onCategorySwiperChangeIndex.bind(this)}>
          {storeCategory.map((categoryItem, categoryIndex) => {
            return(
              <SwiperItem key={categoryIndex.toString()}>
                <ScrollView style={'height:'+medicineViewHeight+'rpx;'} className='flex-row flex-wrap' scrollY onScrollToLower={this.onLoadMoreData.bind(this, categoryIndex)}>
                  {categoryItem.items.map((medicineItem, medicineIndex) => {
                    const color = this.dealMedicineStatueColor(medicineItem.store_medicine_status)
                    const statusBorder = 'border: solid 1px ' + color
                    const titleColor = 'color: ' + color
                    
                    return(
                      <View className='store-medicine-item' key={medicineIndex.toString()}>
                        <CollectionGoodsItem data={medicineItem} showcar={false} />
                        {(medicineItem.store_medicine_status.length > 0 && categoryIndex === 0) 
                          && <View className='store-medicine-status' style={statusBorder}>
                              <Text className='store-medicine-status-title' style={titleColor}>{medicineItem.store_medicine_status}</Text>
                            </View>}
                      </View>
                    )
                  })}
                  <YFWFooterRefresh status={categoryItem.refreshStatus} />
                </ScrollView>
              </SwiperItem>
            )
          })}
        </Swiper>
      </View>
    )
  }

  /** 渲染底部操作按钮 */
  renderBottomActionView () {
    const { isIphoneX } = this.state
    return(
      <View className='bottom-action back-white' id='store-bttom'>
        <View className='bottom-line'></View>
        <View className='flex-row flex-content-evenly height-50 width-screen'>
          <View className='store-bottom-action-item flex-column flex-content-evenly flex-align-center' onClick={this.onStoreDetailClick.bind(this)}>
            <Image className='store-bottom-action-icon' src={require('../../../../images/bottom_icon_dianpu.png')} />
            <Text className='store-bottom-action-name'>商家简介</Text>
          </View>
          <View className='store-bottom-action-item flex-column flex-content-evenly flex-align-center' onClick={this.onStoreAllMedicineClick.bind(this)}>
            <Image className='store-bottom-action-icon' src={require('../../../../images/bottom_icon_all.png')} />
            <Text className='store-bottom-action-name'>全部商品</Text>
          </View>
          <View className='store-bottom-action-item flex-column flex-content-evenly flex-align-center' onClick={this.onServiceClick.bind(this)}>
            <Image className='store-bottom-action-icon' src={require('../../../../images/bottom_icon_zixun.png')} />
            <Text className='store-bottom-action-name'>在线咨询</Text>
          </View>
        </View>
        {isIphoneX && <View className='bottom-ipx'></View>}
      </View>
    )
  }

  /** 点击搜索 */
  onSearchClick () {
    const { storeId } = this.state
    pushNavigation('get_search', { storeid: storeId,placeholder:'搜索药品、品牌'})
  }

  /** 点击更多按钮 */
  onMoreIconClick () {
    this.setState({ isOpenMore: true })
  }

  /** 点击收藏按钮 */
  onCollectionStore () {
    const { storeId } = this.state
    if (storeId === 0) {
      return
    }

    let { storeInfo } = this.state
    const isCollected = storeInfo.is_favorite 
    if (isCollected) {
      shopDetailApi.getCancelCollectShop(storeId).then(response => {
        storeInfo.is_favorite = false
        this.setState({
          storeInfo: storeInfo
        })

        Taro.showToast({
          title: '取消收藏成功',
          icon: 'none',
          duration: 2000
        })
      }, error => {
        Taro.showToast({
          title: '取消收藏失败',
          icon: 'none',
          duration: 2000
        })
      })
    } else {
      shopDetailApi.getCollectShop(storeId).then(response => {
        storeInfo.is_favorite = true
        this.setState({
          storeInfo: storeInfo
        })

        Taro.showToast({
          title: '收藏成功',
          icon: 'none',
          duration: 2000
        })
      }, error => {
        Taro.showToast({
          title: '收藏失败',
          icon: 'none',
          duration: 2000
        })
      })
    }
  }

  /** 优惠券点击 */
  onCouponItemClick (couponItem) {
    goodsDetailApi.getCoupon(couponItem.id).then(response => {
      Taro.showToast({
        title: '优惠券领取成功',
        icon: 'none',
        duration: 2000
      })
    }, error => {
      const message = safe(error.msg).indexOf('领取失败') === -1 ? '优惠券领取失败' : error.msg
      Taro.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      })
    })
  }

  /** 点击切换分类 */
  onCategoryItemClick (categoryIndex) {
    const { storeCategoryIndex } = this.state
    if (categoryIndex !== storeCategoryIndex) {
      this.setState({
        storeCategoryIndex: categoryIndex
      })
      this.refreshMedicineData(categoryIndex)
    }
  }

  /** 滑动商品swiper */
  onCategorySwiperChangeIndex (event) {
    if (event.detail.source == "touch") {
      const index = event.detail.current
      this.setState({
        storeCategoryIndex: index
      })
      this.refreshMedicineData(index)
    }
  }

  /** 滑动分类时请求数据 */
  refreshMedicineData (categoryIndex) {
    const { storeCategory } = this.state
    const categoryItem = storeCategory[categoryIndex]
    if (categoryItem.items.length === 0 && categoryItem.moreData) {
      if (categoryIndex === 0) {
        this.fetchStoreRecommendMedicine()
      } else {
        this.fetchStoreCategoryMedicine(categoryIndex)
      }
    }
  }

  /** 请求加载更多数据 */
  onLoadMoreData (categoryIndex) {
    let { storeCategory } = this.state
    let categoryItem = storeCategory[categoryIndex]
    if (categoryItem.moreData && !categoryItem.loading) {
      categoryItem.pageIndex++
      storeCategory[categoryIndex] = categoryItem
      this.state.storeCategory = storeCategory
      this.fetchStoreCategoryMedicine(categoryIndex)
    }
  }

  /** 点击全部商品 */
  onStoreAllMedicineClick () {
    const { storeId } = this.state
    pushNavigation('get_shop_detail_list', { value: storeId })
  }

  /** 点击商家简介 */
  onStoreDetailClick () {
    const { storeId } = this.state
    pushNavigation('get_shop_detail_intro', { value: storeId })
  }

  /** 点击在线咨询 */
  onServiceClick () {
    const concatItem = {
      name: "咨询客服",
      type: "get_h5",
      value: 'https://m.yaofangwang.com/chat.html'
    }
    pushNavigation(concatItem.type, concatItem)
  }

  /** 解析药品状态颜色 */
  dealMedicineStatueColor ( medicineStatus ) {
    let color = ''
    switch (medicineStatus) {
      case '热销' :
          color = 'rgb(255,51,0);'
          break;
      case '促销' :
          color = 'rgb(254,172,76);'
          break;
      case '新品' :
          color = 'rgb(31,219,155);'
          break;
      case '推荐' :
          color = 'rgb(72,139,255);'
          break;
      default:
          color = 'rgb(255,51,0);'
          break;
      }
      return color
  }
}
