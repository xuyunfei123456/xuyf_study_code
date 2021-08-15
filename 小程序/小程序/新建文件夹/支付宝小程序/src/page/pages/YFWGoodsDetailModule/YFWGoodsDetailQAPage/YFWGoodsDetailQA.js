import Taro, { Component } from '@tarojs/taro';
import { 
  View,
  ScrollView,
  Swiper,
  SwiperItem,
  Text,
  Button,
  Image
} from '@tarojs/components';

import { GoodsDetailApi } from '../../../../apis/index'
import TitleView from '../../../../components/YFWTitleView/YFWTitleView'

import './YFWGoodsDetailQA.scss'

const qaApi = new GoodsDetailApi()

export default class YFWGoodsDetailQA extends Component {

  config = {
    navigationBarTitleText: '全部问题',
  }

  constructor (props) {
    super(props)

    this.state = {
      selectIndex: 0,
      datasource: [
        {
          id: 1,
          title: '物流问题',
          items: []
        },
        {
          id: 2,
          title: '商品问题',
          items: []
        },
        {
          id: 3,
          title: '支付问题',
          items: []
        },
        {
          id: 4,
          title: '处方问题',
          items: []
        },
        {
          id: 5,
          title: '价格问题',
          items: []
        }
      ]
    }
  }

  componentWillMount() {
    this.fetchData()
  }

  /** 获取数据 */
  fetchData() {
    qaApi.getQuestionList().then((response) => {
      /**
       * title：问题
       * content：答案
       * dict_question_ask_type：问题类型 1.物流问题 2.商品问题 3.支付问题 4.处方问题 5.价格问题
       */
      if (response.length > 0) {
        const { datasource } = this.state

        for (var index = 0; index < response.length; index++) {
          var model = response[index]

          if ((model.dict_question_ask_type - 1) >= 0 && (model.dict_question_ask_type - 1) < datasource.length) {
            var qaModel = datasource[model.dict_question_ask_type - 1]
            qaModel.items.push(model)
          }
        }

        this.setState({
          datasource: datasource
        })
      }
    })
  }

  render() {
    return(
      <View className='qa'>
        {this.renderTopTab()}
        {this.renderContent()}
      </View>
    )
  }

  /** 顶部tab */
  renderTopTab() {
    const { datasource } = this.state
    const { selectIndex } = this.state

    return(
      <ScrollView className='top-scroll' scrollX scrollIntoView={'top-item-'+selectIndex.toString()}>
        {datasource.map((qamodel, qaIndex) => {
          const selected = selectIndex === qaIndex
          const fontSize = selected ? 36 : 30;
          const fontColor = selected ? '#1fdb9b': '#333'
          
          return(
            <View id={'top-item-'+qaIndex.toString()} className='top-item' onClick={this.onChangeIndex.bind(this, qaIndex)} >
              <View className='top-item-button'>
                <TitleView fontWeight='bold' fontSize={fontSize} fontColor={fontColor} title={qamodel.title} largeStyle={selected} showLine={selected} />
              </View>
            </View>
          )
        })}
      </ScrollView>
    )
  }

  /** swiper */
  renderContent() {
    const { datasource } = this.state
    const { selectIndex } = this.state

    return(
      <View className='qa-content'>
        <Swiper className='qa-swiper' current={selectIndex} onChange={this.onSwiperChange.bind(this)}>
          {datasource.map(qamodel => {
            return(
              <SwiperItem>
                <ScrollView className='qa-swiper' scrollY>
                  {qamodel.items.map((qaItem) => {
                    return(
                      <View className='qa-item' taroKey={qaItem.id}>
                        <View className='qa-item-row'>
                          <Image className='qa-icon' src={require('../../../../images/YFWGoodsDetailModule/goods_deail_question_q.png')} />
                          <Text className='qa-qusetion'>{qaItem.title}</Text>
                        </View>
                        <View className='qa-item-row'>
                          <Image className='qa-icon' src={require('../../../../images/YFWGoodsDetailModule/goods_deail_question_a.png')} />
                          <Text className='qa-answer'>{qaItem.content}</Text>
                        </View>
                      </View>
                    )
                  })}
                </ScrollView>
              </SwiperItem>
            )
          })}
        </Swiper>
      </View>
    )
  }

  /** 切换index */
  onChangeIndex(index) {
    if (this.state.selectIndex !== index) {
      this.setState({
        selectIndex: index
      })
    }
  }

  /** swiper滑动 */
  onSwiperChange(event) {
    if (event.detail.source == "touch") {
      this.setState({
        selectIndex: event.detail.current
      })
    }
  }
}