import Taro, { Component } from '@tarojs/taro'
import { View, Image, Input } from '@tarojs/components'
import './YFWInvoiceModal.scss'
import YFWFloatLayout from '../YFWFloatLayout/YFWFloatLayout'
import { isNotEmpty } from '../../utils/YFWPublicFunction.js'
import { NAME, NEWNAME, IDENTITY_CODE, IDENTITY_VERIFY } from '../../utils/YFWRuleString'

export default class YFWInvoiceModal extends Component {
  config = {
    component: true
  }

  constructor (props) {
    super(...arguments)

    const { invoice } = props
    const { isOpened } = props
    this.state = {
      _invoice: invoice,
      _isOpened: isOpened
    }
  }

  componentWillReceiveProps (nextProps) {
    const { _invoice } = this.state
    const { _isOpened } = this.state
    const { invoice } = nextProps
    const { isOpened } = nextProps

    if (_invoice.type !== invoice.type) {
      this.setState({ _discounts: discounts })
    }

    if (isOpened !== _isOpened) {
      this.setState({ _isOpened: isOpened })
    }
  }

  close () { 
    this.setState({ _isOpened: false })
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  render () {
    const { _invoice } = this.state
    const { _isOpened } = this.state
    const layoutVisiable = _isOpened ? 'visibility: visible;' : 'visibility: hidden;'
    const layoutOpacity = _isOpened ? 'opacity: 1;' : 'opacity: 0;'
    const layoutTranslate = _isOpened ? 'transform: translate(0, 0);' : 'transform: translate(0, 100%);'

    return (
      <View className='yfw-invoice-layout' style={layoutVisiable} >
        <View 
          className='yfw-invoice-layout-back' 
          style={layoutOpacity} 
          onClick={this.close.bind(this)}
          onTouchMove={e => {
            e.preventDefault()
          }}
        >
        </View>
        <View className='yfw-invoice-layout-body' style={layoutTranslate}>
          <View className='invoice-layout-header'>
            <Text>发票信息</Text>
            <View onClick={this.close.bind(this)}>
              <Image className='invoice-close-icon' src={require('../../images/returnTips_close.png')} mode='widthFix' />
            </View>
          </View>
          <View className='invoice-layout-content'>
            <View className='invoice-modal invoice-column'>
            <View className='invoice-column'>
              <Text className='invoice-14-text invoice-dark-text invoice-margin-bottom-10 invoice-margin-left-3vw'>发票类型</Text>
              <View className='invoice-row'>
                <View className={_invoice.type === 0 ? 'invoice-type-select' : 'invoice-type-normal'} onClick={this.onInvoiceTypeClick.bind(this, 0)}>
                  <Text>无需发票</Text>
                </View>
                <View className={_invoice.type === 1 ? 'invoice-type-select' : 'invoice-type-normal'} onClick={this.onInvoiceTypeClick.bind(this, 1)}>
                  <Text>我要发票</Text>
                </View>
              </View>
            </View>
            {_invoice.type === 1 && <View className='invoice-column invoice-margin-left-3vw invoice-margin-top-10'>
              <Text className='invoice-14-text invoice-dark-text invoice-margin-bottom-10'>发票抬头</Text>
              <View className='invoice-name invoice-column invoice-content-center invoice-algin-center'>
                <Text className='invoice-12-text invoice-white-text'>个人</Text>
              </View>
              <Text className='invoice-14-text invoice-dark-text invoice-margin-top-10 invoice-margin-bottom-10'>收票人信息</Text>
              <Text className='invoice-12-text invoice-dark-text'>收票人姓名</Text>
              <Input 
                className='invoice-input invoice-12-text invoice-dark-text' 
                placeholder='请填写您的真实姓名'
                placeholderStyle={'color: #cccccc'}
                maxLength={10}
                value={_invoice.name}
                onInput={this.onInvoiceNameInput.bind(this)}
                onBlur={this.onInvoiceNameInputEnd.bind(this)}
              />
              <View className='invoice-line invoice-margin-bottom-10' />
              <Text className='invoice-12-text invoice-dark-text'>身份证信息</Text>
              <Input 
                className='invoice-input invoice-12-text invoice-dark-text' 
                placeholder='请填写您的身份证号码'
                placeholderStyle={'color: #cccccc'}
                type='idcard'
                maxLength={18}
                value={_invoice.code}
                onInput={this.onInvoiceIdCardInput.bind(this)}
                onBlur={this.onInvoiceIdCardInputEnd.bind(this)}
              />
              <View className='invoice-line invoice-margin-bottom-10' />
            </View>}
            <View 
              className='invoice-bottom-action invoice-column invoice-content-center invoice-algin-center invoice-margin-bottom-10'
              onClick={this.onInvoiceCommit.bind(this)}
            >
              <Text className='invoice-14-text invoice-white-text invoice-bold-text'>确认</Text>
            </View>
          </View>
          </View>
        </View>
      </View>
    )
  }

  /** 选择是否需要发票 */
  onInvoiceTypeClick (type) {
    let { _invoice } = this.state
    if (type !== _invoice.type) {
      _invoice.type = type

      this.setState({ _invoice: _invoice })
    }
  }


  /** 发票姓名填写 */
  onInvoiceNameInput (event) {
    let value = event.detail.value
    value = value.replace(NEWNAME, '')
    return value
  }

  /** 发票姓名填写完成 */
  onInvoiceNameInputEnd (event) {
    let value = event.detail.value
    value = value.replace(NAME, '')
    let { _invoice } = this.state
    _invoice.name = value
    this.setState({
      _invoice: _invoice
    })
  }

  /** 发票身份证号码填写 */
  onInvoiceIdCardInput (event) {
    let value = event.detail.value
    value = value.replace(IDENTITY_CODE, '')
    return value
  }

  /** 发票身份证号码填写完成 */
  onInvoiceIdCardInputEnd (event) {
    let value = event.detail.value
    let { _invoice } = this.state
    _invoice.code = value
    this.setState({
      _invoice: _invoice
    })
  }

  /** 提交发票信息 */
  onInvoiceCommit () {
    const { _invoice } = this.state
    if (_invoice.type === 1) {
      if (_invoice.name.length === 0) {
        Taro.showToast({ 
          title: '请输入收票人姓名',
          icon: 'none',
          duration: 2000
        })
      } else if (!_invoice.code.match(IDENTITY_VERIFY)) {
        Taro.showToast({ 
          title: '收票人身份证号码格式不正确',
          icon: 'none',
          duration: 2000
        })
      } else {
        this.close()
        if (this.props.onInvoice) {
          this.props.onInvoice(_invoice)
        }
      }
    } else {
      this.close()
      if (this.props.onInvoice) {
        this.props.onInvoice(_invoice)
      }
    }
  }
}

YFWInvoiceModal.defaultProps = {
  invoice: {
    type: 0,
    name: '',
    code: ''
  },
  isOpened: false
}
