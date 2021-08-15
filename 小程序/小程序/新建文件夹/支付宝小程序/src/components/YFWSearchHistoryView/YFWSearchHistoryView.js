import Taro, { Component } from '@tarojs/taro'
import { View, Block, Image, Text, ScrollView } from '@tarojs/components'
import TitleView from '../YFWTitleView/YFWTitleView'
import './YFWSearchHistoryView.scss'
export default class YFWSearchHistoryView extends Component {

    config = {
        component: true
    }
    static defaultProps = {
        hotWords: [],
        historyWords: [],
        shop_id: '',
        onClickHotItemMethod: null,
        onClearHistoryMethod: null,
        onClickHistoryItemMethod: null,
        onClickToggleCloseMethod: null,
        onclickClearHistoryItemMethod: null,
        toggleCloseBtn: 0

    }
    toggleCloseAction() {
        if (this.props.onClickToggleCloseMethod) {
            this.props.onClickToggleCloseMethod()
        }
    }
    clickHotItemMethod(event) {
        if (this.props.onClickHotItemMethod) {
            this.props.onClickHotItemMethod({ name: event.currentTarget.dataset.name })
        }
    }
    clickClearHistoryItemMethod(event) {
        if (this.props.onclickClearHistoryItemMethod) {
            this.props.onclickClearHistoryItemMethod({ name: event.currentTarget.dataset.name })
        }
    }
    clearHistoryMethod() {
        if (this.props.onClearHistoryMethod) {
            this.props.onClearHistoryMethod()
        }

    }

    clickHistoryItemMethod(event) {
        if (this.props.onClickHistoryItemMethod) {
            this.props.onClickHistoryItemMethod({ name: event.currentTarget.dataset.name })
        }
    }
    componentWillMount() { }

    componentDidMount() { }

    render() {
        const { hotWords } = this.props
        const { historyWords } = this.props
        const { toggleCloseBtn } = this.props
        return (
            <View className='container'>
                <ScrollView className='scroll' scrollY>
                    {hotWords.length > 0 && (
                        <View>
                            <View className='hotWords-view'>
                                <TitleView title="热门搜索" ></TitleView>
                            </View>
                            <View className='hotWords-context'>
                                {hotWords.map((info, infoIndex) => {
                                    return (
                                        <Block key={infoIndex}>
                                            <View className='hotWords-context-view' onClick={this.clickHotItemMethod} data-name={info} >
                                                <Text>{info}</Text>
                                            </View>

                                        </Block>
                                    )
                                })}
                            </View>
                        </View>
                    )}
                    {historyWords.length > 0 && (
                        <View>
                            <View className='historyWords-view'>
                                <TitleView title="历史搜索" ></TitleView>
                                <View className='clear-view'>
                                    {toggleCloseBtn == 1 && (<View className="clear-left"><View onClick={this.clearHistoryMethod}>全部删除</View><View className="cut-off-rule">|</View></View>)}
                                    <View onClick={this.toggleCloseAction}>
                                        {toggleCloseBtn == 0 ?
                                            <Image src={require('../../images/ico_delete.png')} className='image-view' ></Image> :
                                            <View className="completeBtn">完成</View>
                                        }
                                    </View>


                                </View>
                            </View>
                            <View className='hotWords-context'>
                                {historyWords.map((historyInfo, historyIndex) => {
                                    return (
                                        <Block key={historyIndex}>
                                            {
                                                toggleCloseBtn == 1 ? <View className='hotWords-context-view' onClick={this.clickClearHistoryItemMethod} data-name={historyInfo} >

                                                    <Text> {(historyInfo.showType == 'goods' ? '商品' : '商家') + (' ' + historyInfo.value)} </Text>
                                                    <Image className="closeHistoryWordsShow" src={require("../../images/returnTips_close.png")}></Image>
                                                </View> : <View className='hotWords-context-view' onClick={this.clickHistoryItemMethod} data-name={historyInfo} >

                                                    <Text> {(historyInfo.showType == 'goods' ? '商品' : '商家') + (' ' + historyInfo.value)} </Text>

                                                </View>
                                            }

                                        </Block>
                                    )
                                })}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>
        )
    }
}
