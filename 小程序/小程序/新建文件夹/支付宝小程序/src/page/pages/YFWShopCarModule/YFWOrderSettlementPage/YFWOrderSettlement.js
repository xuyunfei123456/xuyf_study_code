import Taro, { Component } from '@tarojs/taro'
import { 
  View, 
  Image,
  Text,
  Input,
  Block,
  Switch,
  ScrollView
} from '@tarojs/components'
import './YFWOrderSettlement.scss'
import { pushNavigation } from '../../../../apis/YFWRouting'
import { OrderPaymentApi } from '../../../../apis/index'
import { isNotEmpty, toDecimal, isEmpty, safe, safeObj, strMapToObj } from '../../../../utils/YFWPublicFunction'
import { YFWAddressModel } from '../Model/YFWAddressModel'
import { YFWOrderSettlementModel } from '../Model/YFWOrderSettlementModel'
import MedicineNameView from '../../../../components/YFWMedicineNameView/YFWMedicineNameView'
import YFWPriceView from '../../../../components/YFWPriceView/YFWPriceView'
import YFWFloatLayout from '../../../../components/YFWFloatLayout/YFWFloatLayout'
import YFWInvoiceModal from '../../../../components/YFWInvoiceModal/YFWInvoiceModal'
import { NAME, NEWNAME, IDENTITY_CODE, IDENTITY_VERIFY } from '../../../../utils/YFWRuleString'
import {get as getGlobalData ,set as setGlobalData } from '../../../../global_data'
const orderPaymentApi = new OrderPaymentApi()
const addressModel = new YFWAddressModel()
const settlementModel = new YFWOrderSettlementModel()

export default class YFWOrderSettlement extends Component {

  config = {
    navigationBarTitleText: '订单结算'
  }

  constructor (props) {
    super(props)
    this.state = {
      needenrollment_prompt:"",
      isCompleteYqfk:false,
      is_needenrollment:0,
      all_total:"",
      opacityAnimation: {},
      translateAnimation: {},
      invoiceModalShow:false,
      orderInfo: {},
      isIphoneX: getGlobalData('isIphoneX'),
      defaultAddress: {},
      selectAddress: {}, // 选择地址
      showAddressFloat: false,
      searchEndtype: 0,   //0代表搜索框无二维码，1代表有
      isCompleteInquiry:false,
      invoice: {
        shopId: 0,
        invoice_applicant: '',
        invoice_code: '',
        isNeed: false,
        itemTitle: '请选择',
        selectType: {
          type: 1,
          name: '增值税纸质普通发票',
          desc:
            '商家支持开具纸质发票，发票随货寄出或者发货后2日内寄出，若未收到可要求商家补开寄出。'
        },
        suportTypes: []
      },
      invoiceMap:{},
      invoiceTop:0
    }
  }

  componentWillMount () {
    const params = this.$router.params.params
    if (isNotEmpty(params)) {
      const value = JSON.parse(decodeURIComponent(params))
      this.medicineIds = value.medicineIds || []
      this.packageIds = value.packageIds || []
    }
  }
  /** 提交发票 */
  handleInvoiceConfirm(event) {
    let { invoice } = this.state

    if (invoice.isNeed && invoice.invoice_code.length == 0) {
      Taro.showToast({
        title: '请填写您的身份证号码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (invoice.isNeed && !IDENTITY_VERIFY.test(invoice.invoice_code)) {
      Taro.showToast({
        title: '身份证号码格式不正确',
        icon: 'none',
        duration: 2000
      })
      return
    }
    let { invoiceMap } = this.state
    invoice.itemTitle = invoice.isNeed ? invoice.selectType.name : '无需发票'
    invoiceMap[invoice.shopId] = invoice
    this.setState({ invoice: invoice, invoiceMap: invoiceMap })

    this.handleCloseInvoiceModal()
  }
  componentDidMount () { 
    Taro.getSystemInfo({
      success: res => {
        this.baseModalHeight = res.windowHeight
      }
    })
  }
  componentWillUnmount () { 
    var info = getGlobalData('inquiryInfo'),yqfkInfo = getGlobalData('yqfkInfo');
    info.isSave = false;
    yqfkInfo.isSave = false;
    setGlobalData('inquiryInfo',info)
    setGlobalData('yqfkInfo',yqfkInfo)
  }
  componentDidShow () {
    const { selectAddress } = this.state
    const { defaultAddress } = this.state
    if (selectAddress.id) {
      const addressArray = addressModel.getModelArray([selectAddress])
      this.state.defaultAddress = addressArray[0]
      this.setState({ defaultAddress: addressArray[0] })
      this.fetchOrderSettlementInfo()
    }
    var inquiryInfo = getGlobalData('inquiryInfo'),yqfkInfo = getGlobalData('yqfkInfo');
    this.setState({ isCompleteInquiry: inquiryInfo.isSave,isCompleteYqfk:yqfkInfo.isSave })
    orderPaymentApi.getAddress().then((result) => {
      let addressArray = addressModel.getModelArray(result)
      console.log(addressArray)
      if (addressArray.length == 0) {
        Taro.showModal({
          content: '您还没有设置收货地址，请点击这里设置！',
          cancelText: '取消',
          confirmText: '确定',
          success: function (res) {
            if (res.confirm) {
              pushNavigation('get_address')
            } else {
              Taro.navigateBack()
            }
          },
          fail(){
            Taro.navigateBack()
          }
        })
        return;
      } else {
        if(!this.state.selectAddress.id){
          let defaultAddress = {}
          addressArray.forEach((item, index, array) => {
            if (item.is_default == '1') {
              defaultAddress = item;
            }
          });
          if (isEmpty(defaultAddress)) {
            defaultAddress = addressArray[0];
          }
          this.state.defaultAddress = addressArray[0]
        }
        this.fetchOrderSettlementInfo()
      }
      
      
    }).then((error) => {

    })
  }

  onPageScroll (event) {
    const { scrollTop } = event
    const { showAddressFloat } = this.state

    if (scrollTop >= 50 && !showAddressFloat) {
      this.setState({
        showAddressFloat: true
      })
    } else if (scrollTop < 50 && showAddressFloat) {
      this.setState({
        showAddressFloat: false
      })
    } 
  }


  /** 获取订单结算信息 */
  fetchOrderSettlementInfo () {
    const medicineIds = this.medicineIds.join(',')
    const packageIds = this.packageIds.join(',')
    const { defaultAddress,invoiceMap } = this.state
    Taro.showLoading({ title: '加载中...' })

    orderPaymentApi.getBuyInfo(defaultAddress.id, medicineIds, packageIds).then(response => {
      setGlobalData('work_trade_items',response.work_trade_items || {})
      response.invoiceMap = invoiceMap
      const orderInfo = settlementModel.getModelValue(response)
      this.setState({
        all_total: orderInfo.all_total,
        orderInfo: orderInfo,
        selectAddress:{},
        is_needenrollment:response.is_needenrollment,
        needenrollment_prompt:response.needenrollment_prompt
      })
      this.state.orderInfo = orderInfo
      this.reloadOrderPrice()
      Taro.hideLoading({})
    }, error => {
      Taro.hideLoading({})
      Taro.showModal({
        content: error.msg,
        showCancel: false,
        confirmColor: "#1fdb9b",
        success(res) {
          Taro.navigateBack()
        }
      })
    })
  }
  handleInquiryInfo() {
    let inquiryInfo = getGlobalData('inquiryInfo');
    if (!inquiryInfo.isSave) {
      inquiryInfo.drug_items = inquiryInfo.isEditPatient
        ? inquiryInfo.drug_items
        : this.state.orderInfo.drug_items
      inquiryInfo.selectPatient = this.state.orderInfo.drug_items[0]
      inquiryInfo.medicine_disease_items = this.state.orderInfo.medicine_disease_items
      inquiryInfo.medicine_disease_xz_count = this.state.orderInfo.medicine_disease_xz_count
      inquiryInfo.is_certificate_upload = this.state.orderInfo.is_certificate_upload
      inquiryInfo.disease_xz_add = this.state.orderInfo.disease_xz_add;
      inquiryInfo.rx_mode = Number.parseInt(this.state.orderInfo.rx_mode),
      inquiryInfo.cartids = this.medicineIds.join(',')
      inquiryInfo.packageids = this.packageIds.join(',')
      inquiryInfo.isPrescrption = inquiryInfo.rx_mode == 2
      setGlobalData('inquiryInfo',inquiryInfo)
    }
    pushNavigation('get_inquiry_info')
  }
  /** 点击、滚动穿透 */
  handleCatchTap(event) {
    return true
  }
      /** 显示发票弹窗 */
  handleShowInoviceModal(event) {
    const { invoiceMap } = this.state
    const dataset = event.currentTarget.dataset
    const shopId = dataset['shopId']
    const inovice = invoiceMap[shopId]
    let translateAni = Taro.createAnimation({
      duration: 300,
      timingFunction: 'linear',
      delay: 100
    })

    let opacityAni = Taro.createAnimation({
      duration: 300,
      timingFunction: 'linear',
      delay: 0
    })

    opacityAni.opacity(1).step()
    translateAni.translateY(0).step()

    this.setState({
      opacityAnimation: opacityAni.export(),
      translateAnimation: translateAni.export(),
      invoiceModalShow: true, 
      invoice: inovice
    })

  }
  handleNeedenrollment(){
    pushNavigation('get_nrollment',{'hasPatient':this.state.orderInfo.medicate_info_type,'needenrollment_prompt':this.state.needenrollment_prompt})
  }
  /** 关闭弹窗 */
  handleCloseInvoiceModal(event) {
    const transY = this.baseModalHeight
    let translateAni = Taro.createAnimation({
      duration: 300,
      timingFunction: 'linear',
      delay: 100
    })

    let opacityAni = Taro.createAnimation({
      duration: 300,
      timingFunction: 'linear',
      delay: 0
    })

    opacityAni.opacity(0).step()
    translateAni.translateY(transY).step()

    this.setState({
      invoiceModalShow:false,
      opacityAnimation: opacityAni.export(),
      translateAnimation: translateAni.export(),
    })
    setTimeout(function () {
      opacityAni.opacity(0).step()
      translateAni.translateY(transY).step()
      this.setState({
        opacityAnimation: opacityAni.export(),
        translateAnimation: translateAni.export(),
        invoiceModalShow: false, 
      })
    }.bind(this), 300)
  }
  /** 是否需要发票点击 */
  handleNeedInvoiceItemClick(event) {
    const dataset = event.currentTarget.dataset
    let { invoice } = this.state
    invoice.isNeed = dataset['index'] == '1'
    this.setState({ invoice: invoice })
  }
    /** 发票输入身份证号码 */
    handleInvoiceCodeInput(event) {
      let value = event.detail.value
      value = value.replace(IDENTITY_CODE, '')
      let { invoice } = this.state
      invoice.invoice_code = value
      this.setState({ invoice: invoice })
    }
    onFocus(e){
      if (this.state.type == 1) {
        this.setState({
            searchEndtype: 0
        })
    }
    }
    onBlur(e){
      this.setState({
        invoiceTop:0
      })
    }
      /** 发票类型点击 */
  handleInvoiceTypeClick (event) {
    const dataset = event.currentTarget.dataset
    let { invoice } = this.state
    invoice.selectType = dataset['item'];
    this.setState({ invoice: invoice })
  }
  render () {
    const { orderInfo,isCompleteInquiry,invoiceModalShow,opacityAnimation,translateAnimation,invoice,isCompleteYqfk,is_needenrollment,invoiceTop } = this.state
    const shopItems = orderInfo.shop_items || [];
    const unsign = !isCompleteYqfk?require('../../../../images/unsign.png'):require('../../../../images/hassignin.png')
    return (
      <View className='settlement'>
        {this.renderAddressView()}
        {/* {this.renderPatientInfo()} */}
        {orderInfo.medicate_info_type && (
          <View id="rxview" className="rxview" onClick={this.handleInquiryInfo}>
            {isCompleteInquiry ? (
              <View className="inquiry-view">
                <Image
                  src={require('../../../../images/rx_info_icon.png')}
                  className="info-icon"
                ></Image>
                <View className="inquiry-ct">
                  <Text className="inquiry-title">已添加就诊信息</Text>
                  <Text className="inquiry-desc">
                    医生将根据您的就诊信息提供问诊服务。
                  </Text>
                </View>
                <Text className="inquiry-detail">查看</Text>
                <Image
                  src={require('../../../../images/icon_arrow_right_gary.png')}
                  className="detail-icon"
                ></Image>
              </View>
            ) : (
              <Image
                className="rx-image"
                src="http://c1.yaofangwang.net/common/images/yb-minmap-icons/add_drug_gif.gif"
                mode="widthFix"
              ></Image>
            )}
          </View>
        )}
        {is_needenrollment && (
          <View className={isCompleteYqfk?'completeYqfk':'is_needenrollment'} onClick={this.handleNeedenrollment}>
          <Image className="unsign" src={unsign}></Image>
          <View className="sign_tip">
            <View style="font-size:24rpx;color:#333333">疫情防控药品登记</View>
            <View style="font-size:18.6rpx;color:#999999">您购买的药品含疫情防控药品，根据监管部门要求需登记用药人信息后下单</View>
          </View>
          <View style="color:#999999;font-size:23.6rpx;flex:1;text-align:right">去登记</View>
          <Image style="height:30rpx;width:30rpx;margin-right:20rpx" src={require('../../../../images/icon_arrow_right_gary.png')}></Image>
      </View>
        )}
        {this.renderNoticeView()}
        {shopItems.map(storeItem => {
          return this.renderOrderSettlementItem(storeItem)
        })}
        {this.renderPaymentInfo()}
        {this.renderBottomView()}
        {this.renderSpaceView()}
        {this.renderModals()}
        {/* 新版发票信息 */}
        {
          <View
          className="invoice-modal"
          hidden={!invoiceModalShow}
          animation={opacityAnimation} 
          onTouchMove={this.handleCatchTap}
        >
          {invoice.isNeed ? (
                      <View
                      animation={translateAnimation} 
                      className={"invoice-conent"}
                      onClick={this.handleCatchTap}
                    >
                      <View className="invoice-header">
                        <Text>填写发票信息</Text>
                        <View onClick={this.handleCloseInvoiceModal}>
                          <Image
                            src={require('../../../../images/returnTips_close.png')}
                          ></Image>
                        </View>
                      </View>
                      <View className="invoice-title">需要发票</View>
                      <View className="invoice-tags">
                        <View
                          className={
                            invoice.isNeed
                              ? 'invoice-tag-item'
                              : 'invoice-tag-item invoice-tag-item-active'
                          }
                          data-index="0"
                          onClick={this.handleNeedInvoiceItemClick}
                        >
                          无需发票
                        </View>
                        <View
                          className={
                            invoice.isNeed
                              ? 'invoice-tag-item invoice-tag-item-active'
                              : 'invoice-tag-item'
                          }
                          data-index="1"
                          onClick={this.handleNeedInvoiceItemClick}
                        >
                          需要发票
                        </View>
                      </View>
                   
                        <ScrollView
                          scrollY
                          scrollTop={invoiceTop}
                          className={"invoice-scroll"}
                          style={`height:800rpx`}
                        >
                          <View className="invoice-title">发票类型</View>
                          <View className="invoice-tags">
                            {invoice.suportTypes.map((item, index) => {
                              // let invoiceTag=item.name.includes("无") ? "invoicePopupMin" : "invoicePopupMax"
                              return (
                                <Block key="invoice">
                                  <View
                                    className={
                                      invoice.selectType.type == item.type
                                        ? 'invoice-tag-item invoice-tag-item-active'
                                        : 'invoice-tag-item'
                                    }
                                    data-item={item}
                                    onClick={this.handleInvoiceTypeClick}
                                  >
                                    {item.name}
                                  </View>
                                </Block>
                              )
                            })}
                          </View>
                          <View className="invoice-desc">
                            <Text decode={true}>{invoice.selectType.desc}</Text>
                          </View>
                          <View className="invoice-title">发票抬头</View>
                          <View className="invoice-tt">个人</View>
                          <View className="invoice-title">开票信息</View>
                          <View className="invoice-info">
                            <Text className="invoice-info-tt">身份证号</Text>
                            <Input
                              value={invoice.invoice_code}
                              onInput={this.handleInvoiceCodeInput.bind(this)}
                              onFocus={this.onFocus.bind(this)}
                              onBlur={this.onBlur}
                              maxlength="18"
                              className="invoice-info-tt invoice-info-ll invoice-info-in"
                              placeholder="请填写个人身份证号"
                              placeholderStyle="color: #ccc"
                            ></Input>
                          </View>
                          <View className="invoice-info">
                            <Text className="invoice-info-tt">发票内容</Text>
                            <Text className="invoice-info-tt invoice-info-ll">
                              商品明细
                            </Text>
                          </View>
                          <View className="invoice-cl">
                            <Text className="invoice-desc">发票须知：</Text>
                            <Text className="invoice-desc">
                              1.发票金额不含优惠券、满减、积分等优惠扣减金额；
                            </Text>
                            <Text className="invoice-desc">
                              2.商家若无法开具电子普通发票，则开具纸质发票，发票随货寄出或者发货后2日内寄出，若未收到可要求商家补开并寄出；
                            </Text>
                            <Text className="invoice-desc">3.电子发票：</Text>
                            <Text className="invoice-desc">
                              (1)电子普通发票是税局认可的有效付款凭证，其法律效力、基本用途、基本使用规定同纸质发票，可支持报销入账，如需纸质发票可自行打印下载；
                            </Text>
                            <Text className="invoice-desc">
                              (2)电子普通发票则在发货后2日内开出，若商家未开出可联系商家开出；
                            </Text>
                            <Text className="invoice-desc">
                              (3)用户可点击“我的订单-查看发票”查询，分享链接至电脑端下载打印。
                            </Text>
                          </View>
                        </ScrollView>
                     
                      <View
                        className="invoice-action"
                        onClick={this.handleInvoiceConfirm}
                      >
                        确定
                      </View>
                    </View>
          ) : (
            <View
            animation={translateAnimation} 
            className={"invoice-conent invoice-conent-min"}
            onClick={this.handleCatchTap}
            
          >
            <View className="invoice-header">
              <Text>填写发票信息</Text>
              <View onClick={this.handleCloseInvoiceModal}>
                <Image
                  src={require('../../../../images/returnTips_close.png')}
                ></Image>
              </View>
            </View>
            <View className="invoice-title">需要发票</View>
            <View className="invoice-tags">
              <View
                className={
                  invoice.isNeed
                    ? 'invoice-tag-item'
                    : 'invoice-tag-item invoice-tag-item-active'
                }
                data-index="0"
                onClick={this.handleNeedInvoiceItemClick}
              >
                无需发票
              </View>
              <View
                className={
                  invoice.isNeed
                    ? 'invoice-tag-item invoice-tag-item-active'
                    : 'invoice-tag-item'
                }
                data-index="1"
                onClick={this.handleNeedInvoiceItemClick}
              >
                需要发票
              </View>
            </View>
       
              <View className="invoice-scroll"></View>
           
            <View
              className="invoice-action"
              onClick={this.handleInvoiceConfirm}
            >
              确定
            </View>
          </View>
          )}

        </View>
        }
      </View>
    )
  }

  /** 渲染地址信息 */
  renderAddressView () {
    const { defaultAddress } = this.state

    return(
      <View className='settlement-address-view settlement-column'>
        <Text className='settlement-white-text settlement-14-text settlement-margin-bottom-5 settlement-margin-left-2vw'>收货地址</Text>
        <View className='settlement-card-view settlement-column' onClick={this.onChangeAddress.bind(this)}>
          <View className='settlement-row'>
            <View className='settlement-column'>
              <View className='settlement-row settlement-algin-center settlement-margin-top-20'>
                <View className='settlement-addres-icon settlement-row settlement-algin-center settlement-content-center'>
                  <Image src={require('../../../../images/zuoB.png')} mode='widthFix' />
                </View>
                <Text className='settlement-dark-text settlement-14-text settlement-bold-text settlement-margin-right-10'>{safe(defaultAddress.name)}</Text>
                <Text className='settlement-dark-text settlement-14-text settlement-bold-text settlement-margin-right-10'>{safe(defaultAddress.mobile)}</Text>
                {defaultAddress.is_default === 1 && <Image src={require('../../../../images/Label_moren.png')} className='settlement-addres-default' mode='widthFix' />}
              </View>
              <Text className='settlement-addres settlement-light-text settlement-12-text settlement-margin-top-20'>{'地址：'+safe(defaultAddress.address)}</Text>
            </View>
            <View className='settlement-addres-icon settlement-row settlement-content-center settlement-algin-center'>
              <Image src={require('../../../../images/icon_arrow_right_gary.png')} mode='widthFix' />
            </View>
          </View>
          <Image src={require('../../../../images/shouhua.png')} className='settlement-addres-line settlement-margin-top-20' mode='widthFix' />
        </View>
      </View>
    )
  }

  /** 用药人信息 */
  renderPatientInfo () {
    const { orderInfo } = this.state
    const patientInfo = orderInfo.medicate_item   

    return(
      <Block>
        {orderInfo.medicate_info_show === 'true' && <View className='settlement-card-view settlement-column'>
          <View className='settlement-row'>
            <View className='settlement-warn-icon settlement-row settlement-content-center settlement-algin-center'>
              <Image src={require('../../../../images/warining.png')} mode='widthFix' />
            </View>
            <View className='settlement-column settlement-padding-10'>
              <Text className='settlement-dark-text settlement-13-text'>请完善用药人信息</Text>
              <Text className='settlement-light-text settlement-10-text settlement-margin-top-5'>根据国家药监局规定，购买处方药需要登记实名信息。</Text>
            </View>
          </View>
          <View className='settlement-patient-line' />
          <View className='settlement-patient-item settlement-row settlement-algin-center'>
            <Text className='settlement-patient-title settlement-dark-text settlement-13-text'>姓名</Text>
            <Input 
              className='settlement-patient-content' 
              placeholder='请输入姓名'
              placeholderStyle={'color: #cccccc'}
              maxLength={10}
              value={patientInfo.medicate_name}
              onInput={this.onPatientNameInput.bind(this)}
              onBlur={this.onPatientNameInputEnd.bind(this)}
            />
          </View>
          <View className='settlement-patient-line' />
          <View className='settlement-patient-item settlement-row settlement-algin-center'>
            <Text className='settlement-patient-title settlement-dark-text settlement-13-text'>身份证号</Text>
            <Input 
              className='settlement-patient-content' 
              placeholder='请输入身份证号'
              placeholderStyle={'color: #cccccc'}
              type='idcard'
              maxLength={18}
              value={patientInfo.medicate_idcard}
              onInput={this.onPatientIdCardInput.bind(this)}
              onBlur={this.onPatientIdCardInputEnd.bind(this)}
            />
          </View>
          <View className='settlement-patient-line' />
          <View className='settlement-patient-item settlement-row settlement-algin-center'>
            <Text className='settlement-patient-title settlement-dark-text settlement-13-text'>性别</Text>
            <Text className='settlement-dark-text settlement-13-text'>{patientInfo.medicate_sex}</Text>
          </View>
        </View>}
      </Block>
    )
  }

  /** 渲染订单快速结算提示 */
  renderNoticeView () {
    return(
      <View className='settlement-notice-view settlement-yellow-back settlement-row'>
        <Text className='settlement-yellow-text settlement-13-text'>根据GSP相关规定，药品一经售出，无质量问题不退不换</Text>
      </View>
    )
  }

  /** 
   * 渲染结算item
   * 药店信息、药品信息、优惠服务信息
   */
  renderOrderSettlementItem (storeItem) {
    return(
      <View className='settlement-column'>
        {this.renderStoreView(storeItem)}
        {storeItem.cart_items.map(dataItem => {
          return this.renderPackageMedicineItem(dataItem)
        })}
        {this.renderStoreMoneyView(storeItem)}
        {this.renderStoreLine()}
      </View>
    )
  }

  /** 渲染药店信息 */
  renderStoreView (storeItem) {
    return(
      <View className='settlement-store-view settlement-row settlement-algin-center'>
        <Image className='settlement-store-icon' src={require('../../../../images/shops.png')} mode='widthFix' />
        <Text className='settlement-store-title settlement-dark-text settlement-13-text settlement-bold-text'>{storeItem.shop_title}</Text>
      </View>
    )
  }

  /** 渲染单品、多件装 */
  renderPackageMedicineItem (dataItem) {
    const isPackage = dataItem.type !== 'medicine'
    const packageName= dataItem.type === 'package' ? '套餐' : '多件装'
    const packageClass = dataItem.type === 'package' ? 'settlement-red-back' : 'settlement-blue-back'

    return(
      <Block>
        {!isPackage 
          && <View className='settlement-card-view settlement-column'>
            {this.renderMedicineItem(dataItem)}
            <View className='settlement-package-price-view settlement-row settlement-content-end settlement-algin-end'>
              <Text className='settlement-dark-text settlement-13-text'>共</Text>
              <Text className='settlement-red-text settlement-13-text'>{dataItem.quantity}</Text>
              <Text className='settlement-dark-text settlement-13-text'>件 小计：</Text>
              <YFWPriceView price={dataItem.medicine_total} fontSize={26} />
            </View>
          </View>
        }
        {isPackage 
          && <View className='settlement-card-view settlement-column'>
            <View className='settlement-row settlement-algin-center settlement-margin-top-10'>
              <View className={'settlement-package-type ' + packageClass}>{packageName}</View>
              <Text className='settlement-package-name settlement-light-text settlement-10-text'>{dataItem.package_name}</Text>
            </View>
            {dataItem.package_medicines.map(medicineItem => {
              return this.renderMedicineItem(medicineItem)
            })}
            <View className='settlement-package-price-view settlement-row settlement-content-end settlement-algin-end'>
              <Text className='settlement-dark-text settlement-13-text'>共</Text>
              <Text className='settlement-red-text settlement-13-text'>{dataItem.smp_medicine_packmedicine_count}</Text>
              <Text className='settlement-dark-text settlement-13-text'>件 小计：</Text>
              <YFWPriceView price={dataItem.medicine_total} fontSize={26} />
              <Text style={'color:gray;text-decoration:line-through;padding-left:10px'}> ¥{dataItem.smp_medicine_packmedicine_total}</Text>
            </View>
          </View>
        }
      </Block>
    )
  }

  /** 渲染药品 */
  renderMedicineItem (medicineItem) {
    return(
      <View className='settlement-medicine-view settlement-row settlement-algin-center'>
        <Image src={medicineItem.img_url} className='settlement-medicine-image' />
        <View className='settlement-medicine-right settlement-column settlement-content-between'>
          <View style={'display:flex;justify-content:space-between'}>
          <MedicineNameView medicineType={parseInt(medicineItem.prescriptionType)} name={medicineItem.title} fontSize={26} fontWeight='bold' />
          <YFWPriceView price={medicineItem.price} fontSize={26} color={'black'}/>
          </View>
          <View className='settlement-row settlement-content-between settlement-algin-center'>
            <Text className='settlement-light-text settlement-12-text'>{medicineItem.standard}</Text>
            <Text className='settlement-light-text settlement-12-text'>x{medicineItem.quantity}</Text>
          </View>
        </View>
    </View>
    )
  }
  /** 渲染包装、配送、优惠金额 */
  renderStoreMoneyView (storeItem) {
    const quantityContent = '共'+storeItem.store_medicine_count_total+'件'
    const { modalList ,shop_id} = storeItem
    const {invoiceMap} = this.state
    console.log('invoiceMap',invoiceMap)
    return(
      <Block>
        {modalList.map(modalItem => {
          return this.renderNormalItem(modalItem)
        })}
        <View
          className="settlement-normal-item settlement-row settlement-algin-center"
          style="display:flex;justify-content:space-between"
          data-shopId={shop_id}
          onClick={this.handleShowInoviceModal}
        >
          <View className="packageForm">
            <Text>发票信息</Text>
          </View>
          <View>
            <Text decode={true} className="packagePrice">
              {invoiceMap[shop_id].itemTitle}
            </Text>
            <Image
              src={require('../../../../images/icon_arrow_right_gary.png')}
              mode="widthFix"
              className="uc_next packagePrice"
            ></Image>
          </View>
        </View>
        <View style={'display:flex;justify-content:flex-end;font-size:26px;width:94vw;align-items:flex-end'}>
          <Text className='settlement-light-text settlement-12-text'>{quantityContent}</Text>
          <Text className='settlement-light-text settlement-12-text' style={'padding-left:10px'}>合计：</Text>
          <YFWPriceView price={storeItem.totalPrice} fontSize={26} />
        </View>
      </Block>
    )
  }

  /** 渲染带右箭头的item */
  renderNormalItem (modalItem) {
    const {selectInfo} = modalItem;
    const _name = modalItem.title == '优惠券' ? JSON.stringify(selectInfo) !='{}'?  selectInfo.coupons_desc:'暂无可用优惠券':selectInfo.name
    return(
      <View className='settlement-normal-item settlement-row-new settlement-algin-center' onClick={this.onNormalItemClick.bind(this, modalItem)}>
        <View>
          <Text className='settlement-normal-item-title-new settlement-dark-text settlement-12-text'>{modalItem.title}</Text>
          <Text className='settlement-normal-item-title-new settlement-gray-text settlement-12-text'>{_name}</Text>
        </View>
        <View style="display:flex">
          { modalItem.title == '优惠券'&&JSON.stringify(selectInfo) !='{}' && selectInfo.price != '0.00' && <Text className={'settlement-12-text'}>-</Text>}
          <Text className={'settlement-12-text'}>{modalItem.content}</Text>
          <View className='settlement-row settlement-content-end settlement-algin-center'>
            {modalItem.isShowArrow && <Image src={require('../../../../images/icon_arrow_right_gary.png')} mode='widthFix' />}
          </View>
        </View>

      </View>
    )
  }

  /** 渲染弹窗 */ 
  renderModals () {
    const { orderInfo } = this.state
    const shopItems = orderInfo.shop_items || []
    const { platformModals } = orderInfo
    return (
      <View>
        {platformModals && platformModals.map(modalItem => {
          return modalItem.isShowModal ? this.renderModalView(modalItem) : <View></View>
        })}
        {shopItems.map(storeItem => {
          return this.renderStoreModals(storeItem)
        })}
      </View>
    )
  }

  /** 渲染商店弹窗 */
  renderStoreModals (storeItem) {
    const { modalList } = storeItem
    return ( 
      <Block>
        {modalList.map(modalItem => {
          return modalItem.isShowModal ? this.renderModalView(modalItem) : <View></View>
        })}
      </Block>
    )
  }

  /** 渲染底部弹窗 */
  renderModalView (modalItem) {
    const { invoiceInfo } = this.state
    return(
      <Block>
        {modalItem.type !== 'inovice' && <YFWFloatLayout 
          title={modalItem.title} 
          isOpened={modalItem.modalOpen} 
          onClose={this.onNormalItemModalClose.bind(this, modalItem)}
        >
          {modalItem.modalName.length > 0 && <View className='settlement-row'>
            <Text className='settlement-dark-text settlement-14-text settlement-margin-bottom-10 settlement-margin-left-3vw'>{modalItem.modalName}</Text>
          </View>}
          {modalItem.type === 'normal' && modalItem.dataItems.map((dataItem, dataItemIndex) => {
            return this.renderModalNormalItem(modalItem, dataItem, dataItemIndex)
          })}
          {modalItem.type === 'coupon' && modalItem.dataItems.map((dataItem, dataItemIndex) => {
            return this.renderModalCouponItem(modalItem, dataItem, dataItemIndex)
          })}
          {/* {modalItem.type === 'inovice' && this.renderModalInvoiceView()} */}
          {modalItem.dataItems.length === 0 && this.renderModalEmptyView()}   
        </YFWFloatLayout>}
        {modalItem.type === 'inovice' 
          && <YFWInvoiceModal 
              invoice={invoiceInfo} 
              isOpened={modalItem.modalOpen} 
              onClose={this.onNormalItemModalClose.bind(this, modalItem)}
              onInvoice={(invoice) => { this.handleInvoiceInfo(invoice) }} 
            />
        }
      </Block>
    )
  }

  /** 渲染弹窗普通item */
  renderModalNormalItem (modalItem, dataItem, dataItemIndex) {
    const itemClass = dataItem.isSelect ? 'settlement-modal-item-select' : 'settlement-modal-item-normal'
    const textClass = dataItem.isSelect ? 'settlement-white-text' : 'settlement-green-text'
    const itemIcon = dataItem.isSelect ? require('../../../../images/chooseBtnWhite3x.png') : require('../../../../images/checkout_unsel.png')
    return(
      <View 
        className={'settlement-modal-item settlement-margin-left-3vw settlement-row settlement-content-between settlement-algin-center '+itemClass}
        onClick={this.onModalNormalItemClick.bind(this, modalItem, dataItemIndex)}
      >
        <View className='settlement-row settlement-content-between settlement-algin-center'>
          <Text className={'settlement-14-text settlement-bold-text '+textClass}>{dataItem.name}</Text>
          <Text className={'settlement-14-text settlement-bold-text '+textClass}>{'¥'+dataItem.price}</Text>
        </View>
        <Image src={itemIcon} mode='widthFix' />
      </View>
    )
  }

  /** 渲染弹窗优惠券item */
  renderModalCouponItem (modalItem, dataItem, dataItemIndex) {
    const itemIcon = dataItem.isSelect ? require('../../../../images/chooseBtn.png') : require('../../../../images/checkout_unsel.png')
    const useCoupon = Number.parseFloat(dataItem.price) > 0
    return(
      <View 
        className='settlement-modal-coupon-item settlement-margin-left-3vw settlement-row settlement-content-between settlement-algin-center'
        onClick={this.onModalNormalItemClick.bind(this, modalItem, dataItemIndex)}
      >
        {useCoupon && <View className='settlement-modal-coupon-item-left settlement-row settlement-content-center settlement-algin-center'>
            <View>
              <Text className='settlement-15-text settlement-bold-text settlement-white-text'>¥</Text>
              <Text className='settlement-30-text settlement-bold-text settlement-white-text'>{dataItem.price}</Text>
            </View>
        </View>}
        {!useCoupon && <Text className='settlement-15-text settlement-bold-text settlement-dark-text settlement-margin-left-3vw'>{dataItem.coupon_des}</Text>}
        {useCoupon && <View className='settlement-modal-coupon-item-center settlement-column settlement-content-between'>
          <Text className='settlement-15-text settlement-bold-text settlement-dark-text'>{dataItem.coupon_des}</Text>
          <Text className='settlement-13-text settlement-dark-text'>{dataItem.start_time+'-'+dataItem.expire_time}</Text>
        </View>}
        <View className='settlement-modal-coupon-item-right settlement-column settlement-content-center settlement-algin-center'>
          <Image src={itemIcon} mode='widthFix' />
        </View>
      </View>
    )
  }

  /** modal空页面 */
  renderModalEmptyView () {
    return(
      <View className='settlement-modal-empty settlement-column settlement-algin-center'>
        <Image src={'https://c1.yaofangwang.net/common/images/miniapp/ic_no_coupon.png'} mode='widthFix' />
        <Text className='settlement-12-text settlement-light-text'>暂无可用优惠券</Text>
      </View>
    )
  }


  /** 渲染商店分割线 */
  renderStoreLine () {
    return <View className='settlement-store-line' />
  }

  /** 渲染支付信息 */
  renderPaymentInfo () {
    const { orderInfo } = this.state
    const { platformModals } = orderInfo
    return(
      <View className='settlement-column'>
        {platformModals && platformModals.map(modalItem => {
          return this.renderNormalItem(modalItem)
        })}
        {orderInfo.showPoint 
          && <View className='settlement-normal-item settlement-row settlement-content-between settlement-algin-center'>
            <Text className='settlement-light-text settlement-12-text'><Text style={'color:#000;padding-right:10px;'} className='settlement-12-text'>积分抵扣</Text>{'使用'+orderInfo.usePoint+'积分抵用'+orderInfo.userPointMoney+'元'}</Text>
            <Switch checked={orderInfo.pointEnable} color='#1fdb9b' onChange={this.onPointOrBalanceChange.bind(this, 1)} />
          </View>
        }
        {orderInfo.showBalance 
          && <View className='settlement-normal-item settlement-row settlement-content-between settlement-algin-center'>
            <View className='settlement-row settlement-algin-center'>
              <Text className='settlement-light-text settlement-12-text'>{'可使用奖励金额'+orderInfo.useBalance+'元'}</Text>
              <Image src={require('../../../../images/tips_help.png')} className='settlement-balance-icon' mode='widthFix' />
            </View>
            <Switch checked={orderInfo.balanceEnable} color='#1fdb9b' onChange={this.onPointOrBalanceChange.bind(this, 2)} />
          </View>
        }
        {this.renderStoreLine()}
      </View>
    )
  }

  /** 渲染底部信息 */
  renderBottomView () {
    const { orderInfo,all_total } = this.state
    const { isIphoneX } = this.state
    const { defaultAddress } = this.state
    const { showAddressFloat } = this.state
    const priceTotal = orderInfo.orderTotalPrice || '0.00'
    const priceArray = priceTotal.split('.')
    const intergeP = priceArray[0]
    const floatP = priceArray[1]
    return(
      <View className='settlement-bottom-view'>
        {showAddressFloat && <View className='settlement-notice-view settlement-yellow-back settlement-row'>
          <Text className='settlement-pink-text settlement-13-text'>{defaultAddress.address}</Text>
        </View>}
        <View className='settlement-row'>
          <View className='settlement-bottom-left settlement-row settlement-algin-center' style={'justify-content:flex-end;padding-right:10px'}>
            <View>
              {all_total && <Text className='settlement-13-text' style={'color:gray;padding-right:10px'}>共{all_total}件</Text>}
              <Text className='settlement-dark-text settlement-13-text settlement-bold-text'>总计：</Text>
              <Text className='settlement-red-text settlement-12-text settlement-bold-text'>¥</Text>
              <Text className='settlement-red-text settlement-15-text settlement-bold-text'>{intergeP}.</Text>
              <Text className='settlement-red-text settlement-12-text settlement-bold-text'>{floatP}</Text>
            </View>
          </View>
          <View className='settlement-bottom-right settlement-row settlement-content-center settlement-algin-center' onClick={this.onPayClick.bind(this)}>
            <Text className='settlement-white-text settlement-15-text settlement-bold-text'>去支付</Text>
          </View>
        </View>
        {isIphoneX && <View className='settlement-ipx'></View>}
      </View>
    )
  }

  /** 渲染底部占位View */
  renderSpaceView () {
    const { isIphoneX } = this.state
    const spaceStyle = isIphoneX ? 220 : 160
    return <View className='settlement-space-vew' style={'height: '+spaceStyle+'rpx;'} />
  }

  /** 切换收货人地址 */
  onChangeAddress () {
    pushNavigation('get_address_list', { selectEnable:true})
  }

  /** 姓名输入框输入事件 */
  onPatientNameInput (event) {
    let value = event.detail.value
    value = value.replace(NEWNAME, '')
    return value
  }

  /** 姓名输入框输入完成事件 */
  onPatientNameInputEnd (event) {
    let value = event.detail.value
    value = value.replace(NAME, '')
    let { orderInfo } = this.state
    orderInfo.medicate_item.medicate_name = value
    this.setState({
      orderInfo: orderInfo
    })
  }

  /** 身份证号码输入框输入事件 */
  onPatientIdCardInput (event) {
    let value = event.detail.value
    value = value.replace(IDENTITY_CODE, '')
    return value
  }

  /** 身份证号码输入框输入完成事件 */
  onPatientIdCardInputEnd (event) {
    const value = event.detail.value
    const isIdCard = value.match(IDENTITY_VERIFY)
    if (!isIdCard) {
      Taro.showToast({
        title: '请输入正确的身份证号码',
        icon: 'none',
        duration: 2000
      })
    } else {
      let { orderInfo } = this.state
      const idLength = value.length
      const sex = value.substr(idLength-2, 1)
      orderInfo.medicate_item.medicate_idcard = value
      orderInfo.medicate_item.medicate_sex = sex === '1' ? '男' : '女'
      this.setState({
        orderInfo: orderInfo
      })
    }
  }

  /** 点击显示modal */
  onNormalItemClick (modalItem) {
    let { orderInfo } = this.state
    let openItem = modalItem
    openItem.modalOpen = true
    if (modalItem.shopIndex !== -1) {
      let shopItem = orderInfo.shop_items[modalItem.shopIndex]
      shopItem.modalList[modalItem.modalIndex] = openItem
      orderInfo.shop_items[modalItem.shopIndex] = shopItem
      this.setState({ orderInfo: orderInfo })
    } else if (modalItem.shopIndex === -1) {      
      orderInfo.platformModals[modalItem.modalIndex] = openItem
    }
    this.setState({ orderInfo: orderInfo })
  }

  /** modal关闭 */
  onNormalItemModalClose (modalItem) {
    let { orderInfo } = this.state
    let openItem = modalItem
    openItem.modalOpen = false
    if (modalItem.shopIndex !== -1) {
      let shopItem = orderInfo.shop_items[modalItem.shopIndex]
      shopItem.modalList[modalItem.modalIndex] = openItem
      orderInfo.shop_items[modalItem.shopIndex] = shopItem
    } else if (modalItem.shopIndex === -1) {
      orderInfo.platformModals[modalItem.modalIndex] = openItem
    }
    this.setState({ orderInfo: orderInfo })
  }

  /** 点击modal的item */
  onModalNormalItemClick (modalItem, dataItemIndex) {
    let { orderInfo } = this.state
    let openItem = modalItem
    let changeMoney = 0.0
    let shopChangeMoney = 0.0
    let orderChangeMoney = 0.0
    let selectedItem = modalItem.dataItems[modalItem.selectIndex]
    let selectItem = modalItem.dataItems[dataItemIndex]

    selectedItem.isSelect = false
    selectItem.isSelect = true
    openItem.dataItems[modalItem.selectIndex] = selectedItem
    openItem.dataItems[dataItemIndex] = selectItem
    openItem.modalOpen = false
    openItem.selectIndex = dataItemIndex
    openItem.selectInfo = modalItem.dataItems[dataItemIndex]
    openItem.content = modalItem.dataItems[dataItemIndex].content

    changeMoney = selectItem.money - selectedItem.money
    orderChangeMoney = Number.parseFloat(orderInfo.orderTotalPrice) + changeMoney
    orderInfo.orderTotalPrice = toDecimal(orderChangeMoney)
    if (modalItem.shopIndex !== -1) {
      let shopItem = orderInfo.shop_items[modalItem.shopIndex]
  
      shopChangeMoney = Number.parseFloat(shopItem.totalPrice) + changeMoney
      shopItem.modalList[modalItem.modalIndex] = openItem
      shopItem.totalPrice = toDecimal(shopChangeMoney)
      orderInfo.shop_items[modalItem.shopIndex] = shopItem
  
    } else if (modalItem.shopIndex === -1) {
      orderInfo.platformModals[modalItem.modalIndex] = openItem
    }
    this.setState({ orderInfo: orderInfo })

    this.reloadOrderPrice()
  }

  /** 积分、奖励金状态改变 */
  onPointOrBalanceChange (type, event) {
    let { orderInfo } = this.state
    const changeValue = event.detail.value || event.detail.checked || false
    if (type === 1) {
      orderInfo.pointEnable = changeValue
    } else {
      orderInfo.balanceEnable = changeValue
    }
    this.setState({ orderInfo: orderInfo })

    this.reloadOrderPrice()
  }

  /** 重新计算订单总价 */
  reloadOrderPrice () {
    let { orderInfo } = this.state
    const selectPlatformCoupon = orderInfo.platformModals[0].selectInfo
    let orderTotal = 0
    orderInfo.shop_items.map(shopItem => {
      orderTotal += Number.parseFloat(shopItem.totalPrice)
    })
    if (isNotEmpty(selectPlatformCoupon)) {
      const money = selectPlatformCoupon.money || 0
      orderTotal += money
    }
    if (orderTotal <= 0) {
      orderTotal = 0.01
    }

    const point = Number.parseFloat(orderInfo.user_point)
    const ratio = Number.parseFloat(orderInfo.use_ratio)
    let balance = Number.parseFloat(orderInfo.balance)
    let showBalance = true
    let cutPoint = point
    if (orderTotal*100*ratio <= cutPoint) {
      showBalance = false
      cutPoint = Number.parseInt(orderTotal*100*ratio)
    }
    if (balance === 0) {
      showBalance = false
    }
    if (showBalance) {
      balance = Math.min(balance, orderTotal*ratio - cutPoint/100)
    }
    if (orderInfo.pointEnable) {
      orderTotal -= Number.parseFloat(toDecimal(cutPoint/100))
    }
    if (orderInfo.balanceEnable) {
      orderTotal -= balance
    }

    orderInfo.usePoint = cutPoint
    orderInfo.orderTotalPrice = toDecimal(orderTotal)
    orderInfo.userPointMoney = toDecimal(cutPoint/100)
    orderInfo.useBalance = toDecimal(balance)
    orderInfo.showBalance = showBalance

    this.setState({ orderInfo: orderInfo })
  }


  /** 发票信息回调函数 */
  handleInvoiceInfo (invoiceInfo) {
    let { orderInfo } = this.state
    let modalItem = orderInfo.platformModals[1]
    if (invoiceInfo.type === 1) {
      modalItem.modalOpen = false
      modalItem.content = '发票抬头：'+invoiceInfo.name
    } else {
      modalItem.modalOpen = false
      modalItem.content = '无需发票'
    }
    orderInfo.platformModals[1] = modalItem
    this.setState({ orderInfo: orderInfo })
  }
  /** 校验就诊信息 */
  verifyinquiryInfo (event) {
    let drug_items = this.state.orderInfo.drug_items
    let medicate_info_type = this.state.orderInfo.medicate_info_type
    let { isCompleteInquiry } = this.state
    if (medicate_info_type != 2) {
      return true
    } if (!isCompleteInquiry) {
      Taro.showToast({ title: '请添加处方信息', icon: 'none', duration:2000 })
      Taro.pageScrollTo({ scrollTop: 0, duration: 300})
      return false
    }
    return true
  }
  /** 去支付 */
  onPayClick () {
    if(!this.verifyinquiryInfo()) {
      return
    }
    let yqfkInfo = getGlobalData('yqfkInfo'),that = this;
    if(this.state.is_needenrollment &&!yqfkInfo.isSave){
      Taro.showModal({
        title: '疫情防控药品等级提醒',
        content: '您购买的药品含疫情防控药品，根据监管部门要求需登记用药人信息后下单。',
        showCancel: true,
        confirmColor: '#1fdb9b',
        confirmText:'去登记',
        cancelText:'取消',
        success: function(res) {
          if (res.confirm) {
            pushNavigation('get_nrollment',{'hasPatient':that.state.orderInfo.medicate_info_type})
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return;
    }
    const { orderInfo } = this.state
    let noLogistics = orderInfo.shop_items.some(shopItem => {
      return safe(safeObj(shopItem.modalList[1]).dataItems).length === 0
    })
    if (orderInfo.shop_items.length === 0) {
      return
    } else if (noLogistics) {
      Taro.showToast({
        title: '当前地区暂不支持配送',
        icon: 'none',
        duration: 2000
      })
    } else {
      if (process.env.TARO_ENV === 'swan') {
        Taro.showToast({
          title: '暂不支持支付，请前往APP进行购买',
          icon: 'none',
          duration: 2000
        })        
      } else {
        this.onCommitOrder()
      }
    }
  }


  /** 提交订单 */
  onCommitOrder () {
    Taro.showLoading({ title: '加载中...' })

    const { orderInfo } = this.state
    const { invoiceInfo } = this.state
    const { defaultAddress } = this.state
    const { invoiceMap } = this.state
    let listMap = new Map()
    let cartGoodsIds = []
    let cartPackageIds = []
    orderInfo.shop_items.map(shopItem => {
      const invoice = invoiceMap[shopItem.shop_id]
      let info = {
        packageid: safe(safeObj(shopItem.modalList[0].selectInfo).id),
        logisticsid: safe(safeObj(shopItem.modalList[1].selectInfo).id),
        couponsid: safe(safeObj(shopItem.modalList[2].selectInfo).id),
        rx_image: "",
        rx_content: "",
        no_rx_reason: "",
        dict_bool_etax: invoice.isNeed ? (invoice.selectType.type=='1' ? 0 : 1) : 0,
        invoice_idcard: invoice.isNeed ? invoice.invoice_code : '',
        invoice_name: invoice.isNeed ? '个人' : '',
        invoice_type: invoice.isNeed ? '1' : '0',

      }
      listMap.set(shopItem.shop_id,info)
      cartGoodsIds = cartGoodsIds.concat(shopItem.medicineIds)
      cartPackageIds = cartPackageIds.concat(shopItem.packageIds)
    })
    let medicate_name = ''
    let medicate_code = ''
    let medicate_sex = ''
    if (safe(orderInfo.medicate_info_show) === 'true') {
      medicate_name = orderInfo.medicate_item.medicate_name
      medicate_code = orderInfo.medicate_item.medicate_idcard
      medicate_sex = orderInfo.medicate_item.medicate_sex === '男' ? '1': '0'
    }
    let usePoint = '0.0'
    if (orderInfo.pointEnable) {
      usePoint = orderInfo.usePoint
    }
    let useBalance = '0.00'
    if (orderInfo.showBalance && orderInfo.balanceEnable) {
      useBalance = orderInfo.useBalance
    }
    let sysInfo = Taro.getStorageSync('system_info')

    const inquiryInfo = getGlobalData('inquiryInfo')
    let diseaselist = []
    inquiryInfo.medicine_disease_items.forEach(mItem => {
      mItem.diseases.map(dItem => {
        if (dItem.active) {
          diseaselist.push({ id: dItem.id, name: dItem.name, namecn: mItem.medicine_name })
        }
      })
    })
    let rx_info=null;
    if(this.state.orderInfo.medicate_info_type){
      let _arr = inquiryInfo.certificationImages.map(item=>item.fileId)
      rx_info = {
        rx_upload_type: inquiryInfo.isPrescrption ? 3 : 2,
        rx_image: inquiryInfo.rx_images.join('|'),
        case_url: _arr.join('|'),
        drugid: inquiryInfo.selectPatient?inquiryInfo.selectPatient.id :'',
        disease_desc: inquiryInfo.diseaseDesc,
        diseaselist: diseaselist
      }
    }
    let _globalYqData = getGlobalData('yqfkInfo')
    let _yqfkInfo = JSON.parse(JSON.stringify(_globalYqData))
    delete _yqfkInfo.isSave;
    delete _yqfkInfo.agreeFlag; 
    if(this.state.orderInfo.medicate_info_type){
      _yqfkInfo.drugname = inquiryInfo.selectPatient?inquiryInfo.selectPatient.real_name : _yqfkInfo.drugname;
      _yqfkInfo.drugidcardno = inquiryInfo.selectPatient?inquiryInfo.selectPatient.idcard_no : _yqfkInfo.drugidcardno;
      _yqfkInfo.drugmobile = inquiryInfo.selectPatient?inquiryInfo.selectPatient.mobile : _yqfkInfo.drugmobile;
    }
    if(_yqfkInfo.qt != 1){
      _yqfkInfo.desc_sym = ""
    }
    if( _yqfkInfo.medicate_purpose != 1){
      delete _yqfkInfo.fs;
      delete _yqfkInfo.ks;
      delete _yqfkInfo.xm;
      delete _yqfkInfo.is_fl;
      delete _yqfkInfo.qt;
      delete _yqfkInfo.desc_sym;
    }
    _yqfkInfo.medicate_purpose =  _yqfkInfo.medicate_purpose == 1 ?'治疗':'预防储备';

    let params = {
      cartids: cartGoodsIds.join(','), //商品在购物车里的ID  多个用,分割
      packageids: cartPackageIds.join(','), //套餐或多件装在购物车里的ID  多个用,分割
      request_os: safe(safeObj(sysInfo).platform),
      use_point: usePoint,
      platform_coupon_id: safe(safeObj(orderInfo.platformModals[0].selectInfo).id),
      addressid: defaultAddress.id,
      all_order_price_total: orderInfo.orderTotalPrice,
      shop_list: strMapToObj(listMap),
      // medicate_name: medicate_name,
      // medicate_idcard: medicate_code,
      // medicate_sex: medicate_sex,
      rx_info: rx_info,
    }
    if(this.state.is_needenrollment){
      params.enrollment_info = JSON.stringify(_yqfkInfo)
    }
    console.log('支付参数'+params)
    orderPaymentApi.submitOrder(params).then(response => {
      Taro.hideLoading()
      
      if (isNotEmpty(response)) {
        const info = { orderIds: response, addressInfo: defaultAddress }
        pushNavigation('get_ordersubmit', info, 'redirect')
      }
    }, error => {
      Taro.hideLoading()
      Taro.showToast({
        title: error.msg || '订单异常',
        icon: 'none',
        duration: 2000
      })
    })
  }
}