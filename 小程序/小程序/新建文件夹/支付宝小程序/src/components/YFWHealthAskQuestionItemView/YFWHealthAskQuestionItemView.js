import Taro, { Component, Config } from '@tarojs/taro'
import {
    Block,
    View,
    Image,
    Text
} from '@tarojs/components'
import { pushNavigation } from '../../apis/YFWRouting.js'
import './YFWHealthAskQuestionItemView.scss'

class YFWHealthAskQuestionItemView extends Taro.Component {
  config = {
    component: true
  }
  
  constructor (props) {
    super(...arguments)


    this.state = {
      data: [],
      froms: ''
    }
  }
  static defaultProps = {
    data: [],
    froms: ''
  }
  componentWillReceiveProps (nextProps) {
    const { data,froms } = nextProps
    this.setState({ data,froms })
  }
  clickItemMethod(e) {
    let detailId = e.currentTarget.dataset.id
    pushNavigation('get_ask_detail', { value: detailId })
  }
  render() {
    const { data, froms } = this.state
    return (
      <View className="container">
        {data.map((item, index) => {
          return (
            <Block>
              {froms === 'pharmacist_ask' && (
                <View
                  className="my-box"
                  onClick={this.clickItemMethod}
                  data-id={item.id}
                >
                  <Text className="item-text">{item.title}</Text>
                  <View className="my-box-context">
                    <Text className="box-context-one">{item.reply_count}</Text>
                    <Text className="box-context-two">条回复</Text>
                    <Text className="box-context-thress">{item.time}</Text>
                  </View>
                  <View className="line-view"></View>
                </View>
              )}
              {froms === '' && (
                <View
                  className="mybox"
                  onClick={this.clickItemMethod}
                  data-id={item.id}
                >
                  <View className="title-view">
                    <Image className="title_icon"></Image>
                    <Text>{item.title}</Text>
                    <Image
                      className="title_icon1"
                      src={require('../../images/icon_wen.png')}
                    ></Image>
                  </View>
                  {(item.status == '已回复' || item.status == '已采纳') && (
                    <View className="doctor-ask">
                      <View className="doctor-view">
                        <View className="doctor-item">
                          <Image src={item.intro_image}></Image>
                          <Text className="doctor-text">{item.name}</Text>
                          <View className="doctor-item-view">
                            <Text
                              style={
                                'color:' +
                                (item.type_name === '药师'
                                  ? '#dab96b'
                                  : '#ec8028')
                              }
                            >
                              {item.type_name}
                            </Text>
                          </View>
                          <View className="shop-name">
                            {item.practice_unit}
                          </View>
                        </View>
                      </View>
                      <View className="reply_content">
                        {item.reply_content}
                      </View>
                    </View>
                  )}
                  <View className="bottom-view">
                    <Text className="bottom-left-view">{item.time}</Text>
                    <View className="bottom-right-view">
                      <View className="bottom-right-status">
                        {(item.status === '待回复' ||
                          item.status === '未回复') && (
                          <Image
                            src={require('../../images/yfwsk/inf999.png')}
                            mode="aspectFit"
                          ></Image>
                        )}
                        {item.status === '已回复' && (
                          <Image
                            src={require('../../images/yfwsk/infgreen.png')}
                            mode="aspectFit"
                          ></Image>
                        )}
                        {item.status === '已采纳' && (
                          <Image
                            src={require('../../images/yfwsk/caina.png')}
                            mode="aspectFit"
                          ></Image>
                        )}
                        <Text
                          style={
                            'color:' +
                            (item.status === '已回复'
                              ? '#1fdb9b'
                              : item.status === '已采纳'
                              ? '#feac4c'
                              : '#999999')
                          }
                        >
                          {item.status}
                        </Text>
                      </View>
                      <View className="reply_count">
                        <Text className="reply-count-text">
                          {item.reply_count}
                        </Text>
                        <Text className="reply-count-txt">条回复</Text>
                        <Image
                          src={require('../../images/icon_arrow_more.png')}
                        ></Image>
                      </View>
                    </View>
                  </View>
                  <View className="bottom-line"></View>
                </View>
              )}
            </Block>
          )
        })}
      </View>
    )
  }
}
export default YFWHealthAskQuestionItemView
