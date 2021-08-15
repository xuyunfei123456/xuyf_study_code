import Taro, { Component } from '@tarojs/taro'
import { View, Block, Image, Text } from '@tarojs/components'
import { GoodsCategaryApi } from '../../../../apis/index.js'
const goodsCategaryApi = new GoodsCategaryApi()
import { getModelArray } from '../../../../components/GoodsItemView/model/YFWGoodsListModel.js'
import GoodsView from '../../../../components/GoodsItemView/YFWGoodsListView'
import Filterboxmodal from '../../../../components/YFWFilterBoxModal/YFWFilterBoxModal'
import YFWMoreModal from '../../../../components/YFWMoreModal/YFWMoreModal'
import {
    isNotEmpty,
    safeObj,
    isEmpty,
    itemAddKey
  } from '../../../../utils/YFWPublicFunction.js'
import './YFWSubCategory.scss'
class YFWSubCategory extends Component {

    config = {
        navigationBarTitleText: ''
    }
    constructor (props) {
        super(props)
        this.state = {
            isOpenMore: false,
            pageIndex: 1,
            list: [],
            categoryID: '',
            sort: '',
            sorttype: '',
            paramJson: {},
            pageEnd: false,
        }
    }
    componentWillMount () {
        let options = this.$router.params
        let screenData = options.params && JSON.parse(options.params) || {}
        Taro.setNavigationBarTitle({
            title: screenData.name
        })
        this.setState({
            categoryID:screenData.value
        })
        this.state.categoryID = screenData.value
        this.requestData()
    }
    openControlPanel =()=> {
        let filterBox = this.filterBox.$component?this.filterBox.$component:this.filterBox
        filterBox&&filterBox.showModal()
    }
    
    changeSortType =(e)=> {
      this.setState({
        sort: e.sort,
        pageIndex:1,
        sorttype:e.sorttype,
        pageEnd:false,
      })
        this.state.pageIndex = 1
        this.state.sort = e.sort
        this.state.sorttype = e.sorttype
        this.requestData()
    }
    changeFilter =(info)=> {
        //{brands:品牌集合   manufacturers:厂家}
        // console.log(info.detail, 'new filter')
        // * aliascn  品牌 多品牌以, 分割
        //   * titleAbb  厂家 多厂家以, 分割
    
        let brand = isEmpty(info.brands) ? '' : info.brands.join(',')
        let manufacturer = isEmpty(info.manufacturers)
          ? ''
          : info.manufacturers.join(',')
        this.setState({
          // paramJson: { aliascn: brand, titleAbb: manufacturer },
          // pageIndex: 1,
          pageEnd:false
        })
        this.state.pageEnd = false
        this.state.paramJson = { aliascn: brand, titleAbb: manufacturer }
        this.state.pageIndex = 1
        this.requestData()
    }

    requestData() {
        goodsCategaryApi.getCategaryGoods(this.state.categoryID, this.state.sort, this.state.sorttype, this.state.pageIndex, this.state.paramJson, '4.0.00').then(response => {
            let data = getModelArray(response.dataList, 'all_medicine_subCategory')
            if (this.state.pageIndex == 1) {
              if (data.length < 20) {
                this.hideLoadingView()
              }
              this.state.list = data
            } else {
              if (data.length < 20) {
                this.hideLoadingView()
              }
              this.state.list= this.state.list.concat(data)
            }
            
            this.setState({
                list: this.state.list
            })
          })
    }
    hideLoadingView() {
        this.setState({
            pageEnd: true
        })
    }

    requestNextPage = (e) => {
        if(!this.state.pageEnd){
          this.state.pageIndex = this.state.pageIndex +1
          this.requestData()
      }else{
          this.setState({
              pageEnd:true
          })
      }
    }
    bindSearchTap () {
        console.log('dfg')
        Taro.navigateTo({
          url: '../YFWSearchPage/YFWSearch'
        })
    }
    openUtilityMenu () {
      this.setState({ isOpenMore: true })
    }
    componentDidMount () { }

    render () {
        const { categoryID } = this.state
        const { list } = this.state
        const { pageEnd } = this.state
        const { isOpenMore } = this.state
        return (
            <View className="container">
              <View className="toSearchViews">
                <View className="topSearchInputViews" onClick={this.bindSearchTap}>
                  <Image
                    className="searchIcon"
                    src={require('../../../../images/YFWStoreModule/top_bar_search.png')}
                    mode="aspectFit"
                  ></Image>
                  <Text className="placeholder">搜索症状、药品、药店、品牌</Text>
                </View>
                <View className="topViewSearchBotton" onClick={this.openUtilityMenu}>
                  <Image
                    className="more-view"
                    src={require('../../../../images/more_white.png')}
                    mode="aspectFit"
                    id="more_image"
                  ></Image>
                </View>
              </View>
              <View className='goods-view'>
                <Block>
                  <GoodsView
                    list={list}
                    pageEnd={pageEnd}
                    onChangeSortType={this.changeSortType}
                    onRequestNextPage={this.requestNextPage}
                    onOpenControlPanel={this.openControlPanel}
                    froms="category"
                  ></GoodsView>
                </Block>
              </View>
              <Filterboxmodal
                ref={this.refFilterBox}
                onChangeFilter={this.changeFilter}
                category_id={categoryID}
                froms="YFWSubCategoryController"
              ></Filterboxmodal>
              <YFWMoreModal isOpened={isOpenMore} onClose={() => this.setState({ isOpenMore: false })} />
            </View>
          )
    }
    refFilterBox = (node) => this.filterBox = node
    
}

export default YFWSubCategory