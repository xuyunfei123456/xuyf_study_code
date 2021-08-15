import { Block, View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './CancelCompolaintModal.scss'

export default class CancelCompolaintModal extends Taro.Component {

    constructor(props){
        super(props)
        this. state = {
            show: false
          }
    }
  
  show = () => {
    this.setState({
      show: true
    })
  }
  
  closeView = () => {
    this.setState({
      show: false
    })
  }

  cancelComplaint = () => {
    this.triggerEvent('cancelComplaint')
  }
  config = {
    component: true
  }

  render() {
    const { show } = this.state
    return (
      show && (
        <View className="modal-mask">
          <View className="modal-content">
            <View className="closeIconLayout">
              <View onClick={this.closeView} className="closeTap">
                <Image
                  src={require('../../../../../images/returnTips_close.png')}
                  className="closeIcon"
                ></Image>
              </View>
            </View>
            <Image
              src={require('../../../../../images/icon_warning_complaint.png')}
              className="warnningIcon"
            ></Image>
            <View className="topTips">投诉撤销后，无法再发起，</View>
            <View className="bottomTips">请务必确定您的诉求已得到解决。</View>
            <View className="buttonLayout">
              <View className="leftButton" onClick={this.cancelComplaint}>
                确定撤销
              </View>
              <View className="rightButton" onClick={this.closeView}>
                不撤销
              </View>
            </View>
          </View>
        </View>
      )
    )
  }
} 


