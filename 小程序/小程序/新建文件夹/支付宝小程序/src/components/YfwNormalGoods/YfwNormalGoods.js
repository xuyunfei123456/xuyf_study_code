import { Block, View, Image } from '@tarojs/components'
import Taro, { Component, Config } from "@tarojs/taro";
import './YfwNormalGoods.scss'


class YfwNormalGoods extends Component {

  config = {
      component: true
  }

  static defaultProps = {
    imgWrapperHeight: '0.00',
    img: '#ff3300',
    name: 30,
    price: '',
  }


  componentWillMount () { }

  componentDidMount () { }

  render() {
    const { imgWrapperHeight, img, name, price } = this.props
    return (
      <View className="wrapper">
        <View
          className="goods_img"
          style={'height:' + imgWrapperHeight + 'rpx;'}
        >
          <Image className="img" src={img} mode="widthFix"></Image>
        </View>
        <View className="normal_name">{name}</View>
        <View className="price">
          <View className="nowPrice">{'￥' + price}</View>
          <View className="oldPrice"></View>
        </View>
      </View>
    )
  }
}

export default YfwNormalGoods
