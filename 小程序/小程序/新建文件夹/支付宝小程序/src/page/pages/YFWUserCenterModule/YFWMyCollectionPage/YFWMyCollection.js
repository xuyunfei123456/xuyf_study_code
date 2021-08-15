import {
  Block,
  View,
  Text,
  ScrollView,
  Swiper,
  SwiperItem,
  Image
} from '@tarojs/components'
import Taro from '@tarojs/taro'
import { UserCenterApi, ShopDetailApi, GoodsDetailApi } from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
const shopDetailApi = new ShopDetailApi()
const goodsDetailApi = new GoodsDetailApi()
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import Priceview from '../../../../components/YFWPriceView/YFWPriceView'
import Titleview from '../../../../components/YFWTitleView/YFWTitleView'
import './YFWMyCollection.scss'

export default class YFWMyCollection extends Taro.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectIndex: 0,
      dataSource: [
        {
          id: 0,
          name: '商品',
          items: []
        },
        {
          id: 1,
          name: '商家',
          items: []
        }
      ],
      firstFlag:true,
      listHeight: 600,
      ratio: 1,
      isEdit: false,
      pageEnd: false,
      pageEndLeft: false,
      pageEndRight: false,
      pageIndexLeft: 1,
      pageIndexRight: 1,
      selectGoods: {},
      selectStore: {},
      isSelectAll: false,
      env_type: process.env.TARO_ENV,
      platform: "",
      isIOStt: false
    }
  }

  envjudge = () => {
    let that = this
    if (this.state.env_type == 'tt' && this.state.platform == 'iOS') {
      that.state.isIOStt = true
    } else {
      that.state.isIOStt = false
    }
  }

  componentWillMount() {
    let that = this
    if (that.state.env_type === 'tt') {
      tt.getSystemInfo({
        success(res) {
          that.state.platform = res.system.slice(0, 3)
          that.envjudge()
        },
        fail(res) {
          console.log(`获取系统信息失败`);
        }
      });
    }
    this.getData()
  }

  toEdit = () => {
    this.setState({
      listHeight: this.state.listHeight - 100,
      isEdit: !this.state.isEdit
    })
  }

  finishEdit = () => {
    this.setState({
      listHeight: this.state.listHeight + 100,
      isEdit: !this.state.isEdit
    })
  }

  showMore = () => {
    let that = this
    let query = Taro.createSelectorQuery()
    query.select('#more_image').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      let bottom = res[0].bottom * that.state.ratio
      that.selectComponent('#moreview').showModal(bottom + 20)
    })
  }

  /**跳转订单列表 */
  toDetail = e => {
    let item = e.currentTarget.dataset.item
    let index = e.currentTarget.dataset.index
    if (index == 1) {
      pushNavigation('get_shop_detail', { value: item.storeId })
    } else {
      pushNavigation('get_shop_goods_detail', { value: item.id })
    }
  }

  itemClick = e => {
    if (this.state.isEdit) {
      let data = e.currentTarget.dataset.item
      let id = parseInt(e.currentTarget.id)
      let isSelect = data.isSelect ? false : true || !data.isSelect
      this.state.dataSource[this.state.selectIndex].items[id].isSelect = isSelect
      this.setState({
        dataSource: this.state.dataSource
      })
      if (this.state.selectIndex == 0) {
        if (isSelect) {
          this.state.selectGoods[data.medicineid + data.storeid] =
            data.medicineid
        } else {
          delete this.state.selectGoods[data.medicineid + data.storeid]
        }
        console.log(this.state.selectGoods)
      } else {
        if (isSelect) {
          this.state.selectStore[data.storeId] = data.storeId
        } else {
          delete this.state.selectStore[data.storeId]
        }
        console.log(this.state.selectStore)
      }
      console.log(this.state.dataSource)
      this.checkSelect()
    } else {
      this.toDetail(e)
    }
  }

  checkSelect = index => {
    let currentIndex = index || this.state.selectIndex
    let currentSelectData =
      currentIndex == 0 ? this.state.selectGoods : this.state.selectStore
    let currentLength = this.state.dataSource[currentIndex].items.length
    if (
      Object.keys(currentSelectData).length == currentLength &&
      Object.keys(currentSelectData).length != 0
    ) {
      this.setState({
        dataSource: this.state.dataSource,
        isSelectAll: true
      })
    } else {
      this.setState({
        dataSource: this.state.dataSource,
        isSelectAll: false
      })
    }
  }

  /**管理 全选 */
  toSelectAll = () => {
    let currentIndex = this.state.selectIndex
    let currentSelectData =
      currentIndex == 0 ? this.state.selectGoods : this.state.selectStore
    let currentData = this.state.dataSource[currentIndex].items
    if (this.state.isSelectAll) {
      currentData.forEach((item, index, array) => {
        item.isSelect = false
      })
      if (currentIndex == 0) {
        this.state.selectGoods = {}
      } else {
        this.state.selectStore = {}
      }
    } else {
      currentData.forEach((item, index, array) => {
        item.isSelect = true
        if (currentIndex == 0) {
          this.state.selectGoods[item.medicineid + item.storeid] =
            item.medicineid
        } else {
          this.state.selectStore[item.storeId] = item.storeId
        }
      })
    }
    this.checkSelect()
  }

   /**顶部点击事件 */
  changeIndex = event => {
    let index = event.currentTarget.dataset.index
    if (index != this.state.selectIndex) {
      this.state.selectIndex = index
      if(this.state.firstFlag){
        this.state.pageEnd = false
        this.state.firstFlag = false;
        this.getData();
      }
      this.state.selectGoods = {}
      this.state.selectStore = {}
      this.checkSelect(index)
    }
  }

  /**侧滑 */
  swiperChangIndex = event => {
    if (event.detail.source == 'touch') {
      this.state.selectIndex= event.detail.current
      if(this.state.firstFlag){
        this.state.pageEnd = false
        this.state.firstFlag = false;
        this.getData();
      }
      this.state.selectGoods = {}
      this.state.selectStore = {}
      this.checkSelect(event.detail.current)
    }
  }

  requestNextPage = e => {
    if (this.state.selectIndex == 0) {
      this.state.pageEnd = this.state.pageEndLeft
    } else {
      this.state.pageEnd = this.state.pageEndRight
    }
    if (!this.state.pageEnd) {
      if (this.state.selectIndex == 0) {
        this.state.pageIndexLeft = this.state.pageIndexLeft + 1
      } else {
        this.state.pageIndexRight = this.state.pageIndexRight + 1
      }
      this.getData()
    } else {
      this.hideLoadingView()
    }
  }

  hideLoadingView = () => {
    this.setState({
      pageEnd: true
    })
  }

  /** 获取收藏列表数据 */
  getData = () => {
    if (this.state.selectIndex == 0) {
      userCenterApi
        .getMyCollectionGoods(this.state.pageIndexLeft)
        .then(response => {
          let data = response.dataList
          if (data.length < 20) {
            this.state.pageEndLeft = true
            this.hideLoadingView()
          }
          if (this.state.pageIndexLeft == 1) {
            this.state.dataSource[0].items = data
          } else {
            data = this.state.dataSource[0].items.concat(data)
          }
          this.state.dataSource[0].items = data
          this.setState({
            dataSource: this.state.dataSource
          })
        })
    } else {
      userCenterApi
        .getMyCollectionShops(this.state.pageIndexRight)
        .then(response => {
          let data = response.dataList
          if (data.length < 20) {
            this.state.pageEndRight = true
            this.hideLoadingView()
          }
          if (this.state.pageIndexRight == 1) {
            this.state.dataSource[1].items = data
          } else {
            data = this.state.dataSource[1].items.concat(data)
          }
          this.state.dataSource[1].items = data
          this.setState({
            dataSource: this.state.dataSource
          })
        })
    }
  }

  /** 删除某条收藏数据 */
  deleteMethod = () => {
    let goodsIds = ''
    let goodsStoreIds = ''
    let storeIds = ''
    let currentSelectData =
      this.state.selectIndex == 0 ? this.state.selectGoods : this.state.selectStore
    Object.entries(currentSelectData).forEach(([key, value], index) => {
      console.log(`${key}: ${value}`)
      if (this.state.selectIndex == 0) {
        let data = key.split(value)
        if (index == 0) {
          goodsIds += value
          goodsStoreIds += data[1]
        } else {
          goodsIds += ',' + value
          goodsStoreIds += ',' + data[1]
        }
      } else {
        if (index == 0) {
          storeIds += value
        } else {
          storeIds += ',' + value
        }
      }
    })
    if (this.state.selectIndex == 0) {
      if (Object.keys(currentSelectData).length == 0) {
        Taro.showToast({
          title: '请至少选择一件商品'
        })
        return
      }
      goodsDetailApi
        .getCancleCollectGoods(goodsIds, goodsStoreIds)
        .then(response => {
          Taro.showToast({
            title: '删除成功'
          })
          this.state.selectGoods={}
         
          this.getData()
        })
    } else {
      if (Object.keys(currentSelectData).length == 0) {
          Taro.showToast({
            title: '请至少选择一个商家'
          })
          return
      }
      shopDetailApi.getCancelCollectShop(storeIds).then(response => {
        Taro.showToast({
          title: '删除成功'
        })
        this.state.selectStore={}
        this.getData()
      })
    }
    this.state.pageEndLeft = false
    this.state.pageEndRight = false
    this.state.pageIndexLeft = 1
    this.state.pageIndexRight = 1
  }
  config = {
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTitleText: '我的收藏',
    navigationBarTextStyle: 'white'
  }

  /**图片处理 */
  getImageUrl(url) {
    if (url.indexOf("default") >= 0) {
      return url
    } else {
      return url + '_300x300.jpg'
    }
  }

  render() {
    const {
      isEdit,
      selectIndex,
      dataSource,
      listHeight,
      data,
      pageEnd,
      isSelectAll,
      env_type,
      platform,
      isIOStt
    } = this.state
    return (
      <View className="container">
        <View className="topView">
          <View className="topViewMore"></View>
          <View className="topTitleView"></View>
          <View className="topViewMore">
            {isEdit ? (
              <Text className="eidt" onClick={this.finishEdit}>
                完成
                
                </Text>
            ) : (
                <Text className="eidt" onClick={this.toEdit}>
                  管理
                </Text>
              )}
          </View>
        </View>
        <View className="goodsView">
          <ScrollView
            className="goodsView-top"
            scrollX="true"
            scrollY="false"
            scrollIntoView={'item-' + selectIndex}>
            {dataSource.map((info, infoindex) => {
              return (
                <Block>
                  <View
                    className="goodsView-top-item"
                    onClick={this.changeIndex}
                    data-index={infoindex}
                    id={'item-' + infoindex}
                  >
                    <Titleview
                      title={info.name}
                      showLine={infoindex == selectIndex}
                    ></Titleview>
                  </View>
                </Block>
              )
            })}
          </ScrollView>
          <View className="separate" id="separateView"></View>
          <Swiper
            current={selectIndex}
            className="goodsView-content"
            onChange={this.swiperChangIndex}>
            {dataSource.map((swiperinfo, swiperIndex) => {
              return (
                <Block>
                  <SwiperItem className={process.env.TARO_ENV == 'alipay'?"":"goodsView-swiper-item-parent"}>
                    <ScrollView
                      className="goodsView-swiper-item"
                      scrollX="false"
                      scrollY="true"
                      onScrollToLower={this.requestNextPage}>
                      {dataSource[swiperIndex].items.map((item, index) => {
                        return (
                          <View
                            className={
                              'listItemView ' +
                              (swiperIndex == 1 ? 'shopItemView' : '')
                            }
                            onClick={this.itemClick}
                            id={index}
                            data-index={swiperIndex}
                            data-item={item}>
                            {isEdit && (
                              <View
                                className={
                                  'bottonView ' +
                                  (swiperIndex == 1 ? 'shopItemView' : '')
                                }>
                                {item.isSelect ? (
                                  <Image
                                    className="bottonItem"
                                    src={require('../../../../images/chooseBtn.png')}
                                  ></Image>
                                ) : (
                                    <Image
                                      className="bottonItem .unselect"
                                      src={require('../../../../images/radio_off.png')}
                                    ></Image>
                                  )}
                              </View>
                            )}
                            <Image
                              className={
                                swiperIndex == 1 ? 'shop_image' : 'goods_image'
                              }
                              src={swiperIndex == 1 ? item.imageUrl : this.getImageUrl(item.imageUrl)}
                            ></Image>
                            <View
                              className={
                                'rightView ' +
                                (swiperIndex == 1 ? 'shopRight' : '')
                              }>
                              <Text
                                className={
                                  swiperIndex == 1 ? 'shop_name' : 'goods_name'
                                }
                                style={
                                  'color:' +
                                  (item.is_invalid == 1 ? '#333333' : '#333333')
                                }>
                                {item.name}
                              </Text>
                              <Text
                                className={
                                  swiperIndex == 1
                                    ? 'shop_address'
                                    : 'goods_shop_name'
                                }
                                style={
                                  'color:' +
                                  (item.is_invalid == 1 ? 'rgb(153, 153, 153)' : 'rgb(153, 153, 153)')
                                }>
                                {swiperIndex == 1
                                  ? item.address
                                  : item.storeName}
                              </Text>
                              {swiperIndex == 0 && (
                                <View className="goods_price">
                                  <Priceview
                                    price={item.price}
                                    fontSize="34"
                                    isInvalid={
                                      item.is_invalid == 1 ? true : false
                                    }
                                    discount={item.goods_discount}
                                  ></Priceview>
                                </View>
                              )}
                            </View>
                          </View>
                        )
                      })}
                      <View className={isIOStt ? "foot-tt" : "foot"} >
                        {(pageEnd ? (
                          false
                        ) : (
                            true
                          )) ? (
                            <View className='loading-more'>
                              <Image
                                src={require('../../../../images/loading_cycle.gif')}
                                className="loading"
                              ></Image>
                              <View className="text">加载更多...</View>
                            </View>
                          ) : (
                            <Text className="text">没有更多了</Text>
                          )}
                      </View>
                    </ScrollView>
                  </SwiperItem>
                </Block>
              )
            })}
          </Swiper>
        </View>
        {isEdit && (
          <View className="editBottomView collection-row">
            <View className="selectAll" onClick={this.toSelectAll}>
              {isSelectAll ? (
                <Image
                  className="bottonItem"
                  src={require('../../../../images/chooseBtn.png')}
                ></Image>
              ) : (
                  <Image
                    className="bottonItem .unselect"
                    src={require('../../../../images/radio_off.png')}
                  ></Image>
                )}
              <Text className="title">全选</Text>
            </View>
            <View className="delete" onClick={this.deleteMethod}>
              <Text className="title">删除</Text>
            </View>
          </View>
        )}
      </View>
    )
  }
}


