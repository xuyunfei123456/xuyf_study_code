import Taro, { Component } from '@tarojs/taro'
import { 
  View,
  Text,
  Image
} from '@tarojs/components'
import './YFWActionModal.scss'

export default class YFWActionModal extends Component {
  config = {
    component: true
  }

  static defaultProps = {
    modalTitle: '',
  }

  constructor (props) {
    super(props)
    this.state = {
      isShow: false,
      opacityAnimation: {},
      translateAnimation: {}
    }
  }

  componentDidMount() {
    Taro.getSystemInfo({
      success: res => {
        this.baseModalHeight = res.windowHeight
      }
    })
  }

  /** 显示modal */
  onActionModalShow() {
    const { isShow } = this.state

    if (!isShow) {

      let translateAni = Taro.createAnimation({
        duration: 300,
        timingFunction: 'linear',
        delay: 100
      })

      let opacityAni = Taro.createAnimation({
        duration: 300,
        timingFunction: 'linear',
        delay: 0
      })

      opacityAni.opacity(1).step()
      translateAni.translateY(0).step()

      this.setState({
        isShow: true,
        opacityAnimation: opacityAni.export(),
        translateAnimation: translateAni.export(),
      })

      setTimeout(function () {
        opacityAni.opacity(1).step()
        translateAni.translateY(0).step()
        this.setState({
          opacityAnimation: opacityAni.export(),
          translateAnimation: translateAni.export(),
        })
      }.bind(this), 300)
    }
  }

  /** 隐藏modal */
  onActionModalDismiss() {
    const { isShow } = this.state
    const transY = this.baseModalHeight

    if(isShow) {
      
      let translateAni = Taro.createAnimation({
        duration: 300,
        timingFunction: 'linear',
        delay:0
      })
      translateAni.translateY(transY).step()

      let opacityAni = Taro.createAnimation({
        duration: 300,
        timingFunction: 'linear',
        delay: 0
      })
      opacityAni.opacity(0).step()

      this.setState({
        translateAnimation: translateAni.export(),
        opacityAnimation: opacityAni.export(),
      })

      setTimeout(function () {
        opacityAni.opacity(0).step()
        translateAni.translateY(transY).step()
        this.setState({
          opacityAnimation: opacityAni.export(),
          translateAnimation: translateAni.export(),
          isShow: false
        })
      }.bind(this), 300)
    }
  }

  render () {
    const { modalTitle } = this.props
    const { isShow } = this.state
    const { opacityAnimation } = this.state
    const { translateAnimation } = this.state

    return (
      <View className='action-modal' hidden={!isShow}>
        <View 
          className='action-modal-back' 
          animation={opacityAnimation} 
        >
        </View>
        <View className='action-modal-content'
          animation={translateAnimation} 
          onClick={this.onActionModalDismiss.bind(this)}
          // onTouchMove={e => e.stopPropagation()}
        >
          <View className='action-content' onClick={e => e.stopPropagation()}>
            <View className='action-modal-head'>
              <View className='action-modal-head-lr'></View>
              <View className='action-modal-head-center'>
                <Text className='action-modal-title'>{modalTitle}</Text>
              </View>
              <View className='action-modal-head-lr' onClick={this.onActionModalDismiss.bind(this)}>
                <Image className='action-modal-close-icon' src={require('../../images/returnTips_close.png')} />
              </View>
            </View>
            <View className='action-content-content'>
              {this.props.children}
            </View>
          </View>
        </View>
      </View>
    )
  }
}
