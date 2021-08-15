import Taro, { Component } from '@tarojs/taro'
import { 
  View,
  Text
} from '@tarojs/components'
import './YFWSideBar.scss'

export default class YFWSideBar extends Component {
  config = {
    component: true
  }

  static defaultProps = {
    sideWidth: 100,
    sideHeight: 22,
    isCollection: false
  }

  constructor (props) {
    super(props)
    this.state = {
      isOpen: false,
      transform: ''
    }
  }

  componentWillMount () {
    Taro.getSystemInfo({
      success: (res) => {
        this.windowWidth = res.windowWidth
      }
    })

    this.startPointX = 0
    this.startPointY = 0
    this.markPointX = 0
    this.endPointX = 0
    this.moveVertical = false
  }

  render () {
    const { sideWidth } = this.props
    const { sideHeight } = this.props
    const { isCollection } = this.props
    const { transform } = this.state
    const sideStyle = 'width: '+sideWidth+'vw; height: '+sideHeight+'vw;'
    const topStyle = 'width: '+sideWidth+'vw; height: '+sideHeight+'vw; transform: '+transform
    const bottomStyle = 'width: '+sideWidth+'vw; height: '+sideHeight+'vw;'

    return (
      <View className='side-bar' style={sideStyle}>
        <View 
          className='side-bar-top' 
          style={topStyle}
          onTouchStart={this.onSideTouchStart.bind(this)}
          onTouchMove={this.onSideTouchMove.bind(this)}
          onTouchEnd={this.onSideTouchEnd.bind(this)}
        >
          {this.props.children}
        </View>
        <View className='side-bar-bottom' style={bottomStyle}>
          { isCollection 
            && <View className='side-bar-bottom-item' style={'height: '+sideHeight+'vw; background-color: #a1a1a1;'} onClick={this.onCollectionItemClick.bind(this)}>
                <Text className='side-bar-bottom-item-title'>移入收藏</Text>
              </View>
          }
          <View className='side-bar-bottom-item' style={'height: '+sideHeight+'vw; background-color: #ff3300;'} onClick={this.onDeleteItemClick.bind(this)}>
            <Text className='side-bar-bottom-item-title'>删除</Text>
          </View>
        </View>
      </View>
    )
  }

  /** 开始触摸 */
  onSideTouchStart (event) {
    const startPoint = event.touches[0] || event.changedTouches[0]
    this.startPointX = startPoint.pageX
    this.startPointY = startPoint.pageY
  }

  /** 滑动 */
  onSideTouchMove (event) {
    if (this.moveVertical === true) {
      return
    }

    const movePoint = event.touches[0] || event.changedTouches[0]
    const movePointX = movePoint.pageX
    const movePointY = movePoint.pageY
    const moveX = this.startPointX - movePointX
    const moveY = this.startPointY - movePointY
    if (Math.abs(moveY) > (Math.abs(moveX)/3)) {
      // 竖向滑动
      this.moveVertical = true
      return
    }

    const { isOpen } = this.state
    const { isCollection } = this.props
    const bottomWidth = isCollection ? 36 : 18
    const limmitWidth = bottomWidth/100*this.windowWidth
    if (this.startPointX >= movePointX) {
      // 左滑
      if (isOpen === false) {
        const translateX = Math.min(moveX, limmitWidth)
        const transform = 'translateX(-' + translateX + 'px);'
        this.setState({
          transform: transform
        })
      }
    } else {
      // 右滑
      if (isOpen === true) {
        const translateX = Math.max(limmitWidth+moveX, 0)
        const transform = 'translateX(-' + translateX + 'px);'
        this.setState({
          transform: transform
        })
      }
    }
  }

  /** 结束触摸 */
  onSideTouchEnd (event) {
    const { isCollection } = this.props
    const bottomWidth = isCollection ? 36 : 18
    const { isOpen } = this.state
    const limmitWidth = bottomWidth/100*this.windowWidth

    if (this.moveVertical) {
      const translateX = isOpen ? limmitWidth : 0
      const transform = 'translateX(-' + translateX + 'px);'
      this.setState({
        transform: transform
      })

      this.moveVertical = false
      return
    }

    const endPoint = event.touches[0] || event.changedTouches[0]
    const endPointX = endPoint.pageX
    const moveX = Math.abs(this.startPointX - endPointX)
    if (this.startPointX > endPointX) {
      // 左滑
      if (isOpen === false) {
        const open = moveX >= (limmitWidth*0.3)
        const translateX = open ? limmitWidth : 0
        const transform = 'translateX(-' + translateX + 'px);'
        this.setState({
          transform: transform,
          isOpen: open
        })
        open && this.props.onOpen && this.props.onOpen()
      }
    } else {
      // 右滑
      if (isOpen === true) {
        const open = moveX <= (limmitWidth*0.3)
        const translateX = open ? limmitWidth : 0
        const transform = 'translateX(-' + translateX + 'px);'
        this.setState({
          transform: transform,
          isOpen: open
        })
      }
    }
  }

  /** 点击收藏 */
  onCollectionItemClick () {
    this.props.onCollection && this.props.onCollection()
  }

  /** 点击删除 */
  onDeleteItemClick () {
    this.props.onDelete && this.props.onDelete()
  }

  /** 关闭 */
  onClose () {
    const { isOpen } = this.state
    if (isOpen) {
      this.setState({
        transform: 'translateX(0px);',
        isOpen: false
      })
    }
  }
}
