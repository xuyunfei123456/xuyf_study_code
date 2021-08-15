import { Block, View, Image, Text, ScrollView } from '@tarojs/components'
import Taro, { Component } from '@tarojs/taro'
// pages/YFWHomeFindModule/YFWFindYaoPage/YFWFindYao.js
import { FindGoodsApi, MessageApi } from '../../../apis/index.js'
import { pushNavigation } from '../../../apis/YFWRouting.js'
import {
  isNotEmpty,
  safeObj,
  mobClick,
  upadataTabBarCount
} from '../../../utils/YFWPublicFunction.js'
const findGoodsApi = new FindGoodsApi()
const messageApi = new MessageApi()
import { YFWFindYaoShopModel } from './Model/YFWFindYaoShopModel.js'
const findYaoShopModel = new YFWFindYaoShopModel()
import { scanCode } from '../../../utils/YFWScanCode.js'
import { config } from '../../../config.js'
import TitleView from '../../../components/YFWTitleView/YFWTitleView'
import YFWMessageRedPointView from '../../../components/YFWMessageRedPointView/YFWMessageRedPointView'
import YFWHealthAskAllDepartView from '../../../components/YFWHealthAskAllDepartView/YFWHealthAskAllDepartView'
import './YFWFindYao.scss'
const app = Taro.getApp()

export default class YFWFindYao extends Component {
    config = {
      navigationBarTitleText: '找药',
    }
    constructor (props) {
        super (props)
        this.state = {
            text: '',
            address: '上海市',
            data: [],
            shopData: [],
            dataSource: [
            {
                key: '分类找药',
                data: [],
                images: [
                require('../../../images/findyao/sort_icon_zxyp.png'),
                require('../../../images/findyao/sort_icon_ysbj.png'),
                require('../../../images/findyao/sort_icon_ylqx.png'),
                require('../../../images/findyao/sort_icon_jsyp.png'),
                require('../../../images/findyao/sort_icon_zyyp.png'),
                require('../../../images/findyao/sort_icon_mrhf.png')
                ],
                id: 0
            },
            {
                key: '附近的药房',
                data: [],
                images: [],
                id: 1
            },
            {
                key: '高发疾病',
                data: [],
                images: [
                require('../../../images/findyao/sort_icon_FT.png'),
                require('../../../images/findyao/sort_icon_FR.png'),
                require('../../../images/findyao/sort_icon_WY.png'),
                require('../../../images/findyao/sort_icon_XC.png'),
                require('../../../images/findyao/sort_icon_GXY.png'),
                require('../../../images/findyao/sort_icon_TNB.png'),
                require('../../../images/findyao/sort_icon_ZF.png'),
                require('../../../images/findyao/sort_icon_FSB.png'),
                require('../../../images/findyao/sort_icon_RXA.png'),
                require('../../../images/findyao/sort_icon_GA.png'),
                require('../../../images/findyao/sort_icon_TF.png'),
                require('../../../images/findyao/sort_icon_JZB.png')
                ],
                id: 2
            },
            {
                key: '热门品牌',
                data: [],
                images: [
                require('../../../images/findyao/sort_icon_YNBY.png'),
                require('../../../images/findyao/sort_icon_RH.png'),
                require('../../../images/findyao/sort_icon_TRT.png'),
                require('../../../images/findyao/sort_icon_999.png'),
                require('../../../images/findyao/sort_icon_BYS.png'),
                require('../../../images/findyao/sort_icon_YST.png'),
                require('../../../images/findyao/sort_icon_TCBJ.png'),
                require('../../../images/findyao/sort_icon_TT.png'),
                require('../../../images/findyao/sort_icon_PZH.png'),
                require('../../../images/findyao/sort_icon_SC.png'),
                require('../../../images/findyao/sort_icon_HSY.png'),
                require('../../../images/findyao/sort_icon_QS.png')
                ],
                id: 3
            }
            ],
            messageCount: 0
        }
    }
    componentDidMount () {
        findGoodsApi.getFindGoodsInfo().then(response=>{
            this._handle_requestData_TCP(response)
        })  
    }
    componentDidShow () {
      upadataTabBarCount()
      let ssid = Taro.getStorageSync('cookieKey')
      if (ssid && ssid.length > 0) {
        messageApi.getMessageUnreadCount().then((result) => {
          console.log(result)
          this.setState({
            messageCount: result
          })
        })
      }
    }
    _handle_requestData_TCP(res){
        let dataSource = this.state.dataSource 
        let categoryData = []
        if (isNotEmpty(res.main_category)){
          res.main_category.forEach((item,index)=>{
            categoryData.push({
              id:item.id,
              name: item.name,
              img: dataSource[0].images[index]
            })
          })
        }
        let diseaseData = []
        if (isNotEmpty(res.top_disease)) {
          res.top_disease.forEach((item, index) => {
            diseaseData.push({
              id: item.id,
              name: item.name,
              hot: item.hot,
              img: dataSource[2].images[index]
            })
          })
        }
        let brandData = []
        if (isNotEmpty(res.top_brand)) {
          res.top_brand.forEach((item, index) => {
            brandData.push({
              name: item.name,
              img: dataSource[3].images[index]
            })
          })
        }
    
        dataSource[0].data = categoryData
        dataSource[1].data = res.near_shop
        dataSource[2].data = diseaseData
        dataSource[3].data = brandData
          //
        let shopArray = [];
        shopArray = findYaoShopModel.getModelData(res.near_shop);
          this.setState({
            dataSource: dataSource,
            shopData:shopArray
            
          })
      
    
      }
    bindScanTap (e) {
      e.stopPropagation()
      scanCode()
    }
    //跳转分类页
    toCategoryMethod(index) {
      console.log(index)
      pushNavigation('get_all_category',{index:index})
    }
    //事件处理函数
    bindSearchTap(text) {
      console.log(text)
      console.log('搜索页')
      pushNavigation('get_search')
    }
    //跳转商家详情
    toShopDetaiMethod(id) {
      console.log(id)
      pushNavigation('get_shop_detail',{value:id})
    }
      //跳转分类详情列表
    toSubCategoryMethod(id,name) {
      pushNavigation('get_category', { value: id, name: name })
    }
    //跳转搜索页面(热门品牌)
    toSearchMethod(name) {
      pushNavigation('get_search', { value: name })
      console.log(name)
    }
    //附近商家
    nearShopMethod(event) {
      console.log('附近的药店')
      pushNavigation('get_around_store')
    }
    
     /**
     * 用户点击右上角分享
     */
    onShareAppMessage () {
      return {
        title: config.share_title,
        imageUrl: config.share_image_url
      }
    }
    render() {
      const { messageCount, dataSource, shopData } = this.state
      return (
        <View className="container">
            <View className="top_container_another">
              <View className="top_content">
                <View onClick={this.bindSearchTap.bind(this,'fhdf')} className="top_search_another">
                  <Image
                    className="top_search_left_icon"
                    src={require('../../../images/top_bar_search.png')}
                  ></Image>
                  <Text className="top_search_title">
                    批准文号、通用名、商品名、症状
                  </Text>
                  <View className="top_search_right" onClick={this.bindScanTap}>
                    <Image
                      className="top_search_scan"
                      src={require('../../../images/qr_sys.png')}
                    ></Image>
                  </View>
                </View>
                <YFWMessageRedPointView messagecount = {messageCount} /> 
              </View>
            </View>
            <View className="scroll_view">
              <ScrollView
                scrollX="false"
                scrollY="true"
                className="list_view"
                scrollTop
              >
                {dataSource.map((dataInfo, index) => {
                  const titleName = dataInfo.key
                  return (
                    <Block key={dataInfo.id}>
                      <View
                        className="header_view"
                        onClick={
                          dataInfo.id == 0
                            ? this.toCategoryMethod.bind(this,index)
                            : dataInfo.id == 1
                            ? this.nearShopMethod
                            : ''
                        }
                      >
                        <View className='header_text'>
                          <TitleView title = {titleName}/>
                        </View>
                        {dataInfo.id == 0 && (
                          <Image
                            src={require('../../../images/around_detail_icon.png')}
                            className="header_icon"
                          ></Image>
                        )}
                        {dataInfo.id == 1 && (
                          <Image
                            src={require('../../../images/around_detail_icon.png')}
                            className="header_icon"
                          ></Image>
                        )}
                      </View>
                      {dataInfo.id == 0 && (
                        <View className="findyao">
                          {dataInfo.data.map((items, index) => {
                            return (
                              <Block key="key">
                                <Image
                                  src={items.img}
                                  className="find_class"
                                  onClick={this.toCategoryMethod.bind(this,index)}
                                ></Image>
                              </Block>
                            )
                          })}
                        </View>
                      )}
                      {dataInfo.id == 1 && (
                        <View className="find_near">
                          {shopData.map((items, index) => {
                            return (
                              <Block key="key">
                                <View
                                  className="find_near_contextView"
                                  onClick={this.toShopDetaiMethod.bind(this,items.id)}
                                >
                                  <View className="find_near_img">
                                    <Image
                                      src={items.logo_img_url}
                                      className="find_near_icon"
                                      mode="aspectFit"
                                    ></Image>
                                  </View>
                                  <View className="find_near_context">
                                    <Text className="find_shop_title">
                                      {items.title}
                                    </Text>
                                    <Text className="find_shop_loaction">
                                      {items.distance}
                                    </Text>
                                    <View className="find_shop_status">
                                      <Image
                                        src={require('../../../images/check_checked.png')}
                                        className="logistics_status_icon"
                                      ></Image>
                                      <Text className="logistics_status_text">
                                        已签约
                                      </Text>
                                      <Image
                                        src={require('../../../images/findyao/sort_icon_star.png')}
                                        className="evaluation_icon"
                                      ></Image>
                                      <Text className="evaluation_text">
                                        {items.star}
                                      </Text>
                                    </View>
                                  </View>
                                  <Image
                                    src={require('../../../images/findyao/sort_icon_jdkk.png')}
                                    className="find_jdkk"
                                  ></Image>
                                </View>
                              </Block>
                            )
                          })}
                        </View>
                      )}
                      {dataInfo.id == 2 && (
                        <View className="findyao_disease">
                          {dataInfo.data.map((items, index) => {
                            return (
                              <Block key="key">
                                <Image
                                  src={items.img}
                                  className="find_jibi"
                                  onClick={this.toSubCategoryMethod.bind(this,items.id,items.name)}
                                ></Image>
                              </Block>
                            )
                          })}
                        </View>
                      )}
                      {dataInfo.id == 3 && (
                        <View className="findyao_next">
                          {dataInfo.data.map((items, index) => {
                            return (
                              <Block key="key">
                                <Image
                                  src={items.img}
                                  className="find_hot_image"
                                  onClick={this.toSearchMethod.bind(this,items.name)}
                                ></Image>
                              </Block>
                            )
                          })}
                        </View>
                      )}
                    </Block>
                  )
                })}
              </ScrollView>
            </View>
          </View>
      )
    }
    

}
