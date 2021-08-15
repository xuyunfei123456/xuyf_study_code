import Taro, { Component } from '@tarojs/taro'
import { 
  View, 
  Input,
  Image,
  Text
} from '@tarojs/components'
import './YFWShopDetailAllGoodsList.scss'
import { ShopDetailApi, ShopCarApi } from '../../../../apis/index'
import { getModelArray } from '../../../../components/GoodsItemView/model/YFWGoodsListModel'
import { isNotEmpty } from '../../../../utils/YFWPublicFunction'
import CollectionGoodsItem from '../../../../components/GoodsItemView/CollectionGoodsItem'
import ListGoodsItem from '../../../../components/GoodsItemView/ListGoodsItem'
import YFWFooterRefresh from '../../../../components/YFWFooterRefresh/YFWFooterRefresh'
import { pushNavigation } from '../../../../apis/YFWRouting'
const shopDetailApi = new ShopDetailApi()
const shopCarApi = new ShopCarApi()

export default class YFWShopDetailAllGoodsList extends Component {

  config = {
    navigationBarTitleText: '全部商品'
  }

  constructor (props) {
    super(props)
    this.state = {
      scrollHeight:"",
      storeId: 0,
      fromPage: 'store',
      fliterIndex: 1,
      tableStyle: 'table',
      fliter: [
        {
          id: 1,
          name: '默认',
        },
        {
          id: 2,
          name: '价格',
          increase: true,
          icon: require('../../../../images/order_by_default.png') // order_by_default order_by_plus order_by_minus
        },
        {
          id: 3,
          name: '分类',
          isShow: false,
          icon: require('../../../../images/shop_search_gray.png'), // shop_search_gray shop_search_green
          selectedId: 0,
          category: [
            {
              id: 1,
              name: "中西药品"
            },
            {
              id: 2,
              name: "医疗器械"
            },
            {
              id: 3,
              name: "养生保健"
            },
            {
              id: 4,
              name: "美容护肤"
            },
            {
              id: 5,
              name: "计生用品"
            },
            {
              id: 6,
              name: "中药饮片"
            }
          ]
        },
        {
          id: 4,
          icon: require('../../../../images/YFWStoreModule/medicine_map_gray.png') // medicine_map_gray medicine_list_gray
        },
      ],
      medicineList: [],
      activityData: {
        add_on: '',
        add_on_isshow: '0',
        freepostage: '',
        freepostage_isshow: '1',
      },
      refreshStatus: 'hidden'
    }
  }
  componentWillMount(){
    let sysInfo = Taro.getSystemInfoSync();
    this.state.screenWidth = sysInfo.screenWidth;
    this.state.windowWidth = sysInfo.windowWidth;
    this.state.windowHeight = sysInfo.windowHeight;
    this.state.wratio = sysInfo.windowWidth / 750;
    this.state.scrollHeight = (sysInfo.windowHeight-200* this.state.wratio)/this.state.wratio-20
    this.setState({
      scrollHeight:this.state.scrollHeight
    })
  }
  componentDidMount () {
    const params = this.$router.params.params
    if (isNotEmpty(params)) {
      const value = JSON.parse(decodeURIComponent(params))
      this.state.storeId = value.value || 338958 
      this.state.fromPage = value.from || 'store'
      this.activityPrice = value.price || 0
    }

    this.categoryId = ''
    this.sortType = 'sale_count desc'
    this.keyword = ''
    this.pageIndex = 1
    this.isMoreData = true
    this.isLoading = false

    this.fetchAllMedicineData()
    this.fetchAcitivityData()
  }

  onReachBottom() {
    this.pageIndex++
    this.fetchAllMedicineData()
  }
  onScrollToLower(){
    this.pageIndex++
    this.fetchAllMedicineData()
  }

  /** 获取商品数据 */
  fetchAllMedicineData() {
    if (this.isMoreData === false || this.isLoading === true) {
      return
    }
    const { storeId } = this.state
    this.setState({ refreshStatus: 'loading' })
    this.isLoading = true

    shopDetailApi.getShopGoods(storeId, this.categoryId, this.sortType, this.pageIndex, this.keyword).then(response => {
      this.isLoading = false
      const modelList = getModelArray(response.dataList, 'all_medicine_list')
      let { medicineList } = this.state
      let { isMoreData } = this.state
      if (this.pageIndex === 1) {
        medicineList = modelList
      } else {
        medicineList = medicineList.concat(modelList)
      }

      let status = 'hidden'
      if (modelList.length < 20) {
        this.isMoreData = false
        status = 'nomore'
      } else {
        this.isMoreData = true
        status = 'hidden'
      }

      this.setState({
        medicineList: medicineList,
        refreshStatus: status
      })

    }, error => {
      this.isLoading = false
      if (this.pageIndex > 1) {
        this.pageIndex--
      }

      this.setState({ refreshStatus: 'hidden' })
    })
  }

  /** 获取凑单信息 */
  fetchAcitivityData () {
    const { fromPage } = this.state
    if (fromPage === 'store') {
      return
    }

    const { storeId } = this.state

    shopCarApi.getFreepostageAndActivityInfo(storeId, this.activityPrice).then(response => {
      this.setState({
        activityData: response
      })
    }, error => {

    })
  }

  render () {
    const { tableStyle } = this.state
    const { refreshStatus } = this.state
    return (
      <View className='container back-gray'>
        {this.renderHeaderView()}
        {this.renderSpaceView()}
        {tableStyle === 'table' && this.renderMedicineListView()}
        {tableStyle === 'collection' && this.renderMedicineCollectionView()}
        {this.renderCategoryModal()}
      </View>
    )
  }

  renderHeaderView () {
    const { fromPage } = this.state
    return(
      <View className='store-medicine-header'>
        {this.renderSearchTopView()}
        {this.renderFliterView()}
        {fromPage === 'shopcar' && this.renderActivityView()}
      </View>
    )
  }

  /** 渲染头部搜索 */
  renderSearchTopView () {
    return(
      <View className='flex-row flex-content-between flex-align-center width-screen height-50 back-green'>
        <View className='store-medicine-search flex-row flex-align-center'>
          <Image className='store-medicine-search-icon' src={require('../../../../images/YFWStoreModule/top_bar_search.png')} />
          <Input 
            className='store-medicine-search-input' 
            placeholder='搜索店铺内商品'
            confirmType='search'
            onInput={e => this.keyword = e.detail.value}
            onConfirm={this.onSearchButtonClick.bind(this)}
          ></Input>
        </View>
        <View className='store-medicine-button flex-row flex-content-center flex-align-center' onClick={this.onSearchButtonClick.bind(this)}>
          <Text className='text-15 text-white'>搜索</Text>
        </View>
      </View>
    )
  }

  /** 渲染筛选栏 */
  renderFliterView () {
    const { fliter } = this.state

    return(
      <View className='flex-row flex-content-evenly flex-align-center width-screen height-50'>
        {fliter.map(fliterItem => {
          const { fliterIndex } = this.state
          const iconClass = fliterItem.id === 4 ? 'store-fliter-icon-big' : 'store-fliter-icon'
          const textClass = fliterItem.id === fliterIndex ? 'text-green' : 'text-black'
      
          return(
            <View className='store-medicine-fliter-item flex-row flex-content-center flex-align-center' taroKey={fliterItem.id} onClick={this.onFliterItemClick.bind(this, fliterItem)}>
              {fliterItem.id !== 4 && <Text className={'text-15 '+textClass}>{fliterItem.name}</Text>}
              {fliterItem.id !== 1 && <Image className={iconClass} src={fliterItem.icon} mode='aspectFit' />}
            </View>
          )
        })}
      </View>
    )
  }

  /** 渲染分类modal */
  renderCategoryModal () {
    const { fliter } = this.state
    const fliterItem = fliter[2]

    return(
      <View 
        className='store-category-modal' 
        hidden={!fliterItem.isShow} 
        onTouchMove={e => e.stopPropagation()}
        onClick={this.onHideCategoryModal.bind(this)}
      >
        <View className='store-category-modal-content flex-row flex-content-evenly flex-wrap' onClick={e => e.stopPropagation()}>
          {fliterItem.category.map((categoryItem, categoryIndex) => {
            const isSelected = fliterItem.selectedId === categoryItem.id
            const itemClass = isSelected ? 'store-category-modal-item-select' : 'store-category-modal-item-normal'
            const textClass = isSelected ? 'text-green' : 'text-black'

            return(
              <View 
                className={'store-category-modal-item flex-row flex-content-center flex-align-center ' + itemClass} 
                taroKey={categoryIndex} 
                onClick={this.onCategoryItemClick.bind(this, categoryItem)}
              >
                <Text className={'text-12 ' + textClass}>{categoryItem.name}</Text>
              </View>
            )
          })}
        </View>
      </View>
    )
  }

  /** 渲染占位View */
  renderSpaceView () {
    const { fromPage } = this.state
    return(
      <View className='store-space'>
        <View className='store-medicine-space'></View>
        {fromPage === 'shopcar' && this.renderActivityView()}
      </View>
    )
  }

  /** 渲染列表 */
  renderMedicineListView () {
    const { medicineList,scrollHeight,refreshStatus } = this.state
    return(
      <scroll-view className='store-medicine-list' scrollY style={`height:${scrollHeight}rpx`} onScrollToLower={this.onScrollToLower}>
        {medicineList.map((medicineItem, medicineIndex) => {
          return(
            <View key={medicineIndex.toString()}>
              <ListGoodsItem data={medicineItem} showcar={false} />
            </View>
          )
        })}
        <YFWFooterRefresh status={refreshStatus} />
      </scroll-view>
    )
  }

  /** 渲染列表 */
  renderMedicineCollectionView () {
    const { medicineList } = this.state
    return(
      <View className='container flex-row flex-wrap'>
        {medicineList.map((medicineItem, medicineIndex) => {
          
          return(
            <View className='store-medicine-list-item' key={medicineIndex.toString()}>
              <CollectionGoodsItem data={medicineItem} showcar={false} />
            </View>
          )
        })}
      </View>
    )
  }

  /** 凑单 */
  renderActivityView () {
    const { activityData } = this.state

    return(
      <View className='flex-row flex-content-between flex-align-center width-screen back-yellow'>
        <View className='store-medicine-activity-left flex-column'>
          {activityData.add_on_isshow === '1' && <Text>{activityData.add_on}</Text>}
          {activityData.freepostage_isshow === '1' && <Text>{activityData.freepostage}</Text>}
        </View>
        <View className='store-medicine-activity-right flex-column flex-content-center flex-align-end' onClick={() => pushNavigation('get_shopping_car')}>
          <Text>去购物车</Text>
        </View>
      </View>
    )
  }

  /** 点击搜索按钮 */
  onSearchButtonClick () {
    this.pageIndex = 1
    this.fetchAllMedicineData()
  }

  /** 筛选器item点击 */
  onFliterItemClick (fliterItem) {
    switch (fliterItem.id) {
      case 1:
        this.fliterDefault(fliterItem)
        break;
    
      case 2:
        this.fliterPrice(fliterItem)
        break;
    
      case 3:
        this.fliterCatergory(fliterItem)
        break;
    
      case 4:
        this.fliterListStyle(fliterItem)
        break;
    
      default:
        break;
    }
  }

  /** 筛选器默认筛选 */
  fliterDefault (fliterItem) {
    if (this.isLoading) {
      return
    }
    const { fliterIndex } = this.state
    let { fliter } = this.state
    if (fliterItem.id === fliterIndex) {
      return
    }

    fliter[1].icon = require('../../../../images/order_by_default.png')
    fliter[1].increase = true
    fliter[2].icon = require('../../../../images/shop_search_gray.png')
    fliter[2].selectedId = 0
    fliter[2].isShow = false

    this.setState({
      fliter: fliter,
      fliterIndex: 1
    })

    this.categoryId = ''
    this.sortType = 'sale_count desc'
    this.pageIndex = 1
    this.isMoreData = true

    this.fetchAllMedicineData()
  }

  /** 筛选器价格筛选 */
  fliterPrice (fliterItem) {
    if (this.isLoading) {
      return
    }
    let { fliter } = this.state
    const { increase } = fliterItem
    fliter[1].increase = !increase
    fliter[1].icon = !increase ? require('../../../../images/order_by_minus.png') : require('../../../../images/order_by_plus.png')
    fliter[2].icon = require('../../../../images/shop_search_gray.png')
    fliter[2].isShow = false
    this.setState({
      fliter: fliter,
      fliterIndex: 2
    })

    this.sortType = increase ? 'price asc' : 'price desc'
    this.pageIndex = 1
    this.isMoreData = true

    this.fetchAllMedicineData()
  }

  /** 筛选器分类筛选 */
  fliterCatergory (fliterItem) {
    let { fliter } = this.state
    const { isShow } = fliterItem
    fliter[2].isShow = !isShow
    fliter[2].icon = require('../../../../images/shop_search_green.png')
    fliter[1].icon = require('../../../../images/order_by_default.png')
    this.setState({
      fliter: fliter,
      fliterIndex: 3
    })
  }

  /** 商品分类点击 */
  onCategoryItemClick (categoryItem) {
    if (this.isLoading) {
      return
    }
    let { fliter } = this.state
    let fliterItem = fliter[2]
    if (fliterItem.selectedId === categoryItem.id) {
      return
    }

    fliterItem.selectedId = categoryItem.id
    fliterItem.isShow = false
    fliter[2] = fliterItem
    this.setState({
      fliter: fliter,
    })

    this.categoryId = categoryItem.id
    this.pageIndex = 1
    this.isMoreData = true

    this.fetchAllMedicineData()
  }

  /** 点击分类modal空白处 */
  onHideCategoryModal () {
    let { fliter } = this.state
    fliter[2].isShow = false
    this.setState({
      fliter: fliter,
    })
  }

  /** 修改列表样式 */
  fliterListStyle (fliterItem) {
    let { tableStyle } = this.state
    let { fliter } = this.state
    if (tableStyle === 'table') {
      tableStyle = 'collection'
      fliter[3].icon = require('../../../../images/YFWStoreModule/medicine_list_gray.png')
    } else {
      tableStyle = 'table'
      fliter[3].icon = require('../../../../images/YFWStoreModule/medicine_map_gray.png')
    }
    fliter[2].isShow = false
    this.setState({
      tableStyle: tableStyle,
      fliter: fliter
    })
  }
}