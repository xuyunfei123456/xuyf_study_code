import Taro, { Component } from '@tarojs/taro'
import { Block, View, Image, Text, Input } from '@tarojs/components'
import { isEmpty } from '../../utils/YFWPublicFunction.js'
import './YFWOrderApplyReturnModal.scss'
class YFWOrderApplyReturnModal extends Component {

    config = {
        component: true
    }

    static defaultProps = {
        onCheckPhone: null
    }
    constructor (props) {
        super(props)
        this.state = {
            show: false,
            isFocus: false,
            inputValue: '',
            codes: ["", "", "", ""],
            orderNo:'',
            order_total:'',
            packaging_total: '',
            shipping_total: '',
            type:'',
            phone: ''
        }
    }
    showView ({ phone, orderNo, orderTotal, packagingTotal, shippingTotal, type, inputSuccess}) {
        this.inputSuccess = inputSuccess;
        let mPhone = phone.substr(0, 3) + '****' + phone.substr(7);
        this.setState({
          show: true,
          phone: mPhone,
          isFocus: true,
          codes: ["", "", "", ""],
          orderNo: orderNo,
          order_total: orderTotal,
          packaging_total: packagingTotal,
          shipping_total: shippingTotal,
          type:type
        })
    }

    listenKeyInput (e) {
        let text = e.detail.value;
        this.state.inputValue = text
        let textLength = text.length;
        let codeArray = new Array();
        for (let i = 0; i < (textLength > 4? 4 : textLength); i++) {
          let code = text.substr(i, 1);
          codeArray[i] = (code);
        }
        for (let i = codeArray.length; i < 4; i++) {
          codeArray.push("");
        }
        this.setState({
          codes: codeArray
        })
        if (textLength > 3) {
          Taro.hideKeyboard()
          let returnString = text.substr(0, 4);
          this.inputSuccess(returnString);
        }
    }
    newlistenKey(e){
      let {value} =  e.detail;
      this.setState({
        inputValue:value
      })
      this.state.inputValue = value
      if(value.length == 4){
        this.inputSuccess(value);
        this.checkNumber();
      }


    }
    openKeyboard (){
        this.setState({
          isFocus: true
        })
    }

    closeView () {
      if(process.env.TARO_ENV === 'alipay'){
        my.hideKeyboard()
      }
        this.setState({
            show: false,
            isFocus: false,
            codes: ["", "", "", ""],
            inputValue:''
        })
    }

    checkNumber () {
      if(this.state.inputValue&&this.state.inputValue.length !=4){
          Taro.showToast({
              title: '请输入正确的手机号码数字',
              icon:'none'
            })
          return
      }
        // if (isEmpty(this.state.codes[3])){
        //     Taro.showToast({
        //       title: '请输入正确的手机号码数字',
        //       icon:'none'
        //     })
        //    return
        // }
        // this.triggerEvent('checkPhone', { orderNo: this.state.orderNo, order_total: this.state.order_total, packaging_total: this.state.packaging_total, shipping_total: this.state.shipping_total, type: this.state.type,phone:this.state.phone})
        if(this.props.onCheckPhone) {
            this.props.onCheckPhone({orderNo: this.state.orderNo, order_total: this.state.order_total, packaging_total: this.state.packaging_total, shipping_total: this.state.shipping_total, type: this.state.type,phone:this.state.phone})
        }
      }
    componentWillMount () { }

    componentDidMount () { }

    render () {
        const { codes, show, inputValue, isFocus, phone} = this.state

        return (
            <Block>
              {show && (
                <View className="modal-mask">
                  <View className="modal-contents">
                    <View className="main-contents">
                      <View className="delete_parent">
                        <Image
                          src={require('../../images/returnTips_close.png')}
                          className="delete"
                          onClick={this.closeView}
                        ></Image>
                      </View>
                      <Text className="text_one">为确保您的账户安全，</Text>
                      <Text className="text_two">请输入手机号中间四位数字</Text>
                      <Text className="text_three">{'您的注册手机号：' + phone}</Text>
                      <Input
                          value={inputValue}
                          enableNative={true}
                          type='number'
                          adjustPosition={true}
                          confirmType='done'
                          onInput={this.newlistenKey}
                          className="newcodeinput"
                          maxLength = {4}
                      ></Input>
                      {/* <View className="code_parent" onClick={this.openKeyboard}>
                        {codes.map((item, index) => {
                          return (
                            <Block key={item}>
                              <Text
                                className="verify-text"
                                style={'margin-left:' + (index == 0 ? 0 : 50) + 'rpx'}
                              >
                                {item}
                              </Text>
                            </Block>
                          )
                        })}
                      </View> */}
                    </View>
                    <View className="modal-footer">
                      <View className="confirm_button" onClick={this.checkNumber}>
                        确 定
                      </View>
                    </View>
                    
                  </View>
                </View>
              )}
              {/* <Input
                    value={inputValue}
                    type='number'
                    adjustPosition={true}
                    confirmType='done'
                    focus={isFocus}
                    cursorSpacing={-400}
                    onInput={this.listenKeyInput}
                    className="input"
                ></Input> */}
            </Block>
          )
    }
}

export default YFWOrderApplyReturnModal