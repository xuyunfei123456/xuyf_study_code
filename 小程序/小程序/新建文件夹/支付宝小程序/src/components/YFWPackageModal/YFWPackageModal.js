import Taro, { Component } from '@tarojs/taro'
import { 
  View,
  Text,
  ScrollView,
  Image,
  Input
} from '@tarojs/components'
import './YFWPackageModal.scss'
import YFWPriceView from '../YFWPriceView/YFWPriceView'
import {
  isNotEmpty, safe, toDecimal,
} from '../../utils/YFWPublicFunction.js'
import {
  ShopCarApi
} from '../../apis/index'
import { pushNavigation } from '../../apis/YFWRouting'
import {get as getGlobalData } from '../../global_data'
const shopCarApi = new ShopCarApi()

export default class YFWPackageModal extends Component {
  config = {
    component: true
  }

  constructor (props) {
    super(...arguments)

    const { isOpened } = props
    const { goods } = props
    this.state = {
      wx_rx_is_buy:0,
      _isOpened: isOpened,
      _goods: goods,
      _actionStatus: 0,
      isIphoneX: getGlobalData('isIphoneX'),
      selectInfo: {
        type: 0, // 选择的类型 0单品 1套餐 2疗程装
        desc: 'single', // 单品single 套餐commbo 疗程装treatment
        name: '选择单品', // 选择的名称
        modalName: '', 
        selectIndex: 0, // 套装选择的索引
        selectModel: {}, // 套装信息
        quantity: 1, // 选择的数量
        isBuy: false // 提交需求、加入需求单
      },
    }
  }

  componentWillReceiveProps(nextProps) {
    const { goods } = nextProps
    const { _goods } = this.state
    const { isOpened } = nextProps
    const { _isOpened } = this.state
    let { _actionStatus } = this.state
    let { medicine_selectInfo } = goods
    const { medicine_inventory } = goods
    const limmit = medicine_inventory.limitation > 0 ? medicine_inventory.limitation : medicine_inventory.inventory
    let quantity = Math.min(medicine_selectInfo.quantity, limmit)
    quantity === 0 && (quantity = 1)
    medicine_selectInfo.quantity = quantity
    
    if (medicine_selectInfo.type === 1) {
      const { selectModel } = medicine_selectInfo
      const commboType = selectModel.dict_medicine_type || 0
      _actionStatus = Number.parseInt(commboType) < 0 ? goods.medicine_status : 3
    } else {
      _actionStatus = goods.medicine_status
    }
    
    this.setState({
      _goods: goods,
      _actionStatus: _actionStatus,
      selectInfo: medicine_selectInfo,
    })

    if (_isOpened !== isOpened) {
      this.setState({
        _isOpened: isOpened
      })
    }
  }
  componentWillMount(){
    let appSystemConfig = getGlobalData('appSystemConfig');
    this.setState({wx_rx_is_buy:appSystemConfig.wx_rx_is_buy}) 
  }
  close () {
    this.setState({ _isOpened: false })
    if (this.props.onClose) {
      this.props.onClose()
    }
  }
  render () {
    const { _isOpened } = this.state
    const { isIphoneX } = this.state
    const layoutVisiable = _isOpened ? 'visibility: visible;' : 'visibility: hidden;'
    const layoutOpacity = _isOpened ? 'opacity: 1;' : 'opacity: 0;'
    const layoutTranslate = _isOpened ? 'transform: translate(0, 0);' : 'transform: translate(0, 100%);'

    return (
      <View className='yfw-package-layout' style={layoutVisiable} >
        <View className='yfw-package-layout-back' style={layoutOpacity} onClick={this.close.bind(this)}></View>
        <View className='yfw-package-layout-body' style={layoutTranslate} >
          {this.renderPackageHeader()}
          {this.renderPackageCenter()}
          {this.renderPackageBottom()}
          {isIphoneX && <View className='package-modal-ipx'></View>}
        </View>
      </View>
    )
  }

  /** 渲染头部信息 */
  renderPackageHeader() {  
    const { _goods } = this.state
    const { selectInfo } = this.state
    const { medicine_info } = _goods
    const price = safe(medicine_info.price).length > 0 ? toDecimal(medicine_info.price) : '0.00'
    const priceArray = price.split('.')

    return(
      <View className='package-modal-header'>
        <Image className='goods-image' src={medicine_info.medicine_image} />
        <View className='package-modal-header-center'>
          <Text className='package-modal-dark-text package-modal-13-text package-modal-bold-text package-select-name'>{medicine_info.medicine_name}</Text>
          <Text className='package-modal-light-text package-modal-12-text'>{medicine_info.medicine_authorizetion}</Text>
          <View>
            <Text className='package-modal-red-text package-modal-12-text package-modal-bold-text'>¥</Text>
            <Text className='package-modal-red-text package-modal-15-text package-modal-bold-text'>{priceArray[0]+'.'}</Text>
            <Text className='package-modal-red-text package-modal-12-text package-modal-bold-text'>{priceArray[1]}</Text>
          </View>
          <Text className='package-modal-dark-text package-modal-12-text package-select-name'>{selectInfo.modalName}</Text>
        </View>
        <View className='package-modal-header-close' onClick={this.close.bind(this)}>
          <Image className='package-modal-close-icon' src={require('../../images/returnTips_close.png')} />
        </View>
      </View>
    )
  }

  /** 渲染中间信息 */
  renderPackageCenter() {
    const { _goods } = this.state
    const { selectInfo } = this.state
    const { medicine_info } = _goods
    const { medicine_style } = _goods
    const { medicine_treatment } = medicine_style
    const { medicine_combo } = medicine_style

    return(
      <ScrollView className='package-modal-center' scrollY>        
        <View className='package-modal-column package-modal-padding'>
          <Text className='package-modal-dark-text package-modal-13-text'>选择单品</Text>
          <View className='package-modal-single-view'>
            {this.renderSingleItem(0, medicine_info.medicine_standard, 0, selectInfo.type === 0)}
          </View>
        </View>
        {safe(medicine_combo).length > 0 && <View className='package-modal-column package-modal-padding'>
          <Text className='package-modal-dark-text package-modal-13-text'>选择套餐</Text>
          <ScrollView className='modal-commbo-topview' scrollX>
            {medicine_combo.map((comboItem, comboIndex) => {
              const isSelected = selectInfo.type === 1 && selectInfo.selectIndex === comboIndex
              const selectClass = isSelected ? 'modal-commbo-topitem-select' : 'modal-commbo-topitem-normal'
              const selectClassText = isSelected ? 'package-modal-green-text' : 'package-modal-normal-text'
              return(
                <View className={'modal-commbo-topitem ' + selectClass} taroKey={comboIndex} onClick={this.onComboItemClick.bind(this, comboItem, comboIndex)}>
                  <View className='package-modal-column'>
                    <Text className={'package-modal-13-text package-modal-bold-text ' + selectClassText}>{comboItem.name_aliase}</Text>
                  </View>
                </View>
              )
            })}
          </ScrollView>
          {selectInfo.type === 1 && <View className='modal-commbo-view'>
            <Text className='package-modal-13-text package-modal-dark-text'>{selectInfo.selectModel.name}</Text>
            <View className='commbo-price-view'>
              <YFWPriceView price={selectInfo.selectModel.price} />
              <Text className='package-modal-margin-left package-modal-12-text package-modal-normal-text'>{'原价：¥' + selectInfo.selectModel.original_price}</Text>
            </View>
            {medicine_combo[selectInfo.selectIndex].medicine_list.map(commboItem => {
              return this.renderCommboItem(commboItem)
            })}
          </View>}
        </View>}
        {safe(medicine_treatment).length > 0 && <View className='package-modal-column package-modal-padding package-modal-margin-top-10'>
          <Text className='package-modal-dark-text package-modal-13-text'>疗程装</Text>
          <View className='package-modal-single-view'>
            {medicine_treatment.map((treatmentItem, treatmentIndex) => {
              const isSelected = selectInfo.type === 2 && selectInfo.selectIndex === treatmentIndex

              return this.renderSingleItem(2, treatmentItem, treatmentIndex, isSelected)
            })}
          </View>
        </View>}
      </ScrollView>
    )
  }

  /** 渲染单品、疗程装item */
  renderSingleItem(type, singleItem, singleIndex, isSelected) {
    const { _goods } = this.state
    const { medicine_selectInfo } = _goods
    const { medicine_info } = _goods
    const itemClass = type == 0 ? (isSelected ? 'package-modal-single-item-select' : 'package-modal-single-item-normal') 
    :(isSelected ? 'package-modal-single-item-select2' : 'package-modal-single-item-normal2')
    const nameClass = isSelected 
      ? 'package-modal-green-text package-modal-13-text package-modal-bold-text package-modal-margin-right-10'
      : 'package-modal-normal-text package-modal-13-text package-modal-bold-text package-modal-margin-right-10'
    const periodClass = isSelected 
      ? 'package-modal-green-text package-modal-12-text'
      : 'package-modal-normal-text package-modal-12-text'
    const singleTitle = type === 0 ? singleItem : singleItem.name

    return(
      <View className={itemClass} onClick={this.onSingleItemClick.bind(this, type, singleItem, singleIndex)}>
        <View className={nameClass}>{singleTitle}</View>
        {medicine_info.medicine_period_to && <View className={periodClass}>{'有效期至：'+medicine_info.medicine_period_to}</View>}
      </View>
    )
  }

  /** 渲染套餐item */
  renderCommboItem(commboItem) {
    return(
      <View className='commbo-item'>
        <Image className='commbo-item-image' src={commboItem.image_url} />
        <View className='commbo-item-right'>
          <Text className='package-modal-dark-text package-modal-12-text'>{commboItem.medicine_name}</Text>
          <View className='commbo-item-right-bottom'>
            <Text className='package-modal-normal-text package-modal-12-text'>{'¥'+commboItem.price+' '+commboItem.period_to}</Text>
            <Text className='package-modal-normal-text package-modal-12-text'>{'x'+commboItem.quantity}</Text>
          </View>
        </View>
      </View>
    )
  }

  /** 渲染底部信息 */
  renderPackageBottom() {
    const { _goods,wx_rx_is_buy } = this.state
    const { selectInfo } = this.state
    const { _actionStatus } = this.state
    const { medicine_inventory } = _goods

    return(
      <View className='package-modal-bottom'>
        <View className='package-modal-bottom-quantity'>
          <View className='package-quantity-left'>
            <Text className='package-modal-dark-text package-modal-13-text package-modal-margin-right-20'>数量</Text>
            <Text className='package-modal-light-text package-modal-13-text package-modal-margin-right-10'>{'库存:'+medicine_inventory.inventory}</Text>
            {Number.parseInt(medicine_inventory.limitation) > 0 && <Text className='package-modal-yellow-text package-modal-13-text'>{'(限购:'+medicine_inventory.limitation+'件)'}</Text>}
          </View>
          <View className='package-quantity-view'>
            <View className='package-quantity-sub-add' onClick={this.onSubQuantityClick.bind(this)}>
              <Text className='package-quantity-sa-title'>-</Text>
            </View>
            <Input 
              className='package-quantity-input' 
              type='number' 
              maxLength='6' 
              value={selectInfo.quantity} 
              onInput={this.onQuantityInput.bind(this)}
              onBlur={this.onQuantityInputEnd.bind(this)}
            ></Input>
            <View className='package-quantity-sub-add' onClick={this.onAddQuantityClick.bind(this)}>
              <Text className='package-quantity-sa-title'>+</Text>
            </View>
          </View>
        </View>
        <View className='package-modal-bottom-button'>
          {_actionStatus === 3 &&wx_rx_is_buy != 1&& <View className='package-modal-button-consult' onClick={this.onServiceClick.bind(this)}>
            <Text className='package-modal-white-text package-modal-15-text package-modal-bold-text'>在线咨询</Text>
          </View>}
          {_actionStatus === 2 &&wx_rx_is_buy != 1&& <View className='package-modal-button-unsale'>
            <Text className='package-modal-white-text package-modal-15-text package-modal-bold-text'>暂不销售</Text>
          </View>}
          {((_actionStatus === 1 || wx_rx_is_buy == 1) && selectInfo.isBuy) && <View className='package-modal-button-buy' onClick={this.onAddOrBuy.bind(this, true)}>
            <Text className='package-modal-white-text package-modal-15-text package-modal-bold-text'>{_goods.medicine_info.medicine_type>0?'提交需求':'立即购买'}</Text>
          </View>}
          {((_actionStatus === 1 ||  wx_rx_is_buy == 1 )&& !selectInfo.isBuy) && <View className='package-modal-button-cart' onClick={this.onAddOrBuy.bind(this, false)}>
            <Text className='package-modal-white-text package-modal-15-text package-modal-bold-text'>{_goods.medicine_info.medicine_type>0?'加入需求单':'加入购物车'}</Text>
          </View>}
        </View>
      </View>
    )
  }

  /** 单品、疗程装点击 */
  onSingleItemClick(type, singleItem, singleIndex) {
    if (type === 0) {
      let { selectInfo } = this.state
      let { _goods } = this.state
      let { _actionStatus } = this.state
      if (selectInfo.type === type) {
        return
      }

      selectInfo.name = "已选择：" + singleItem
      selectInfo.modalName = "已选择：" + singleItem
      selectInfo.selectIndex = singleIndex;
      selectInfo.selectModel = {}
      selectInfo.type = 0
      selectInfo.desc = 'single'
      _actionStatus = _goods.medicine_status

      this.setState({
        selectInfo: selectInfo,
        _actionStatus: _actionStatus
      })

      const { onCallBack } = this.props
      onCallBack && onCallBack(selectInfo)
      
    } else if (type === 2) {
      let { selectInfo } = this.state
      let { _goods } = this.state
      let { _actionStatus } = this.state
      if (selectInfo.type === type && selectInfo.selectIndex == singleIndex) {
        return
      }

      selectInfo.name = "已选择：" + singleItem.name
      selectInfo.modalName = "已选择：" + singleItem.name
      selectInfo.selectIndex = singleIndex;
      selectInfo.selectModel = singleItem
      selectInfo.type = 2
      selectInfo.desc = 'treatment'
      _actionStatus = _goods.medicine_status

      this.setState({
        selectInfo: selectInfo,
        _actionStatus: _actionStatus
      })

      const { onCallBack } = this.props
      onCallBack && onCallBack(selectInfo)
    }
  }

  /** 点击套餐 */
  onComboItemClick(comboItem, comboIndex) {
    let { selectInfo } = this.state
    let { _goods } = this.state
    let { _actionStatus } = this.state
    if (selectInfo.type === 1 && selectInfo.selectIndex === comboIndex) {
      return
    } else {
      selectInfo.name = "已选择：" + comboItem.name
      selectInfo.modalName = "已选择：" + comboItem.name
      selectInfo.selectIndex = comboIndex;
      selectInfo.selectModel = comboItem
      selectInfo.type = 1
      selectInfo.desc = 'commbo'
      const commboType = comboItem.dict_medicine_type || 0
      _actionStatus = Number.parseInt(commboType) < 0 ? _goods.medicine_status : 3

      this.setState({
        selectInfo: selectInfo,
        _actionStatus: _actionStatus
      })

      const { onCallBack } = this.props
      onCallBack && onCallBack(selectInfo)
    }
  }

  /** 减少数量 */
  onSubQuantityClick() {
    let { selectInfo } = this.state
    if (selectInfo.quantity === 1) {
      return
    } else {
      selectInfo.quantity--

      this.setState({
        selectInfo: selectInfo
      })

      const { onCallBack } = this.props
      onCallBack && onCallBack(selectInfo)
    }
  }

  /** 添加数量 */
  onAddQuantityClick() {
    const { _goods } = this.state
    const { medicine_inventory } = _goods
    let { selectInfo } = this.state
    const limmit = medicine_inventory.limitation > 0 ? medicine_inventory.limitation : medicine_inventory.inventory
    if (selectInfo.quantity === limmit) {
      Taro.showToast({
        title: '超过限购上限',
        icon:'none'
      })
      return
    } else {
      selectInfo.quantity++

      this.setState({
        selectInfo: selectInfo
      })

      const { onCallBack } = this.props
      onCallBack && onCallBack(selectInfo)
    }
  }

  /** 输入框输入事件 */
  onQuantityInput(e) {
    const { _goods } = this.state
    const { medicine_inventory } = _goods
    const limmit = medicine_inventory.limitation > 0 ? medicine_inventory.limitation : medicine_inventory.inventory
    const value =  e.detail.value.length > 0 ? parseInt(e.detail.value) : 0
    if (value === 0) {
      return '1'
    } else if (value >= limmit) {
      return limmit.toString()
    } else {
      return value.toString()
    }
  }
  
  /** 输入框输入完成事件 */
  onQuantityInputEnd(e) {
    const { _goods } = this.state
    const { medicine_inventory } = _goods
    const value =  e.detail.value.length > 0 ? parseInt(e.detail.value) : 0

    let { selectInfo } = this.state
    selectInfo.quantity = value

    this.setState({
      selectInfo: selectInfo
    })

    const { onCallBack } = this.props
    onCallBack && onCallBack(selectInfo)
  }

  /** 添加购物车或者购买 */
  onAddOrBuy(isBuy) {
    const { selectInfo } = this.state
    const { onCartCallBack } = this.props
    const { _goods } = this.state
    const { medicine_info } = _goods
    let storeMedicineId = ''
    let packageId = ''
    if (selectInfo.type === 0) {
      storeMedicineId = medicine_info.store_medicine_id
    } else {
      packageId = selectInfo.selectModel.package_id
    }

    shopCarApi.addGoodsToShopCar(selectInfo.quantity, storeMedicineId, packageId, isBuy).then(response => {
      onCartCallBack && onCartCallBack()
      this.close()

      if (isBuy) {
        let medicineIds = []
        let packageIds = []
        if(selectInfo.type == 0) {
          medicineIds = response.cartids || []
        }else {
          packageIds = response.packageids || []
        }

        // 跳转结算页
        pushNavigation('get_settlement', { medicineIds: medicineIds, packageIds: packageIds })
      } else {
        Taro.showToast({
          title: "添加成功",
          icon: 'none',
          duration: 2000
        })
      }
    }, error => {
      const message = isNotEmpty(error.msg) ? error.msg : "添加失败"
      Taro.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      })
    })
  }

  /** 客服 */
  onServiceClick () {
    this.close()
    const concatItem = {
      name: "咨询客服",
      type: "get_h5",
      value: 'https://m.yaofangwang.com/chat.html'
    }
    pushNavigation(concatItem.type, concatItem)
  }
}

YFWPackageModal.defaultProps = {
  isOpened: false,
  goods: {
    medicine_info: {},
    medicine_inventory: {},
    medicine_selectInfo: {},
    medicine_status: 1,
    medicine_style: [],
    medicine_id: 0
  }
}
