// pages/YFWGoodsDetailModule/YFWGoodsDetailPage/YFWGoodsDetail.js
import {
  GoodsDetailApi,
  ShopDetailApi,
  ShopCarApi,
  UserCenterApi
} from '../../../apis/index.js'
const goodsDetailApi = new GoodsDetailApi()
const storeDetailApi = new ShopDetailApi()
const shopCarApi = new ShopCarApi()
const userCenterApi = new UserCenterApi()
var app = getApp()
var log = require('../../../utils/log.js')
import {
  pushNavigation
} from '../../../apis/YFWRouting.js'

import {
  isNotEmpty,
  safeObj,
  safe,
  convertImg,
  tcpImage,
  toDecimal,
  getAppSystemConfig,
  coverAuthorizedTitle,
  isLogin
} from '../../../utils/YFWPublicFunction.js'
import * as configinfo from '../../../config' 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    firstShowFlag:true,
    ljgmFlag:false,
    serviceInfo:{
      nickName:'',
      avatarUrl:"",
      params:{

      },
      transfer_action:{
        actionType:'to_group', //执行动作类型： to_group：指定技能组； to_service：指定客服。
        deciId:"20337e4187664f3b91afcaed738f8f61",  //指定技能组或客服id
        optionId:4, //溢出标记： 指定客服时： 1：溢出； 2：不溢出。 指定技能组时： 3：溢出； 4：不溢出
        spillId:4, //溢出条件： 指定客服时： 1：客服不在线； 2：客服忙碌, 3：智能判断。 指定客服组时： 4：技能组无客服在线； 5：技能组所有客服忙碌； 6：技能组不上班； 7：智能判断。
      },
      platform_action:{
        customerCode:"",  //商户在平台里面的唯一id
        flowGroupId:"20337e4187664f3b91afcaed738f8f61",   //指定主账号下的技能组id
      },
      partnerid:"", //对接id
      robotid:1 // 机器人id
    },
    verFlag:0,
    clickCollectFlag:false,
    paramFlag:false,//参数展开收起的标志
    activityItem: {},
    activityHieght: '',
    hasSpecification: false,//是否有说明书,
    specificationOrder: [
      '贮藏',
      '功能与主治',
      '禁忌症',
      '性状',
      '用法用量',
      '药品名称',
      '执行标准',
    ],
    isRemove: false, // 商品下架，从比价页返回时需要再返回一次
    isLoading: false, // 是否正在请求
    isIphoneX: app.globalData.isiPhoneX,
    isShowWhite: true, // 空白占位view
    opacityAnimation: {},
    translateAnimation: {},
    wx_rx_is_buy:1,//是否限制处方药购买
    dataSource: {
      ratio: 1, // 比率
      topIndex: 0, // 顶部选择框所有
      isLogin: false, // 判断是否登录
      isShowTopItem: false, // 是否显示商品、评价、详情点击按钮
      isShowReturnModal: false, //查看退货款规则弹框
      isShowCommboModal: false, // 选择单品、套装弹窗
      isShowStoreModal: false, // 商家资质、实景弹窗
      isCollection: false, // 是否收藏
      is_seckill: false, // 秒杀商品
      activity_prompt_info: '', //活动提示
      prohibit_sales_btn_text: '暂不预约', //暂不预约、售罄
      store_medicine_id: 0, // 药品商店id
      shop_cart_count: 0, // 购物车数量
      question_scroll_top: 0, // 滑动到评价区域的值
      baseinfo_scroll_top: 0, // 滑动到基本信息区域的值
      top_height: 0, // 顶部区域的高度
      isSuspensionBaseInfo: false, // 基本信息、说明书、服务保障是否悬浮
      medicine_image_index: '', // 顶部图片滑动时当前滑块索引
      medicine_status: 0, // 底部按钮状态 0空白view 1可销售 2暂不预约
      medicine_images: [], // 商品图片数组
      medicine_services: [], // 24小时发货、品质保障、提供发票
      medicine_info: {
        medicine_id: 0,
        activity_img_url: '', // 活动图片
        price: '', // 价格
        discount: '', // 返现折扣价
        real_price: '', // 真实价格
        medicine_type: '-1', // 类型 OTC、单轨、双轨
        medicine_type_status: false,
        medicine_typedesc: '', // 药品类型解释
        medicine_typeurl: '', // 单双轨说明页链接
        medicine_icon: '', // 药品类型图片
        medicine_name: '', // 药品名称
        medicine_indications: '', // 功能主治
        medicine_authorizetion: '', // 批准文号
        medicine_authorizetionTitle: '', //批准文号、注册证号
        medicine_standard: '', // 规格
        medicine_dosage_form: '', // 剂型/型号
        medicine_manufacturer: '', // 生产厂家
        medicine_bentrusted_name: '', // 上市许可人
        medicine_notice: '', // 风险提示 
        medicine_vacation: '', // 节假日提示字段
        medicine_waring: '', // 警示语
        medicine_promptinfo: '', // 禁止销售提示
        medicine_namecn: '', // 通用名
        medicine_nameen: '', // 英文名
        medicine_py_namecn: '', // 拼音名称
        medicine_period: '', // 有效期
        medicine_period_to: '', // 有效期至
        medicine_aliascn: '', // 品牌
        medicine_guide: {}, // 说明书
      },
      medicine_logistics: {
        logisyics_amount: '', // 运费
        start_city: '', // 发货地址
        end_city: '', // 收货地址
      },
      medicine_inventory: {
        inventory: 0, // 库存
        limitation: 0, // 限购
      },
      medicine_coupons: [], // 优惠券列表, 
      medicine_discount: [], // 促销
      medicine_show_discount: [], // 促销显示
      medicine_style: {
        medicine_single: [], // 单品规格
        medicine_combo: [], // 套餐
        medicine_treatment: [], // 多件装
        medicine_packages: [] // 套装
      },
      medicine_selectInfo: {
        type: 0, // 选择的类型 0单品 1套餐 2多件装
        desc: 'single',
        name: '选择单品', // 选择的名称
        modalName: '',
        selectIndex: 0, // 套装选择的索引
        selectModel: {}, // 套装信息
        quantity: 1, // 选择的数量
        isBuy: false // 立即购买、加入需求单
      }, // 药品的单品、套餐、多件装信息
      medicine_store: {
        store_logo: '', // 药店logo
        store_name: '', // 药店名称
        store_score: 5.0, // 药店评分
        store_score_images: [
          "/images/YFWGoodsDetailModule/goods_deail_star.png",
          "/images/YFWGoodsDetailModule/goods_deail_star.png",
          "/images/YFWGoodsDetailModule/goods_deail_star.png",
          "/images/YFWGoodsDetailModule/goods_deail_star.png",
          "/images/YFWGoodsDetailModule/goods_deail_star.png"
        ], // 药店评分
        store_id: 0, // 药店id
        store_recommend_medicine: [], // 商店推荐商品
        store_images: [], // 商家实景
        store_aptitude: [], // 商家资质
        store_contracted: true, // 商家是否认证
        store_modal: {
          type: 1, // 1.商家资质 2.店铺实景
          image_list: [], // 图片数组
          name: "暂无资质图片", // 暂无资质图片 暂无实景图片
          isShowLeft: false, // 显示左箭头
          isShowRight: false, // 显示右箭头
          index: 0, // 当前滑动页数
        }
      },
      medicine_question: 0, // 常见问题
      medicine_comment: {
        count: '0', // 评论数量
        comment_list: [] // 列表
      },
      medicine_detail_index: 0, // 默认基本信息
      medicine_explain_show: 0, // 是否显示说明书
      medicine_detail: [{
          title: '基本信息',
          notice: '',
          medicine_image_list: [],
          isShow: 1,
          items: [{
              title: '通用名',
              subtitle: ''
            },
            {
              title: '商品品牌',
              subtitle: ''
            },
            {
              title: '批准文号',
              subtitle: ''
            },
            {
              title: '包装规格',
              subtitle: ''
            },
            {
              title: '剂型/型号',
              subtitle: ''
            },
            {
              title: '英文名称',
              subtitle: ''
            },
            {
              title: '汉语拼音',
              subtitle: ''
            },
            {
              title: '有效期',
              subtitle: ''
            },
            {
              title: '生产企业',
              subtitle: ''
            },
          ]
        },
        {
          title: '说明书',
          notice: '友情提示：商品说明书均由药房网商城工作人员手工录入，可能会与实际有所误差，仅供参考，具体请以实际商品为准',
          items: [],
          isShow: 0,
        },
        {
          title: '服务保障',
          notice: '',
          isShow: 1,
          promise: {
            title: '药房网商城承诺',
            qualification: {
              icon: '',
              type: '',
              link: ''
            },
            items: [{
                icon: '/images/YFWGoodsDetailModule/goods_deail_qualification.png',
                title: '品质保障',
                content: '药房网商城在售商品均由正规实体签约商家供货，商家提供品质保证。在购物过程中发现任何商家有违规行为，请直接向我们投诉举报！'
              },
              {
                icon: '/images/YFWGoodsDetailModule/goods_deail_invoice.png',
                title: '提供发票',
                content: '药房网商城所有在售商家均可提供商家发票'
              }
            ]
          },
          store_qualification: {
            title: '商家资质',
            items: []
          },
          store_images: {
            title: '商家实景',
            items: []
          },
          returned_standard: {
            title: '退换货标准',
            return_policy: {
              title: '退换货政策',
              content: '由商品售出之日（以实际收货时间为准）起七日内符合退换货条件的商品享受退换货政策。'
            },
            return_condition: {
              title: '退换货条件',
              items: [
                '因物流配送导致外包装污损、破损的商品，请直接拒绝签收处理。',
                '经质量管理部门检验，确属产品本身存在质量问题。',
                '国家权威管理部门发布公告的产品（如停售、召回等）。',
                '因商家失误造成发货错误，如商品的名称、规格、数量、产品批次等信息与所订商品不符。'
              ]
            },
            return_explain: {
              title: '特殊说明',
              content: '因药品是特殊商品，依据中华人民共和国《药品经营质量管理规范》及其实施细则（GSP）、《互联网药品交易服务审批暂行规定》等法律、法规的相关规定：药品一经售出，无质量问题，不退不换。'
            },
            return_process: {
              title: '退换货流程',
              items: [
                '联系商家客服或自行确认符合退换货政策。',
                '在线提交退换货申请及相关证明。',
                '退换货申请通过后寄回商品。',
                '确认商家为您重寄的商品或退款。'
              ]
            }
          }
        }
      ]
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params = "";
    try {
      options.params = options.params&& decodeURIComponent(options.params)
      params = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {
        value: 16650415
      }
    } catch (error) {
      log.info('商品详情页接收到的参数'+options.params+'catchinfo===='+error)
    }
    this.data.dataSource.store_medicine_id = params.value
    this.dealParams(params)

    this.getGoodsDetail();
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        let screenWidth = res.windowWidth
        let ratio = 750 / screenWidth
        that.data.dataSource.ratio = ratio
      },
    })
    let query = wx.createSelectorQuery()
    query.select('#topTabView').boundingClientRect()
    query.exec(function (res) {
      that.data.dataSource.top_height = res[0] && res[0].height || 60
    })
  },
  /*活动跳转*/
  activityRedirect: function () {
    pushNavigation('receive_h5',{value:this.data.activityItem.url})
  },
  /**
   * 解析上个页面传递参数
   */
  dealParams: function (params) {
    if (params.type == "sellers") {
      let medicine = params.data

      wx.setNavigationBarTitle({
        title: medicine.namecn
      })

      // 图片
      let medicine_images = []
      for (let index = 0; index < medicine.image_list.length; index++) {
        let imgae_url = medicine.image_list[index]
        imgae_url = convertImg(imgae_url)
        medicine_images.push(imgae_url);
      }

      // 服务
      let service = ["品质保障", "提供发票", "退货款规则"]
      if (medicine.scheduled_name) {
        service.unshift(medicine.scheduled_name)
      }

      // 功能主治
      let medicine_indications = medicine.applicability
      if (medicine_indications.indexOf('<p>') != -1) {
        medicine_indications = medicine_indications.replace('<p>', '')
        medicine_indications = medicine_indications.replace('</p>', '')
      }

      // 药品类型icon
      let medicien_icon = ''
      let medicien_typedesc = ''
      let medicien_type_status = false
      if (medicine.dict_medicine_type == 0) {
        // OTC
        medicien_type_status = true
        medicien_icon = '/images/ic_drug_OTC.png'
      } else if (medicine.dict_medicine_type == 1 || medicine.dict_medicine_type == 3) {
        // 单轨
        medicien_type_status = true
        medicien_icon = '/images/ic_drug_track_label.png'
        medicien_typedesc = "处方药指凭医师处方购买和使用的药品"
      } else if (medicine.dict_medicine_type == 2) {
        // 双轨
        medicien_type_status = true
        medicien_icon = '/images/ic_drug_track_label.png'
        medicien_typedesc = "处方药指凭医师处方或在药师指导下购买和使用的药品"
      }

      // 基本信息
      let baseInfo = this.data.dataSource.medicine_detail[0]
      baseInfo.medicine_image_list = medicine_images

      let subtitles = [medicine.namecn, medicine.aliascn, medicine.authorized_code, medicine.standard, medicine.troche_type, medicine.nameen, medicine.py_namecn, medicine.period, medicine.manufacturer]
      for (let index = 0; index < subtitles.length; index++) {
        let model = baseInfo.items[index]
        let subtitle = subtitles[index]
        if (model.title == '批准文号') {
          model.title = medicine.authorizedCode_title
        }
        model.subtitle = subtitle
      }
      this.setData({
        'dataSource.medicine_images': medicine_images,
        'dataSource.medicine_image_index': '1/7',
        'dataSource.medicine_services': service,
        'dataSource.medicine_info.medicine_id': medicine.id,
        'dataSource.medicine_info.price': toDecimal(medicine.price),
        'dataSource.medicine_info.discount': safe(medicine.discount),
        'dataSource.medicine_info.medicine_type': medicine.dict_medicine_type,
        'dataSource.medicine_info.medicine_type_status': medicien_type_status,
        'dataSource.medicine_info.medicine_typedesc': medicien_typedesc,
        'dataSource.medicine_info.medicine_icon': medicien_icon,
        'dataSource.medicine_info.medicine_name': safe(medicine.aliascn) + ' ' + safe(medicine.namecn),
        'dataSource.medicine_info.medicine_indications': safe(medicine_indications),
        'dataSource.medicine_info.medicine_authorizetion': safe(medicine.authorized_code),
        'dataSource.medicine_info.medicine_authorizetionTitle': safe(medicine.authorizedCode_title),
        'dataSource.medicine_info.medicine_standard': safe(medicine.standard),
        'dataSource.medicine_info.medicine_dosage_form': safe(medicine.troche_type),
        'dataSource.medicine_info.medicine_manufacturer': safe(medicine.title),
        'dataSource.medicine_info.medicine_namecn': safe(medicine.namecn),
        'dataSource.medicine_info.medicine_nameen': safe(medicine.nameen),
        'dataSource.medicine_info.medicine_py_namecn': safe(medicine.py_namecn),
        'dataSource.medicine_info.medicine_period': safe(medicine.period),
        'dataSource.medicine_info.medicine_period_to': safe(medicine.period_to),
        'dataSource.medicine_info.medicine_aliascn': safe(medicine.aliascn),
        'dataSource.medicine_info.medicine_promptinfo': safe(medicine.buy_prompt_info),
        'dataSource.medicine_info.bentrusted_name': safe(medicine.bentrusted_store_name),
        'dataSource.medicine_info.medicine_typeurl': safe(medicine.rx_giude_url),
        'dataSource.medicine_logistics.logisyics_amount': safe(medicine.shipping_price),
        'dataSource.medicine_logistics.start_city': safe(medicine.region),
        'dataSource.medicine_inventory.inventory': safe(medicine.reserve),
        'dataSource.medicine_store.store_name': safe(medicine.title),
        'dataSource.medicine_store.store_id': safe(medicine.shop_id),
        'dataSource.medicine_detail[0]': baseInfo,
        isShowWhite: false,
      })
    }
  },

  /**
   * 获取商品详情
   */
  getGoodsDetail: function () {
    this.setData({
      isLoading: true
    })
    /** 获取商品详情数据 20657803 16649936 6590821 16650415*/
    goodsDetailApi.getGoodsDetailInfo(this.data.dataSource.store_medicine_id).then(response => {
      if (isNotEmpty(response)) {
        if (isNotEmpty(response.note)) {
          this.setData({
            activityItem: response.note
          })
        }
        if (response.medicineid) {
          // 商品不存在、返回一个比价页的id
          this.data.isRemove = true
          wx.showModal({
            content: "商品已下架!",
            cancelColor: "#1fdb9b",
            cancelText: "返回",
            confirmColor: "#1fdb9b",
            confirmText: "去比价页",
            success(res) {
              if (res.confirm) {
                // 前往比价页
                pushNavigation('get_goods_detail', {
                  value: response.medicineid
                }, 'redirect')
              } else if (res.cancel) {
                wx.navigateBack()
              }
            }
          })
        } else {
          console.log(response)
          wx.setNavigationBarTitle({
            title: response.medicine_info.namecn
          })
          let _ver = configinfo.config.app_version;
          getAppSystemConfig().then((info)=>{
            this.setData({
              wx_rx_is_buy:parseInt(info.wx_rx_is_buy) != 0,
              verFlag:_ver == info.miniapp_audit_version ? 1 :2
            })
            wx.nextTick(() => {
              let _this = this
              wx.createSelectorQuery().select('#bottomOperate').boundingClientRect(function (rect) {
                _this.setData({
                  activityHieght: rect ? rect.height : 0
                })
              }).exec()
            })
          },(error)=>{
          })
          
          this.goodsImagesWith(response);
          this.goodsDetailInfoWith(response);
          this.goodsCouponAndDiscountWith(response)
          this.goodsComboModelWith(response);

          this.dealGoodsBaseiInfo(response);
          this.dealGoodsExplainInfo();

          this.handleSetHasSpecification(response)

          this.getShopCartNumber()
          this.getStoreDetail(response);
          this.getStoreRecommendMedicne(response);
          this.getStoreQualification(response);
          this.gteVacation();
        }
      } else {
        wx.showModal({
          content: "商品不存在!",
          showCancel: false,
          confirmColor: "#1fdb9b",
          success(res) {
            if (res.confirm) {
              wx.navigateBack()
            }
          }
        })
      }

      this.setData({
        isLoading: false,
        isShowWhite: false
      })
    }, error => {
      this.setData({
        isLoading: false
      })
    });
  },

  /**
   * 获取药店详情数据
   */
  getStoreDetail: function (res) {
    let storeId = res.storeid;

    this.setData({
      isLoading: true
    })
    storeDetailApi.getShopInfo(storeId).then(response => {

      if (isNotEmpty(response)) {
        let score = response.total_star.toFixed(1)
        let stars = this.data.dataSource.medicine_store.store_score_images
        let scores = score.toString().split(".")
        let a = parseInt(scores[0]) + (parseInt(scores[1]) == 0 ? 0 : 1)
        this.setData({
          'dataSource.medicine_store.store_name': response.title,
          'dataSource.medicine_store.store_id': response.shop_id,
          'dataSource.medicine_store.store_logo': response.logo_image,
          'dataSource.medicine_store.store_score': score,
          'dataSource.medicine_store.store_score_images': stars.slice(0, a),
          'dataSource.medicine_store.store_contracted': response.dict_store_status == 4 ? true : false,
          'dataSource.medicine_comment.count': response.evaluation_count,
        })
        let currentTime = this.currentDate()
        let recentDataInfo = {
          shop_goods_id: this.data.dataSource.store_medicine_id,
          time_stamp: currentTime,
          shop_name: response.title,
          medicine_price: toDecimal(res.price),
          img_url: res.medicine_info.image_list[0],
          authCode: res.medicine_info.authorized_code,
          standard: res.medicine_info.standard,
          name_cn: res.medicine_info.namecn
        }
        try {
          // wx.removeStorageSync('recentBrowse')
          let value = wx.getStorageSync('recentBrowse')
          if (value) {
            if (value && typeof (value) == 'object') {
              let currentData = value[currentTime]
              if (typeof (currentData) == 'object') {
                currentData[this.data.dataSource.store_medicine_id] = recentDataInfo
              } else {
                value[currentTime] = {
                  [this.data.dataSource.store_medicine_id]: recentDataInfo
                }
              }
              wx.setStorageSync('recentBrowse', value)
            } else {
              wx.setStorageSync('recentBrowse', {
                [currentTime]: {
                  [this.data.dataSource.store_medicine_id]: recentDataInfo
                }
              })
            }
          } else {
            wx.setStorageSync('recentBrowse', {
              [currentTime]: {
                [this.data.dataSource.store_medicine_id]: recentDataInfo
              }
            })
          }
        } catch (e) {
          // Do something when catch error
        }
      }
      this.setData({
        isLoading: false
      })
    }, error => {
      this.setData({
        isLoading: false
      })
    });
  },

  currentDate() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let myDate = date.getDate();
    let timestamp = year + '年' + month + '月' + myDate + '日';
    return timestamp;
  },
  /**
   * 获取购物车数量
   */
  getShopCartNumber: function () {
    shopCarApi.getShopCarCount().then(response => {
      let count = response.cartCount ? response.cartCount : 0;
      wx.setStorageSync({
        key:"shopCarCount",
        data:count
      })
      this.setData({
        'dataSource.shop_cart_count': count
      })
    }, error => {
      this.setData({
        isLoading: false
      })
    });
  },

  /**
   * 获取商家推荐商品
   */
  getStoreRecommendMedicne: function (res) {
    let storeId = res.storeid;
    this.setData({
      isLoading: true
    })
    storeDetailApi.getShopRecommendGoods(storeId).then(response => {

      if (isNotEmpty(response)) {
        let recommend = []
        for (let index = 0; index < response.length; index++) {
          let medicine = response[index];
          medicine.intro_image = tcpImage(medicine.intro_image)
          medicine.price = toDecimal(medicine.price)
          recommend.push(medicine)
        }

        this.setData({
          'dataSource.medicine_store.store_recommend_medicine': recommend,
        })
      }
      this.setData({
        isLoading: false
      })
    }, error => {
      this.setData({
        isLoading: false
      })
    });
  },

  /**
   * 获取节假日信息
   */
  gteVacation: function () {
    goodsDetailApi.getVacationInfo().then(response => {
      this.setData({
        'dataSource.medicine_info.medicine_vacation': safe(response),
      })
    }, error => {
      this.setData({
        isLoading: false
      })
    })
  },

  /**
   * 获取商家资质、实景图片、平台资质图片
   */
  getStoreQualification: function (res) {
    let storeId = res.storeid;
    let storeParams = {
      name: "storeQualification",
      shopID: storeId
    }
    let paltParams = {
      name: "paltformQualification"
    }
    this.setData({
      isLoading: true
    })
    goodsDetailApi.getShopAndPlatformQualification(storeParams, paltParams).then(response => {

      if (isNotEmpty(response)) {
        // 平台资质
        let paltformQualification = response.paltformQualification
        let qualification = this.data.dataSource.medicine_detail[2].promise.qualification
        qualification.icon = paltformQualification.imageurl
        qualification.link = paltformQualification.link
        qualification.type = paltformQualification.type

        // 商家资质、实景
        let storeQualification = response.storeQualification
        let zz_items = isNotEmpty(storeQualification.zz_items) ? storeQualification.zz_items : []
        let sj_items = isNotEmpty(storeQualification.sj_items) ? storeQualification.sj_items : []

        this.setData({
          'dataSource.medicine_detail[2].promise.qualification': qualification,
          'dataSource.medicine_detail[2].store_qualification.items': zz_items,
          'dataSource.medicine_detail[2].store_images.items': sj_items,
          'dataSource.medicine_store.store_images': sj_items,
          'dataSource.medicine_store.store_aptitude': zz_items,
          'dataSource.medicine_store.store_modal.image_list': zz_items,
          'dataSource.medicine_store.store_modal.isShowRight': zz_items.length > 1
        })
      }
      this.setData({
        isLoading: false
      })
    }, error => {
      this.setData({
        isLoading: false
      })
    });
  },

  /**
   * 商品图片处理
   */
  goodsImagesWith: function (response) {

    // 药品信息
    let medicine = response.medicine_info

    // 商品图片处理
    let medicine_images = []
    for (let index = 0; index < medicine.image_list.length; index++) {
      let imgae_url = medicine.image_list[index]
      imgae_url = convertImg(imgae_url)
      medicine_images.push(imgae_url);
    }

    // 24小时发货、品质保障、提供发票
    let service = ["品质保障", "提供发票", "退货款规则"]
    if (response.scheduled_days) {
      service.unshift(response.scheduled_days)
    }

    // 底部按钮状态
    let status = 0
    if (response.button_show == true) {
      status = 1
    } else if (response.button_show == false) {
      status = 2
    }

    this.setData({
      'dataSource.isCollection': isNotEmpty(response.is_favorite) ? response.is_favorite : false,
      'dataSource.is_seckill': response.is_seckill_mediicne == '1',
      'dataSource.activity_prompt_info': response.activity_prompt_info,
      'dataSource.prohibit_sales_btn_text': response.prohibit_sales_btn_text || '暂不预约',
      'dataSource.medicine_images': medicine_images,
      'dataSource.medicine_image_index': 1 + "/" + medicine_images.length,
      'dataSource.medicine_services': service,
      'dataSource.medicine_status': status
    })
  },

  /**
   * 药品信息处理
   */
  goodsDetailInfoWith: function (response) {
    // 药品信息
    let medicine = response.medicine_info
    // 功能主治
    let medicine_indications = medicine.applicability.replace(/<[^>]+>/g, "").replace(/(↵|\r|\n)/g, "").trim()

    // 药品类型icon
    let medicien_icon = ''
    let medicien_typedesc = ''
    let medicien_type_status = false
    if (medicine.dict_medicine_type == 0) {
      // OTC
      medicien_type_status = true
      medicien_icon = '/images/ic_drug_OTC.png'
    } else if (medicine.dict_medicine_type == 1 || medicine.dict_medicine_type == 3) {
      // 单轨
      medicien_type_status = true
      medicien_icon = '/images/ic_drug_track_label.png'
      medicien_typedesc = "处方药指凭医师处方购买和使用的药品"
    } else if (medicine.dict_medicine_type == 2) {
      // 双轨
      medicien_type_status = true
      medicien_icon = '/images/ic_drug_track_label.png'
      medicien_typedesc = "处方药指凭医师处方或在药师指导下购买和使用的药品"
    }
    let period_to = ''
    if (safe(response.period_to).includes('有效期')) {
      period_to = response.period_to
    } else if (isNotEmpty(response.period_to)) {
      period_to = '有效期至：' + response.period_to
    }
    this.setData({
      'dataSource.medicine_info.medicine_id': medicine.id,
      'dataSource.medicine_info.activity_img_url': safe(medicine.activity_img_url),
      'dataSource.medicine_info.price': toDecimal(response.price),
      'dataSource.medicine_info.real_price': toDecimal(response.real_price),
      'dataSource.medicine_info.discount': safe(response.price_desc),
      'dataSource.medicine_info.medicine_type': medicine.dict_medicine_type,
      'dataSource.medicine_info.medicine_type_status': medicien_type_status,
      'dataSource.medicine_info.medicine_typedesc': medicien_typedesc,
      'dataSource.medicine_info.medicine_icon': medicien_icon,
      'dataSource.medicine_info.medicine_name': safe(medicine.aliascn) + ' ' + safe(medicine.namecn),
      'dataSource.medicine_info.medicine_indications': safe(medicine_indications),
      'dataSource.medicine_info.medicine_authorizetion': safe(medicine.authorized_code),
      'dataSource.medicine_info.medicine_authorizetionTitle': coverAuthorizedTitle(medicine.authorized_code),
      'dataSource.medicine_info.medicine_standard': safe(medicine.standard),
      'dataSource.medicine_info.medicine_dosage_form': safe(medicine.troche_type),
      'dataSource.medicine_info.medicine_manufacturer': safe(medicine.title),
      'dataSource.medicine_info.medicine_namecn': safe(medicine.namecn),
      'dataSource.medicine_info.medicine_nameen': safe(medicine.nameen),
      'dataSource.medicine_info.medicine_py_namecn': safe(medicine.py_namecn),
      'dataSource.medicine_info.medicine_period': safe(medicine.period),
      'dataSource.medicine_info.medicine_period_to': period_to,
      'dataSource.medicine_info.medicine_aliascn': safe(medicine.aliascn),
      'dataSource.medicine_info.medicine_notice': safe(medicine.medication_prompt),
      'dataSource.medicine_info.medicine_waring': safe(medicine.warning_tip),
      'dataSource.medicine_info.medicine_promptinfo': safe(response.buy_prompt_info),
      'dataSource.medicine_info.bentrusted_name': safe(medicine.bentrusted_store_name),
      'dataSource.medicine_info.medicine_guide': safeObj(medicine.guide),
      'dataSource.medicine_info.medicine_typeurl': safe(medicine.rx_giude_url),
      'dataSource.medicine_selectInfo.modalName': "已选：" + safe(medicine.standard),
      'dataSource.medicine_selectInfo.price': toDecimal(response.price),
    })
  },

  /**
   * 优惠券和促销活动信息处理
   */
  goodsCouponAndDiscountWith: function (response) {
    // 优惠券
    let coupons_list = this.couponModelWithArray(response.coupons_list)

    // 满减
    let discount_list = this.discountModelWithArray(response.activity_list);
    let discountStr = this.freepostageModelWithStr(discount_list);
    //包邮
    let freepostage_list = this.freepostageModelWithArray(response.freepostage_list);

    let freepostageStr = this.freepostageModelWithStr(freepostage_list);
    this.setData({
      'dataSource.medicine_coupons': coupons_list,
      'dataSource.medicine_discount': discount_list,
      'dataSource.medicine_discountStr': discountStr,
      'dataSource.medicine_freepostage_list': freepostage_list,
      'dataSource.medicine_freepostageStr': freepostageStr,
      'dataSource.medicine_show_discount': discount_list.slice(0, 3),
        /**
   * 运费和库存信息处理
   */
      'dataSource.medicine_logistics.logisyics_amount': response.shipping_price,
      'dataSource.medicine_logistics.start_city': response.store_address,
      'dataSource.medicine_logistics.end_city': app.globalData.city,
      'dataSource.medicine_inventory.inventory': response.reserve,
      'dataSource.medicine_inventory.limitation': response.max_buyqty,
    })
  },

  /**
   * 优惠券模型处理
   */
  couponModelWithArray: function (coupon_list) {
    let coupons = []

    if (isNotEmpty(coupon_list)) {
      for (let index = 0; index < coupon_list.length; index++) {
        let model = coupon_list[index]
        model.name = parseFloat(model.use_condition_price) > 0 ? "满" + model.use_condition_price + "减" + model.price + "元" : model.price + "元",
          coupons.push(model)
      }

      return coupons;
    }
  },

  /**
   * 满减、包邮模型处理
   * activeArray 满减活动
   * postageArray 包邮活动
   */
  discountModelWithArray: function (activeArray) {
    let discount_list = []

    // 满减
    if (isNotEmpty(activeArray)) {
      for (let index = 0; index < activeArray.length; index++) {
        let activeModel = activeArray[index]
        let title = '满' + activeModel.condition_price + '元减' + activeModel.sub_price + '元'
        let name = '满' + activeModel.condition_price + '减' + activeModel.sub_price
        let discountModel = {
          type: 0,
          title: title,
          name: name,
          reduce_price: activeModel.reduce_price,
          condition_price: activeModel.condition_price,
          sub_price: activeModel.sub_price
        }
        discount_list.push(discountModel)
      }
    }

    return discount_list;
  },

  freepostageModelWithArray: function (freepostageArray) {
    let freepostag = []

    if (isNotEmpty(freepostageArray)) {
      for (let index = 0; index < freepostageArray.length; index++) {
        let activeModel = freepostageArray[index]
        let discountModel = {
          type: 1,
          title: activeModel.title + activeModel.not_region_name,
          name: '满' + activeModel.condition_price + '元包邮',
          not_region_name: activeModel.not_region_name,
        }
        freepostag.push(discountModel)
      }
    }
    return freepostag;
  },

  freepostageModelWithStr: function (freepostage) {
    let freepostageStr = '';
    let freepostage_list = [];
    if (isNotEmpty(freepostage)) {
      for (let index = 0; index < freepostage.length; index++) {
        let activeModel = freepostage[index]
        let discountModel = activeModel.title
        freepostage_list.push(discountModel)
      }
    }
    freepostageStr = freepostage_list.join('，')
    return freepostageStr;
  },
  /**
   * 单品、套餐、多件装信息处理
   */
  goodsComboModelWith: function (response) {

    // 单品
    if (isNotEmpty(response.other_standard_list)) {
      this.setData({
        'dataSource.medicine_style.medicine_single': response.other_standard_list,
      })
    }

    // 套装
    if (isNotEmpty(response.package_list)) {
      let combo_list = []
      let treatment_list = []

      for (let index = 0; index < response.package_list.length; index++) {
        let model = response.package_list[index]
        model.price = toDecimal(model.price)
        model.original_price = toDecimal(model.original_price)

        if (model.package_type == 0) {
          for (let idx = 0; idx < model.medicine_list.length; idx++) {
            let medicine = model.medicine_list[idx]
            medicine.image_url = tcpImage(medicine.image_url)
            medicine.price = toDecimal(medicine.price)
          }

          combo_list.push(model)
        } else {
          treatment_list.push(model)
        }
      }

      let name = "选择单品"
      if (combo_list.length > 0 && treatment_list.length > 0) {
        name = "选择单品、套餐、多件装"
      } else if (combo_list.length > 0 && treatment_list.length == 0) {
        name = "选择单品、套餐"
      } else if (combo_list.length == 0 && treatment_list.length > 0) {
        name = "选择单品、多件装"
      }

      this.setData({
        'dataSource.medicine_style.medicine_packages': combo_list.concat(treatment_list),
        'dataSource.medicine_style.medicine_combo': combo_list,
        'dataSource.medicine_style.medicine_treatment': treatment_list,
        'dataSource.medicine_selectInfo.name': name,
                /**
   * 问题和评论信息处理
   */
        'dataSource.medicine_question': response.question_ask_count,
        'dataSource.medicine_comment.count': response.evaluation_count,
        'dataSource.medicine_comment.comment_list': safeObj(response.evaluation_list),
        
      })
    }
  },



  /**
   * 处理基本信息
   */
  dealGoodsBaseiInfo: function (response) {
    let baseInfo = this.data.dataSource.medicine_detail[0]
    let medicine = this.data.dataSource.medicine_info

    baseInfo.notice = safe(response.package_prompt_info)
    baseInfo.medicine_image_list = this.data.dataSource.medicine_images

    let subtitles = [medicine.medicine_namecn, medicine.medicine_aliascn, medicine.medicine_authorizetion, medicine.medicine_standard, medicine.medicine_dosage_form, medicine.medicine_nameen, medicine.medicine_py_namecn, medicine.medicine_period, medicine.medicine_manufacturer]
    for (let index = 0; index < subtitles.length; index++) {
      let model = baseInfo.items[index]
      let subtitle = subtitles[index]
      if (model.title == '批准文号') {
        model.title = medicine.medicine_authorizetionTitle
      }
      model.subtitle = subtitle
    }

    this.setData({
      'dataSource.medicine_detail[0]': baseInfo,
      'dataSource.medicine_explain_show': response.medicine_info.dict_bool_lock,
      'dataSource.limit_buy_prompt':response.limit_buy_prompt
    })
  },

  /**
   * 处理说明书信息
   */
  dealGoodsExplainInfo: function () {
    if (this.data.dataSource.medicine_explain_show == 1) {
      let explaineInfo = this.data.dataSource.medicine_detail[1]
      let guide = this.data.dataSource.medicine_info.medicine_guide

      let guideKeys = Object.keys(guide)
      let explaine_items = []
      for (let index = 0; index < guideKeys.length; index++) {
        let title = guideKeys[index]
        let model = {
          title: "【" + title + "】",
          subtitle: guide[title].replace(/<[^>]+>/g, "").replace(/(↵|\r)/g, "\n").trim()
        }
        explaine_items.push(model)
      }

      explaineInfo.isShow = 1
      explaineInfo.items = explaine_items

      this.setData({
        'dataSource.medicine_detail[1]': explaineInfo,
      })
    }
  },


  /**
   * 点击顶部item切换内容
   */
  topViewIndexChange: function (event) {
    let index = event.currentTarget.dataset.index

    if (index != this.data.dataSource.topIndex) {
      let that = this
      if (index == 0) {
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 300
        })
      } else if (index == 1) {
        wx.pageScrollTo({
          scrollTop: that.data.dataSource.question_scroll_top,
          duration: 300
        })
      } else if (index == 2) {
        wx.pageScrollTo({
          scrollTop: that.data.dataSource.baseinfo_scroll_top,
          duration: 300
        })
      }
    }
  },

  /**
   * 顶部图片滑动
   */
  medicineImageChangeIndex: function (event) {
    if (event.detail.source == "touch") {
      let index = event.detail.current + 1
      let total = this.data.dataSource.medicine_images.length
      this.setData({
        'dataSource.medicine_image_index': index + "/" + total,
      })
    }
  },

  /**
   * 查看全部问题
   */
  lookAllQuestion: function () {
    pushNavigation('goods_detail_qa')
  },

  /**
   * 优惠券弹窗
   */
  showCouponModal: function () {
    this.couponModal.showModal();
  },

  showGuideModal() {
    this.specificationModal.showModal()
  },

  /**
   * 查看退货款规则
   */
  showReturnPayModal: function (event) {
    let item = event.currentTarget.dataset.item
    if (item == '退货款规则') {
      if (!this.data.dataSource.isShowReturnModal) {
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
        translateAni.translateY(600).step()

        that.setData({
          'dataSource.isShowReturnModal': true,
          opacityAnimation: opacityAni.export(),
          translateAnimation: translateAni.export(),
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
    }
  },

  /**
   * 促销活动modal
   */
  showDiscountModal: function () {
    this.discountModal.showModal();
  },

  handleSetHasSpecification(response) {
    this.setData({
      hasSpecification: Object.keys(response.medicine_info.guide).length > 0
    })
  },

  /**
   * 选择单品、套餐、多件装modal
   */
  showCommboModal: function (event) {
    let isBuy = event.currentTarget.id == "buyNow"
    if (!this.data.dataSource.isShowCommboModal) {
      let that = this

      that.setData({
        'dataSource.medicine_selectInfo.isBuy': isBuy
      })

      let opacityAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      opacityAni.opacity(0).step()

      let translateAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      translateAni.translateY(600).step()

      that.setData({
        'dataSource.isShowCommboModal': true,
        opacityAnimation: opacityAni.export(),
        translateAnimation: translateAni.export(),
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
    this.data.firstShowFlag&&this.setData({
      firstShowFlag:false,
    })
  },

  hideReturnModal: function () {
    if (this.data.dataSource.isShowReturnModal) {
      let that = this
      let translateAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      translateAni.translateY(600).step()

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
          'dataSource.isShowReturnModal': false
        })
      }.bind(this), 300)
    }
  },

  hideCommboModal: function () {
    if (this.data.dataSource.isShowCommboModal) {
      let that = this
      let translateAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      translateAni.translateY(600).step()

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
          'dataSource.isShowCommboModal': false
        })
      }.bind(this), 300)
    }
  },

  /**
   * 选择单品、套餐、多件装
   */
  selectPackageStyle: function (event) {
    let type = event.currentTarget.id
    let selected = this.data.dataSource.medicine_selectInfo
    if (type == "single") {
      // 单品
      selected.name = "已选：" + this.data.dataSource.medicine_info.medicine_standard
      selected.modalName = "已选：" + this.data.dataSource.medicine_info.medicine_standard
      selected.selectIndex = 0;
      selected.selectModel = {}
      selected.type = 0
      selected.desc = 'single'
      selected.price = this.data.dataSource.medicine_info.price || "";
    } else if (type == "commbo") {
      // 套餐
      let model = event.currentTarget.dataset.item
      selected.name = "已选：" + model.name
      selected.modalName = "已选：" + model.name
      selected.selectIndex = event.currentTarget.dataset.index;
      selected.selectModel = model
      selected.type = 1
      selected.desc = 'commbo'
      selected.price = model.price || "";
    } else if (type == "treatment") {
      // 多件装
      let model = event.currentTarget.dataset.item
      selected.name = "已选：" + model.name
      selected.modalName = "已选：" + model.name
      selected.selectIndex = event.currentTarget.dataset.index;
      selected.selectModel = model
      selected.type = 2
      selected.desc = 'treatment'
      selected.price = model.price || "";
    }
    this.setData({
      'dataSource.medicine_selectInfo': selected
    })
  },

  /**
   * 修改购买数量
   */
  changeBuyQuantity: function (event) {
    let type = event.currentTarget.id
    let quantity = this.data.dataSource.medicine_selectInfo.quantity
    let medicine_inventory = this.data.dataSource.medicine_inventory
    // 最大购买量
    let max_buy = medicine_inventory.limitation > 0 ? medicine_inventory.limitation : medicine_inventory.inventory

    if (type == 'subQuantity') {
      quantity--;
    } else if (type == 'addQuantity') {
      quantity++;
    }

    if (quantity < 1 || quantity > max_buy) {
      wx.showToast({
        title: '超过限购上限',
        icon:'none'
      })
      return
    }

    this.setData({
      'dataSource.medicine_selectInfo.quantity': quantity
    })
  },

  /**
   * 修改购买数量
   */
  inputBuyQuantity: function (event) {
    let quantity = event.detail.value.length > 0 ? parseInt(event.detail.value) : 0
    let medicine_inventory = this.data.dataSource.medicine_inventory
    // 最大购买量
    let max_buy = medicine_inventory.limitation > 0 ? medicine_inventory.limitation : medicine_inventory.inventory

    if (quantity > max_buy) {
      quantity = max_buy
      return quantity.toString()
    }
  },

  /**
   * 购买数量输入框结束编辑
   */
  quantityEndEditting: function (event) {
    let quantity = event.detail.value.length > 0 ? parseInt(event.detail.value) : 0

    if (quantity == 0) {
      quantity = this.data.dataSource.medicine_selectInfo.quantity
    }

    this.setData({
      'dataSource.medicine_selectInfo.quantity': quantity
    })
  },

  /**
   * 显示商家资质、店铺实景弹窗
   */
  showStoreModal: function () {
    if (!this.data.dataSource.isShowStoreModal) {
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
      translateAni.translateY(500).step()

      that.setData({
        'dataSource.isShowStoreModal': true,
        opacityAnimation: opacityAni.export(),
        translateAnimation: translateAni.export(),
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

  /**
   * 隐藏商家资质、店铺实景弹窗
   */
  hideStoreModal: function () {
    if (this.data.dataSource.isShowStoreModal) {
      let that = this
      let translateAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      translateAni.translateY(500).step()

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
          'dataSource.isShowStoreModal': false
        })
      }.bind(this), 300)
    }
  },

  /**
   * 切换商家资质、店铺实景
   */
  showStoreQuanlityOrLive: function (event) {
    let type = event.currentTarget.id == "quanlity" ? 1 : 2
    let name = event.currentTarget.id == "quanlity" ? "暂无资质图片" : "暂无实景图片"
    let image_list = event.currentTarget.id == "quanlity" ? this.data.dataSource.medicine_store.store_aptitude : this.data.dataSource.medicine_store.store_images
    let store_modal = this.data.dataSource.medicine_store.store_modal
    store_modal.type = type;
    store_modal.name = name;
    store_modal.image_list = image_list
    store_modal.isShowLeft = false
    store_modal.isShowRight = image_list.length > 1
    store_modal.index = 0

    this.setData({
      'dataSource.medicine_store.store_modal': store_modal
    })
  },

  /**
   * 商家资质弹窗点击左右箭头切换图片
   */
  changeAptitudeIndex: function (event) {
    let type = event.currentTarget.id
    let count = this.data.dataSource.medicine_store.store_modal.image_list.length - 1
    let index = this.data.dataSource.medicine_store.store_modal.index

    if (type == "arrow_left") {
      index--
    } else if (type == "arrow_right") {
      index++
    }

    this.setData({
      'dataSource.medicine_store.store_modal.index': index,
      'dataSource.medicine_store.store_modal.isShowLeft': index > 0,
      'dataSource.medicine_store.store_modal.isShowRight': index < count
    })
  },

  /**
   * 滑动swiper
   */
  aptitudeChangeIndex: function (event) {
    if (event.detail.source == "touch") {
      let count = this.data.dataSource.medicine_store.store_modal.image_list.length - 1
      let index = event.detail.current
      this.setData({
        'dataSource.medicine_store.store_modal.index': index,
        'dataSource.medicine_store.store_modal.isShowLeft': index > 0,
        'dataSource.medicine_store.store_modal.isShowRight': index < count
      })
    }
  },

  /**
   * 进入购物车
   */
  lookShopCartDetail: function () {
    pushNavigation("get_shopping_car")
  },

  /**
   * 查看更多
   */
  lookMoreView: function () {
    let that = this
    let query = wx.createSelectorQuery()
    query.select('#more_image').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {

      let bottom = (res[0].bottom + 5) * that.data.dataSource.ratio;
      that.moreView.showModal(bottom)
    })
  },

  /**
   * 点击药品名称查看医药政策
   */
  lookMedicineService: function () {
    let item = {
      name: "单双轨说明页",
      type: "receive_h5",
      value: this.data.dataSource.medicine_info.medicine_typeurl
    }
    pushNavigation(item.type, item)
  },

  /**
   * 点击平台资质图片查看平台资质
   */
  lookplatformQualification: function () {
    let item = {
      name: "资质证书",
      type: "receive_h5",
      value: this.data.dataSource.medicine_detail[2].promise.qualification.link
    }
    pushNavigation(item.type, item)
  },

  /**
   * 查看店铺内药品
   */
  lookMedicineDetail: function (event) {
    pushNavigation("get_shop_goods_detail", {
      value: event.currentTarget.dataset.item.id
    })
  },

  /**
   * 查看店铺内全部商品
   */
  lookStoreAllMedicine: function () {
    pushNavigation("get_shop_detail_list", {
      value: this.data.dataSource.medicine_store.store_id
    })
  },

  /**
   * 进入店铺
   */
  lookStore: function () {
    pushNavigation("get_shop_detail", {
      value: this.data.dataSource.medicine_store.store_id
    })
  },

  /**
   * 查看全部评论
   */
  lookAllComment: function () {
    pushNavigation("goods_detail_all_comments", {
      shopId: this.data.dataSource.medicine_store.store_id
    });
  },

  /**
   * 切换基本信息、说明书、服务保障
   */
  changeGoodsDetailInfo: function (event) {
    let currentIndex = event.currentTarget.dataset.index;
    if (currentIndex != this.data.dataSource.medicine_detail_index) {
      this.setData({
        'dataSource.medicine_detail_index': currentIndex
      })
    }
  },

  /**
   * 收藏
   */
  collectionMedicine: function () {
    if (!isLogin()) {
      this.data.clickCollectFlag = true;
      pushNavigation('get_author_login')
      
      return;
    }
    let collection = this.data.dataSource.isCollection
    let goodsId = this.data.dataSource.medicine_info.medicine_id
    let shopId = this.data.dataSource.medicine_store.store_id
    this.setData({
      isLoading: true
    })
    if (collection && !this.data.clickCollectFlag) {
      // 取消收藏
      goodsDetailApi.getCancleCollectGoods(goodsId, shopId).then(response => {
        wx.showToast({
          title: "取消收藏成功",
          icon: 'none',
          duration: 2000
        })
        this.setData({
          isLoading: false,
          'dataSource.isCollection': !collection
        })
      }, error => {
        this.setData({
          isLoading: false
        })
      })
    } else {
      // 收藏
      goodsDetailApi.getCollectGoods(goodsId, shopId).then(response => {
        wx.showToast({
          title: "收藏成功",
          icon: 'none',
          duration: 2000
        })
        this.setData({
          isLoading: false,
          'dataSource.isCollection': !collection,
          clickCollectFlag:false,
        })
      }, error => {
        this.setData({
          isLoading: false
        })
      })
    }
  },

  /**
   * 加入需求单
   */
  addShopCart: function () {

    this.addCartOrBuy(false)
  },

  /**
   * 立即购买
   */
  immediatelyBuyMedicine: function () {
    if (!isLogin()) {
      this.data.ljgmFlag = true;
      pushNavigation('get_author_login')
      return;
    }
    this.addCartOrBuy(true)
  },

  /**
   * 添加购物车、直接购买
   */
  addCartOrBuy: function (isBuy) {
    if (!isLogin()) {
      pushNavigation('get_author_login')
      return;
    }
    let modal = this.selectComponent("#authentication");
    if(app.globalData.certification == '_unCertification'){
      userCenterApi.getUserAccountInfo().then(res=>{
        if(!res || res.dict_bool_certification != 1){
          modal.setData({
            isShow:true,
          })
          return false;
        }else{
          app.globalData.certification = res.dict_bool_certification;
          this.toPay(isBuy);
        }
      })
    }else{
      modal.setData({
        isShow:app.globalData.certification == 1 ? false:true,
      })
      if(app.globalData.certification != 1){
        return false;
      }
      this.toPay(isBuy);
    }

  },
    toPay:function(isBuy){
      let selectInfo = this.data.dataSource.medicine_selectInfo
      let packageId = ''
      let storeMedicineId = ''
      let quantity = selectInfo.quantity
      if (selectInfo.type == 0) {
        storeMedicineId = this.data.dataSource.store_medicine_id
      } else {
        packageId = selectInfo.selectModel.package_id
      }
  
      this.setData({
        isLoading: true
      })
  
      shopCarApi.addGoodsToShopCar(quantity, storeMedicineId, packageId, isBuy).then(response => {
        let _arr = wx.getStorageSync('checkedArr') || [];
        _arr.push(storeMedicineId || packageId);
        wx.setStorageSync('checkedArr', _arr)
        this.getShopCartNumber()
        this.hideCommboModal()
        if (isBuy) {
          let params = {}
          if (selectInfo.type == 0) {
            params.type = 'medicine'
            params.id = response.cartids.join(',')
          } else {
            params.type = 'package'
            params.package_id = response.packageids.join(',')
          }
  
          pushNavigation('get_settlement', {
            Data: [params],
            isBuy: true
          })
        } else {
          // 弹窗提示添加购物车成功
          wx.showToast({
            title: this.data.dataSource.medicine_info.medicine_type >0?'加入需求单成功':'加入购物车成功',
            icon: 'none',
            duration: 2000
          })
        }
  
        this.setData({
          isLoading: false
        })
      }, error => {
        // 弹窗提示添加购物车失败
        this.setData({
          isLoading: false
        })
  
        let message = isNotEmpty(error.msg) ? error.msg : this.data.dataSource.medicine_info.medicine_type >0?"加入需求单失败":"加入购物车失败"
        wx.showToast({
          title: message,
          icon: 'none',
          duration: 2000
        })
      })
    },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.couponModal = this.selectComponent("#couponModal");
    this.discountModal = this.selectComponent("#discountModal");
    this.specificationModal = this.selectComponent('#specificationModal');
    this.moreView = this.selectComponent("#moreView")
    this.goodsQuestion = this.selectComponent("#goodsQuestion")
    this.goodsBaseInfo = this.selectComponent("#goodsBaseInfo")
  },

  /**
   * 页面滑动
   */
  onPageScroll: function (event) {
    this.showTopView(event.scrollTop)
    if (this.data.dataSource.question_scroll_top == 0) {
      this.commentAndBaseScrollTop(event.scrollTop)
    } else if (this.data.dataSource.isShowTopItem) {
      this.topviewChange(event.scrollTop)
      this.baseAndServiceTop(event.scrollTop)
    }
  },

  /**
   * 显示顶部视图
   */
  showTopView: function (scrollTop) {
    if (scrollTop > 40) {
      if (!this.data.dataSource.isShowTopItem) {
        this.setData({
          'dataSource.isShowTopItem': true
        })
      }
    } else {
      if (this.data.dataSource.isShowTopItem) {
        this.setData({
          'dataSource.isShowTopItem': false
        })
      }
    }
  },

  /**
   * 设置滑动到评论、基本信息的滑动高度
   */
  commentAndBaseScrollTop: function (scrollTop) {
    let that = this
    let query = wx.createSelectorQuery()
    let topH = that.data.dataSource.top_height
    query.select('#goodsQuestion').boundingClientRect()
    query.select('#goodsBaseInfo').boundingClientRect()
    query.exec(function (res) {
      if (res === null || res.length < 1 || !res[0] || res[0].top === null || res[0].top === undefined) {
        return;
      }
      if (!res[1] || res[1].top === null || res[1].top === undefined) {
        return;
      }
      that.data.dataSource.question_scroll_top = scrollTop + res[0].top  + res[0].height- topH
      that.data.dataSource.baseinfo_scroll_top = scrollTop + res[1].top + res[1].height - topH
    })
  },

  /**
   * 切换顶部视图的状态
   */
  topviewChange: function (scrollTop) {
    // 顶部按钮选中切换
    if ((scrollTop + 5) >= this.data.dataSource.baseinfo_scroll_top && this.data.dataSource.topIndex != 2) {
      this.setData({
        'dataSource.topIndex': 2
      })

    } else if ((scrollTop + 5) >= this.data.dataSource.question_scroll_top && (scrollTop + 5) < this.data.dataSource.baseinfo_scroll_top && this.data.dataSource.topIndex != 1) {
      this.setData({
        'dataSource.topIndex': 1
      })

    } else if ((scrollTop + 5) < this.data.dataSource.question_scroll_top && this.data.dataSource.topIndex != 0) {
      this.setData({
        'dataSource.topIndex': 0
      })

    } else {
      // console.log("判断遗漏", scrollTop, this.data.dataSource.question_scroll_top, this.data.dataSource.topIndex)
    }
  },

  /**
   * 基本信息悬浮效果
   */
  baseAndServiceTop: function (scrollTop) {
    // 悬浮
    if (this.data.dataSource.baseinfo_scroll_top <= (scrollTop + 5) && this.data.dataSource.isSuspensionBaseInfo == false) {
      this.setData({
        'dataSource.isSuspensionBaseInfo': true
      })
    } else if (this.data.dataSource.baseinfo_scroll_top > (scrollTop + 5) && this.data.dataSource.isSuspensionBaseInfo == true) {
      this.setData({
        'dataSource.isSuspensionBaseInfo': false
      })
    }
  },

  /**
   * 查看资质modal弹框点击方法
   */
  qualificationModalItemClick: function (event) {
    this.hideStoreModal()
    this.showBigImage(event)
  },

  /**
   * 点击查看大图
   */
  showBigImage: function (event) {
    let type = event.currentTarget.dataset.type
    let list = event.currentTarget.dataset.images
    let current = event.currentTarget.dataset.current
    let urls = []
    if (type == 'medicine') {
      urls = list
    } else {
      for (let index = 0; index < list.length; index++) {
        urls.push(list[index].image_url)
      }
    }

    wx.previewImage({
      urls: urls,
      current: current
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    this.setData({
      isLoading:false
    })
    //判断是否登录
    wx.getStorage({
      key: 'cookieKey',
      success(res) {
        if (isNotEmpty(res.data)) {
          that.getShopCartNumber();
          if(that.data.clickCollectFlag){
            that.collectionMedicine();//点击收藏 没登陆时跳转 登录 返回页面时调用收藏
          }
          if(that.data.ljgmFlag){
            that.addCartOrBuy(true);//点击购买 没登陆时跳转 登录 返回页面时调用购买
            that.data.ljgmFlag = false;
          }
          that.setData({
            'dataSource.isLogin': true
          })
        } else {
          that.setData({
            'dataSource.isLogin': false
          })
        }
      }
    })
    if (that.data.isRemove) {
      that.data.isRemove = false
      wx.navigateBack({

      })
    }
    if(app.globalData.certification == 1){
      let modal = this.selectComponent("#authentication");
      modal.setData({
        isShow:false,
      })
    }
  },
  consultAction: function () {
    if (this.data.dataSource.isLogin) {
      return
    } else {
      pushNavigation('get_author_login')
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let goodsId = this.data.dataSource.store_medicine_id
    return {
      title: this.data.dataSource.medicine_info.medicine_namecn,
      path: '/pages/YFWGoodsDetailModule/YFWGoodsDetailPage/YFWGoodsDetail?params=' + JSON.stringify({
        value: goodsId
      }),
      imageUrl: this.data.dataSource.medicine_images[0]
    }
  },
  jumpDiscountNotice: function (event) {
    pushNavigation('discount_notice_page', {
      value: toDecimal(event.currentTarget.dataset.price),
      shop_goods_id: this.data.dataSource.store_medicine_id
    })
  },
  changeParamFlag:function(){
    this.setData({
      paramFlag:!this.data.paramFlag
    })
  }
})