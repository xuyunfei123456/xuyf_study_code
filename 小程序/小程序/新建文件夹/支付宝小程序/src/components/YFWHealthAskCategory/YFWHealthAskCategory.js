import Taro, { Component, Config } from '@tarojs/taro'
import {
    Block,
    View,
    Text
} from '@tarojs/components'
import { pushNavigation } from '../../apis/YFWRouting.js'
import './YFWHealthAskCategory.scss'

class YFWHealthAskCategory extends Taro.Component {
  config = {
    component: true
  }
  constructor (props) {
    super(...arguments)

    const { data,titel } = props
    this.state = {
      data: data,
      titel: titel,
      isOpened:false,
    }
  }
  componentWillReceiveProps (nextProps) {
    const { isOpened,data } = nextProps
    this.setState({ isOpened,data, })

  }

  close () {
    this.setState({ _isOpened: false })
    if (this.props.onClose) {
      this.props.onClose()
    }
  }


  itemClick(e) {
    if(this.props.onItemClick){
      this.props.onItemClick({context: e.currentTarget.dataset.item})
    }
    this.setState({
      isOpened: false
    })
  }
  render() {
    const { isOpened, data } = this.state
    return (
      <View
        className="modal-back"
        hidden={!isOpened}
        onClick={this.close}
        id="father"
      >
        <View className="modal-content" onClick={this.close}>
          <View className="content-view">
            {data.map((item, index) => {
              return (
                <Block key={index}>
                  <View
                    className="category-view"
                    onClick={this.itemClick}
                    data-item={item}
                  >
                    <Text>{item.department_name}</Text>
                  </View>
                </Block>
              )
            })}
          </View>
        </View>
      </View>
    )
  }
}
YFWHealthAskCategory.defaultProps = {
  data:{},
  title:'',

}
export default YFWHealthAskCategory
