import Taro, { Component } from '@tarojs/taro'
import { View, Block, Text, Image, ScrollView } from '@tarojs/components'
import { pushNavigation} from '../../apis/YFWRouting.js'
import FilterView from '../YFWFilterView/YFWFilterView'
import ListGoods from '../GoodsItemView/ListGoodsItem'
import CollectionGoods from '../GoodsItemView/CollectionGoodsItem'
import './YFWGoodsListView.scss'
class YFWGoodsListView extends Component {

    config = {
        component: true
    }

    static defaultProps = {
        froms: 'search',
        showShopCarTips: false,
        shopCarTipsInfo: {},
        list: [],
        pageEnd: false,
        onChangeSortType: null,
        onRequestNextPage: null,
        onOpenControlPanel: null,
        onRefreshTips: null
    }

    constructor (props) {
        super (props) 
        this.state = {
            // pageEnd: false,
            listType: true,
            // list:[]
        }
    }

    changeSortType =(e)=> {
        console.log(e)
        if(this.props.onChangeSortType) {
            this.props.onChangeSortType({
                sort: e.sort,
                sorttype: e.sorttype,
                categoryID: e.categoryID
              })
        }
    }

    changeListType =()=> {
        this.setState({
            listType: !this.state.listType
        })
    }

    openControlPanel =()=> {
       if(this.props.onOpenControlPanel) {
            this.props.onOpenControlPanel()
       }
    }

    requestNextPage () {
        if(this.props.onRequestNextPage) {
            this.props.onRequestNextPage()
       }
    }
    toShopCar(){
        pushNavigation('get_shopping_car')
    }

    refreshTips =(e)=> {
        if(this.props.onRefreshTips) {
            this.props.onRefreshTips({price:e.price})
        }
    }
    componentWillMount () { }

    componentDidMount () { }

    render () {
        const { froms } = this.props
        console.log('from======'+froms)
        let showcar = (froms== 'category' ||froms== 'search') ? false : true
        let showstore = (froms== 'category' ||froms== 'search') ? true : false
        let showCode = (froms== 'category' ||froms== 'search') ? true : false
        let showtrocheType = (froms== 'category' ||froms== 'search') ? true : false
        let showCompany = (froms== 'category' ||froms== 'search') ? true : false
        const { showShopCarTips } = this.props
        const { shopCarTipsInfo } = this.props
        const { list } = this.props
        const { listType } = this.state
        const { pageEnd } = this.props
        return (
        <View className='mainView'>
            <FilterView onChangeSortType={this.changeSortType} onChangeListType={this.changeListType} onOpenControlPanel={this.openControlPanel} froms={froms}/>
            {showShopCarTips && (
                <View className='shopCarTip'>
                    {(shopCarTipsInfo.freepostage.length>0||shopCarTipsInfo.add_on.length>0) && (
                        <View className='carLeft'>
                            <Text>{shopCarTipsInfo.freepostage}</Text>
                            <Text>{shopCarTipsInfo.add_on}</Text>
                        </View>
                    )}
                    <View className='carRight' onClick={this.toShopCar}></View>
                </View>
            )}
            <ScrollView className='scrollView' scrollY onScrollToLower={this.requestNextPage}>
                {listType ? (
                    <View>
                        {list.map((info, infoIndex) => {
                            return(
                                <Block>
                                    <ListGoods data={info} showCompany={showCompany} showtrocheType={showtrocheType} showcar={showcar} showstore={showstore} showCode={showCode} onCallBack={this.refreshTips}/>
                                </Block>
                            )
                        })}
                    </View>
                ) : (
                    <View className='collectionView'>
                        {list.map((secondInfo, secondIndex) => {
                            return(
                                <View className='collectionItemView'>
                                    <CollectionGoods data={secondInfo} showCompany={showCompany} showtrocheType={showtrocheType} showcar={showcar} showstore={showstore} onCallBack={this.refreshTips}/>
                                </View>
                            )
                        })}
                    </View>
                )}
                <View className='onloading'>
                    {!pageEnd ? (
                        <Image className='loading-icon' src={require('../../images/loading_cycle.gif')}/>
                    ) : (
                        <Text className='loadover'>没有更多商品了</Text>
                    )}
                </View>
            </ScrollView>
        </View>
        )
    }

}

export default YFWGoodsListView