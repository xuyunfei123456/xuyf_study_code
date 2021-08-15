import { Block, View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './YFWTitleView.scss'

export default class YFWTitleView extends Taro.Component {
  static defaultProps = {
    title: '',
    fontSize: 30,
    fontWeight: 'bold',
    fontColor: '#1fdb9b',
    titleHeight: 15,
    lineHeight: 10,
    showLine: true,
    largeStyle: false,
    showImage:true,
  }
  largeStyles(){
    this.setState({
      fontColor: largeStyle ? '#1fdb9b' : '#333'
    })
  }
  config = {
    component: true
  }

  render() {
    const { title } = this.props
    const { fontSize } = this.props
    const { fontWeight } = this.props
    const { fontColor } = this.props
    const { titleHeight } = this.props
    const { lineHeight } = this.props
    const { showLine } = this.props
    const { largeStyle,showImage } = this.props
    let color = (largeStyle ? '#1fdb9b' : '#333')
    const textStyle = 'color: '+color+';font-size: '+fontSize+'rpx; fontWeight: '+fontWeight+';'
    return (
      <View className="root">
        <Text
          className={process.env.TARO_ENV=='alipay' ? "text_title_alipay" : "text_title"}
          id="title"
          style={textStyle}>
          {title}
        </Text>
        {largeStyle ? (
          <Image
            className="line_image"
            src={require('../../images/title_bottom_line_another.png')}
            style={'display:'+(showImage?'block':'none')}
          ></Image>
        ) : (
          <Image
            className="text_image"
            src={require('../../images/title_bottom_line.png')}
            style={
              'height:' + lineHeight + 'rpx;opacity:' + (showLine ? '1' : '0')+';display:'+(showImage?'block':'none')
            }
          ></Image>
        )}
      </View>
    )
  }
} // components/YFWTitleView.js