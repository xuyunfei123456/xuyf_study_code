import { Block, View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import Filter from '../../imports/Filter.js'
import './YFWStar.scss'

class YFWStar extends Taro.Component {
  static defaultProps = {
    total: 5,
    starSize: 24,
    starSpacing: 10,
    starColor: 'yellow',
    stars: 5,
    disStar:[0,0,0,0,0]
  }
  constructor(props) {
    super(props)
    this.state = {
      arr: new Array()
    }
  }
  componentWillMount() {
    for (let i = 0; i < this.props.stars; i++) {
      this.state.arr.push(1)
    }
    // console.log(this.props.stars)
  }

  config = {
    component: true
  }

  render() {
    const { disStar, total, starSize, starSpacing, starColor, stars } = this.props
    return (
      <View className="root_view">
        <View className="total_stars_view">
          {disStar.map((item, index) => {
            return (
              <Image
                className="start"
                src={require('../../images/nearly_star_disenable.png')}
                style={
                  'left:' +
                  (index == 0 ? 0 : index * (starSpacing + starSize)) +
                  'rpx'
                }
              ></Image>
            )
          })}
        </View>
        <View className="total_stars_view">
          {this.state.arr.map((item, index) => {
            return (
              <Image
                className="start"
                src={require('../../images/sx_star.png')}
                style={
                  'left:' +
                  (index == 0 ? 0 : index * (starSpacing + starSize)) +
                  'rpx'
                }
              ></Image>
            )
          })}
        </View>
        <View
          style={'width:' + (starSpacing + starSize) * total + 'rpx'}
        ></View>
      </View>
    )
  }
} // components/YFWStar/YFWStar.js

export default YFWStar
