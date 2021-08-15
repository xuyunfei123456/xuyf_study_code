import Taro, { Component } from '@tarojs/taro'
import { View, ScrollView, Block, Image, Text } from '@tarojs/components'
import './YFWSearchRelevantWordsView.scss'
class YFWSearchRelevantWordsView extends Component {

    config = {
        component: true
    }
    static defaultProps = {
        data: {},
        keyWords: '',
        shop_id: '',
        onClickSearchShopMethod: null,
        onClickHotItemMethod: null
    }

    clickSearchShopMethod() {
        if(this.props.onClickSearchShopMethod) {
            this.props.onClickSearchShopMethod()
        }
    }
    clickHotItemMethod(event) {
        console.log(event)
        if(this.props.onClickHotItemMethod) {
            this.props.onClickHotItemMethod({name: event.currentTarget.dataset.context})
        }
    }
    componentWillMount () { }

    componentDidMount () { }

    render () {
        const { data } = this.props
        const { keyWords } = this.props
        const { shop_id } = this.props
        return (
            <View className='container'>
                <ScrollView scrollY className='scroll'>
                    {shop_id.length==0 && (
                        <View className='top-views' onClick={this.clickSearchShopMethod}>
                            <View className='topView-context'>
                                <Image src={require('../../images/shops.png')}/>
                                <Text>搜索“{keyWords}”的商家</Text>
                            </View>
                            <View className='lineview'></View>
                        </View>
                    )}
                    {data.map((dataInfo, dataIndex) => {
                        return (
                            <Block key={dataIndex}>
                                <View className='list-view' onClick={this.clickHotItemMethod} data-context={dataInfo} >
                                <View className='list-context'>
                                    <Text>{dataInfo}</Text>
                                </View>
                                <View className='lineview'></View>
                                </View>
                            </Block>
                        )
                    })}
                </ScrollView>
            </View>
        )
    }
}

export default YFWSearchRelevantWordsView