import Taro, { Component } from '@tarojs/taro'
import { 
  View,
  Text,
  Image
} from '@tarojs/components'
import './YFWMoreModal.scss'
import { pushNavigation } from '../../apis/YFWRouting'

export default class YFWMoreModal extends Component {
  config = {
    component: true
  }

  constructor (props) {
    super(...arguments)

    const { isOpened } = props
    this.state = {
      _isOpened: isOpened,
      moreData: [
        {
          id: 1,
          name: '消息',
          icon: require('../../images/pop1.png'),
          page: 'get_message_home'
        },
        {
          id: 2,
          name: '首页',
          icon: require('../../images/pop2.png'),
          page: 'get_home'
        },
        {
          id: 3,
          name: '商品分类',
          icon: require('../../images/pop3.png'),
          page: 'get_all_category'
        },
        {
          id: 4,
          name: '购物车',
          icon: require('../../images/pop4.png'),
          page: 'get_shopping_car'
        },
        {
          id: 5,
          name: '我的',
          icon: require('../../images/pop5.png'),
          page: 'get_user_center'
        },
      ]
    }
  }

  componentWillReceiveProps (nextProps) {
    const { isOpened } = nextProps
    const { _isOpened } = this.state

    if (_isOpened !== isOpened) {
      this.setState({ _isOpened: isOpened })
    }
  }

  close () {
    this.setState({ _isOpened: false })
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  render () {
    const { _isOpened } = this.state
    const { moreData } = this.state
    const layoutVisiable = _isOpened ? 'visibility: visible;' : 'visibility: hidden;'
    const layoutOpacity = _isOpened ? 'opacity: 1;' : 'opacity: 0;'

    return (
      <View 
        className='more-modal' 
        style={layoutVisiable}
        onClick={this.close.bind(this)}
        onTouchMove={e => e.stopPropagation()}
      >
        <View className='more-modal-conent' style={layoutOpacity}>
          <Image className='more-modal-arrow' src={require('../../images/more_view_angle.png')} />
          <View className='more-modal-list'>
            {moreData.map(moreItem => {
              return(
                <View className='more-modal-item' onClick={this.onMoreItemClick.bind(this, moreItem)}>
                  <Image className='more-modal-item-icon' src={moreItem.icon} />
                  <Text className='more-modal-item-name'>{moreItem.name}</Text>
                </View>
              )
            })}
          </View>
        </View>
      </View>
    )
  }

  /** 点击item */
  onMoreItemClick (moreItem) {
    pushNavigation(moreItem.page)
  }
}

YFWMoreModal.defaultProps = {
  isOpened: false
}
