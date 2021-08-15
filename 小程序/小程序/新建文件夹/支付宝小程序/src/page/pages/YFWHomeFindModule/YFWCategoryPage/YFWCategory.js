import { Block, View, Image, Text, ScrollView } from '@tarojs/components'
import Taro, { Component } from '@tarojs/taro'
import { GoodsCategaryApi } from '../../../../apis/index.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import {
  isNotEmpty,
  safeObj,
  mobClick,
  upadataTabBarCount
} from '../../../../utils/YFWPublicFunction.js'
const goodsCategaryApi = new GoodsCategaryApi()
import {YFWCategoryModel} from './Model/YFWCategoryModel.js'
import TitleView from '../../../../components/YFWTitleView/YFWTitleView'
import { set as setGlobalData, get as getGlobalData } from '../../../../global_data'
import { AtList } from 'taro-ui'
import CategoryModel from './Components/YFWCategoryView/YFWCategoryView'
let categoryModel = new YFWCategoryModel()
import './YFWCategory.scss'
class YFWCategory extends Component {
    config = {
      navigationBarTitleText: '商品分类',
      allowsBounceVertical:'NO',
    }
    constructor(props){
        super(props)
        this.state = {
            selectIndex:0,
            data:[],
            scrollheight:'',
            scroll_top:0,
            rightArray:{
              categories:[]
            },
            pageIndex:1,
            rightRenderCount:3,
        }
        this.dataArray = []
    }
    componentWillMount () {
      //   Taro.getSystemInfo({
      //     success: res => {
      //         if (res.model.indexOf('iPhone X') > -1) {
      //           setGlobalData('isIphoneX', true)
      //         }
      //         this.state.scrollheight = res.windowHeight
      //     }
      // })
        // this.requestData()
        Taro.stopPullDownRefresh();
        let options = this.$router.params
        let screenData = options.params && JSON.parse(options.params).index || this.state.selectIndex
        this.state.secondIndex = screenData
        this.requestData()
    }
    requestData(){
        goodsCategaryApi.getCategaryInfo().then(res => {
            // let _res = res.map(item=>{
            //   if(item.name == '计生用品'){
            //     let a = [];
            //     item.items.map(item2=>{
            //       if(item2.name !='情趣用品'){
            //         a.push(item2)
            //       }
            //     })
            //     item.items = a
            //   }
            //   return item;
            // })
            let array = [];
            array = YFWCategoryModel.getModelArray(res)
            this.dataArray = array
            let classArray = array.map((items)=>{
              return {id:items.id,name:items.name}
            })
            console.log(array,'gg')
            let indexs = this.state.secondIndex
            this.setState({
              data: classArray,
              dataArray:array,
              rightArray:array[indexs],
              selectIndex:indexs
            })
            
        })
    }

    
    pressRow (e) {
      let index =e.selectIndex
        // if(index ==0 ||index ==1|| index==2 ||index==3){
        //   that.setState({
        //     selectIndex:index,
        //   })
        //   // this.initRightData(index)
        //   // setTimeout(() => {
        //   //   let dataArray = that.dataArray[index]
        //   //   that.setState({
        //   //     rightArray:dataArray
        //   // })
        //   // }, 50);
        // }else{
        //   let dataArray = that.dataArray[index]
        //   that.setState({
        //     selectIndex:index,
        //     rightArray:dataArray
        // })
        // }
      let dataArray = this.dataArray[index]
      let maxCount = dataArray.categories.length
      let rightRenderCount = 3
      if (maxCount < rightRenderCount) {
        rightRenderCount = maxCount
      }
      this.setState({
        rightRenderCount:rightRenderCount,
        selectIndex:index,
        rightArray:dataArray
      })
    }

   
    pushCategory (event) {
      pushNavigation('get_category', { value: event.currentTarget.id, name: event.currentTarget.dataset.name})
      console.log('分类结果页')
    }

    renderLeftView () {
      const { data, selectIndex } = this.state
      return (
            <View className='left-list'>
              {data.map((items, infoindex) => {
                return (
                  <View className='left-context' key={items.id.toString()+'left'} onClick={this.pressRow.bind(this,infoindex)}>
                    <View
                      className={
                        'leftline-select ' +
                        (infoindex == selectIndex ? 'leftline' : '')
                      }
                    ></View>
                    <Text
                      className={
                        'left-text ' +
                        (infoindex == selectIndex ? 'left-text-select' : '')
                      }
                    >
                      {items.name}
                    </Text>
                  </View>
                )
              })}
                  

            </View>
      )
    }
    //右侧商品
    renderRightView () {
      const { rightArray } = this.state
      const { scrollheight } = this.state
      const { scroll_top } = this.state
      const { selectIndex } = this.state
      const { rightRenderCount } = this.state
      return(
            <ScrollView className='right-list' scrollY scrollTop={scroll_top} onScrollToLower={this.scrollLower.bind(this,rightArray.categories.length)}>
              <View className='context' onClick={this.pushCategory} id={rightArray.id} data-name={rightArray.name}>
                <Image src={rightArray.app_category_ad[0].img_url}></Image>
              </View>
              <View className='class-type'>
                {rightArray.categories.map((secondInfo,secondIndex)=>{
                  if (secondIndex > rightRenderCount-1) {
                    return (<View/>)
                  }
                  return(
                    <View key={secondInfo.id.toString()+'second'}>
                      {this.renderSecondView(secondInfo)}
                      {this.renderCategoryView(secondInfo)}
                    </View>
                  )
                })}
              </View>
            </ScrollView>
      )
    }
    scrollLower (maxCount) {
      const { rightRenderCount } = this.state

      if (maxCount > rightRenderCount) {
        this.setState({
          rightRenderCount:maxCount
        })
      }
    }
    //更多标题
    renderSecondView (secondInfo) {
      const secondName = secondInfo.name
      return(
        <View
          className='class-type-context'
          onClick={this.pushCategory}
          id={secondInfo.id}
          data-name={secondName}
        >
          <View className='class-context-text'>
            <TitleView title={secondName} />
          </View>
          <Text className='more-text'>更多</Text>
        </View>
      )
    }
    //标题分类
    renderCategoryView (secondInfo) {
      // return (<View/>)
      return(
        <View className='goods-view'>
          {secondInfo.categories.map((infos, infoIndex) => {
            return (
              <View
              key={infos.id.toString()+'category'}
              className='goods-context'
              onClick={this.pushCategory}
              id={infos.id}
              data-name={infos.name}
            >
              <Image src={infos.intro_image}></Image>
              <Text>{infos.name}</Text>
            </View>
            )
          })}
        </View>
      )
    }
    
    render() {
        const {data,dataArray,selectIndex} = this.state
        return (
            <View className='container-view'>
              {/* {this.renderLeftView()} */}
              <View className='container-left'>
                <CategoryModel data={data} selectIndex={selectIndex} classData={dataArray} onPressRow={value => { this.pressRow(value) }}/>
              </View>
              {this.renderRightView()}
            </View>
        )
      }
}