import { Block, View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './YFWStarScore.scss'

export default class YFWStarScore extends Taro.Component {
  static defaultProps = {
    title: '',
  }
  constructor(props) {
    super(props)
    this.state = {
      starScores: [0, 0, 0, 0, 0],
      unStartScores: [0, 0, 0, 0, 0],
      score_text: '非常好',
      startNum: 5,
    }
  }
  onStarClick = item => {
    this.state.unStartScores = []
    let text
    this.state.startNum = item.currentTarget.dataset.position + 1
    if (item.currentTarget.dataset.position === 4) {
      text = '非常好'
    } else if (item.currentTarget.dataset.position === 3) {
      text = '很好'
    } else if (item.currentTarget.dataset.position === 2) {
      text = '一般'
    } else if (
      item.currentTarget.dataset.position === 1 ||
      item.currentTarget.dataset.position === 0
    ) {
      text = '差'
    }
    for (let i = 0; i <= item.currentTarget.dataset.position; i++) {
      this.state.unStartScores.push(1)
    }
    this.setState({
      unStartScores: this.state.unStartScores,
      score_text: text
    })
    if (this.props.onGetStar) {
      this.props.onGetStar({ star: this.state.startNum, title: this.props.title })
    }
  }
  onUnStarClick = item => {
    this.state.unStartScores = []
    this.state.startNum = item.currentTarget.dataset.position + 1
    let text
    if (item.currentTarget.dataset.position === 4) {
      text = '非常好'
    } else if (item.currentTarget.dataset.position === 3) {
      text = '很好'
    } else if (item.currentTarget.dataset.position === 2) {
      text = '一般'
    } else if (
      item.currentTarget.dataset.position === 1 ||
      item.currentTarget.dataset.position === 0
    ) {
      text = '差'
    }
    for (let i = 0; i <= item.currentTarget.dataset.position; i++) {
      this.state.unStartScores.push(1)
    }
    this.setState({
      unStartScores: this.state.unStartScores,
      score_text: text
    })
    if (this.props.onGetStar) {
      this.props.onGetStar({ star: this.state.startNum, title: this.props.title })
    }
  }

  config = {
    component: true
  }

  render() {
    const { starScores, unStartScores, score_text } = this.state
    return (
      <View className="root_view">
        <View className="total_stars_view">
          {starScores.map((item, index) => {
            return (
              <Block>
                <View
                  className="startParent"
                  onClick={this.onStarClick}
                  data-position={index}
                >
                  <Image
                    className="start"
                    src={require('../../images/dd_icon_staring.png')}
                  ></Image>
                </View>
              </Block>
            )
          })}
        </View>
        <View className="total_stars_view">
          {unStartScores.map((item, index) => {
            return (
              <Block>
                <View
                  className="startParent"
                  onClick={this.onUnStarClick}
                  data-position={index}
                >
                  <Image
                    className="start"
                    src={require('../../images/sx_star.png')}
                  ></Image>
                </View>
              </Block>
            )
          })}
        </View>
        <Text className="score_text">{score_text}</Text>
      </View>
    )
  }
}