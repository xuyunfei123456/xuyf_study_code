import Taro, { Component } from '@tarojs/taro'
import { Block, View, ScrollView, Input } from '@tarojs/components'


import { OrderApi } from '../../../../apis/index'
import './YFWMessage.scss'
const orderApi = new OrderApi()
export default class YFWMessage extends Component {
  config = {
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '留言',
    enablePullDownRefresh: true
  }
  constructor(porps) {
    super(porps)
    this.state = {
      advisoryList: [],
      orderno: '',
      inputText: '',
      height: ''
    }
  }
  onTextInput(e) {
    let inputText = e.detail.value
    this.setState({
      inputText
    })
  }
  /**
   * 生命周期函数--监听页面加载
   */
  componentWillMount(options) {
    let that = this
    Taro.getSystemInfo({
      success(res) {
        // window的高度
        let height = res.windowHeight - 130
        that.setState({
          height
        })
      }
    })
    let params = this.$router.params.params;
    params = (params && JSON.parse(params)) || {}
    this.state.orderno = params.orderno || params.order_no || '';
    this.gethistoryMessage()
  }
  send() {
    if (this.state.inputText == '') {
      return
    }
    orderApi
      .sendMessage({ orderno: this.state.orderno, content: this.state.inputText })
      .then(res => {
        this.gethistoryMessage()
        this.setState({
          inputText: ''
        })
      })
  }
  //获取历史留言
  gethistoryMessage() {
    orderApi.gethistoryMessage(this.state.orderno).then(res => {
      this.setState({
        advisoryList: res.advisoryList || []
      })
    })
  }
  render() {
    const { height, advisoryList, inputText } = this.state
    return (
      <View>
        <ScrollView
          className="scroll"
          scrollY="false"
          style={'height:' + height + 'px'}
          scrollIntoView={'item' + advisoryList.length}
        >
          <View className="wrapper">
            {advisoryList.map((item, index) => {
              return (
                <View className="list" key={index} id={'item' + (index + 1)}>
                  <View className="selfAndTime">
                    <View className="self">
                      {item.accountid > 0 ? '我' : '商家回复'}
                    </View>
                    <View className="time">{item.create_time}</View>
                  </View>
                  <View className="message">{item.content}</View>
                </View>
              )
            })}
          </View>
        </ScrollView>
        <View className="bottom_container">
          <Input
            type="text"
            className="input"
            placeholder="请输入您的留言"
            placeholderClass="placeTip"
            value={inputText}
            onInput={this.onTextInput}
          ></Input>
          <View
            className={'send ' + (inputText == '' ? '' : 'hascontent')}
            onClick={this.send}
          >
            发送
          </View>
        </View>
      </View>
    )
  }
}

