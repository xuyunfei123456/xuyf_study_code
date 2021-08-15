import Taro, { Component } from '@tarojs/taro'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import './YFWFloatLayout.scss'

export default class YFWFloatLayout extends Component {

  config = {
    component: true
  }

  constructor (props) {
    super(...arguments)

    const { isOpened } = this.props
    const { title } = this.props
    this.state = {
      _isOpened: isOpened,
      _title: title
    }
  }

  componentWillReceiveProps (nextProps) {
    const { isOpened } = nextProps
    const { _isOpened } = this.state

    if (isOpened !== _isOpened) {
      this.setState({
        _isOpened: isOpened
      })
    }
  }

  /** 关闭 */
  close () {
    this.setState({ _isOpened: false })
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  render () {
    const { _isOpened } = this.state
    const { _title } = this.state
    const layoutVisiable = _isOpened ? 'visibility: visible;' : 'visibility: hidden;'
    const layoutOpacity = _isOpened ? 'opacity: 1;' : 'opacity: 0;'
    const layoutTranslate = _isOpened ? 'transform: translate(0, 0);' : 'transform: translate(0, 100%);'

    return (
      <View className='yfw-float-layout' style={layoutVisiable} >
        <View 
          className='yfw-float-layout-back' 
          style={layoutOpacity} 
          onClick={this.close.bind(this)}
          onTouchMove={e => {
            e.preventDefault()
          }}
        >
        </View>
        <View className='yfw-float-layout-body' style={layoutTranslate}>
          <View className='float-layout-header'>
            <Text>{_title}</Text>
            <View onClick={this.close.bind(this)}>
              <Image className='close-icon' src={require('../../images/returnTips_close.png')} mode='widthFix' />
            </View>
          </View>
          <View className='float-layout-content'>
            <ScrollView 
              className='float-layout-content'
              scrollY={true}
            >
              {this.props.children}
            </ScrollView>
          </View>
        </View>
      </View>
    )
  }
}

YFWFloatLayout.defaultProps = {
  isOpened: false,
  title: '',
  onClose: () => {}
}