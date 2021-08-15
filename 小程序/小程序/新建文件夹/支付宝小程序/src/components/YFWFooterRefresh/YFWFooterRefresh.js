import Taro, { Component } from '@tarojs/taro'
import { 
  View,
  Image,
  Text
} from '@tarojs/components'

import './YFWFooterRefresh.scss'

export default class YFWFooterRefresh extends Component {

  config = {
    component: true
  }

  constructor (props) {
    super(props)

    const { status } = props

    this.state = {
      _status: status, // 只有三个值 默认：hidden，加载中：loading，没有更多了：nomore
    }
  }

  componentWillReceiveProps(nextProps) {
    const { status } = nextProps 
    const { _status } = this.state 

    if (status !== _status) {
      this.setState({
        _status: status
      })
    }
  }

  render() {
    const { _status } = this.state
    const _isHidden = _status === 'hidden'
    const _hiddenIcon = _status === 'nomore'
    let title = ''
    if (_status === 'loading') {
      title = '正在加载中...'
    } else if (_status === 'nomore') {
      title = '没有更多了'
    }

    return(
      <View className='footer-view' hidden={_isHidden}>
        {!_hiddenIcon && <Image className='footer-icon' src={require('../../images/loading_cycle.gif')} />}
        <Text className='footer-title'>{title}</Text>
      </View>
    )
  }
}

YFWFooterRefresh.defaultProps = {
  status: 'hidden'
}