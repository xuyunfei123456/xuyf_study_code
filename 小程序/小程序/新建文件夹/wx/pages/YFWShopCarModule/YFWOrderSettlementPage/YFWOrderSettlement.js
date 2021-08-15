// pages/YFWShopCarModule/YFWOrderSettlementPage/YFWOrderSettlement.js
import {
  OrderPaymentApi,ShopCarApi
} from '../../../apis/index.js'
const orderPaymentApi = new OrderPaymentApi()
const shopCarApi = new ShopCarApi()
import {
  pushNavigation
} from '../../../apis/YFWRouting.js'
import { YFWOrderSettlementModel} from '../Model/YFWOrderSettlementModel.js'
import { YFWAddressModel} from '../Model/YFWAddressModel.js'
import { IDENTITY_CODE, IDENTITY_VERIFY } from "../../../utils/YFWRegular"
import { objToStrMap, safe, safeObj, strMapToObj, toDecimal, isEmpty, jsonToArray} from '../../../utils/YFWPublicFunction.js'
var log = require('../../../utils/log')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeIndex:0,
    acid_aid_gy_gytype_coid:"",
    opacityAnimation: {},
    translateAnimation: {},
    needenrollment_prompt:'',
    isCompleteYqfk:false,
    is_needenrollment:0,
    all_total:"",
    getAddressFlag:false,
    defaultAddress:{},
    selectAddress:null,//选择的地址
    orderInfo:{},
    voicType:'',
    invoiceInfo:{
      type:0,
      title:'',
      code:''
    },
    showChose:true,
    packs: [],
    selectPackInfo: new Map(),
    onPS: '',
    onPatchPay: '',
    patchs: [],
    isNedVoic: [{
      voic: '无需发票'
    }, {
      voic: '我要发票'
    }],
    onForm: '',
    platforms: [],
    coupon_items:[],
    un_coupon_items:[],
    coupon_select_available:true,
    selectInvoiceType:0,
    onForm:'',
    platforms:[],
    goodsIds: [],
    packageIds: [],
    isCompleteInquiry: false,
    invoiceModalShow: false,
    invoiceMap: {},
    invoice: {
      shopId: 0,
      invoice_applicant: '',
      invoice_code: '',
      isNeed: false,
      itemTitle: '请选择',
      selectType: {

      },
      suportTypes: []
    },
    isBuy:false,//是否是立即购买
  },
  singleItemNumMap: new Map(),
  // 监听页面滚动
  onPageScroll: function(e) {
    this.setData({
      scrollTop: e.scrollTop
    })
  },
  //选择地址
  choseAddressAction: function() {
    pushNavigation('get_address_list', { selectEnable:true})
  },
  handleNeedenrollment(){
    pushNavigation('get_nrollment',{'hasPatient':this.data.orderInfo.medicate_info_type,'needenrollment_prompt':this.data.needenrollment_prompt})
  },
  handleInquiryInfo: function (event) {
    let inquiryInfo = app.globalData.inquiryInfo
    if (!inquiryInfo.isSave) {
      inquiryInfo.drug_items = inquiryInfo.isEditPatient ? inquiryInfo.drug_items : this.data.orderInfo.drug_items
      inquiryInfo.selectPatient = this.data.orderInfo.drug_items[0]
      inquiryInfo.medicine_disease_items = this.data.orderInfo.medicine_disease_items
      inquiryInfo.medicine_disease_xz_count = this.data.orderInfo.medicine_disease_xz_count
      inquiryInfo.is_certificate_upload = this.data.orderInfo.is_certificate_upload
      inquiryInfo.disease_xz_add = this.data.orderInfo.disease_xz_add
      inquiryInfo.rx_mode = Number.parseInt(this.data.orderInfo.rx_mode),
      inquiryInfo.cartids = this.data.goodsIds.join(',')
      inquiryInfo.packageids = this.data.packageIds.join(',')
      inquiryInfo.isPrescrption = inquiryInfo.rx_mode==2
      inquiryInfo.diseaseDesc = "";
      inquiryInfo.certificationImages = [];
      app.globalData.inquiryInfo = inquiryInfo
    }

    pushNavigation('get_inquiry_info')
  },
  /** 点击、滚动穿透 */
  handleCatchTap: function (event) {
    return true
  },
  // 包装方式
  isway: function(event) {
    this.setData({
      packs: event.currentTarget.dataset.info,
      selectShopID: event.currentTarget.dataset.shopId,
    })
    this.onpackway.showModal()
  },
  // 获取包装方式
  isClosePack: function(event) {
    this.onpackway.hideModal()
    let index = event.currentTarget.dataset.index;
    this.data.orderInfo.shop_items.map((shopInfo) => {
      if (shopInfo.shop_id == this.data.selectShopID) {
        shopInfo.selectPackInfo = this.data.packs[index]
        shopInfo.package_items.map((packInfo, i) => {
          packInfo.isSelect = index == i
        })
        let totalPrice = parseFloat(shopInfo.store_medicine_price_total)
        if (shopInfo.selectPackInfo) {
          totalPrice += parseFloat(shopInfo.selectPackInfo.price)
        }
        if (shopInfo.selectLogisticInfo) {
          totalPrice += parseFloat(shopInfo.selectLogisticInfo.price)
        }
        if (shopInfo.selectCouponInfo) {
          totalPrice -= parseFloat(shopInfo.selectCouponInfo.money)
        }
        shopInfo.totalPrice = toDecimal(totalPrice)
      }

    })
    this.reloadOrderPrice()
  },
  //配送方式
  patchWay: function(event) {
    this.setData({
      patchs: event.currentTarget.dataset.info,
      selectShopID: event.currentTarget.dataset.shopId,
    })
    this.onpatchway.showModal()
  },
  //当前地区暂不配送
  noPatchWay: function() {
    wx.showModal({
      title: '提示',
      content: '当前地区暂不配送',
      showCancel: false,
      confirmColor: '#1179ce',
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //获取配送方式
  isClosePatch: function(event) {
    this.onpatchway.hideModal()
    let index = event.currentTarget.dataset.index;

    this.data.orderInfo.shop_items.map((shopInfo) => {
      if (shopInfo.shop_id == this.data.selectShopID) {
        shopInfo.selectLogisticInfo = this.data.patchs[index]
        shopInfo.logistic_items.map((packInfo, i) => {
          packInfo.isSelect = index == i
        })
        let totalPrice = parseFloat(shopInfo.store_medicine_price_total)
        if (shopInfo.selectPackInfo) {
          totalPrice += parseFloat(shopInfo.selectPackInfo.price)
        }
        if (shopInfo.selectLogisticInfo) {
          totalPrice += parseFloat(shopInfo.selectLogisticInfo.price)
        }
        if (shopInfo.selectCouponInfo) {
          totalPrice -= parseFloat(shopInfo.selectCouponInfo.money)
        }
        if (shopInfo.shop_offers_price) {
          totalPrice -= parseFloat(shopInfo.shop_offers_price)
        }
        shopInfo.totalPrice = toDecimal(totalPrice)
      }

    })
    this.reloadOrderPrice()

  },
  //打开平台选项
  formWay: function() {
    this.onplatform.showModal()
  },
  //获取平台优惠
  isCloseForm: function(event) {
    this.onplatform.hideModal()
    let index = event.currentTarget.dataset.index
    this.data.platforms.map((item, i) => {
      item.isSelect = i == index
    })
    this.data.orderInfo.selectPlatformCouponsInfo = this.data.platforms[index]
    this.setData({
      platforms: this.data.platforms,
      'orderInfo.selectPlatformCouponsInfo': this.data.platforms[index],
    })
    this.reloadOrderPrice()
  },
  showVio: function() {
    this.oninvoway.showModal()

  },
  //获取发票类型
  isCloseInvo: function(event) {
    let index = event.currentTarget.dataset.index

    this.setData({
      selectInvoiceType: index
    })
  },
  //发票确定按钮
  onCenter:function(event){
    if (this.data.selectInvoiceType == 1){

      if (!this.data.invoiceInfo.title || this.data.invoiceInfo.title == '') {
        wx.showToast({
          title: '请输入姓名',
        })
        return
      }

      if (!this.data.invoiceInfo.code || this.data.invoiceInfo.code.length == 0) {
        wx.showToast({
          title: '请输入发票号',
        })
        return
      }
    }
    this.oninvoway.hideModal()

    this.setData({
      showChose:false,
      'invoiceInfo.type':this.data.selectInvoiceType,
    })

  },
  //使用积分
  useInteal: function (e) {
    console.log('change 事件，携带值为', e.detail.value)
    this.data.orderInfo.pointEnable = e.detail.value
    this.setData({
      'orderInfo.pointEnable':e.detail.value
    })
    this.reloadOrderPrice()
  },
  /**奖励金余额 */
  balanceEnableChange: function(e) {
    this.data.orderInfo.balanceEnable = e.detail.value
    this.setData({
      'orderInfo.balanceEnable': e.detail.value
    })
    this.reloadOrderPrice()
  },
  addCarMoreAction: function(event) {
    let info = event.currentTarget.dataset.info
    let totalPrice = 0
    this.data.orderInfo.shop_items.some((shopInfo) => {
      let isShop = shopInfo.shop_id == this.data.selectShopID
      if (isShop) {
        totalPrice = parseFloat(shopInfo.store_medicine_price_total)
      }
      return isShop
    })
    this.ondiscount.hideModal()
    pushNavigation('get_shop_detail_list', {
      'value': this.data.selectShopID,
      'priceInShop': totalPrice,
      'isShowConditionTips':true,
      condition_price: info.condition_price,
      condition_money:info.money,
    })
  },
  couponSelectChange: function(event) {
    this.setData({
      coupon_select_available:event.currentTarget.dataset.status,
    })
  },
  // 打开优惠券选择弹框
  ondis: function(event) {
    this.setData({
      coupon_items: event.currentTarget.dataset.info,
      un_coupon_items: event.currentTarget.dataset.unInfo,
      selectShopID: event.currentTarget.dataset.shopId,
    })
    this.ondiscount.showModal()
  },
  //选择优惠弹框按钮
  isCloseDis: function(event) {
    this.ondiscount.hideModal()
    let index = event.currentTarget.dataset.index
    this.data.orderInfo.shop_items.map((shopInfo) => {
      if (shopInfo.shop_id == this.data.selectShopID) {
        shopInfo.selectCouponInfo = this.data.coupon_items[index]
        shopInfo.coupon_items.map((packInfo, i) => {
          packInfo.isSelect = index == i
        })
        let totalPrice = parseFloat(shopInfo.store_medicine_price_total)
        if (shopInfo.selectPackInfo) {
          totalPrice += parseFloat(shopInfo.selectPackInfo.price)
        }
        if (shopInfo.selectLogisticInfo) {
          totalPrice += parseFloat(shopInfo.selectLogisticInfo.price)
        }
        if (shopInfo.selectCouponInfo) {
          totalPrice -= parseFloat(shopInfo.selectCouponInfo.money)
        }
        if (shopInfo.shop_offers_price) {
          totalPrice -= parseFloat(shopInfo.shop_offers_price)
        }
        shopInfo.totalPrice = toDecimal(totalPrice)
      }

    })
    this.reloadOrderPrice()
  },
  /**重算订单总价 */
  reloadOrderPrice: function() {
    let orderTotalPrice = 0
    this.data.orderInfo.shop_items.map((shopInfo) => {
      orderTotalPrice += parseFloat(shopInfo.totalPrice)
    })
    if (this.data.orderInfo.selectPlatformCouponsInfo) {
      orderTotalPrice -= parseFloat(this.data.orderInfo.selectPlatformCouponsInfo.money)
    }
    if (orderTotalPrice <= 0) {
      orderTotalPrice = 0.01
    }
        
    let point = parseInt(this.data.orderInfo.user_point)
    let balance = parseInt(this.data.orderInfo.balance)
    let ratio = parseFloat(this.data.orderInfo.use_ratio)
    let showBalance = true;

    let cut_point = point
    orderTotalPrice = parseFloat(orderTotalPrice)
    if (orderTotalPrice * 100 * ratio <= cut_point) {
      cut_point = Number.parseInt(orderTotalPrice * 100 * ratio);
      showBalance = false;
    }
    if (balance == 0) {
      showBalance = false;
    }
    if (showBalance) {
      balance = Math.min(balance, orderTotalPrice * ratio - cut_point / 100);
    }
    this.data.orderInfo.usePoint = cut_point
    this.data.orderInfo.usePointMoney = toDecimal(cut_point / 100)
    if (this.data.orderInfo.pointEnable) {
      orderTotalPrice -= parseFloat(toDecimal(cut_point / 100))
    }
    if (this.data.orderInfo.balanceEnable) {
      orderTotalPrice -= parseFloat(balance)
    }
    orderTotalPrice = toDecimal(orderTotalPrice)
    this.data.orderInfo.useBalance = toDecimal(balance)
    this.data.orderInfo.showBalance = showBalance
    this.data.orderInfo.orderTotalPrice = orderTotalPrice
    this.setData({
      orderInfo: this.data.orderInfo,
    })

  },
  //接受发票人
  nameInput: function(e) {
    this.setData({
      'invoiceInfo.title': e.detail.value
    })
  },
  //接受发票号
  codeInput: function (e) {
    this.setData({
      'invoiceInfo.code': e.detail.value
    })
  },
  //用药人姓名
  medicateNameInput: function (e) {
    this.setData({
      'orderInfo.medicate_item.medicate_name': e.detail.value
    })
  },
  //用药人身份证号
  medicateCodeInput: function (e) {
    let idcard = e.detail.value.replace(/[^0-9xX]/g,'')
    this.setData({
      'orderInfo.medicate_item.medicate_idcard': idcard
    })
  },
  idCardConfirm: function() {
    let medicate_idcard = this.data.orderInfo.medicate_item.medicate_idcard
    let sex = ''
    if (medicate_idcard.match(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/)) {
      let sexTag = medicate_idcard.slice(-2, -1)//18位身份证号码取倒数第二位数判断性别
      if (medicate_idcard.length == 15) {//15位身份证号码取最后一位数判断性别
        sexTag = medicate_idcard.slice(-1)
      }
      sexTag = parseInt(sexTag)
      sex = sexTag % 2 == 0 ? '女' : '男'
    }
    this.setData({
      'orderInfo.medicate_item.medicate_sex':sex
    })
  },
  /**奖励金提示 */
  tipAction: function(event) {
    let tipInfo = event.currentTarget.dataset.info
    if (!tipInfo) {
      return
    }
    wx.showModal({
      content: tipInfo.split('\\n').join('\n'),
      showCancel:false,
    })
  },

  /** 阻止发票弹窗滚动穿透 */
  handleInvoiceMove: function (event) {
    return true
  },

  /** 显示发票弹窗 */
  handleShowInoviceModal: function (event) {
    const { invoiceMap } = this.data
    const dataset = event.currentTarget.dataset
    const shopId = dataset['shopid']
    const inovice = invoiceMap[shopId]
    if (!this.data.invoiceModalShow) {
      let that = this
      let opacityAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      opacityAni.opacity(0).step()

      let translateAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      translateAni.translateY(505).step()

      that.setData({
        invoiceModalShow: true,
        opacityAnimation: opacityAni.export(),
        translateAnimation: translateAni.export(),
        invoice: inovice
      })

      setTimeout(function () {
        opacityAni.opacity(1).step()
        translateAni.translateY(0).step()
        that.setData({
          opacityAnimation: opacityAni.export(),
          translateAnimation: translateAni.export(),
        })
      }.bind(this), 0)
    }

  },

  /** 关闭弹窗 */
  handleCloseInvoiceModal: function (event) {
    if (this.data.invoiceModalShow) {
      let that = this
      let translateAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      translateAni.translateY(505).step()

      let opacityAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      opacityAni.opacity(0).step()

      that.setData({
        translateAnimation: translateAni.export(),
        opacityAnimation: opacityAni.export(),
      })

      setTimeout(function () {
        opacityAni.opacity(0).step()
        translateAni.translateY(0).step()
        that.setData({
          translateAnimation: translateAni.export(),
          opacityAnimation: opacityAni.export(),
          invoiceModalShow: false
        })
      }.bind(this), 300)
    }
  },

  /** 是否需要发票点击 */
  handleNeedInvoiceItemClick: function (event) {
    const dataset = event.currentTarget.dataset
    let { invoice } = this.data
    invoice.isNeed = dataset['index'] == '1'
    this.setData({ invoice: invoice })
  },

  /** 发票类型点击 */
  handleInvoiceTypeClick: function (event) {
    const dataset = event.currentTarget.dataset
    let { invoice } = this.data
    invoice.selectType = dataset['item'];
    this.setData({ invoice: invoice })
  },

  /** 发票输入身份证号码 */
  handleInvoiceCodeInput: function (event) {
    let value = event.detail.value
    value = value.replace(IDENTITY_CODE, '')
    let { invoice } = this.data
    invoice.invoice_code = value
    this.setData({ invoice: invoice })
  },

  /** 提交发票 */
  handleInvoiceConfirm: function (event) {
    let { invoice } = this.data
    
    if (invoice.isNeed && invoice.invoice_code.length == 0) {
      wx.showToast({ title: '请填写您的身份证号码', icon: 'none', duration: 2000 })
      return
    }
    if (invoice.isNeed && !IDENTITY_VERIFY.test(invoice.invoice_code)) {
      wx.showToast({ title: '身份证号码格式不正确', icon: 'none', duration: 2000 })
      return
    }
    let { invoiceMap } = this.data
    invoice.itemTitle = invoice.isNeed ? invoice.selectType.name : '无需发票'
    invoiceMap[invoice.shopId] = invoice
    this.setData({ invoice: invoice, invoiceMap: invoiceMap })
    
    this.handleCloseInvoiceModal()
  },

  /**
     * 判断用药人信息是否完整
     * @returns {boolean}
     */
  verifyMedicateInfo: function() {
    if (safeObj(safeObj(this.data.orderInfo).medicate_info_show) === 'true') {
      let medicateInfo = safeObj(safeObj(this.data.orderInfo).medicate_item)
      let back = false
      if (isEmpty(medicateInfo)) {
        back = true
      } else if (isEmpty(medicateInfo.medicate_name)) {
        back = true
      } else if (isEmpty(medicateInfo.medicate_idcard) || !medicateInfo.medicate_idcard.match(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/)) {
        back = true
      } else if (isEmpty(medicateInfo.medicate_sex)) {
        back = true
      }
      if (back) {
        wx.showToast({
          title: '请完善用药人信息',
          icon:'none'
        })
        return true;
      }
    }
    return false
  },

  /** 校验就诊信息 */
  verifyinquiryInfo: function (event) {
    let drug_items = this.data.orderInfo.drug_items
    let medicate_info_type = this.data.orderInfo.medicate_info_type
    let { isCompleteInquiry } = this.data
    if (medicate_info_type != 2) {
      return true
    } if (!isCompleteInquiry) {
      wx.showToast({ title: '请添加处方信息', icon: 'none', duration:2000 })
      wx.pageScrollTo({ scrollTop: 0, duration: 300})
      return false
    }
    return true
  },

  // 去支付
  goPay: function() {
    let that = this;
    if(!this.verifyinquiryInfo()) {
      return
    }

    if(this.data.is_needenrollment&&!app.globalData.yqfkInfo.isSave){
      wx.showModal({
        title: '疫情防控药品等级提醒',
        content: '您购买的药品含疫情防控药品，根据监管部门要求需登记用药人信息后下单。',
        showCancel: true,
        confirmColor: '#1fdb9b',
        confirmText:'去登记',
        cancelText:'取消',
        success: function(res) {
          if (res.confirm) {
            pushNavigation('get_nrollment',{'hasPatient':that.data.orderInfo.medicate_info_type})
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return;
    }
    if (this.data.orderInfo&&this.data.orderInfo.shop_items&&this.data.orderInfo.shop_items.length == 0) {
      return
    }
    if(!this.data.orderInfo || !this.data.orderInfo.shop_items){
      log.info('结算页商品==='+JSON.stringify(this.data.orderInfo))
      return;
    }

    let noLogisticInfo = this.data.orderInfo.shop_items.some((shopItem)=>{
      return isEmpty(shopItem.selectLogisticInfo)
    })
    if (noLogisticInfo) {
      wx.showToast({
        title: '当前地区不配送',
        duration:2000,
        icon:'none'
      })
      return
    }

    wx.showLoading({
      title: '加载中...',
    })
    const { invoiceMap } = this.data
    let listMap = new Map()
    let cartGoodsIds = []
    let cartPackageIds = [];
    this.data.orderInfo.shop_items.map((shopItem)=>{
      const invoice = invoiceMap[shopItem.shop_id]
      let info = {
        packageid: safe(safeObj(shopItem.selectPackInfo).id),
        logisticsid: safe(safeObj(shopItem.selectLogisticInfo).id),
        couponsid: safe(safeObj(shopItem.selectCouponInfo).id),
        rx_image: "",
        rx_content: "",
        no_rx_reason: "",
        dict_bool_etax: invoice.isNeed ? (invoice.selectType.type=='1' ? 0 : 1) : 0,
        invoice_idcard: invoice.isNeed ? invoice.invoice_code : '',
        invoice_name: invoice.isNeed ? '个人' : '',
        invoice_type: invoice.isNeed ? '1' : '0',
      }
      listMap.set(shopItem.shop_id,info)

      shopItem.cart_items.map((goodsInfo)=>{
        if (goodsInfo.type == 'medicine') {
          cartGoodsIds.push(goodsInfo.id)
        } else {
          cartPackageIds.push(goodsInfo.package_id)
        }
      })
    })
    if (this.data.invoiceInfo.type == 0) {
      this.data.invoiceInfo.title = ''
      this.data.invoiceInfo.code = ''
    }
    let medicate_name = ''
    let medicate_code = ''
    let medicate_sex = ''
    if (this.data.orderInfo.medicate_info_show == 'true') {
      medicate_name = this.data.orderInfo.medicate_item.medicate_name
      medicate_code = this.data.orderInfo.medicate_item.medicate_idcard
      medicate_sex = this.data.orderInfo.medicate_item.medicate_sex == '男'?'1':'0'
    }
    let use_point = '0'
    if (this.data.orderInfo.pointEnable) {
      use_point = this.data.orderInfo.usePoint
    }
    let use_balance = '0.00'
    if (this.data.orderInfo.showBalance&&this.data.orderInfo.balanceEnable) {
      use_balance = this.data.orderInfo.useBalance
    }
    let sysInfo = wx.getStorageSync('system_info') || {}

    const inquiryInfo = app.globalData.inquiryInfo
    let diseaselist = []
    inquiryInfo.medicine_disease_items.forEach(mItem => {
      mItem.diseases.map(dItem => {
        if (dItem.active) {
          diseaselist.push({ id: dItem.id, name: dItem.name, namecn: mItem.medicine_name })
        }
      })
    })
    let rx_info=null;
    if(this.data.orderInfo.medicate_info_type){
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

    let _yqfkInfo = JSON.parse(JSON.stringify(app.globalData.yqfkInfo))
    delete _yqfkInfo.isSave;
    delete _yqfkInfo.agreeFlag; 
    if(this.data.orderInfo.medicate_info_type){
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
      // invoice_type: this.data.invoiceInfo.type, //发票类型 0==无需发票  1==需要发票
      // invoice_name: this.data.invoiceInfo.title,//发票抬头 可为空字符串
      // invoice_idcard: this.data.invoiceInfo.code,//发票号  可为空字符串
      cartids: cartGoodsIds.join(','), //商品在购物车里的ID  多个用,分割
      packageids: cartPackageIds.join(','),//套餐或多件装在购物车里的ID  多个用,分割
      request_os: sysInfo.platform,//平台 
      use_point: use_point,//使用积分
      platform_coupon_id: safe(safeObj(this.data.orderInfo.selectPlatformCouponsInfo).id),//平台优惠券ID
      use_balance: use_balance,//使用余额
      addressid: safe(this.data.defaultAddress.id),//地址信息
      all_order_price_total: String(parseFloat(this.data.orderInfo.orderTotalPrice).toFixed(2)),//订单总金额
      shop_list: strMapToObj(listMap),//
      // medicate_name: inquiryInfo.selectPatient?inquiryInfo.selectPatient.real_name:'',//用药人姓名
      // medicate_idcard: inquiryInfo.selectPatient?inquiryInfo.selectPatient.idcard_no:'',//用药人身份证号
      // medicate_sex: inquiryInfo.selectPatient?inquiryInfo.selectPatient.dict_sex :'', //"1" : "0",//用药人性别
      rx_info: rx_info
    }
    if(this.data.is_needenrollment){
      params.enrollment_info = JSON.stringify(_yqfkInfo)
    }
    console.log('🍺🍺🍺🍺🍺🍺🍺🍺',rx_info);
    //兼容口罩拼团  后期删除 20210202
    if(this.data.acid_aid_gy_gytype_coid){
      params.acid_aid_gy_gytype_coid = this.data.acid_aid_gy_gytype_coid
    }
    
    /**
     * shop_list 商店内商品信息集合 {shopID:shopGoodsInfo}
    shopGoodsInfo = {
                packageid:,//
                logisticsid://物流选项ID
                couponsid:,//优惠券ID
                rx_image:"",
                rx_content:"",
                no_rx_reason:""
            }
     */
    try {
      if(wx.getStorageSync('_expiredinfo_')){
        let nowTime = new Date().getTime(),_localdata = wx.getStorageSync('_expiredinfo_')
        log.info('第三方信息'+JSON.stringify(_localdata))
        if(nowTime - _localdata.expired>24*60*60*1000){
          log.info('第三方信息过期'+_localdata.uid+'===第一次登录时间：'+ _localdata.expired)
          wx.removeStorageSync('_expiredinfo_');
        }else{
          params.from_unionid = _localdata.uid;
          if(_localdata.sub_siteid){
            params.sub_siteid = _localdata.sub_siteid
          }
          log.info('第三方信息下单'+_localdata.uid+'===第一次登录时间：'+ _localdata.expired)
        }
      }
    } catch (error) {
      log.info('跳转进入我们的小程序信息:'+JSON.stringify(error))
    }

    console.log(params)
    orderPaymentApi.submitOrder(params).then((result)=>{
      console.log(result)
      wx.hideLoading()
      if(result){
        let info = { orderIds: result, addressInfo: this.data.defaultAddress }
        wx.redirectTo({
          url: '/pages/YFWShopCarModule/YFWOrderSubmitSuccessPage/YFWOrderSubmitSuccess?params='+JSON.stringify(info),
        })
        // pushNavigation('get_ordersubmit', { orderIds: result,addressInfo:this.data.defaultAddress})
      } else {
      }
    },(error)=>{
      wx.hideLoading()
      wx.showModal({
        content: error.msg || '',
        showCancel:false,
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    let info = options.params
    if (info&&typeof(info) == 'string') {
      info = JSON.parse(options.params)
      this.data.isBuy = info.isBuy;
      this.data.acid_aid_gy_gytype_coid = info.acid_aid_gy_gytype_coid || "";
      let goodsInfoArray = info.Data
      let goodsIds = []
      let packageIds = []
      goodsInfoArray.map((goodsInfo) => {
        if (goodsInfo.type == 'medicine') {
          goodsIds.push(goodsInfo.id)
        } else {
          packageIds.push(goodsInfo.package_id)
        }
      })
      this.data.goodsIds = goodsIds
      this.data.packageIds = packageIds
    }

  },

  requestDataFromServer() {
    let goodsIds = this.data.goodsIds.length > 0 ? this.data.goodsIds.join(',') : ''
    let packgeIds = this.data.packageIds.length > 0 ? this.data.packageIds.join(',') : ''
    orderPaymentApi.getBuyInfo(this.data.defaultAddress.id, goodsIds, packgeIds).then((result) => {
      app.globalData.work_trade_items = result.work_trade_items || {}
      console.log('购买药物信息',result)
      result.invoiceMap =  this.data.invoiceMap
      let orderInfoModel = YFWOrderSettlementModel.getModelValue(result)
      console.log(orderInfoModel)
      this.data.orderInfo = orderInfoModel
      this.reloadOrderPrice()
      //立即购买进入相关数据处理
      if (this.data.isBuy){
        //立即购买进入只会有一个shop_items取第一个
        orderInfoModel.shop_items[0].cart_items.forEach((item, index)=>{
          if(isEmpty(item.id) && isEmpty(item.count)){
            // this.data.packageItemNumMap.set(item.package_id,item.count)
          } else {
            this.singleItemNumMap.set(item.id,item.quantity)
          }
            
        })
      }
      this.data.needenrollment_prompt = result.needenrollment_prompt
      this.setData({
        defaultAddress: this.data.defaultAddress,
        isBuy:this.data.isBuy,
        // orderInfo: orderInfoModel,
        //selectAddress:null,
        platforms: orderInfoModel.platform_coupons_items,
        invoiceMap: orderInfoModel.invoiceMap,
        all_total:orderInfoModel.all_total,
        is_needenrollment:result.is_needenrollment,
      })

      app.globalData.inquiryInfo.drug_items = orderInfoModel.drug_items
      app.globalData.inquiryInfo.isEditPatient = false

    },error=>{
      if (error&&error.msg) {
        wx.showModal({
          title: '',
          content: error.msg,
          showCancel:false,
          success (res) {
            wx.navigateBack({})
          }
        })
      }
    })
  },
  //优惠券凑单回调
  _collectBillsCallback(info) {
    //相同商品数量加一
    let newCartid = parseInt(info.package_id?info.package_id:info.id)
    if(this.singleItemNumMap.has(newCartid)){
        let numPlus = this.singleItemNumMap.get(newCartid) + 1
        shopCarApi.changeCarGoodsQuantity(newCartid,numPlus).then((response)=>{
          this.requestDataFromServer()
        },(error)=>{})
    } else {
      this.data.goodsIds.push(newCartid)
      this.requestDataFromServer()
      app.globalData.inquiryInfo.isSave = false
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // 包装方式
    this.onpackway = this.selectComponent('#onpackway');
    // 配送方式
    this.onpatchway = this.selectComponent('#onpatchway');
    //发票类型
    this.oninvoway = this.selectComponent('#oninvoway');
    //平台优惠
    this.onplatform = this.selectComponent('#onplatform');
    // 优惠券
    this.ondiscount = this.selectComponent('#ondiscount')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(options) {
    var that = this;
    if (this.data.selectAddress){
      let addrssModelArray = YFWAddressModel.getModelArray([this.data.selectAddress])
      this.setData({
        defaultAddress: addrssModelArray[0]
      })
      this.data.defaultAddress = addrssModelArray[0]
      this.requestDataFromServer()
    }
    this.setData({ isCompleteInquiry: app.globalData.inquiryInfo.isSave,isCompleteYqfk: app.globalData.yqfkInfo.isSave})
    orderPaymentApi.getAddress().then((result) => {
      let addressArray = YFWAddressModel.getModelArray(result)
      console.log(addressArray)
      if (addressArray.length == 0) {
        this.donotHaveAddress = true
        wx.showModal({
          title: '您还没有设置收货地址，请点击这里设置！',
          content: '',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
              pushNavigation('get_address')
            } else if (res.cancel) {
              console.log('用户点击取消')
              wx.navigateBack()
            }
          },
          fail(){
            wx.navigateBack({})
          }
        })
        return;

      } else {
        this.donotHaveAddress = false
        if(!this.data.selectAddress){
          let defaultAddress = {}
          addressArray.forEach((item, index, array) => {
            if (item.is_default == '1') {
              defaultAddress = item;
            }
          });
          if (isEmpty(defaultAddress)) {
            defaultAddress = addressArray[0];
          }
          that.data.defaultAddress = addressArray[0]
        }
        that.requestDataFromServer()
      }
    }).then((error) => {

    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    app.globalData.inquiryInfo.isSave = false
    app.globalData.yqfkInfo.isSave = false
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
})