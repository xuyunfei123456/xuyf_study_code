import Taro, { Component } from '@tarojs/taro'
import { View, Block, Image, Text, } from '@tarojs/components'
import './YFWFilterView.scss'
class YFWFilterView extends Component {

    config = {
        component: true
    }

    static defaultProps = {
        //search:搜索商品列表    category:分类商品列表   shop_search:商家搜索商品列表    shop_all_goods:商家全部商品列表
        froms: 'search',  
        onChangeSortType: null,
        onChangeListType: null,
        onOpenControlPanel: null,


    }

    constructor (props) {
        super (props)
        this.state = {
            listType: true, //true:列表  false:方块
            sort: '', //
            sorttype: '', //
            selectTab:0,
            priceIconType:0,
            sellerIconType:0,
            priceDerection: true,
            sellerDerection: true,
            categoryID:'',
            categoryArray: [{ id: 1, name: '中西药品' }, { id: 2, name: '医疗器械' }, { id: 3, name: '养生保健' },
            { id: 4, name: '美容护肤' }, { id: 5, name: '计生用品' }, { id: 6, name: '中药饮片'}],
            menuOpen:false,
        }
    }

    changeSortType(event) {
        let id = parseInt(event.currentTarget.dataset.id)
        if (id == 0) {
          this.state.sort = '';
          this.state.sorttype = this.get_sorttype(id);
          this.setState({
            selectTab: 0,
            priceIconType: 0,
            sellerIconType: 0,
            menuOpen: false,
            categoryID: ''
          })
        }
        if (id == 1) {
          if(this.state.selectTab != 1){
            this.state.priceDerection = true
          }
          if (this.state.priceDerection) {
            this.state.sort = (this.props.froms == 'search' || this.props.froms == 'shop_search') ? 'price asc' : 'price';
            this.state.sorttype = this.get_sorttype(id);
            this.state.priceDerection = !this.state.priceDerection;
            this.setState({
              priceIconType: 1,
              sellerIconType: 0,
              selectTab: 1,
              menuOpen: false
            })
          } else {
            this.state.sort = (this.props.froms == 'search' || this.props.froms == 'shop_search') ? 'price desc' : 'price';
            this.state.sorttype = this.get_sorttype(id);
            this.state.priceDerection = !this.state.priceDerection;
            this.setState({
              priceIconType: 2,
              sellerIconType: 0,
              selectTab: 1,
              menuOpen: false
            })
          }
        }
        if (id == 2) {
          //报价数
          if (this.state.selectTab != 2) {
            this.state.sellerDerection = true
          }
          if (this.state.sellerDerection) {
            this.state.sellerDerection = !this.state.sellerDerection;
            // this.state.sort = 'shopCount asc';
            this.state.sort = 'shopCount asc';
            // this.state.sorttype = 'asc';
            this.setState({
              priceIconType: 0,
              sellerIconType: 1,
              selectTab: 2,
              menuOpen: false
            })
          } else {
            this.state.sellerDerection = !this.state.sellerDerection;
            this.state.sort = 'shopCount desc';
            // this.state.sort = 'shopCount desc';
            // this.state.sorttype = 'desc';
            this.setState({
              priceIconType: 0,
              sellerIconType: 2,
              selectTab: 2,
              menuOpen:false
            })
          }
        }
        if (id == 3) {
          if (id == this.state.selectTab) {
            this.state.menuOpen = !this.state.menuOpen;
          } else {
            this.state.menuOpen = true;
          }
          this.setState({ selectTab: 3, priceIconType: 0, sellerIconType:0, menuOpen: this.state.menuOpen })
          return
        }
  
        let sortParams = {}
        if (this.props.froms == 'search'){
          sortParams = {
            sort: this.state.sort,
            sorttype: this.state.sorttype
          }
        }
        if (this.props.froms == 'category'){
          sortParams = {
            sort: this.state.sort,
            sorttype: this.state.sorttype
          }
        }
        if (this.props.froms == 'shop_search'){
          sortParams = {
            sort: this.state.sort,
            sorttype: this.state.sorttype
          }
        }
        if (this.props.froms == 'shop_all_goods'){
          sortParams = {
            sorttype: this.state.sorttype,
            categoryID:this.state.categoryID
          }
        }
        if(this.props.onChangeSortType){
            this.props.onChangeSortType(sortParams)
        }
        // this.triggerEvent('changeSortType', sortParams);
    }

    changeListType() {
        this.setState({
          listType:!this.state.listType
        })
        if(this.props.onChangeListType){
            this.props.onChangeListType()
        }
        // this.triggerEvent('changeListType');
    }

    openControlPanel() {
        if(this.props.onOpenControlPanel) {
            this.props.onOpenControlPanel()
        }
        // this.triggerEvent('openControlPanel');
    }

    closeCategoryView(event) {
        let a = event.currentTarget.id
        if (a == 'father') {
          this.setState({ menuOpen: false })
        }
    }

    categoryClick(event) {
        if (this.state.categoryID == event.currentTarget.id) {
            this.state.categoryID = ''
        } else {
            this.state.categoryID = event.currentTarget.id
        }
        this.setState({ menuOpen: false, categoryID: this.state.categoryID })
        if(this.props.onChangeSortType){
            this.props.onChangeSortType({ categoryID: this.state.categoryID, sorttype: this.state.sorttype})
        }
        // this.triggerEvent('changeSortType', { categoryID: this.state.categoryID, sorttype: this.state.sorttype});
    }

    get_sorttype(selectTab) {
        //search: 搜索商品列表    category: 分类商品列表   shop_search: 商家搜索商品列表    shop_all_goods: 商家全部商品列表
        let sorttype = ''
        if (this.props.froms == 'category') {
          if (selectTab == 0) {
            sorttype = ''
          }else if (selectTab == 1) {
            if (this.state.priceDerection){
              sorttype = 'asc'
            }else{
              sorttype = 'desc'
            }
          }
        }
        if (this.props.froms == 'shop_all_goods') {
          if(selectTab == 0){
            sorttype = 'sale_count desc'
          }else if (selectTab == 1) {
            if (this.state.priceDerection) {
              sorttype = 'price asc'
            } else {
              sorttype = 'price desc'
            }
          }
        }
        this.state.sorttype = sorttype
        return sorttype;
    }
    componentWillMount () { }

    componentDidMount () { }

    render () {
        const { froms } = this.props
        const { sort } = this.state
        const { listType } = this.state
        const { sorttype } = this.state
        const { selectTab } = this.state
        const { priceIconType } = this.state
        const { sellerIconType } = this.state
        const { priceDerection } = this.state
        const { sellerDerection } = this.state
        const { categoryID } = this.state
        const { categoryArray } = this.state
        const { menuOpen } = this.state

        return (
            <View className='top-view'>
                <View className='topViewItem' onClick={this.changeSortType} data-id="0">
                    <Text className={selectTab == 0 ? 'topViewItemTitleSelect' : 'topViewItemTitleUnselect'} >默认</Text>
                </View>
                <View className='topViewItem' onClick={this.changeSortType} data-id="1">
                    <Text className={selectTab == 1 ? 'topViewItemTitleSelect' : 'topViewItemTitleUnselect'} >价格</Text>
                    {priceIconType == 1 && (
                        <Image className='topViewItemIcon' src={require('../../images/order_by_plus.png')}/>
                    )}
                    {priceIconType == 2 && (
                        <Image className='topViewItemIcon' src={require('../../images/order_by_minus.png')}/>
                    )}
                    {priceIconType == 0 && (
                        <Image className='topViewItemIcon' src={require('../../images/order_by_default.png')}/>
                    )}
                </View>
                {froms=='search' && (
                    <View className='topViewItem' onClick={this.changeSortType} data-id="2">
                        <Text className={selectTab == 2 ? 'topViewItemTitleSelect' : 'topViewItemTitleUnselect'}>报价数</Text>
                        {sellerIconType==1 && (
                           <Image className='topViewItemIcon' src={require('../../images/order_by_plus.png')}/> 
                        )}
                        {sellerIconType==2 && (
                           <Image className='topViewItemIcon' src={require('../../images/order_by_minus.png')}/> 
                        )}
                        {sellerIconType==0 && (
                           <Image className='topViewItemIcon' src={require('../../images/order_by_default.png')}/> 
                        )}
                    </View>
                )}
                {froms=='shop_all_goods' && (
                    <View className='topViewItem' onClick={this.changeSortType} data-id="3">
                        <Text className={selectTab == 3 ? 'topViewItemTitleSelect' : 'topViewItemTitleUnselect'}>分类</Text>
                        {selectTab == 3 ? (
                            <Image className="topViewItemIcon2" src={require('../../images/shop_search_green.png')} ></Image>
                            ) : (
                            <Image className="topViewItemIcon2" src={require('../../images/shop_search_gray.png')} ></Image>
                        )}
                    </View>
                )}
                <View className='topViewItem' onClick={this.changeListType}>
                    {listType ? (
                        <Image className='topViewItemImage' src={require('../../images/YFWStoreModule/medicine_map_gray.png')} ></Image>
                    ) : (
                        <Image className='topViewItemImage' src={require('../../images/YFWStoreModule/medicine_list_gray.png')}></Image>
                    )}
                </View>
                {(froms == 'search' || froms == 'category') && (
                    <View className='topViewItem' onClick={this.openControlPanel}>
                        <Text className='topViewItemTitleUnselect'>筛选</Text>
                        <Image className='topViewItemScreenIcon' src={require('../../images/choose_kind.png')} ></Image>
                  </View>
                )}
                {menuOpen && (
                    <View className='topCategoryBgView' onClick={this.closeCategoryView} id="father" >
                        <View className='topCategoryView' onClick={this.closeCategoryView}>
                        {categoryArray.map((info, index) => {
                            return (
                                <View className="categoryItemView" key={info.id}>
                                    <View className={ 'labelView ' + (categoryID == info.id ? 'labelView_select ' : ' ') } onClick={this.categoryClick} id={info.id} >
                                    <Text className={ 'labelText ' + (categoryID == info.id ? 'labelText_select ' : ' ') } >{info.name} </Text>
                                    </View>
                                </View>
                            )
                        })}
                        </View>
                    </View>
                    )}
            </View>
        )
    }
    }

export default YFWFilterView