import Taro, { Component } from '@tarojs/taro'
import { View, Block, Text, Image, ScrollView } from '@tarojs/components'
import { pushNavigation} from '../../apis/YFWRouting.js'
import FilterView from '../YFWFilterView/YFWFilterView'
import ListGoods from '../GoodsItemView/ListGoodsItem'
import CollectionGoods from '../GoodsItemView/CollectionGoodsItem'
import TitleView from '../YFWTitleView/YFWTitleView'
import './YFWNoGoodsListView.scss'

class YFWNoGoodsListView extends Component {

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
        onOpenControlPanel: null
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

    componentWillMount () { }

    componentDidMount () { }

    render () {
        const { froms } = this.props
        let showcar = (froms== 'category' ||froms== 'search') ? false : true
        let showstore = (froms== 'category' ||froms== 'search') ? true : false
        const { showShopCarTips } = this.props
        const { shopCarTipsInfo } = this.props
        const { list } = this.props
        const { listType } = this.state
        const { pageEnd } = this.props
        return (
            <View className='main-View'>
                <FilterView onChangeSortType={this.changeSortType} onChangeListType={this.changeListType} onOpenControlPanel={this.openControlPanel} froms={froms}/>
                <ScrollView className='scroll-View' scrollY>
                    <View className='no-result'>
                        <Image src='https://c1.yaofangwang.net/common/images/miniapp/ic_no_goods_shops.png'/>
                        <Text>抱歉，没有找到商品哦~</Text>
                    </View>
                    <View className='about-shop-view'>
                        <TitleView title='热门搜索'/>
                    </View>
                    {listType ? (
                        <View>
                            {list.map((info, infoIndex) => {
                                return(
                                    <Block>
                                        <ListGoods data={info} showcar={showcar} showstore={showstore}/>
                                    </Block>
                                )
                            })}
                        </View>
                    ) : (
                        <View className='collectionView'>
                            {list.map((secondInfo, secondIndex) => {
                                return(
                                    <View className='collectionItemView'>
                                        <CollectionGoods data={secondInfo} showcar={showcar} showstore={showstore}/>
                                    </View>
                                )
                            })}
                        </View>
                    )}
                </ScrollView>
            </View>
        )
    }
}

export default YFWNoGoodsListView