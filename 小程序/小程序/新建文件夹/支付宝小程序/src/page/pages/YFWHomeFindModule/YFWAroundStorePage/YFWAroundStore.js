import { View, Text, Map, CoverView, CoverImage } from '@tarojs/components';
import Taro, { Component } from '@tarojs/taro'
import './YFWAroundStore.scss'
import { SearchApi, ShopDetailApi } from '../../../../apis/index.js'
const searchApi = new SearchApi()
import { YFWSearchShopModel } from '../YFWSearchPage/Model/YFWSearchShopModel.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { ENETDOWN } from 'constants';
class YFWAroundStore extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showingTable:false,
            frameClassMain: 'frame z1',//默认正面在上面
            frameClassBack: 'frame z2',
            shops:[],
            marker:[],
            scale:14,
            latitude:'31.236276',
            longitude:'121.480248',
        }
    }

    componentWillMount () {
        searchApi.getAssociationShop().then((response) => {
            let data = YFWSearchShopModel.getModelArray(response.dataList);
            var marker =[]
            data.forEach((item, index) => {
              if(process.env.TARO_ENV=='swan'){
                marker.push({
                  markerId: item.id,
                  latitude: item.latitude,
                  longitude: item.longitude,
                  iconPath: require('../../../../images/findyao/FJYD_icon_WXZ.png'),
                  title: item.title,
                  width:19,
                  height:23,
                  zIndex:999999,
                  callout: {
                    display: 'BYCLICK',
                    content: item.title
                  }
                
                })
              }else{
                marker.push({
                  id: item.id,
                  latitude: item.latitude,
                  longitude: item.longitude,
                  iconPath: require('../../../../images/findyao/FJYD_icon_WXZ.png'),
                  title: item.title,
                  width:19,
                  height:23,
                  zIndex:999999,
                
                })
              }
              
            })
            this.setState({
              shops: data,
              marker: marker
            })
          })
    }
    componentDidMount () {
      this.mapCtx = Taro.createMapContext('map')
    }
    
    switchMapTable() {
        var that = this
        this.state.showingTable = !this.state.showingTable
        var that = this
        if (
          this.state.frameClassMain == 'frame z1' &&
          this.state.frameClassBack == 'frame z2'
        ) {
          that.setState({
            frameClassMain: 'frame front',
            frameClassBack: 'frame back'
          })
          setTimeout(function() {
            that.setState({
              frameClassMain: 'frame z2',
              frameClassBack: 'frame z1',
              showingTable: true
            })
          }, 600)
        } else {
          that.setState({
            frameClassMain: 'frame back',
            frameClassBack: 'frame front'
          })
          setTimeout(function() {
            that.setState({
              frameClassMain: 'frame z1',
              frameClassBack: 'frame z2',
              showingTable: false
            })
          }, 600)
        }
    }
    makertap(e) {
        var that = this;
        var id = e.markerId;
        console.log('ENETDOWN')
        // pushNavigation('get_shop_detail', { value: id })
    }
    //跳转商家详情
    toShopDetaiMethod(event) {
        if (event.currentTarget.id=='map'){
        var id = event.markerId+''
        }else{
        var id = event.currentTarget.id
        }
      
        console.log(id)
        pushNavigation('get_shop_detail', {value: id})

    }
    render() {
        const {
          frameClassMain,
          latitude,
          longitude,
          marker,
          scale,
          frameClassBack,
          key,
          shops,
          showingTable
        } = this.state
        return (
          <View className="container">
            {process.env.TARO_ENV == 'tt'?(
              <View className="around-context">
                <View className={frameClassMain}>
                  <ScrollView
                    scrollX="false"
                    scrollY="true"
                    className="list_view"
                    scrollTop
                  >
                    {shops.map((item, index) => {
                      return (
                        <Block>
                          <View
                            className="find_near_context_view"
                            onClick={this.toShopDetaiMethod}
                            data-item={item}
                            id={item.id}
                          >
                            <View className="find_near_img">
                              <Image
                                src={item.logo_img_url}
                                className="find_near_icon"
                                mode="aspectFit"
                              ></Image>
                            </View>
                            <View className="find_near_context">
                              <Text className="find_shop_title">{item.title}</Text>
                              <View className="find_shop_status">
                                <Image
                                  src={require('../../../../images/check_checked.png')}
                                  className="logistics_status_icon"
                                ></Image>
                                <Text className="logistics_status_text">已签约</Text>
                                <Image
                                  src={require('../../../../images/findyao/sort_icon_star.png')}
                                  className="evaluation_icon"
                                ></Image>
                                <Image
                                  src={require('../../../../images/findyao/sort_icon_star.png')}
                                  className="evaluation_icon"
                                ></Image>
                                <Image
                                  src={require('../../../../images/findyao/sort_icon_star.png')}
                                  className="evaluation_icon"
                                ></Image>
                                <Image
                                  src={require('../../../../images/findyao/sort_icon_star.png')}
                                  className="evaluation_icon"
                                ></Image>
                                <Image
                                  src={require('../../../../images/findyao/sort_icon_star.png')}
                                  className="evaluation_icon"
                                ></Image>
                                <Text className="evaluation_text">{item.star}</Text>
                                <View className="kind"></View>
                                <Text className="find_shop_loaction">
                                  {item.distance}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </Block>
                      )
                    })}
                  </ScrollView>
                </View>
              </View>
            ):(<View className="around-context">
              <View className={frameClassMain}>
                <Map
                  className="map_view"
                  id="map"
                  latitude={latitude}
                  longitude={longitude}
                  markers={marker}
                  onMarkertap={this.makertap}
                  scale={scale}
                  onCallouttap={this.toShopDetaiMethod}
                  showLocation
                ></Map>
              </View>
              <View className={frameClassBack}>
                <ScrollView
                  scrollX="false"
                  scrollY="true"
                  className="list_view"
                  scrollTop
                >
                  {shops.map((item, index) => {
                    return (
                      <Block>
                        <View
                          className="find_near_context_view"
                          onClick={this.toShopDetaiMethod}
                          data-item={item}
                          id={item.id}
                        >
                          <View className="find_near_img">
                            <Image
                              src={item.logo_img_url}
                              className="find_near_icon"
                              mode="aspectFit"
                            ></Image>
                          </View>
                          <View className="find_near_context">
                            <Text className="find_shop_title">{item.title}</Text>
                            <View className="find_shop_status">
                              <Image
                                src={require('../../../../images/check_checked.png')}
                                className="logistics_status_icon"
                              ></Image>
                              <Text className="logistics_status_text">已签约</Text>
                              <Image
                                src={require('../../../../images/findyao/sort_icon_star.png')}
                                className="evaluation_icon"
                              ></Image>
                              <Image
                                src={require('../../../../images/findyao/sort_icon_star.png')}
                                className="evaluation_icon"
                              ></Image>
                              <Image
                                src={require('../../../../images/findyao/sort_icon_star.png')}
                                className="evaluation_icon"
                              ></Image>
                              <Image
                                src={require('../../../../images/findyao/sort_icon_star.png')}
                                className="evaluation_icon"
                              ></Image>
                              <Image
                                src={require('../../../../images/findyao/sort_icon_star.png')}
                                className="evaluation_icon"
                              ></Image>
                              <Text className="evaluation_text">{item.star}</Text>
                              <View className="kind"></View>
                              <Text className="find_shop_loaction">
                                {item.distance}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </Block>
                    )
                  })}
                </ScrollView>
              </View>
            </View>)}
            {process.env.TARO_ENV == 'swan'?(
              <CoverView class='map-tab' onClick={this.switchMapTable}>
                <CoverImage class='img' src={showingTable ? require('../../../../images/map.png') : require('../../../../images/medicine_list.png')}/>
              </CoverView>
            ):process.env.TARO_ENV == 'tt'?(<View/>):(<View className="map-tab" onClick={this.switchMapTable}>
              <Image
                src={showingTable ? require('../../../../images/map.png') : require('../../../../images/medicine_list.png')}
              ></Image>
            </View>)}
            
          </View>
        )
      }
}