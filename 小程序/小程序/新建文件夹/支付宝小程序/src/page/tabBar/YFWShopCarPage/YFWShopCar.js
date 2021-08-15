import Taro, { Component, offAudioInterruptionBegin } from '@tarojs/taro'
import { 
  View, 
  Image,
  Text,
  Input,
  Block
} from '@tarojs/components'
import { AtSwipeAction } from 'taro-ui'
import './YFWShopCar.scss'
import { isNotEmpty, tcpImage, toDecimal, isLogin, itemAddKey, upadataTabBarCount } from '../../../utils/YFWPublicFunction'
import { pushNavigation } from '../../../apis/YFWRouting'
import { ShopCarApi, IndexApi, SearchApi,UserCenterApi } from '../../../apis/index'
import { BaseApi } from '../../../apis/base'
import { YFWShopCarModel } from './YFWShopCarModel'
import { getModel } from '../../../model/YFWCouponModel'
import { getItemModel } from '../../../components/GoodsItemView/model/YFWGoodsItemModel'
import MedicineNameView from '../../../components/YFWMedicineNameView/YFWMedicineNameView'
import YFWPriceView from '../../../components/YFWPriceView/YFWPriceView'
import TitleView from '../../../components/YFWTitleView/YFWTitleView'
import CollectionGoodsItem from '../../../components/GoodsItemView/CollectionGoodsItem'
import YFWCouponModal from '../../../components/YFWCouponModal/YFWCouponModal'
import AuthenTication from '../../../components/YFMauthentication/YFMauthentication'
import { set as setGlobalData, get as getGlobalData } from '../../../global_data'
const indexApi = new IndexApi()
const shopCarApi = new ShopCarApi()
const searchApi = new SearchApi()
const shopcarModel = new YFWShopCarModel()
const baseApi = new BaseApi
const userCenterApi = new UserCenterApi()

export default class YFWShopCar extends Component {

  config = {
    navigationBarTitleText: '购物车',
    enablePullDownRefresh: true,
  }

  constructor (props) {
    super(props)

    this.state = {
      firstRequestFlag:false,
      prompt_info:"",
      activityItem:{},
      dataSource: [],
      recommends: [],
      coupon_list: [],
      coupons: [],
      itemKeySize: 0,
      itemSelectedSize: 0,
      priceTotal: '0.00',
      isLoading: false,
      isAllSelected: false,
      priceInShopMap: {}  //保存店铺内选中商品总价的字典,在requestFreepostageAndActivityInfo和updataData请求时更新
    }
  }

  componentDidMount () { 
    this.isQuantityEdit = false
    this.openSideId = ''
    // this.fetchShopCarData()
    this.fetchRecommendData()
  }

  componentDidShow () {
    if(process.env.TARO_ENV === 'alipay'){
      my.setNavigationBar({
        backgroundColor:'#49ddb8'
    })
  }
    if(isLogin()){
      this.fetchShopCarData()
      //this.fetchShopCarCount()
      //是否展示实名认证
      let certificationFlag = getGlobalData('certificationFlag'),
      certification = getGlobalData('certification');
      if(certificationFlag){
        setGlobalData('certificationFlag',false)
        if(certification == '_unCertification'){
          userCenterApi.getUserAccountInfo().then(res=>{
            if(!res || res.dict_bool_certification != 1){
              this.authenTication.setState({
                isShow:true,
              })
            }else{
              setGlobalData('certification',res.dict_bool_certification)
            }
          })
        }else{
          this.authenTication.setState({
            isShow:certification == 1 ? false:true,
          })
        }
      }
    }


  }

  onPullDownRefresh () {
    this.fetchShopCarData(true)
    this.fetchRecommendData(true)
  }

  /** 获取购物车数据 */
  fetchShopCarData (isPull) {
    const login = isLogin()
    if (login == false) {
      return
    }
    this.setState({
      isLoading: true
    })
    shopCarApi.getShopCarInfo().then(response => {
      if (isPull) {
        Taro.stopPullDownRefresh()
      }

      let modelData = itemAddKey(shopcarModel.getModelArray(response))
      this.updataData(modelData)
      this.fetchShopCarCount() 
      this.setState({
        isLoading: false,
        activityItem:response.note || {},
        prompt_info:response.prompt_info || ''
      })
    }, error => {
      if (isPull) {
        Taro.stopPullDownRefresh()
      }
      this.setState({
        isLoading: false,
        firstRequestFlag:true
      })
    })
  }

  /** 请求店家满减包邮信息 */
  fetchFreepostageAndActivityInfo (shopId, price) {
    let { priceInShopMap } = this.state
    priceInShopMap[shopId] = price
    this.setState({
      isLoading: true,
      priceInShopMap: priceInShopMap,
    })
    shopCarApi.getFreepostageAndActivityInfo(shopId, price).then(res => {
      let { dataSource } = this.state
      dataSource.some((shopCarItem)=>{
        if (shopCarItem.shop_id === shopId){
          for (let key in res) {
            shopCarItem[key] = res[key]
          }
        }
      })
      this.setState({
        dataSource: dataSource,
        isLoading: false
      })
    }, error => {
      this.setState({
        isLoading: false
      })
    })
  }

  /** 请求购物车数量 */
  fetchShopCarCount () {
    shopCarApi.getShopCarCount().then(response => {
      const count = response.cartCount || 0
      if(process.env.TARO_ENV != 'tt'){
        upadataTabBarCount(count)
      }else{
        const badge = count === 0 ? '' : (count > 99 ? '99+' : count.toString())
        Taro.setTabBarBadge({
          index: 2,
          text: badge
        })
      }
      this.setState({
        isLoading: false
      })
    }, error => {
      this.setState({
        isLoading: false
      })
    })
  }
  goToPay(){
    const { itemSelectedSize } = this.state
    if (itemSelectedSize === 0) {
      Taro.showToast({
        title: '请至少选择一件商品, 才能结算',
        icon: 'none',
        duration: 2000,
      })
      return false;
    }

    let medicineIds = []
    let packageIds = []
    let notBuyCount = 0
    const { dataSource } = this.state
    const checkDataArray = dataSource
    for (let i = 0; i < checkDataArray.length; i++) {
      if (checkDataArray[i].cart_items) {
        for (let j = 0; j < checkDataArray[i].cart_items.length; j++) {
          if (checkDataArray[i].cart_items[j].type == 'medicines') {
            /** 单品 */
            for (let k = 0; k < checkDataArray[i].cart_items[j].medicines.length; k++) {
              if (checkDataArray[i].cart_items[j].medicines[k].dict_store_medicine_status > 0) {
                const item = checkDataArray[i].cart_items[j].medicines[k]//浅拷贝防止影响页面数据
                if (item['checked']) {
                  medicineIds.push(item.id)
                }
              }
            }
          } else {
            /**套装 或 疗程装 */
            const packageItem = checkDataArray[i].cart_items[j]
            if (packageItem['checked']) {
              packageIds.push(packageItem.package_id)
            }
          }
        }
      }
    }
    
    pushNavigation('get_settlement', { medicineIds: medicineIds, packageIds: packageIds })
  }
  /** 获取推荐商品 */
  fetchRecommendData (isPull) {
    searchApi.getAssociationGoods().then(response => {
      let recommendData = []
      recommendData = response.map((info) => {
        return getItemModel(info, 'cart_list_recommend')
      })
      if (isPull) {
        Taro.stopPullDownRefresh()
      }
      this.setState({
        recommends: recommendData,
        isLoading: false
      })
    }, error => {
      if (isPull) {
        Taro.stopPullDownRefresh()
      }
      this.setState({
        isLoading: false
      })
    })
  }

  /** 更新商品数量 */
  fetchUpdateMedicinQuantity (dataItem, quantity) {
    const { isLoading } = this.state
    if (isLoading) {
      return
    }
    this.setState({
      isLoading: true
    })

    if (dataItem.type === 'medicine') {
      shopCarApi.changeCarGoodsQuantity(dataItem.id, quantity).then(response => {
        this.setState({
          isLoading: false
        })
        this.upadataCount(dataItem, quantity, true)
      }, error => {
        this.setState({
          isLoading: false
        })
        Taro.showToast({
          title: error.msg,
          icon: 'none',
          duration: 2000
        })
        this.upadataCount(dataItem, quantity, false)
      })
    } else {
      shopCarApi.changeCarPackageQuantity(dataItem.id, quantity).then(response => {
        this.setState({
          isLoading: false
        })
        this.upadataCount(dataItem, quantity, true)
      }, error => {
        this.setState({
          isLoading: false
        })
        Taro.showToast({
          title: error.msg,
          icon: 'none',
          duration: 2000
        })
        this.upadataCount(dataItem, quantity, false)
      })
    }
  }

  /**
   * 本地更新单个商品或套餐数量，为了去除后台返回数据顺序改变导致的列表改变。只能在接口成功后调用。
   * changeItem ： 单个商品或套餐数据
   * count ： 更新后的数量
   * type : 是否更新成功
   */
  upadataCount(changeItem, count, type) {
    let { itemSelectedSize } = this.state
    let { priceTotal } = this.state
    let price = Number.parseFloat(priceTotal)
    let changed = false  
    let { dataSource } = this.state
    dataSource.some((shopcarItem) => {
      let priceInShop = 0
      shopcarItem.cart_items.some((packageItem) => {
        if (packageItem.type == "medicines") {
          packageItem.medicines.some((medicineItem) => {
            if (medicineItem.id == changeItem.id && changeItem.type == medicineItem.type) {
              changed = true
              //更新数据中的数量和价格
              if(!type){
                let min;
                if(medicineItem.limit_buy_qty&&medicineItem.reserve){
                  min = medicineItem.limit_buy_qty - medicineItem.reserve>0 ? medicineItem.reserve : medicineItem.limit_buy_qty
                }else{
                  min = medicineItem.limit_buy_qty || medicineItem.reserve
                }
                count = count > min ? min :count;
              }
              if (medicineItem.checked) {
                itemSelectedSize = parseInt(itemSelectedSize) - medicineItem.quantity + count
                price = price - (medicineItem.quantity - count) * Number.parseFloat(medicineItem.price)
              }
              medicineItem.quantity = count
            }
            if (medicineItem.checked) {
              priceInShop = priceInShop + medicineItem.quantity * Number.parseFloat(medicineItem.price_old)
            }
          })
        } else {
          if (packageItem.id == changeItem.id && changeItem.type == packageItem.type) {
            changed = true
            if(!type){
              if(packageItem.type == 'courseOfTreatment'){
                let reserve = packageItem.package_medicines[0].reserve,limit = packageItem.package_medicines[0].limit_buy_qty,smpd_amout = packageItem.package_medicines[0].smpd_amout || 1;
                const ratio1 = Math.floor(reserve/smpd_amout),ratio2 =(limit == null || !limit) ? null : Math.floor(limit/smpd_amout);
                let _reserve;
                if(ratio2 == null){
                  _reserve = ratio1
                }else{
                  _reserve = ratio1 >= ratio2 ? ratio2:ratio1
                }
                count = count > _reserve ? _reserve : count
              }else{
                count =1;
              }
            }
            //更新数据中的数量和价格
            if (packageItem.checked) {
              price = price - (packageItem.quantity - count) * Number.parseFloat(packageItem.price_old)
            }
            packageItem.package_medicines.map((medicine) => {
              let medicine_quantity_after = medicine.quantity / packageItem.quantity * count
              if (packageItem.checked) {
                itemSelectedSize = parseInt(itemSelectedSize) - medicine.quantity + medicine_quantity_after
              }
              medicine.quantity = medicine_quantity_after
            })
            packageItem.quantity = count
            packageItem.price = packageItem.quantity * Number.parseFloat(packageItem.price_old)
          }
          if (packageItem.checked) {
            priceInShop = priceInShop + packageItem.quantity * Number.parseFloat(packageItem.price_old)
          }
        }
      })
      //请求更新活动满减信息
      if(changed && type){
        this.fetchFreepostageAndActivityInfo(shopcarItem.shop_id, priceInShop)
      }
      return changed //如果已经找到, return true 提前跳出循环
    })
    console.log(dataSource)
    this.setState({
      dataSource: dataSource,
      itemSelectedSize: itemSelectedSize,
      priceTotal: toDecimal(price),
    })

    //刷新tab角标
    if (type) {
      this.fetchShopCarCount()
    } 
  }

  /** 服务器请求数据回来后增量更新本地数据 */
  updataData(modelData) {
    let dataMap = this.getDataMap() //将更新前的数据选中情况转化成map
    let itemSelectedSize = 0
    let price = 0
    let itemKeySize = 0
    modelData.map((shopItem) => {
      if (shopItem.cart_items) {
        shopItem['checked'] = false
        if (dataMap[shopItem.shop_id]) {
          shopItem['checked'] = dataMap[shopItem.shop_id]['checked'];
        }
        let priceInShop = 0
        shopItem.cart_items.map((cartItem) => {
          if (cartItem.type == 'medicines') {
            /** 单品 */
            cartItem.medicines.map((medicineItem) => {
              if (medicineItem.dict_store_medicine_status > 0) {
                //如果商品已存在选中状态不变，若不在默认选中
                var checked = false
                if (dataMap[shopItem.shop_id]
                && dataMap[shopItem.shop_id]['medicines'] 
                && dataMap[shopItem.shop_id]['medicines'][medicineItem.shop_goods_id]) {
                  checked = dataMap[shopItem.shop_id]['medicines'][medicineItem.shop_goods_id].checked
                }
                medicineItem['checked'] = checked
                //统计数据
                if (medicineItem['checked']) {
                  price = price + Number.parseFloat(medicineItem.price) * medicineItem.quantity //计算价格用于显示合计金额
                  priceInShop = priceInShop + Number.parseFloat(medicineItem.price_old) * medicineItem.quantity //计算店内价格用于请求满减活动信息
                  itemSelectedSize = itemSelectedSize + medicineItem.quantity //计算商品数量用于显示结算（XX）
                } else {
                  shopItem['checked'] = false
                }
                itemKeySize++ //计算商品数量用于显示购物车（XX）
              }
            })
          } else {
            /**套装 或 疗程装 */
            var packageItem = cartItem
            //如果套装已存在选中状态不变，若不在默认选中
            var checked = false
            if (dataMap[shopItem.shop_id]
              && dataMap[shopItem.shop_id][packageItem.type]
              && dataMap[shopItem.shop_id][packageItem.type][packageItem.id]) {
              checked = dataMap[shopItem.shop_id][packageItem.type][packageItem.id].checked
            }
            packageItem['checked'] = checked
            //统计数据
            if (packageItem['checked']) {
              price = price + Number.parseFloat(packageItem.price)
              priceInShop = priceInShop + Number.parseFloat(packageItem.price_old) * packageItem.quantity
              packageItem.package_medicines.map((medicine) => {
                itemSelectedSize = itemSelectedSize + medicine.quantity
              })
            } else {
              shopItem['checked'] = false
            }
            itemKeySize++
          }
        })
        //店内商品未全选，单独请求满减信息
        if (!shopItem['checked']) {
          let _obj = this.state.dataSource.filter(item=>item.shop_id == shopItem.shop_id)
          if(_obj&&_obj[0]){
            shopItem.freepostage = _obj[0].freepostage
          }
          this.fetchFreepostageAndActivityInfo(shopItem.shop_id, priceInShop)
        } else {
          let { priceInShopMap } = this.state
          priceInShopMap[shopItem.shop_id] = priceInShop
          this.setState({
            priceInShopMap: priceInShopMap
          })
        }
      }
    })

    this.setState({
      dataSource: modelData,
      priceTotal: toDecimal(price),
      itemKeySize: itemKeySize,
      itemSelectedSize: itemSelectedSize,
      firstRequestFlag:true,
    })
    //刷新tab角标
  }

  /** 生成本地数据字典， 记录选择情况，在updataData使用 */
  getDataMap () {
    let allGoods = {}
    let { dataSource } = this.state
    for (let i = 0; i < dataSource.length; i++) {
      if (dataSource[i].cart_items) {
        allGoods[dataSource[i].shop_id] = {}
        allGoods[dataSource[i].shop_id]['checked'] = dataSource[i]['checked']
        for (let j = 0; j < dataSource[i].cart_items.length; j++) {
          if (dataSource[i].cart_items[j].type == 'medicines') {
            allGoods[dataSource[i].shop_id]['medicines'] = {}
            for (let k = 0; k < dataSource[i].cart_items[j].medicines.length; k++) {
              if (dataSource[i].cart_items[j].medicines[k].dict_store_medicine_status > 0) {
                var item = dataSource[i].cart_items[j].medicines[k]
                allGoods[dataSource[i].shop_id]['medicines'][item.shop_goods_id] = item
              }
            }
          } else {
            var packageItem = dataSource[i].cart_items[j]
            if (!allGoods[dataSource[i].shop_id][packageItem.type]) {
              allGoods[dataSource[i].shop_id][packageItem.type] = {}
            }
            allGoods[dataSource[i].shop_id][packageItem.type][packageItem.id] = packageItem
          }
        }
      }
    }
    return allGoods
  }
  activityRedirect(){
    pushNavigation('receive_h5', {
      value: this.state.activityItem.url
    })
  }
  AuthenCompant = (modal) => this.authenTication = modal
  render () {
    const { dataSource } = this.state
    const { coupon_list } = this.state
    const { isLoading,activityItem,prompt_info,firstRequestFlag } = this.state
    const showEmpty = dataSource.length === 0

    return (
      <View className='shopcar'>
        {activityItem.content&&(
          // <!-- 头部广告区域 -->
          <View className="activity">
            <View style="flex-shrink:0">  
              <Image src={activityItem.img_url} style={'height:'+(activityItem.img_height || 0)+'rpx;width:'+(activityItem.img_width || 0)+'rpx;margin-left:14rpx;margin-right:6rpx'}></Image>
            </View>
            <Text className="activityText">{activityItem.content}</Text>
            {activityItem.url &&<Image src={require('../../../images/icon_arrow_y.png')} className="activity_arrow"  onClick={this.activityRedirect}></Image> }
              
          </View>
        )}
        {showEmpty && this.renderEmptyView()}
        {dataSource.map((shopcarItem, shopcarIndex) => {
          return this.renderStoreCell(shopcarItem, shopcarIndex)
        })}
        {this.renderRecommendTitle()}
        {this.renderRecommendList()}
        {dataSource.length>0&&this.renderBottomActionView()}
        {this.renderBottomSpaceView()}
        {isLoading && this.renderLoadingView()}
        {/* <!-- 底部提示 --> */}
        {prompt_info&&firstRequestFlag&&<View className="promit">{prompt_info}</View>}
        <AuthenTication ref={this.AuthenCompant} />
      </View>
    )
  }

  /** 渲染购物车商店cell */
  renderStoreCell (shopcarItem, shopcarIndex) {
    return(
      <View className='shopcar-store-cell'>
        {this.renderStoreAndCouponView(shopcarItem, shopcarIndex)}
        {this.renderStoreActivity(shopcarItem)}
        {shopcarItem.cart_items.map(packageItem => {
          return this.renderPackageMedicineCell(packageItem)
        })}
      </View>
    )
  }

  /** 渲染药店名称、领券 */
  renderStoreAndCouponView (shopcarItem, shopcarIndex) {
    return(
      <View className='shopcar-row'>
        {this.renderCheckBoxButton('store', shopcarItem)}
        <View className='shopcar-store-name-view shopcar-row shopcar-align-center' onClick={this.onStoreNameClick.bind(this, shopcarItem)}>
          <Text className='shopcar-store-name shopcar-dark-text shopcar-15-text shopcar-bold-text'>{shopcarItem.shop_title}</Text>
        </View>
        {shopcarItem.isShowCoupon
          && <View className='shopcar-store-coupon shopcar-row shopcar-align-center' onClick={this.onStoreCouponClick.bind(this, shopcarItem, shopcarIndex)}>
              <Text className='shopcar-yellow-text shopcar-12-text'>领券</Text>
            </View>
        }
        {shopcarItem.isShowCoupon && <YFWCouponModal coupons={shopcarItem.coupons_list} isOpened={shopcarItem.openCoupon} onClose={this.onStoreCouponClose.bind(this, shopcarItem, shopcarIndex)} />}
      </View>
    )
  }

  /** 渲染药店活动 */
  renderStoreActivity (shopcarItem) {
    if (shopcarItem.add_on.length > 0 || shopcarItem.freepostage.length > 0 ) {
      return(
        <View className='shopcar-store-activity shopcar-row'>
          <View className='shopcar-bottom-10'>
            {shopcarItem.add_on.length > 0 
              && <View className='shopcar-store-activity-item shopcar-row'>
                  <Text className='shopcar-store-activity-item-title shopcar-yellow-back'>满减</Text>
                  <Text className='shopcar-store-activity-item-content shopcar-normal-text shopcar-12-text'>{shopcarItem.add_on}</Text>
                </View>
            }
            {shopcarItem.freepostage.length > 0 
              && <View className='shopcar-store-activity-item shopcar-row'>
                  <Text className='shopcar-store-activity-item-title shopcar-blue-back'>包邮</Text>
                  <Text className='shopcar-store-activity-item-content shopcar-normal-text shopcar-12-text'>{shopcarItem.freepostage}</Text>
                </View>
            }
          </View>
          {(shopcarItem.add_on_isshow === '1' || shopcarItem.freepostage_isshow === '1') 
            && <View className='shopcar-store-activity-button shopcar-row shopcar-align-center' onClick={this.onStoreActivityClick.bind(this, shopcarItem)}>
                <Text className='shopcar-yellow-text shopcar-12-text'>去凑单</Text>
              </View>
          }
        </View>
      )
    }
  }

  /** 渲染套装cell */
  renderPackageMedicineCell (packageItem) {
    const isPackage = packageItem.type !== 'medicines'
    const packageName= packageItem.type === 'package' ? '套餐' : '疗程装'
    const packageClass = packageItem.type === 'package' ? 'shopcar-red-back' : 'shopcar-light-blue-back'

    return(
      <View>
        {!isPackage && <View className='shopcar-package-item'>
          {packageItem.medicines.map((medicineItem,index) => {
            return(
              <AtSwipeAction 
                onClick={this.onAtSwipeActionClick.bind(this, medicineItem)}
                onOpened={this.onAtSwipeActionOpen.bind(this, medicineItem)}
                onClosed={this.onAtSwipeActionClose.bind(this, medicineItem)}
                key={medicineItem.id+''+index}
                isOpened={medicineItem.isOpen}
                autoClose={true}
                options={[
                {
                  text: '移入收藏',
                  style: {
                    backgroundColor: '#a1a1a1',
                    width: '10vw',
                    justifyContent: 'center'
                  },
                },
                {
                  text: '删除',
                  style: {
                    backgroundColor: '#ff3300',
                    width: '10vw',
                    justifyContent: 'center'
                  }
                }
              ]}>
                <View className='shopcar-row shopcar-align-center'>
                  {this.renderCheckBoxButton('medicine', medicineItem)}
                  {this.renderMedicineCell(medicineItem, isPackage)}
                </View>
              </AtSwipeAction>
            )
          })}
        </View>}
        {isPackage && <View className='shopcar-package-item'>
          <AtSwipeAction 
            onClick={this.onAtSwipeActionClick.bind(this, packageItem)}
            onOpened={this.onAtSwipeActionOpen.bind(this, packageItem)}
            onClosed={this.onAtSwipeActionClose.bind(this, packageItem)}
            key={packageItem.id}
            isOpened={packageItem.isOpen}
            autoClose={true}
            options={[
            {
              text: '移入收藏',
              style: {
                backgroundColor: '#a1a1a1',
                width: '10vw',
                justifyContent: 'center'
              },
            },
            {
              text: '删除',
              style: {
                backgroundColor: '#ff3300',
                width: '10vw',
                justifyContent: 'center'
              }
            }
          ]}>
            <View className='shopcar-row shopcar-align-center'>
              {this.renderCheckBoxButton('medicine', packageItem)}
              <View>
                {packageItem.package_medicines.map(medicineItem => {
                  return this.renderMedicineCell(medicineItem, isPackage)
                })}
              </View>
            </View>
          </AtSwipeAction>
          {isPackage && <View className='shopcar-package-bottom shopcar-column shopcar-align-end'>
            <View className='shopcar-row shopcar-align-center'>
              <View className={'shopcar-package-type '+packageClass}>{packageName}</View>
              <Text className='shopcar-package-name shopcar-dark-text shopcar-12-text'>{packageItem.package_name}</Text>
              {this.renderQuantityView(packageItem, isPackage)}
            </View>
            <View className='shopcar-padding-5 shopcar-row shopcar-align-end shopcar-content-end shopcar-line-height-15'>
              <Text className='shopcar-dark-text shopcar-12-text'>合计：</Text>
              <YFWPriceView price={packageItem.price} fontSize={26} />
            </View>
          </View>}
        </View>}
      </View>
    )
  }

  /** 渲染药品cell */
  renderMedicineCell (medicineItem, isPackage) {
    const priceColor = isPackage ? '#999999' : '#ff3300'
    const price = isPackage ? medicineItem.price : medicineItem.price_old
    return(
      <View className='shopcar-medicine-view shopcar-row'>
        <Image className='shopcar-medicine-image' src={medicineItem.img_url} onClick={this.onMedicineClick.bind(this, medicineItem)} />
        <View className='shopcar-medicine-center shopcar-column' onClick={this.onMedicineClick.bind(this, medicineItem)}>
          <MedicineNameView medicineType={parseInt(medicineItem.PrescriptionType)} name={medicineItem.title} fontSize={26} fontWeight='bold' />
          <Text className='shopcar-light-text shopcar-10-text shopcar-top-5'>{medicineItem.standard}</Text>
        </View>
        <View className='shopcar-medicine-right shopcar-column shopcar-align-end'>
          <View className='shopcar-right-price shopcar-column shopcar-align-end' onClick={this.onMedicineClick.bind(this, medicineItem)}>
            <YFWPriceView price={price} fontSize={26} color={priceColor} />
            {medicineItem.discount && <Text className='shopcar-red-text shopcar-10-text'>{medicineItem.discount}</Text>}
            {isPackage && <Text className='shopcar-light-text shopcar-10-text'>{'x'+medicineItem.quantity}</Text>}
          </View>
          {!isPackage && this.renderQuantityView(medicineItem, isPackage)}
        </View>
      </View>
    )
  }

  /** 渲染选择框 */
  renderCheckBoxButton (type, dataItem) {
    const icon = dataItem.checked ? require('../../../images/icon_choose.png') : require('../../../images/icon_unchoose.png')
    return(
      <View className='shopcar-check-button shopcar-row shopcar-align-center shopcar-content-center' onClick={this.onCheckBoxClick.bind(this, type, dataItem)}>
        <Image className='shopcar-check-icon' src={icon} />
      </View>
    )
  }

  /** 渲染数量加减View */
  renderQuantityView (dataItem, isPackage) {

    return(
      <View className='shopcar-package-quantity-view shopcar-row'>
        <Text className='shopcar-package-quantity-sa' onClick={this.onSubQuantityClick.bind(this, dataItem)}>-</Text>
        <Input 
          className='shopcar-package-quantity' 
          value={dataItem.quantity} 
          type='number' 
          maxLength={5}
          confirmType='done'
          onFocus={ () => this.isQuantityEdit = true }
          onInput={this.onEditQuantityClick.bind(this, dataItem)}
          onBlur={this.onEditQuantityEnd.bind(this, dataItem)}
        />
        <Text className='shopcar-package-quantity-sa' onClick={this.onAddQuantityClick.bind(this, dataItem)}>+</Text>
      </View>
    )
  }

  /** 渲染推荐title */
  renderRecommendTitle () {
    return(
      <View className='shopcar-row shopcar-align-center shopcar-content-center shopcar-bottom-10 shopcar-padding-5'>
        <TitleView title={'精选商品'} fontWeight="700" />
      </View>
    )
  }

  /** 渲染推荐商品 */
  renderRecommendList () {
    const { recommends } = this.state

    return(
      <View className='shopcar-row shopcar-wrap'>
        {recommends.length > 0 && recommends.map(recommendItem => {
          return(
            <View className='shopcar-recommend-item'>
              <CollectionGoodsItem data={recommendItem} showcar={false} showstanders={true} showstore={true} />
            </View>
          )
        })}
      </View>
    )
  }

  /** 渲染底部操作按钮 */
  renderBottomActionView () {
    const { isAllSelected } = this.state
    const { itemSelectedSize } = this.state
    const { priceTotal } = this.state
    const priceArray = priceTotal.split('.')
    const intergeP = priceArray[0]
    const floatP = priceArray[1]
    const icon = isAllSelected ? require('../../../images/icon_choose.png') : require('../../../images/icon_unchoose.png')

    return(
      <View className='shopcar-bottom-action shopcar-row'>
        <View className='shopcar-bottom-left shopcar-row shopcar-align-center' onClick={this.onCheckBoxAllClick.bind(this)}>
          <View className='shopcar-check-button shopcar-row shopcar-align-center shopcar-content-center'>
            <Image className='shopcar-check-icon' src={icon} />
          </View>
          <Text className='shopcar-dark-text shopcar-13-text shopcar-bold-text'>全选</Text>
        </View>
        <View className='shopcar-bottom-center shopcar-column shopcar-content-center'>
          <View>
            <Text className='shopcar-dark-text shopcar-14-text shopcar-bold-text shopcar-top-2'>合计：</Text>
            <Text className='shopcar-red-text shopcar-12-text shopcar-bold-text'>¥</Text>
            <Text className='shopcar-red-text shopcar-15-text shopcar-bold-text'>{intergeP}.</Text>
            <Text className='shopcar-red-text shopcar-12-text shopcar-bold-text'>{floatP}</Text>
          </View>
          <Text className='shopcar-light-text shopcar-12-text'>不含包装费邮费</Text>
        </View>
        <View className='shopcar-bottom-right shopcar-row shopcar-align-center shopcar-content-center' onClick={this.onSettlementClick.bind(this)}>
          <Text className='shopcar-white-text shopcar-15-text shopcar-bold-text'>{'结算('+itemSelectedSize+')'}</Text>
        </View>
      </View>
    )
  }

  /** 渲染底部占位 */
  renderBottomSpaceView () {
    return <View className='shopcar-height-50' />
  }

  /** 渲染loading */
  renderLoadingView () {
    return(
      <View className='shopcar-loading' onTouchMove={(e) => {e.stopPropagation()}}>
        <Image className='shopcar-loading-icon' src={require('../../../images/loading_cycle.gif')} mode='widthFix' />
      </View>
    )
  }

  /** 渲染购物车空页面 */
  renderEmptyView () {
    const login = isLogin()
    const btnName = login ? '去首页看看' : '登录'
    return(
      <View className='shopcar-empty-view shopcar-column shopcar-content-center shopcar-align-center'>
        <Image className='shopcar-empty-image' src='https://c1.yaofangwang.net/common/images/miniapp/ic_no_shopcar.png' mode='widthFix' />
        <Text className='shopcar-light-text shopcar-13-text'>您的购物车是空的</Text>
        {/* {!login && <Text className='shopcar-light-text shopcar-13-text shopcar-top-10'>登录后即可同步您的购物车商品</Text>} */}
        <View className='shopcar-empty-button shopcar-column shopcar-content-center shopcar-align-center shopcar-top-10' onClick={this.onEmptyButtonClick.bind(this, btnName)}>
          <Text className='shopcar-green-text shopcar-13-text'>{btnName}</Text>
        </View>
      </View>
    )
  }

  /** 点击结算 */
  onSettlementClick () {
    let certification = getGlobalData('certification');
    if(certification == '_unCertification'){
      userCenterApi.getUserAccountInfo().then(res=>{
        if(!res || res.dict_bool_certification != 1){
          this.authenTication.setState({
            isShow:true,
          })
        }else{
          setGlobalData('certification',res.dict_bool_certification)
          this.goToPay()
        }
      })
    }else{
      this.authenTication.setState({
        isShow:certification == 1 ? false:true,
      })
      if(certification != 1){
        return false;
      }else{
        this.goToPay()
      }
    }
  }


  /** 左滑栏事件点击 */
  onAtSwipeActionClick (dataItem, event) {
    const title = event.text
    if (title === '移入收藏') {
      this.onAtSwipeActionClickCollection(dataItem)
    } else {
      this.onAtSwipeActionClickDelete(dataItem)
    }
  }

  /** 左滑栏收藏按钮点击 */
  onAtSwipeActionClickCollection (dataItem) {
    let collectionItems = []
    if (isNotEmpty(dataItem.package_medicines)) {
      dataItem.package_medicines.map(medicineItem => {
        collectionItems.push(medicineItem.id)
      })
    } else {
      collectionItems.push(dataItem.id)
    }
    this.setState({ isLoading: true })

    shopCarApi.moveGoodsToFavorite(collectionItems).then(response => {
      this.setState({ isLoading: false })
      Taro.showToast({
        title: '收藏成功',
        icon: 'none',
        duration: 2000
      })

      this.fetchShopCarData()

    }, error => {
      Taro.showToast({
        title: error.msg,
        icon: 'none',
        duration: 2000
      })
      this.setState({ isLoading: false })
    })
  }

  /** 左滑栏删除按钮点击 */
  onAtSwipeActionClickDelete (dataItem) {
    let goodsItems = []
    let packageItems = []
    if (dataItem.type === 'medicine') {
      goodsItems.push(dataItem.id)
    } else {
      packageItems.push(dataItem.id)
    }
    this.setState({ isLoading: true })

    shopCarApi.delectGoodsFromShopCar(String(goodsItems), String(packageItems)).then(response => {
      this.setState({ isLoading: false })
      Taro.showToast({
        title: '删除成功',
        icon: 'none',
        duration: 2000
      })

      this.fetchShopCarData()
    }, error => {
      Taro.showToast({
        title: error.msg,
        icon: 'none',
        duration: 2000
      })
      this.setState({ isLoading: false })
    })
  }

  /** 左滑栏打开 */
  onAtSwipeActionOpen (dataItem) {
    if (this.openSideId !== dataItem.id) {
      this.openSideId = dataItem.id
      this.openActionItem && (this.openActionItem.isOpen = false)
      dataItem.isOpen = true
      this.openActionItem = dataItem
      this.setState({})
    }
  }

  /** 左滑栏关闭 */
  onAtSwipeActionClose (dataItem) {
    this.openSideId = ''
    dataItem.isOpen = false
    this.setState({})
  }

  /** 购物车为空时点击空页面按钮 */
  onEmptyButtonClick (btnName) {
    if (btnName === '登录') {
      pushNavigation('get_author_login')
    } else {
      pushNavigation('get_home')
    }
  }

  /** 点击药店名称进入商店 */
  onStoreNameClick (shopcarItem) {
    pushNavigation('get_shop_detail', { value: shopcarItem.shop_id })
  }

  /** 点击商品进入商品详情 */
  onMedicineClick (medicineItem) {
    pushNavigation('get_shop_goods_detail', { value: medicineItem.shop_goods_id })
  }

  /** 点击领券 */
  onStoreCouponClick (shopcarItem, shopcarIndex) {
    let { dataSource } = this.state
    let shopItem = shopcarItem
    shopItem.openCoupon = true
    dataSource[shopcarIndex] = shopItem
    this.setState({
      dataSource: dataSource
    })
  }

  /** 优惠券弹窗关闭 */
  onStoreCouponClose (shopcarItem, shopcarIndex) {
    let { dataSource } = this.state
    let shopItem = shopcarItem
    shopItem.openCoupon = false
    dataSource[shopcarIndex] = shopItem
    this.setState({
      dataSource: dataSource
    })
  }

  /** 点击凑单 */
  onStoreActivityClick (shopcarItem) {
    const { priceInShopMap } = this.state
    const shopId = shopcarItem.shop_id
    pushNavigation('get_shop_detail_list', { value: shopId, from: 'shopcar', price: priceInShopMap[shopId] })
  }

  /** 点击增加商品数量 */
  onAddQuantityClick (medicineItem) {
    if (this.isQuantityEdit === true) {
      return
    }
    let quantity = medicineItem.quantity + 1
    if (quantity > medicineItem.reserve) {
      return
    }
    this.fetchUpdateMedicinQuantity(medicineItem, quantity)
  }

  /** 点击减少商品数量 */
  onSubQuantityClick (medicineItem) {
    if (this.isQuantityEdit === true) {
      return
    }

    let quantity = medicineItem.quantity - 1
    if (quantity === 0) {
      return
    }
    this.fetchUpdateMedicinQuantity(medicineItem, quantity)
  }

  /** 点击编辑商品数量 */
  onEditQuantityClick (medicineItem ,event) {
    //更新数据
    this.upadataCount(medicineItem,event.detail.value,true)

  }

  /** 编辑商品数量结束 */
  onEditQuantityEnd (medicineItem, event) {
    this.isQuantityEdit = false
    let value = Number.parseInt(event.detail.value)
    if (value !== medicineItem.quantity) {
      medicineItem.quantity = value
      this.fetchUpdateMedicinQuantity(medicineItem, value)
    }
    // return value
  }

  /** 选择框点击事件 */
  onCheckBoxClick (type, dataItem) {
    if (type === 'store') {
      this.onStoreCheck(dataItem)
    } else {
      this.onMedicineCheck(dataItem)
    }
  }

  /** 商店check事件 */
  onStoreCheck (dataItem) {
    let cilckShopItemKey = dataItem.key 
    const { dataSource } = this.state
    let checkDataArray = dataSource
    let itemSelectedSize = 0
    let price = 0
    let isAllSelected = true
    for (let i = 0; i < checkDataArray.length; i++) {
      if (checkDataArray[i].cart_items) {
        let priceInShop = 0
        if (cilckShopItemKey === checkDataArray[i].key){
          checkDataArray[i]['checked'] = !checkDataArray[i]['checked']
        }
        for (let j = 0; j < checkDataArray[i].cart_items.length; j++) {
          if (checkDataArray[i].cart_items[j].type === 'medicines') {
            /** 单品 */
            for (let k = 0; k < checkDataArray[i].cart_items[j].medicines.length; k++) {
              if (checkDataArray[i].cart_items[j].medicines[k].dict_store_medicine_status > 0) {
                var item = checkDataArray[i].cart_items[j].medicines[k]
                if (cilckShopItemKey == checkDataArray[i].key) {
                item['checked'] = checkDataArray[i]['checked']
                }
                if (item['checked']) {
                  price = price + Number.parseFloat(item.price) * item.quantity          //计算价格用于显示合计金额
                  priceInShop = priceInShop + Number.parseFloat(item.price_old) * item.quantity //计算店内价格用于请求满减活动信息
                  itemSelectedSize = itemSelectedSize + item.quantity        //计算商品数量用于显示结算（XX）
                } else {
                  checkDataArray[i]['checked'] = false                       //取消店家全选状态
                  isAllSelected = false                                      //取消全选状态
                }
              }
            }
          } else {
            /**套装 或 疗程装 */
            var packageItem = checkDataArray[i].cart_items[j]
            if (cilckShopItemKey == checkDataArray[i].key) {
              packageItem['checked'] = checkDataArray[i]['checked']
            }
            if (packageItem['checked']) {
              price = price + Number.parseFloat(packageItem.price)
              priceInShop = priceInShop + Number.parseFloat(packageItem.price_old) * packageItem.quantity 
              packageItem.package_medicines.map((medicine) => {
                itemSelectedSize = itemSelectedSize + medicine.quantity
              })
            } else {
              checkDataArray[i]['checked'] = false
              isAllSelected = false
            }
          }
        }
        //取消店家全选时,发送请求更新活动和包邮信息
        if (cilckShopItemKey === checkDataArray[i].key) {
          this.fetchFreepostageAndActivityInfo(checkDataArray[i].shop_id, priceInShop)
        }
      }
    }
    this.setState({
      dataSource: checkDataArray,
      isAllSelected: isAllSelected,
      priceTotal: toDecimal(price),
      itemSelectedSize: itemSelectedSize,
    })
  }

  /** 商品check事件 */
  onMedicineCheck (dataItem) {
    let cilckItem = dataItem
    let type = 'medicines'
    const { dataSource } = this.state
    let checkDataArray = dataSource
    let itemSelectedSize = 0
    let price = 0
    let isAllSelected = true
    let itemChanged = false  //点击的选项是否已经改变
    /** 无效商品 */
    if (cilckItem.dict_store_medicine_status <= 0) {
      return
    }
    for (let i = 0; i < checkDataArray.length; i++) {
      if (checkDataArray[i].cart_items) {
        checkDataArray[i]['checked'] = true
        let priceInShop = 0
        for (let j = 0; j < checkDataArray[i].cart_items.length; j++) {
          if (checkDataArray[i].cart_items[j].type === 'medicines') {
            /** 单品 */
            for (let k = 0; k < checkDataArray[i].cart_items[j].medicines.length; k++) {
              if (checkDataArray[i].cart_items[j].medicines[k].dict_store_medicine_status > 0) {
                var item = checkDataArray[i].cart_items[j].medicines[k]
                if (type == 'medicines' && cilckItem.id === item.id) {
                  itemChanged = true                                               //选项改变
                  item['checked'] = !item['checked']
                }
                if (item['checked']) {
                  price = price + Number.parseFloat(item.price) * item.quantity                   //计算价格用于显示合计金额
                  priceInShop = priceInShop + Number.parseFloat(item.price_old) * item.quantity      //计算店内价格用于请求满减活动信息
                  itemSelectedSize = itemSelectedSize + item.quantity             //计算商品数量用于显示结算（XX）
                } else {
                  checkDataArray[i]['checked'] = false                             //取消店家全选状态
                  isAllSelected = false                                           //取消全选状态
                }
              }
            }
          } else {
            /**套装 或 疗程装 */
            var packageItem = checkDataArray[i].cart_items[j]
            if (type == 'medicines' && cilckItem.package_id == packageItem.package_id) {
              itemChanged = true
              packageItem['checked'] = !packageItem['checked']
            }
            if (packageItem['checked']) {
              price = price + Number.parseFloat(packageItem.price)
              priceInShop = priceInShop + Number.parseFloat(packageItem.price_old) * packageItem.quantity
              packageItem.package_medicines.map((medicine) => {
                itemSelectedSize = itemSelectedSize + medicine.quantity
              })
            } else {
              checkDataArray[i]['checked'] = false
              isAllSelected = false
            }
          }
        }
        //商品选择改变时,发送请求更新活动和包邮信息
        if (itemChanged) {
          this.fetchFreepostageAndActivityInfo(checkDataArray[i].shop_id, priceInShop)
          itemChanged = false
        }
      }
    }

    this.setState({
      dataSource: checkDataArray,
      isAllSelected: isAllSelected,
      priceTotal: toDecimal(price),
      itemSelectedSize: itemSelectedSize,
    })
  }

  /** 全选事件 */
  onCheckBoxAllClick () {
    const { isAllSelected } = this.state
    let isSelect = !isAllSelected
    let itemKeySize = 0
    let itemSelectedSize = 0
    const { dataSource } = this.state
    let checkDataArray = dataSource
    let price = 0
    for (let i = 0; i < checkDataArray.length; i++) {
      if (checkDataArray[i].cart_items) {
        checkDataArray[i]['checked'] = isSelect
        let priceInShop = 0
        for (let j = 0; j < checkDataArray[i].cart_items.length; j++) {
          if (checkDataArray[i].cart_items[j].type === 'medicines') {
            /** 单品 */
            for (let k = 0; k < checkDataArray[i].cart_items[j].medicines.length; k++) {
              if (checkDataArray[i].cart_items[j].medicines[k].dict_store_medicine_status > 0) {
                var item = checkDataArray[i].cart_items[j].medicines[k]
                item['checked'] = isSelect
                if (item['checked']){
                  price = price + Number.parseFloat(item.price) * item.quantity        //计算价格用于显示合计金额
                  priceInShop = price + Number.parseFloat(item.price_old) * item.quantity   //计算店内价格用于请求满减活动信息
                  itemSelectedSize = itemSelectedSize + item.quantity      //计算商品数量用于显示结算（XX）
                }
                itemKeySize++                                              //计算商品数量用于显示购物车（XX）
              }
            }
          } else {
            /**套装 或 疗程装 */
            var packageItem = checkDataArray[i].cart_items[j]
            packageItem['checked'] = isSelect
            if (packageItem['checked']) {
              price = price + Number.parseFloat(packageItem.price)
              priceInShop = priceInShop + Number.parseFloat(packageItem.price_old) * packageItem.quantity
              packageItem.package_medicines.map((medicine) => {
                itemSelectedSize = itemSelectedSize + medicine.quantity
              })
            }
            itemKeySize ++
          }
        }
        //更新满减活动和包邮信息
        this.fetchFreepostageAndActivityInfo(checkDataArray[i].shop_id, priceInShop)
      }
    }

    this.setState({
      dataSource: checkDataArray,
      isAllSelected: isSelect,
      priceTotal: toDecimal(price),
      itemKeySize: itemKeySize,
      itemSelectedSize: itemSelectedSize,
    })
  }
}