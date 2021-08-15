import Taro, { Component, Config } from '@tarojs/taro'
import { 
  View,
  Text
} from '@tarojs/components'
import {
  isNotEmpty,
  toDecimal
} from '../../utils/YFWPublicFunction.js'
import { pushNavigation } from '../../apis/YFWRouting'
import './YFWHealthAskAllDepartView.scss'

export default class YFWHealthAskAllDepartView extends Component {
  config = {
    component: true
  }

  static defaultProps = {
    data: {},
}
constructor (props) {
  super(...arguments)

  this.state = {
    selectIndex: 0,
    data:[]
  }
}
componentWillReceiveProps (nextProps) {
  const { data } = nextProps
  this.setState({ data, })

}
pressRow(event) {
  this.setState({
    selectIndex: event.currentTarget.dataset.index,
  })
}
toDetail(e) {
  let model = e.currentTarget.dataset.item // 选中大科室
  let cell = e.currentTarget.dataset.cell // 选中小科室
  let pageFrom = "pageAlldepart"
  let params = {
    model: model,
    selectModel: cell,
    pageFrom: pageFrom
  }

  pushNavigation('get_ASK_all_category', params)
}
    render () {
      const {data,selectIndex} = this.state
      return (
        <View className='containerchild'>
          <ScrollView scroll-x="false" scrollY className='scroll-left'>
            {data.map((item,index)=>{
              const classLeft = index==selectIndex?'leftline-select leftline' :'leftline-select';
              const classLeftText = index==selectIndex ? 'left-text left-text-select':'left-text'
              return (
                <Block key={item.key}>
                  <View className='left-context'>
                    <View onClick={this.pressRow} data-index={index}>
                      <View className={classLeft}></View>
                          <Text className={classLeftText}>{item.department_name}</Text>
                      </View>
                  </View>
              </Block>
              )
            })}

          </ScrollView>
          <ScrollView scroll-x="false" scroll-y="true" className='scroll-right'>
            <View className='right-topView' onClick={this.toDetail} data-item={data[selectIndex]}>
              <View className='right-department'>
                <Text>{data[selectIndex].department_name}</Text>
              </View>
              <View className='right-jumpView'>
                <Text>查看所有问题</Text>
                <Image src='/images/icon_arrow_more.png'></Image>
              </View>
              
            </View>
            <View className='right-context'>
              {data[selectIndex].items.map((item,index)=>{
                return (
                  <Block  key={index}>
                  <View className='right-context-view' data-item={data[selectIndex]} data-cell={item} onClick={this.toDetail}>
                    <Text>{item.department_name}</Text>
                  </View>
                </Block>
                )
              })}

            </View>
          </ScrollView>
        </View>
      )
    }
}
