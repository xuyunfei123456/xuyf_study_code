import Taro, { Component } from '@tarojs/taro'
import { 
  View,
  Text,
  Image,
  ScrollView
} from '@tarojs/components'
import './YFWBaseModal.scss'

export default class YFWBaseModal extends Component {
  config = {
    component: true
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
  onBaseModalShow() {
    const { isShow } = this.state

    if (!isShow) {

      let translateAni = Taro.createAnimation({
        duration: 300,
        timingFunction: 'linear',
        delay: 0
      })

      let opacityAni = Taro.createAnimation({
        duration: 300,
        timingFunction: 'linear',
        delay: 0
      })

      translateAni.translateY(0).step()
      opacityAni.opacity(1).step()

      this.setState({
        translateAnimation: translateAni.export(),
        opacityAnimation: opacityAni.export(), 
        isShow: true
      })

      setTimeout(function () {
    
        translateAni.translateY(0).step()
        opacityAni.opacity(1).step()
        this.setState({
    
          translateAnimation: translateAni.export(),
          opacityAnimation: opacityAni.export(),
        })
      }.bind(this), 300)
    }
  }

  /** 隐藏modal */
  onBaseModalDismiss() {
    const { isShow } = this.state
    const transY = this.baseModalHeight

    if(isShow) {
      let that = this
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
    const { isShow } = this.state
    const { opacityAnimation } = this.state
    const { translateAnimation } = this.state

    return (
      <View className='base-modal' hidden={!isShow}>
        <View 
          className='base-modal-back' 
          animation={opacityAnimation} 
        >
        </View>
        <View className='base-modal-content'
          animation={translateAnimation} 
          onClick={this.onBaseModalDismiss.bind(this)}
          // onTouchMove={e => e.stopPropagation()}
        >
          {this.props.children}
        </View>
      </View>
    )
  }
}
