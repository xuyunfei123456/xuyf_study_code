// pages/YFWShopCarModule/YFWShopCarPage/YFWShopCar.js
import {
  isNotEmpty,
  itemAddKey,
  tcpImage,
  toDecimal,
  upadataTabBarCount,
  updateShopCount,
} from '../../../utils/YFWPublicFunction.js'
import {
  getModel
} from '../../../model/YFWCouponModel.js'
import {
  getItemModel
} from './../../../components/GoodsItemView/model/YFWGoodsItemModel.js'
import {
  YFWShopCarModel
} from '../Model/YFWShopCarModel.js'
import {
  ShopCarApi,
  IndexApi,
  SearchApi,
  UserCenterApi
} from '../../../apis/index.js'
import {
  pushNavigation
} from '../../../apis/YFWRouting.js'
import {
  isLogin
} from '../../../utils/YFWPublicFunction.js'
const userCenterApi = new UserCenterApi()
const indexApi = new IndexApi()
const shopCarApi = new ShopCarApi()
const searchApi = new SearchApi()
const shopCarModel = new YFWShopCarModel()
import {
  config
} from '../../../config.js'
var event = require('../../../utils/event')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkedArr:[],
    firstRequestFlag:false,
    tabbarHeight: 0,
    promitBottom: 0,
    prompt_info: '',
    activityHieght: 0,
    activityItem: {},
    data: [],
    recommendData: [],
    coupon_list: [],
    itemKeySize: 0,
    itemSelectedSize: 0,
    isAllSelected: false, //进入页面默认,不全选。修改时配合购物车信息请求中的updataData默认选中一同修改
    priceTotal: 0,
    discountTotal: '0.00', // 促销扣除
    lastOpenSiderId: '',
    inputIsFocus: false,
    isLogin: false,
    loading: false,
    safeAreaInsetBottom: 0,
    priceInShopMap: {} //保存店铺内选中商品总价的字典,在requestFreepostageAndActivityInfo和updataData请求时更新
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    event.on('logout', this, function (res) {
      this.setData({
        isLogin: false
      })
    })
    // this.setData({
    //   safeAreaInsetBottom: app.globalData.safeAreaInsetBottom || 0
    // })

    this.requestRecommendMedicine()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.couponModal = this.selectComponent("#couponModal");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.getStorage({
      key: 'tabBarHeight',
      success: res => {
        if (res.data) {
          this.setData({
            tabbarHeight: 0
          })
        }
      }
    })
    let checkedArr = wx.getStorageSync('checkedArr');
    this.setData({
      checkedArr:checkedArr || [],
    })
    let modal = this.selectComponent("#authentication");
    //判断是否登录
    if (!isLogin()) {
      this.setData({
        isLogin: false,
        firstRequestFlag:true
      })
    } else {
      this.requestCartInfoData()
      this.setData({
        isLogin: isLogin()
      })
      if (app.globalData.certificationFlag) {
        app.globalData.certificationFlag = false;
        if (app.globalData.certification == '_unCertification') {
          userCenterApi.getUserAccountInfo().then(res => {
            if (!res || res.dict_bool_certification != 1) {
              modal.setData({
                isShow: true,
              })
            } else {
              app.globalData.certification = res.dict_bool_certification;
              modal.setData({
                isShow: false,
              })
            }
          })
        } else {
          modal.setData({
            isShow: app.globalData.certification == 1 ? false : true,
          })
        }
      }
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //关闭打开的item
    if (isNotEmpty(this.selectComponent('#' + this.data.lastOpenSiderId))) {
      this.selectComponent('#' + this.data.lastOpenSiderId).close()
    }
    app.globalData.preRoute = 'get_shopping_car';
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
    this.requestCartInfoData()
    this.requestRecommendMedicine()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  /*活动跳转*/
  activityRedirect: function () {
    pushNavigation('receive_h5', {
      value: this.data.activityItem.url
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

    return {
      title: config.share_title,
      imageUrl: config.share_image_url
    }
  },

  /**
   * 点击商品CheckBox事件
   */
  cilckItems: function (e,turnChange = false) {
    let cilckItem = e.currentTarget.dataset.item;
    let type = e.currentTarget.dataset.type;
    let checkDataArray = this.data.data;
    let itemSelectedSize = 0;
    let price = 0;
    let discount = 0
    let isAllSelected = true;
    let itemChanged = false; //点击的选项是否已经改变
    /** 无效商品 */
    if (cilckItem.dict_store_medicine_status <= 0) {
      return
    }
    for (let i = 0; i < checkDataArray.length; i++) {
      let shopItem = checkDataArray[i]
      if (checkDataArray[i].cart_items) {
        checkDataArray[i]['checked'] = true;
        let priceInShop = 0;
        let discountInShop = 0
        for (let j = 0; j < checkDataArray[i].cart_items.length; j++) {
          if (checkDataArray[i].cart_items[j].type == 'medicines') {
            /** 单品 */
            for (let k = 0; k < checkDataArray[i].cart_items[j].medicines.length; k++) {
              if (checkDataArray[i].cart_items[j].medicines[k].dict_store_medicine_status > 0) {
                var item = checkDataArray[i].cart_items[j].medicines[k];
                if (type == 'medicines' && cilckItem.id == item.id) {
                  itemChanged = true; //选项改变
                  item['checked'] = !item['checked'];
                }
                if (item['checked']) {
                  price = price + (item.price_old * item.quantity); //计算价格用于显示合计金额
                  priceInShop = priceInShop + item.price_old * item.quantity; //计算店内价格用于请求满减活动信息
                  discountInShop = discountInShop + (item.price_old - item.price) * item.quantity
                  itemSelectedSize = itemSelectedSize + item.quantity; //计算商品数量用于显示结算（XX）
                } else {
                  checkDataArray[i]['checked'] = false; //取消店家全选状态
                  isAllSelected = false; //取消全选状态
                }
              }
            }
          } else {
            /**套装 或 多件装 */
            var packageItem = checkDataArray[i].cart_items[j]
            if (type == 'medicines' && cilckItem.package_id == packageItem.package_id) {
              itemChanged = true;
              packageItem['checked'] = !packageItem['checked'];
            }
            if (packageItem['checked']) {
              price = price + packageItem.price * packageItem.count;
              priceInShop = priceInShop + packageItem.price_old * packageItem.count;
              packageItem.package_medicines.map((medicine) => {
                itemSelectedSize = itemSelectedSize + medicine.quantity
              })
            } else {
              checkDataArray[i]['checked'] = false;
              isAllSelected = false;
            }
          }
        }
        if (priceInShop >= shopItem.condition_price) {
          discountInShop += shopItem.sub_price
        }
        discount += discountInShop
        this.requestFreepostageAndActivityInfo(checkDataArray[i].shop_id, priceInShop)
      }
    }

    price -= discount
    this.setData({
      data: checkDataArray,
      isAllSelected: isAllSelected,
      priceTotal: toDecimal(price),
      itemSelectedSize: itemSelectedSize,
      discountTotal: toDecimal(discount)
    });
  },

  /**
   * 点击商家CheckBox事件
   */
  cilckShopItems: function (e) {
    let cilckShopItemKey = e.currentTarget.dataset.key;
    let checkDataArray = this.data.data;
    let itemSelectedSize = 0;
    let price = 0;
    let discount = 0
    let isAllSelected = true;
    for (let i = 0; i < checkDataArray.length; i++) {
      let shopItem = checkDataArray[i]
      if (shopItem.cart_items) {
        let priceInShop = 0;
        let discountInShop = 0
        if (cilckShopItemKey == checkDataArray[i].key) {
          checkDataArray[i]['checked'] = !checkDataArray[i]['checked'];
        }
        for (let j = 0; j < checkDataArray[i].cart_items.length; j++) {
          if (checkDataArray[i].cart_items[j].type == 'medicines') {
            /** 单品 */
            for (let k = 0; k < checkDataArray[i].cart_items[j].medicines.length; k++) {
              if (checkDataArray[i].cart_items[j].medicines[k].dict_store_medicine_status > 0) {
                var item = checkDataArray[i].cart_items[j].medicines[k];
                if (cilckShopItemKey == checkDataArray[i].key) {
                  item['checked'] = checkDataArray[i]['checked'];
                }
                if (item['checked']) {
                  price = price + (item.price_old * item.quantity); //计算价格用于显示合计金额
                  priceInShop = priceInShop + item.price_old * item.quantity; //计算店内价格用于请求满减活动信息
                  discountInShop = discountInShop + (item.price_old - item.price) * item.quantity
                  itemSelectedSize = itemSelectedSize + item.quantity; //计算商品数量用于显示结算（XX）
                } else {
                  checkDataArray[i]['checked'] = false; //取消店家全选状态
                  isAllSelected = false; //取消全选状态
                }
              }
            }
          } else {
            /**套装 或 多件装 */
            var packageItem = checkDataArray[i].cart_items[j]
            if (cilckShopItemKey == checkDataArray[i].key) {
              packageItem['checked'] = checkDataArray[i]['checked'];
            }
            if (packageItem['checked']) {
              price = price + packageItem.price * packageItem.count;
              priceInShop = priceInShop + packageItem.price_old * packageItem.count;
              packageItem.package_medicines.map((medicine) => {
                itemSelectedSize = itemSelectedSize + medicine.quantity
              })
            } else {
              checkDataArray[i]['checked'] = false;
              isAllSelected = false;
            }
          }
        }

        if (priceInShop >= shopItem.condition_price) {
          discountInShop += shopItem.sub_price
        }
        discount += discountInShop
        //取消店家全选时,发送请求更新活动和包邮信息
        if (cilckShopItemKey == checkDataArray[i].key) {
          this.requestFreepostageAndActivityInfo(checkDataArray[i].shop_id, priceInShop)
        }
      }
    }

    price -= discount
    this.setData({
      data: checkDataArray,
      isAllSelected: isAllSelected,
      priceTotal: toDecimal(price),
      itemSelectedSize: itemSelectedSize,
      discountTotal: toDecimal(discount)
    });
  },

  /**
   * 点击全选CheckBox事件
   */
  cilckAllItems: function () {
    let isSelect = !this.data.isAllSelected
    let itemKeySize = 0;
    let itemSelectedSize = 0;
    let checkDataArray = this.data.data;
    let price = 0;
    let discount = 0
    for (let i = 0; i < checkDataArray.length; i++) {
      let shopItem = checkDataArray[i]
      if (shopItem.cart_items) {
        checkDataArray[i]['checked'] = isSelect;
        let priceInShop = 0;
        let discountInShop = 0
        for (let j = 0; j < shopItem.cart_items.length; j++) {
          if (checkDataArray[i].cart_items[j].type == 'medicines') {
            /** 单品 */
            for (let k = 0; k < checkDataArray[i].cart_items[j].medicines.length; k++) {
              if (checkDataArray[i].cart_items[j].medicines[k].dict_store_medicine_status > 0) {
                var item = checkDataArray[i].cart_items[j].medicines[k];
                item['checked'] = isSelect;
                if (item['checked']) {
                  price = price + (item.price_old * item.quantity); //计算价格用于显示合计金额
                  priceInShop = price + (item.price_old * item.quantity); //计算店内价格用于请求满减活动信息
                  discountInShop = discountInShop + (item.price_old - item.price) * item.quantity
                  itemSelectedSize = itemSelectedSize + item.quantity; //计算商品数量用于显示结算（XX）
                }
                itemKeySize++; //计算商品数量用于显示购物车（XX）
              }
            }
          } else {
            /**套装 或 多件装 */
            var packageItem = checkDataArray[i].cart_items[j]
            packageItem['checked'] = isSelect;
            if (packageItem['checked']) {
              price = price + packageItem.price * packageItem.count;
              priceInShop = priceInShop + packageItem.price_old * packageItem.count;
              packageItem.package_medicines.map((medicine) => {
                itemSelectedSize = itemSelectedSize + medicine.quantity
              })
            }
            itemKeySize++;
          }
        }
        if (priceInShop >= shopItem.condition_price) {
          discountInShop += shopItem.sub_price
        }
        discount += discountInShop
        //更新满减活动和包邮信息
        this.requestFreepostageAndActivityInfo(shopItem.shop_id, priceInShop)
      }
    }

    price -= discount
    this.setData({
      data: checkDataArray,
      isAllSelected: isSelect,
      priceTotal: toDecimal(price),
      itemKeySize: itemKeySize,
      itemSelectedSize: itemSelectedSize,
      discountTotal: toDecimal(discount)
    });
  },

  /**
   * 键盘获取焦点标志位,屏蔽加减按扭操作时使用
   */
  onInputFocus: function () {
    this.setData({
      inputIsFocus: true,
    })
  },
  onInputBlur: function () {
    this.setData({
      inputIsFocus: false,
    })
  },

  /**
   * 输入数量
   */
  bindQuantityInput: function (e) {
    let item = e.currentTarget.dataset.item,min;
    let value = e.detail.value;
    if (item.type == "medicine") {
      if(item.limit_buy_qty&&item.reserve){
        min = item.limit_buy_qty-item.reserve>0 ? item.reserve : item.limit_buy_qty
      }else{
        min = item.limit_buy_qty || item.reserve
      }
      value = e.detail.value > min ? min : e.detail.value;

    } else if(item.type == 'courseOfTreatment'){ //多件装
      let reserve = item.package_medicines[0].reserve,limit = item.package_medicines[0].limit_buy_qty,smpd_amout = item.package_medicines[0].smpd_amout || 1;
      const ratio1 = Math.floor(reserve/smpd_amout),ratio2 =(limit == null || !limit) ? null : Math.floor(limit/smpd_amout);
      let _reserve;
      if(ratio2 == null){
        _reserve = ratio1
      }else{
        _reserve = ratio1 >= ratio2 ? ratio2:ratio1
      }
      value = e.detail.value > _reserve ? _reserve : e.detail.value
    }else{ //套餐
      // let _arr = [];
      // item.package_medicines.forEach((item, index, array) => {
      //   let reserve = item.reserve,limit = item.limit_buy_qty,smpd_amout = item.smpd_amout || 1,
      //   ratio1 = Math.floor(reserve/smpd_amout),ratio2 =(limit == null || !limit) ? null : Math.floor(limit/smpd_amout);
      //   _arr.push(ratio1);
      //   if(ratio2&& ratio2!= null){
      //     _arr.push(ratio2)
      //   }
      // })
      // let minNum = Math.min(..._arr);
      // value = e.detail.value > minNum ? minNum : e.detail.value;
    }
    return {
      value: value,
    }
  },

  /**
   * 当输入框失去焦点
   */
  inputConfirm: function (e) {
    let item = e.currentTarget.dataset.item,
    value = e.detail.value;
    if (item.quantity != value && item.count != value) {
      this.requestUpdateCount(item, value);
    } else {
      this.onInputBlur()
    }
  },

  /**
   * 空购物车跳转
   */
  emptyButtonClicked: function () {
    if (this.data.isLogin) {
      pushNavigation('get_home')
    } else {
      pushNavigation('get_author_login')
    }
  },

  /**
   * 跳转商品详情
   */
  jumpToGoodsDetail: function (e) {
    let item = e.currentTarget.dataset.item;
    if (item.dict_store_medicine_status <= 0) {
      pushNavigation('get_goods_detail', {
        'value': item.medicineid
      })
    } else {
      pushNavigation('get_shop_goods_detail', {
        'value': item.shop_goods_id
      })
    }
  },

  /**
   * 跳转商家店铺
   */
  jumpToShopDetail(e) {
    let item = e.currentTarget.dataset.item;
    pushNavigation('get_shop_detail', {
      'value': item.shop_id
    })
  },

  /**
   * 去凑单
   */
  addOnItem: function (e) {
    let item = e.currentTarget.dataset.item;
    console.log(this.data.priceInShopMap[item.shop_id] + '')
    pushNavigation('get_shop_detail_list', {
      'value': item.shop_id,
      'priceInShop': this.data.priceInShopMap[item.shop_id],
      'isShowTips': true
    })
  },

  /**
   * 优惠券弹窗
   */
  showCouponModal: function (e) {
    let item = e.currentTarget.dataset.item;
    let coupon_list = item.coupons_list;
    this.setData({
      coupon_list: coupon_list,
    });
    this.couponModal.showModal();
  },

  /**
   * 商品数量 减一
   */
  subFn: function (e) {
    if (this.data.inputIsFocus) {
      return;
    }
    var item = e.currentTarget.dataset.item;
    if (item.type == "medicine") {
      this.requestUpdateCount(item, parseInt(item.quantity) - 1);
    } else {
      this.requestUpdateCount(item, parseInt(item.count - 1));
    }
  },

  /**
   * 商品数量 加一
   */
  plusFn: function (e) {
    if (this.data.inputIsFocus) {
      return;
    }
    var item = e.currentTarget.dataset.item;
    if (item.type == "medicine") {
      parseInt(item.quantity) + 1 > item.reserve ? wx.showToast({
        title: '超过库存上限',
        icon: 'none',
        duration: 2000
      }) : this.requestUpdateCount(item, parseInt(item.quantity) + 1);
    } else {
      let reserve = item.package_medicines[0].reserve;
      item.package_medicines.forEach((item, index, array) => {
        let item_reserve = item.reserve;
        if (reserve > item_reserve) reserve = item_reserve;
      })
      item.count + 1 > Number.parseInt(reserve) ? wx.showToast({
        title: '超过库存上限',
        icon: 'none',
        duration: 2000
      }) : this.requestUpdateCount(item, item.count + 1);
    }
  },

  /**
   * 编辑商品数量
   */
  requestUpdateCount: function (changeItem, quantity) {
    this.setData({
      loading: true,
    })
    quantity = parseInt(quantity)
    if(changeItem.type == 'medicine'){
      shopCarApi.changeCarGoodsQuantity(changeItem.id, quantity).then(res => {
        // this.upadataCount(changeItem, quantity)
        this.requestCartInfoData()
        this.onInputBlur()
      }, error => {
        wx.showToast({
          title: error.msg,
          icon: 'none',
          duration: 2000
        })
        if(error.code&& error.code == -1){
          this.upadataCount(changeItem,1)
        }
        this.onInputBlur()
        this.setData({
          loading: false
        })
      })
    }
    if (changeItem.type == 'package') {
      shopCarApi.changeCarPackageQuantity(changeItem.id, quantity).then(res => {
        this.requestCartInfoData()
        this.onInputBlur()
      }, (error) => {
        wx.showToast({
          title: error.msg,
          icon: 'none',
          duration: 2000
        })
        if(error.code&& error.code == -1){
          this.upadataCount(changeItem,1)
        }
        this.onInputBlur()
        this.setData({
          loading: false
        })
      })
    } else if(changeItem.type == 'courseOfTreatment'){
      shopCarApi.changeCarPackageQuantity(changeItem.id, quantity).then(res => {
        this.requestCartInfoData()
        this.onInputBlur()
      }, error => {
        wx.showToast({
          title: error.msg,
          icon: 'none',
          duration: 2000
        })
        if(error.code&& error.code == -1){
          this.upadataCount(changeItem,1)
        }
        this.onInputBlur()
        this.setData({
          loading: false
        })
      })
    }
  },
  /**
   * 本地更新单个商品或套餐数量，为了去除后台返回数据顺序改变导致的列表改变。只能在接口成功后调用。
   * changeItem ： 单个商品或套餐数据
   * count ： 更新后的数量
   */
  upadataCount(changeItem, count) {
    let itemSelectedSize = this.data.itemSelectedSize;
    let price = this.data.priceTotal;
    let changed = false;
    this.data.data.some((item) => {
      let priceInShop = 0;
      item.cart_items.some((item) => {
        if (changeItem.type == "medicine" && item.medicines) {
          item.medicines.some((item) => {
            if (item.id == changeItem.id && changeItem.type == item.type) {
              changed = true;
              //更新数据中的数量和价格
              if (item.checked) {
                itemSelectedSize = parseInt(itemSelectedSize) - item.quantity + count
                price = price - (item.quantity - count) * item.price
              }
              item.quantity = parseInt(count);
            }
            if (item.checked) {
              priceInShop = priceInShop + item.quantity * item.price_old
            }
          })
        } else {
          if (item.id == changeItem.id && changeItem.type == item.type) {
            changed = true;
            //更新数据中的数量和价格
            if (item.checked) {
              price = price - (item.count - count) * item.price
            }
            item.package_medicines.map((medicine) => {
              let medicine_quantity_after = medicine.quantity / item.count * count
              if (item.checked) {
                itemSelectedSize = parseInt(itemSelectedSize) - medicine.quantity + medicine_quantity_after
              }
              medicine.quantity = medicine_quantity_after
            })
            item.count = parseInt(count);
          }
          if (item.checked) {
            priceInShop = priceInShop + item.count * item.price_old
          }
        }
      })
      //请求更新活动满减信息
      if (changed) {
        this.requestFreepostageAndActivityInfo(item.shop_id, priceInShop)
      }
      console.log(priceInShop, item)
      return changed; //如果已经找到, return true 提前跳出循环
    })
    this.setData({
      data: this.data.data,
      itemSelectedSize: itemSelectedSize,
      priceTotal: toDecimal(price),
    })
    //刷新tab角标
    this.requestShopCarCount()
  },

  /**
   * 服务器请求数据回来后增量更新本地数据
   */
  updataData(newData) {
    let dataMap = this.getDataMap() //将更新前的数据选中情况转化成map
    let itemSelectedSize = 0;
    let price = 0;
    let discount = 0
    let itemKeySize = 0,_checkarr = [];
    newData.map((shopItem) => {
      if (shopItem.cart_items) {
        shopItem['checked'] = false;
        if (dataMap[shopItem.shop_id]) {
          shopItem['checked'] = dataMap[shopItem.shop_id]['checked'];
        }
        let priceInShop = 0;
        let discountInShop = 0
        shopItem.cart_items.map((cartItem) => {
          if (cartItem.type == 'medicines') {
            /** 单品 */
            cartItem.medicines.map((medicineItem) => {
              if (medicineItem.dict_store_medicine_status > 0) {
                //如果商品已存在选中状态不变，若不在默认选中
                var checked = false;
                if (dataMap[shopItem.shop_id] &&
                  dataMap[shopItem.shop_id]['medicines'] &&
                  dataMap[shopItem.shop_id]['medicines'][medicineItem.shop_goods_id]) {
                  checked = dataMap[shopItem.shop_id]['medicines'][medicineItem.shop_goods_id].checked
                }
                medicineItem['checked'] = checked;
                //统计数据
                if (medicineItem['checked']) {
                  price = price + (medicineItem.price_old * medicineItem.quantity); //计算价格用于显示合计金额
                  priceInShop = priceInShop + (medicineItem.price_old * medicineItem.quantity); //计算店内价格用于请求满减活动信息
                  discountInShop = discountInShop + (medicineItem.price_old - medicineItem.price) * medicineItem.quantity
                  itemSelectedSize = itemSelectedSize + medicineItem.quantity; //计算商品数量用于显示结算（XX）
                }
                /* else {
                                  shopItem['checked'] = false
                                }*/
                itemKeySize++; //计算商品数量用于显示购物车（XX）
              }
              let _arr = this.data.checkedArr;
              if(_arr.includes(medicineItem.shop_goods_id)||_arr.includes(medicineItem.shop_goods_id+'')){
                medicineItem['checked'] = true;
                _checkarr.push(medicineItem);
                this.data.checkedArr = _arr.filter(item=>item !=medicineItem.shop_goods_id);
                wx.setStorageSync('checkedArr', this.data.checkedArr)
              }
            })
          } else {
            /**套装 或 多件装 */
            var packageItem = cartItem
            //如果套装已存在选中状态不变，若不在默认选中
            var checked = false;
            if (dataMap[shopItem.shop_id] &&
              dataMap[shopItem.shop_id][packageItem.type] &&
              dataMap[shopItem.shop_id][packageItem.type][packageItem.id]) {
              checked = dataMap[shopItem.shop_id][packageItem.type][packageItem.id].checked
            }
            packageItem['checked'] = checked;
            //统计数据
            if (packageItem['checked']) {
              price = price + packageItem.price * packageItem.count;
              priceInShop = priceInShop + packageItem.price_old * packageItem.count;
              packageItem.package_medicines.map((medicine) => {
                itemSelectedSize = itemSelectedSize + medicine.quantity
              })
            }
            let _arr = this.data.checkedArr;
            if(_arr.includes(packageItem.package_medicines[0].package_id)){
              packageItem['checked'] = true;
              _checkarr.push(packageItem);
              this.data.checkedArr = _arr.filter(item=>item !=packageItem.package_medicines[0].package_id);
              wx.setStorageSync('checkedArr', this.data.checkedArr)
            }
            /* else {
                           shopItem['checked'] = false
                        }*/
            itemKeySize++;
          }
        })
        //店内商品未全选，单独请求满减信息
        if (!shopItem['checked']) {
        //单个商店的包邮信息如果有的话 直接先取缓存 随后在请求requestFreepostageAndActivityInfo中更新  防止闪动
        for (let dataitem of this.data.data) {
          if (dataitem.shop_id == shopItem.shop_id) {
            shopItem.freepostage = dataitem.freepostage;
            shopItem.add_on_isshow = dataitem.add_on_isshow;
            shopItem.freepostage_isshow = dataitem.freepostage_isshow;
            break;
          }
        }
          this.requestFreepostageAndActivityInfo(shopItem.shop_id, priceInShop)
        } else {
          let map = this.data.priceInShopMap
          map[shopItem.shop_id] = priceInShop
          this.setData({
            priceInShopMap: map
          })
        }

        if (priceInShop >= shopItem.condition_price) {
          discountInShop += shopItem.sub_price
        }
        discount += discountInShop
      }
    })

    price -= discount
    this.setData({
      data: newData,
      priceTotal: toDecimal(price),
      itemKeySize: itemKeySize,
      itemSelectedSize: itemSelectedSize,
      discountTotal: toDecimal(discount),
      firstRequestFlag:true,
    }, () => {
      let _this = this
      wx.createSelectorQuery().select('#promitBottom').boundingClientRect(function (rect) {
        _this.setData({
          promitBottom: (rect && rect.height) || 0
        })
      }).exec()

    });
    if(_checkarr.lenght!=0){
      _checkarr.map(item=>{
        this.cilckItems({currentTarget:{dataset:{item,turnChange:true}}})
      })
    }
    //刷新tab角标
    this.requestShopCarCount()
  },
  /**
   * 生成本地数据字典， 记录选择情况，在updataData使用
   */
  getDataMap: function () {
    let allGoods = {};
    let dataArray = this.data.data;
    // console.log(dataArray)
    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i].cart_items) {
        allGoods[dataArray[i].shop_id] = {}
        allGoods[dataArray[i].shop_id]['checked'] = dataArray[i]['checked']
        for (let j = 0; j < dataArray[i].cart_items.length; j++) {
          if (dataArray[i].cart_items[j].type == 'medicines') {
            allGoods[dataArray[i].shop_id]['medicines'] = {}
            for (let k = 0; k < dataArray[i].cart_items[j].medicines.length; k++) {
              if (dataArray[i].cart_items[j].medicines[k].dict_store_medicine_status > 0) {
                var item = dataArray[i].cart_items[j].medicines[k];
                allGoods[dataArray[i].shop_id]['medicines'][item.shop_goods_id] = item
              }
            }
          } else {
            var packageItem = dataArray[i].cart_items[j]
            if (!allGoods[dataArray[i].shop_id][packageItem.type]) {
              allGoods[dataArray[i].shop_id][packageItem.type] = {}
            }
            allGoods[dataArray[i].shop_id][packageItem.type][packageItem.id] = packageItem
          }
        }
      }
    }
    // console.log(allGoods)
    return allGoods;
  },

  /**
   * 滑动删除模块打开回调方法。保存本次打开的itemId并关闭上一次打开的item。
   */
  onSidebarOpen: function (e) {
    if (this.data.lastOpenSiderId != '' && this.data.lastOpenSiderId != e.currentTarget.id) {
      if (isNotEmpty(this.selectComponent('#' + this.data.lastOpenSiderId))) {
        this.selectComponent('#' + this.data.lastOpenSiderId).close()
      }
    }
    this.data.lastOpenSiderId = e.currentTarget.id;
  },

  /**
   * 删除商品
   */
  onDeleteitem: function (e) {
    if (this.data.loading) {
      return
    }
    var item = e.currentTarget.dataset.item;
    let goodsIds = [];
    let packageIds = [];
    if (item.type == 'medicine') {
      goodsIds.push(item.id)
    } else {
      packageIds.push(item.id)
    }

    this.setData({
      loading: true
    })
    shopCarApi.delectGoodsFromShopCar(String(goodsIds), String(packageIds)).then(res => {
      this.setData({
        loading: false
      })
      wx.showToast({
        title: '删除成功',
        icon: 'none',
        duration: 2000
      })
      this.requestCartInfoData()
      if (isNotEmpty(this.selectComponent('#' + this.data.lastOpenSiderId))) {
        this.selectComponent('#' + this.data.lastOpenSiderId).close() //关闭打开的item
      }
    }, error => {
      this.setData({
        loading: false
      })
      wx.showToast({
        title: error.msg,
        icon: 'none',
        duration: 2000
      })
    })
  },

  /**
   * 移动到收藏
   */
  onMoveToConllect: function (e) {
    var item = e.currentTarget.dataset.item;
    let cartidList = [];
    if (isNotEmpty(item.package_medicines)) {
      cartidList = item.package_medicines.map((goodsInfo) => {
        return goodsInfo.id
      })
    } else {
      cartidList.push(item.id)
    }
    this.setData({
      loading: true
    })
    shopCarApi.moveGoodsToFavorite(cartidList).then(res => {
      wx.showToast({
        title: '收藏成功',
      })
      this.requestCartInfoData()
      if (isNotEmpty(this.selectComponent('#' + this.data.lastOpenSiderId))) {
        this.selectComponent('#' + this.data.lastOpenSiderId).close() //关闭打开的item
      }
      this.setData({
        loading: false
      })
    }, error => {
      wx.showToast({
        title: error.msg,
        icon: 'none',
        duration: 2000
      })
      this.setData({
        loading: false
      })
    })
  },
  /**
   * 跳转结算页面
   */
  jumpToOrderSettlement: function () {
    let modal = this.selectComponent("#authentication");
    if (app.globalData.certification == '_unCertification') {
      userCenterApi.getUserAccountInfo().then(res => {
        if (!res || res.dict_bool_certification != 1) {
          modal.setData({
            isShow: true,
          })
        } else {
          app.globalData.certification = res.dict_bool_certification;
          this.goToPay()
        }
      })
    } else {
      modal.setData({
        isShow: app.globalData.certification == 1 ? false : true,
      })
      if (app.globalData.certification != 1) {
        return false;
      } else {
        this.goToPay()
      }
    }
  },
  goToPay: function () {
    if (this.data.itemSelectedSize == 0) {
      wx.showToast({
        title: '请至少选择一件商品, 才能结算',
        icon: 'none',
        duration: 2000,
      })
      return
    }
    let goodsList = [];
    let checkDataArray = this.data.data;
    for (let i = 0; i < checkDataArray.length; i++) {
      if (checkDataArray[i].cart_items) {
        for (let j = 0; j < checkDataArray[i].cart_items.length; j++) {
          if (checkDataArray[i].cart_items[j].type == 'medicines') {
            /** 单品 */
            for (let k = 0; k < checkDataArray[i].cart_items[j].medicines.length; k++) {
              if (checkDataArray[i].cart_items[j].medicines[k].dict_store_medicine_status > 0) {
                var item = this.shallowCopy(checkDataArray[i].cart_items[j].medicines[k]); //浅拷贝防止影响页面数据
                if (item['checked']) {
                  delete item['checked']
                  goodsList.push(item)
                }
              }
            }
          } else {
            /**套装 或 多件装 */
            var packageItem = this.shallowCopy(checkDataArray[i].cart_items[j]);
            if (packageItem['checked']) {
              delete packageItem['checked']
              goodsList.push(packageItem)
            }
          }
        }
      }
    }
    pushNavigation('get_settlement', {
      'Data': goodsList,
    })
  },
  /**
   * 浅拷贝通用方法
   */
  shallowCopy: function (src) {
    var dst = {};
    for (var prop in src) {
      if (src.hasOwnProperty(prop)) {
        dst[prop] = src[prop];
      }
    }
    return dst;
  },
  /**
   * 请求购物车信息
   */
  requestCartInfoData: function () {
    this.setData({
      loading: true
    })
    shopCarApi.getShopCarInfo().then(res => {
      if (isNotEmpty(res.note)) {
        this.setData({
          activityItem: res.note,
        },()=>{
          let _this = this;
          setTimeout(() => {
            wx.createSelectorQuery().select('#activity').boundingClientRect(function (rect) {
              _this.setData({
                activityHieght: rect ? rect.height : 0
              })
            }).exec()
          }, 50)
        })
      }
      if (res.prompt_info != undefined) {
        this.setData({
          prompt_info: res.prompt_info
        })
      }
      let modelData = itemAddKey(shopCarModel.getModelArray(res))
      // console.log(JSON.stringify(modelData))
      this.updataData(modelData)
      this.requestShopCarCount()
      wx.stopPullDownRefresh()
      this.setData({
        loading: false
      })
    }, error => {
      this.setData({
        loading: false,
        firstRequestFlag:true
      })
    });

  },
  /**
   * 请求购物车角标,设置tab角标
   */
  requestShopCarCount: function () {
    let that = this;
    shopCarApi.getShopCarCount().then(response => {
      let count = response.cartCount ? response.cartCount : 0
      upadataTabBarCount(count)
    },error=>{
      
    })
  },
  /**
   * 请求推荐商品信息
   */
  requestRecommendMedicine: function () {
    searchApi.getAssociationGoods().then(res => {
      let recommendData = [];
      recommendData = res.map((info) => {
        return getItemModel(info, 'cart_list_recommend')
      })
      this.setData({
        recommendData: recommendData,
      })
    }, error => {
    })
  },
  /**
   * 请求店家满减、满包邮信息
   */
  requestFreepostageAndActivityInfo: function (shopId, price) {
    let priceInShopMap = this.data.priceInShopMap
    priceInShopMap[shopId] = price
    this.setData({
      loading: true,
      priceInShopMap: priceInShopMap,
    })
    shopCarApi.getFreepostageAndActivityInfo(shopId, price).then(res => {
      console.log(JSON.stringify(res))
      this.data.data.some((item) => {
        if (item.shop_id == shopId) {
          for (var key in res) {
            item[key] = res[key];
          }
        }
      })
      this.setData({
        data: this.data.data,
        loading: false
      })
    })
  }

})