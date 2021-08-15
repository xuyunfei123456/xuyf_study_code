import Taro, { Component } from '@tarojs/taro'
import { 
  View,
  Text,
  Image,
  Swiper,
  SwiperItem
} from '@tarojs/components'
import './YFWAptitudeModal.scss'
import {get as getGlobalData } from '../../global_data'

export default class YFWAptitudeModal extends Component {
  config = {
    component: true
  }

  constructor (props) {
    super(...arguments)

    const { isOpened } = props
    const { aptitudes } = props
    const { lives } = props

    this.state = {
      _isOpened: isOpened,
      isIphoneX: getGlobalData('isIphoneX'),
      _aptitudes: aptitudes,
      _lives: lives,
      store_modal: {
        type: 1, // 1.商家资质 2.店铺实景
        image_list: aptitudes, // 图片数组
        name: "暂无资质图片", // 暂无资质图片 暂无实景图片
        isShowLeft: false, // 显示左箭头
        isShowRight: false, // 显示右箭头
        index: 0, // 当前滑动页数
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { aptitudes } = nextProps
    const { _aptitudes } = this.state
    const { lives } = nextProps
    const { _lives } = this.state
    const { isOpened } = nextProps
    const { _isOpened } = nextProps
    
    if (aptitudes.length !== _aptitudes.length) {
      let { store_modal } = this.state
      store_modal.image_list = aptitudes
      store_modal.isShowRight = aptitudes.length > 1

      this.setState({
        _aptitudes: aptitudes,
        _lives: lives,
        store_modal: store_modal
      })
    }

    if (isOpened !== _isOpened) {
      this.setState({ _isOpened: isOpened })
    }
  }

  close () {
    this.setState({ _isOpened: false})
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  render () {
    const { store_modal } = this.state
    const { _isOpened } = this.state
    const { isIphoneX } = this.state
    const emptyTitle = store_modal.type === 1 ? '暂无商家资质图片' : '暂无店铺实景图片'
    const layoutVisiable = _isOpened ? 'visibility: visible;' : 'visibility: hidden;'
    const layoutOpacity = _isOpened ? 'opacity: 1;' : 'opacity: 0;'
    const layoutTranslate = _isOpened ? 'transform: translate(0, 0);' : 'transform: translate(0, 100%);'

    return (
      <View className='yfw-apt-layout' style={layoutVisiable}>
        <View className='yfw-apt-layout-back' style={layoutOpacity} onClick={this.close.bind(this)}></View>
        <View className='yfw-apt-layout-body' style={layoutTranslate}>
          <View className='aptitude-modal' onClick={e => e.stopPropagation()}>
            <View className='aptitude-modal-header'>
              <View className={store_modal.type === 1 ? 'aptitude-modal-header-select' : 'aptitude-modal-header-normal'} onClick={this.onChangeStoreType.bind(this, 1)}>
                <Text className='aptitude-modal-header-title'>商家资质</Text>
              </View>
              <View className={store_modal.type === 2 ? 'aptitude-modal-header-select' : 'aptitude-modal-header-normal'} onClick={this.onChangeStoreType.bind(this, 2)}>
                <Text className='aptitude-modal-header-title'>店铺实景</Text>
              </View>
            </View>
            {store_modal.image_list.length === 0 && <View className='aptitude-modal-empty'>
              <Image className='aptitude-modal-empty-image' src={require('../../images/YFWGoodsDetailModule/goods_deail_empty_quality.png')} />
              <Text className='aptitude-modal-empty-name'>{emptyTitle}</Text>
            </View>}
            {store_modal.image_list.length > 0 && <View className='aptitude-modal-center'>
              <View className='aptitude-modal-center-lr' onClick={this.onLeftArrowClick.bind(this)}>
                {store_modal.isShowLeft && <Image className='aptitude-modal-center-lr-image' src={require('../../images/YFWGoodsDetailModule/goods_deail_arrow_left.png')} />}
              </View>
              <Swiper className='aptitude-modal-center-swiper' current={store_modal.index} onChange={this.onAptitudeSwiperChangeIndex.bind(this)}>
                {store_modal.image_list.map(aptitudeItem => {
                  return(
                    <SwiperItem>
                      <Image 
                        className='aptitude-modal-center-swiper-image' 
                        src={aptitudeItem.image_url} 
                        mode='aspectFit'
                        onClick={this.onShowBigPicture.bind(this)}
                      />
                    </SwiperItem>
                  )
                })}
              </Swiper>
              <View className='aptitude-modal-center-lr' onClick={this.onrightArrowClick.bind(this)}>
                {store_modal.isShowRight && <Image className='aptitude-modal-center-lr-image' src={require('../../images/YFWGoodsDetailModule/goods_deail_arrow_right.png')} />}
              </View>
            </View>}
            <View className='aptitude-modal-bottom' onClick={this.close.bind(this)}>
              <Text className='aptitude-modal-bottom-title'>关闭</Text>
            </View>
            {isIphoneX && <View className='apt-modal-ipx'></View>}
          </View>
        </View>
      </View>
    )
  }

  /** 点击查看大图 */
  onShowBigPicture() {
    const { store_modal } = this.state
    const { image_list } = store_modal
    const current = image_list[store_modal.index].image_url
    let urls = []
    image_list.map(imageItem => {
      urls.push(imageItem.image_url)
    })
    Taro.previewImage({
      current: current,
      urls: urls
    })
  }

  /** 切换商家资质和实景 */
  onChangeStoreType(type) {
    let { store_modal } = this.state
    if (type !== store_modal.type) {
      const { _aptitudes } = this.state
      const { _lives } = this.state
      const image_list = type === 1 ? _aptitudes : _lives
      
      store_modal.type = type;
      store_modal.name = type === 1 ? "暂无资质图片" : "暂无实景图片"
      store_modal.image_list = image_list
      store_modal.index = 0
      store_modal.isShowLeft = false
      store_modal.isShowRight =  image_list.length > 1;

      this.setState({
        store_modal: store_modal
      })
    }
  }

  /** 点击左滑动 */
  onLeftArrowClick() {
    let { store_modal } = this.state
    let { index } = store_modal

    if (store_modal.isShowLeft) {
      index--
      store_modal.index = index
      store_modal.isShowLeft = index > 0
      store_modal.isShowRight = true;

      this.setState({
        store_modal: store_modal
      })
    }
  }

  /** 点击右滑动 */
  onrightArrowClick() {
    let { store_modal } = this.state
    let { index } = store_modal

    if (store_modal.isShowRight) {
      index++
      store_modal.index = index
      store_modal.isShowRight = index < (store_modal.image_list.length-1)
      store_modal.isShowLeft = true;

      this.setState({
        store_modal: store_modal
      })
    }
  }

  /** 滑动swiper */
  onAptitudeSwiperChangeIndex(event) {
    if (event.detail.source == "touch") {
      let { store_modal } = this.state
      const index = event.detail.current 
      store_modal.index = index
      store_modal.isShowRight = index < (store_modal.image_list.length-1)
      store_modal.isShowLeft = index > 0;
      this.setState({
        store_modal: store_modal
      })
    }
  }
}

YFWAptitudeModal.defaultProps = {
  aptitudes: [],
  lives: [],
  isOpened: false
}
