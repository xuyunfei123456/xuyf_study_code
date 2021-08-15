import { Component } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  Button,
  Block
} from "@tarojs/components";
import Taro from "@tarojs/taro";
import { AtSearchBar } from "taro-ui";
import "./storeList.less";
import { HTTP } from "../../utils/http";
import StoreCard from "../../components/StoreCard/StoreCard";
import { connect } from "react-redux";
import { changeState } from "../../store/actions/index";
import { trnasStoreCardData } from "../../utils/YFWPublicFunction";
import NoMore from "../../components/noMore/noMore";
import { pushNavigation } from "../../apis/YFWRouting";
const httpRequest = new HTTP();

class StoreLost extends Component {
  constructor() {
    super();
    this.state = {
      searchValue: "",
      data: [],
      addressInfo: 0,
      pageIndex: 1,
      pageSize: 10,
      latitude: "",
      longitude: "",
      pageEnd: false,
      _winh: "",
      hasfirwtRequest: false
    };
  }
  componentWillMount() {
    let { changeState } = this.props;
    this.changeState = changeState;
    const { latitude, longitude } = this.props.globalData;
    if (!latitude && !longitude) {
      this.setState({
        addressInfo: 2
      });
    } else {
      this.state.latitude = latitude;
      this.state.longitude = longitude;
      this.setState({
        addressInfo: 1,
        latitude,
        longitude
      });
      this.getNearestStores();
    }
    let that = this;
    Taro.getSystemInfo({
      success: function(res) {
        let ratio = res.windowWidth / 375;
        let _winh = res.windowHeight * ratio;
        that.setState({
          _winh
        });
      }
    });
  }
  getNearestStores() {
    const { pageSize, pageIndex, pageEnd,latitude,longitude,searchValue } = this.state;
    if (pageEnd) return;
    Taro.showLoading({
      title: '',
    })
    let param = {
      pageSize: pageSize,
      pageIndex: pageIndex,
      conditions: {
        lat: latitude,
        lng: longitude,
        title:searchValue
      }
    };
    httpRequest.get("guest.getNearestStorePageData", { ...param }).then(res => {
      if (res && res.dataList && res.dataList.length != 0) {
        let newData = trnasStoreCardData(res.dataList, 1);
        const { data, pageIndex } = this.state;
        let _data = data.concat(newData);
        this.setState({
          data: _data,
          pageEnd: _data.length == res.rowCount ? true : false,
          pageIndex: pageIndex + 1,
          hasfirwtRequest: true
        });
      }
      Taro.hideLoading()
    },error=>{
      Taro.hideLoading()
    });
  }
  openGps() {
    let that = this;
    Taro.getLocation({
      type: "wgs84",
      success: function(res) {
        console.log("获取经纬度成功");
        let latitude = res.latitude,
          longitude = res.longitude;
          that.state.latitude = latitude;
          that.state.longitude = longitude;
        that.setState({
          latitude,
          longitude,
          addressInfo: 1
        });
        that.changeState({ latitude: latitude, longitude: longitude });
        that.getNearestStores();
      },
      fail: res => {
        console.log(res);
      }
    }).catch(err => {
      console.log(err);
    });
  }
  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {
    if (!this.state.latitude) {
      this.openGps();
    }
  }
  storeDetail(shopId,distance,e){
    e.stopPropagation(); // 阻止事件冒泡
    pushNavigation('storeDetail',{shopId,distance,})
  }
  componentDidHide() {}
  onBlur(e) {
    console.log('blur',e)
    if(this.state.searchClearFlag){
      this.state.searchClearFlag = false;
      return;
    }
    const { value } = e.detail;
    if (this.state.searchValue != "" && value == this.state.searchValue) return;
    this.setState({
      searchValue: value
    });
    this.state.pageIndex=1;
    this.state.pageEnd=false;
    this.state.searchValue = value;
    this.state.data=[];
    this.getNearestStores()
  }
  searchClick(e) {
    console.log('searchClick',e)
  }
  serachClear() {
    this.setState({
      searchValue: ""
    });
    this.state.pageIndex=1;
    this.state.pageEnd=false;
    this.state.searchValue = '';
    this.state.data=[];
    this.state.searchClearFlag = true;
    this.getNearestStores()
  }
  chooseStore(shopId,distance){
    let userInfo = Taro.getStorageSync('userinfo');
    userInfo.shopId = shopId;
    Taro.setStorageSync('userinfo',userInfo)
    Taro.setStorageSync('forHomeShopInfo',{shopId,distance,from:'storeList'})
    Taro.navigateBack()
  }
  render() {
    const { data, addressInfo, hasfirwtRequest,latitude } = this.state;
    const that = this;
    const disabled = latitude ? false:true
    return (
      <View className="Wrapper">
        <View className="searchBar">
          <AtSearchBar
            actionName="搜索"
            value={this.state.searchValue}
            onBlur={this.onBlur.bind(this)}
            onActionClick={this.searchClick.bind(this)}
            onClear={this.serachClear.bind(this)}
            disabled={disabled}
          />
        </View>
        {renderList(that)}

        {addressInfo != 0 && data.length == 0 && hasfirwtRequest && (
          <View className="noresultWrapper">
            <Image
              src={require("../../images/noreuslt.png")}
              className="noreuslt"
            />
            <View className="noresult_tip">
              {addressInfo == 1
                ? "暂无符合条件的门店"
                : "无法获取附近的店铺列表，请先开启位置授权"}
            </View>
          </View>
        )}
        {addressInfo == 2 && (
          <View className="openGps">
            <View className="openGps_left">
              <Image
                className="location"
                src={require("../../images/location.png")}
              ></Image>
              <Text className="location_text">请先开启位置授权</Text>
            </View>
            <Button className="openGps_right" openType="openSetting">
              去开启
            </Button>
          </View>
        )}
      </View>
    );
  }
}
export default connect(
  ({ globalData }) => ({
    globalData
  }),
  dispatch => ({
    changeState(data) {
      dispatch(changeState(data));
    }
  })
)(StoreLost);

const renderList = that => {
  const { addressInfo, data, _winh } = that.state;
  if (addressInfo == 1) {
    return (
      <Block>
        {data.length != 0 && (
          <ScrollView scrollY className="searchWrapper">
            {data.map((item) => {
              return (
                <View className="store_card" onClick={that.chooseStore.bind(this,item.shopId,item.distance)}>
                  <StoreCard data={item} actionFn={that.storeDetail.bind(that,item.shopId,item.distance)} />
                </View>
              );
            })}
            <View className="bottom_tip">
              <NoMore />
            </View>
          </ScrollView>
        )}
      </Block>
    );
  }
  return <View></View>;
};
