import Taro, { Component } from '@tarojs/taro'
import { 
  View,
  Image,
  Text
} from '@tarojs/components'
import './YFWShopDetailIntro.scss'
import { ShopDetailApi } from '../../../../apis/index'
import { getShopInfo } from '../Model/YFWShopDetailInfoModel'
import YFWMoreModal from '../../../../components/YFWMoreModal/YFWMoreModal'
import { 
  isNotEmpty,
  safe
} from '../../../../utils/YFWPublicFunction'
const shopDetailApi = new ShopDetailApi()

export default class YFWShopDetailIntro extends Component {

  config = {
    navigationBarTitleText: '商家简介'
  }
  constructor (props) {
    super(props)
    this.state = {
      storeId: 0,
      isOpenMore: false,
      storeInfo: {},
      qualificationItems:[],
      qualificationImages:[],
      sceneItems:[],
      sceneImages:[],
      windowHeight:"",
    }
  }

  componentWillMount () {
    let sysInfo = Taro.getSystemInfoSync();
    this.state.windowHeight = sysInfo.windowHeight/sysInfo.windowWidth*750;
    this.setState({
      windowHeight:this.state.windowHeight
    })
    const params = this.$router.params.params
    if (isNotEmpty(params)) {
      const value = JSON.parse(decodeURIComponent(params))
      this.state.storeId = value.value || 0 
    }

    this.fetchStoreDetail()
    this.fetchStoreImages()
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

  /** 获取商家资质图片和实景图片 */
  fetchStoreImages () {
    const { storeId } = this.state
    if (storeId === 0) {
      return
    }

    shopDetailApi.getShopQualification(storeId).then(response => {
      let zzImages = []
      response.zz_items.map(zzItem => {
        zzImages.push(zzItem.image_url)
      })
      let sjImages = []
      response.sj_items.map(sjItem => {
        sjImages.push(sjItem.image_url)
      })
      this.setState({
        qualificationItems: response.zz_items,
        qualificationImages: zzImages,
        sceneItems: response.sj_items,
        sceneImages: sjImages
      })
    }, error => {

    })
  }

  render () {
    const { isOpenMore ,windowHeight} = this.state

    return (
      <View className='container' style={`height:${windowHeight}rpx;overflow:scroll`}>
        {this.renderBackgroundImage()}
        {this.renderTopView()}
        {this.renderStoreInfoView()}
        {this.renderScoreView()}
        {this.renderStoreOtherView()}
        {this.renderStoreImagesView()}
        <YFWMoreModal isOpened={isOpenMore} onClose={() => this.setState({ isOpenMore: false })} />
      </View>
    )
  }

  /** 渲染背景图片 */
  renderBackgroundImage () {
    return(
      <Image className='store-back-image store-back-height' src={require('../../../../images/shop_bg.jpg')}/>
    )
  }

  /** 渲染顶部搜索、更多 */
  renderTopView () {
    return(
      <View className='flex-row flex-content-between flex-align-center width-screen height-50'>
        <View className='shop-more-view'></View>
        <Text className='shop-title'>店铺详情</Text>
        <View className='shop-more-view flex-row flex-content-center flex-align-center' onClick={this.onMoreIconClick.bind(this)}>
          <Image className='shop-more-icon' src={require('../../../../images/more_white.png')} />
        </View>
      </View>
    )
  }

  /** 渲染商家信息 */
  renderStoreInfoView () {
    const { storeInfo } = this.state

    return(
      <View className='shop-content shop-width-94'>
        <View className='shop-info-view flex-row flex-content-between flex-align-center'>
          <View className='flex-row'>
            <Image className='store-logo margin-right-10' src={storeInfo.logo_img_url} mode='widthFix' />
            <Text className='shop-name'>{storeInfo.title}</Text>
          </View>
          <View className='shop-sign-view flex-row flex-content-center flex-align-center'>
            <Text className='text-12 text-green'>已签约</Text>
          </View>
        </View>
        <Text className='shop-address'>{storeInfo.address}</Text>
      </View>
    )
  }

  /** 渲染评分 */
  renderScoreView () {
    const { storeInfo } = this.state

    return(
      <View className='shop-content shop-width-94'>
        <View className='shop-score-view'>
          {this.renderTotalScoreItem('服务总评', storeInfo.total_star, storeInfo.evaluation_count)}
          {this.renderScoreItem('客户服务', storeInfo.service_star, storeInfo.service_rate)}
          {this.renderScoreItem('发货速度', storeInfo.delivery_star, storeInfo.send_rate)}
          {this.renderScoreItem('物流速度', storeInfo.shipping_star, storeInfo.logistics_rate)}
          {this.renderScoreItem('商品包装', storeInfo.package_star, storeInfo.package_rate)}
        </View>
      </View>
    )
  }

  /** 渲染评分item */
  renderTotalScoreItem (name, score, rate) {
    return(
      <View className='shop-score-item flex-row flex-align-center'>
        <Text className='text-12 text-light'>{safe(name)}</Text>
        {this.renderScoreStar(safe(score))}
        <Text className='text-12 text-normal'>{'(共'+safe(rate)+'人参加评分)'}</Text>
      </View>
    )
  }

  /** 渲染星星 */
  renderScoreStar (score) {
    const scoreF = parseFloat(score)
    return(
      <View className='flex-row shop-margin-left-25'>
        {scoreF > 0.0 && <Image className='shop-score-star' src={require('../../../../images/sx_star.png')} />}
        {scoreF >= 1.0 && <Image className='shop-score-star' src={require('../../../../images/sx_star.png')} />}
        {scoreF >= 2.0 && <Image className='shop-score-star' src={require('../../../../images/sx_star.png')} />}
        {scoreF >= 3.0 && <Image className='shop-score-star' src={require('../../../../images/sx_star.png')} />}
        {scoreF >= 4.0 && <Image className='shop-score-star' src={require('../../../../images/sx_star.png')} />}
      </View>
    )
  }

  /** 渲染评分item */
  renderScoreItem (name, score, rate) {
    return(
      <View className='shop-score-item flex-row flex-align-center'>
        <Text className='text-12 text-light'>{name}</Text>
        <Text className='shop-score'>{safe(score)+'分'}</Text>
        <Text className='text-12 text-normal'>{'领先'+safe(rate)+'的商家'}</Text>
      </View>
    )
  }

  /** 渲染退单率、发货时长 */
  renderStoreOtherView () {
    const { storeInfo } = this.state
    return(
      <View className='shop-content shop-width-94'>
        <View className='shop-score-view'>
          {this.renderStoreOtherItem('退单率', storeInfo.return_rate)}
          {this.renderStoreOtherItem('平均发货时长', storeInfo.avg_send_time)}
        </View>
      </View>
    )
  }

  /** 渲染退单率、发货时长item */
  renderStoreOtherItem (name, content) {
    return(
      <View className='shop-score-item flex-row flex-align-center'>
        <Text className='shop-score-width text-12 text-light'>{name}</Text>
        <Text className='shop-score-content text-12 text-green'>{safe(content)}</Text>
      </View>
    )
  }

  /** 渲染商家资质、商家实景 */
  renderStoreImagesView () {
    const { qualificationItems } = this.state
    const { sceneItems } = this.state

    return(
      <View className='flex-column'>
        <Text className='shop-sz-title'>商家资质</Text>
        <View className='flex-row flex-wrap'>
          {qualificationItems.map((qualifiItem, qualifiIndex) => {
            return(
              <View 
                className='shop-content shop-width-45 flex-content-center flex-align-center' 
                taroKey={qualifiIndex} 
                onClick={this.onStoreImageItemClick.bind(this, 1, qualifiIndex)}
              >
                <Image className='shop-zz-image' src={qualifiItem.image_url} />
                <Text className='shop-zz-name text-ellipsis text-line-1'>{qualifiItem.image_name}</Text>
              </View>
            )
          })}
          </View>
          <View className='shop-sz-title'>商家实景</View>
          <View className='flex-row flex-wrap'>
          {sceneItems.map((liveItem, liveIndex) => {
            return(
              <View 
                className='shop-content shop-width-94 flex-content-between flex-align-center' 
                taroKey={liveIndex}
                onClick={this.onStoreImageItemClick.bind(this, 2, liveIndex)}
              >
                <Image className='shop-sj-image' src={liveItem.image_url} mode='aspectFit' />
              </View>
            )
          })}

        </View>
      </View>
    )
  }

  /** 点击更多 */
  onMoreIconClick () {
    this.setState({ isOpenMore: true })
  }

  /** 点击查看大图 */
  onStoreImageItemClick (type, currentIndex) {
    const imageUrls = type === 1 ? this.state.qualificationImages : this.state.sceneImages
    const currentUrl = imageUrls[currentIndex]
    Taro.previewImage({
      current: currentUrl,
      urls: imageUrls
    })
  }
}