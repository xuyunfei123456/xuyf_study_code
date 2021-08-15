import { Block, View, Form, Textarea, Text, Button } from '@tarojs/components'
import Taro, { Component, Config } from '@tarojs/taro'
import { pushNavigation } from '../../apis/YFWRouting.js'
import './YFWHealthAskAssociationItemView.scss'

class YFWHealthAskAssociationItemView extends Taro.Component {
  config = {
    component: true
  }
  constructor (props) {
    super(...arguments)

    const { data,titel,margin_right } = props
    this.state = {
      data: data,
      titel: titel,
      isShow: false,
      textValue: '',
      margin_right:margin_right
    }
  }
    /**
     * 隐藏弹窗
     */
    hideModal(event) {
      let a = event.currentTarget.id
      if (a == 'father') {
        if (this.state.isShow) {
          this.setState({
            isShow: false
          })
        }
      }
    }

    /**
     * 显示弹窗
     */
    showModal(top) {
      if (!this.state.isShow) {
        this.setState({
          isShow: true
        })
      }
    }
    formSubmit(e) {
      let delValue = e.detail.value
      this.triggerEvent('formSubmit', {
        text: delValue.textarea
      })
      this.setState({
        isShow: false
      })
    }
  render() {
    const { isShow, textValue } = this.state
    return (
      <View
        className="modal-back"
        hidden={!isShow}
        onClick={this.hideModal}
        id="father"
        onTouchMove={this.moveAction}
      >
        <View className="modal-content" onClick={this.hideModal}>
          <View className="content">
            <View className="content-view"></View>
            <View className="textarea">
              <Form onSubmit={this.formSubmit}>
                <Textarea
                  name="textarea"
                  placeholderClass="referPlace"
                  placeholder="请输入追问内容"
                  value={textValue}
                ></Textarea>
                <View className="content-bottom">
                  <View className="content-bottom-view">
                    <Text>/500</Text>
                  </View>
                  {/*  <view class='content-bottom-center' bindtap='submitMethod'>追问</view>  */}
                  <Button className="content-bottom-center" formType="submit">
                    <Text className="text">追问</Text>
                  </Button>
                </View>
              </Form>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
YFWHealthAskAssociationItemView.defaultProps = {
  margin_right: 30,
  data:{},
  title:'',

}
export default YFWHealthAskAssociationItemView
