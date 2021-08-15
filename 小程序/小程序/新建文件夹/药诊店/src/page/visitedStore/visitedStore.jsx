import { Component } from "react";
import { View, ScrollView,Image  } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./visitedStore.less";
import { connect } from "react-redux";
import { HTTP } from "../../utils/http";
import StoreCard from '../../components/StoreCard/StoreCard'
import NoMore from "../../components/noMore/noMore";
import { trnasStoreCardData } from "../../utils/YFWPublicFunction";
import { pushNavigation } from "../../apis/YFWRouting";
const httpRequest = new HTTP();
class VisitedStore extends Component {
  constructor() {
    super();

    this.state = {
      data:[]
    };
  }
  componentWillMount() {
    
  }

  componentDidMount() {
    this.getList();
  }
  getList(){
    let userinfo = Taro.getStorageSync('userinfo');
    if(!userinfo.thirdAccountId)return;
    const {latitude,longitude} = this.props.globalData;
    Taro.showLoading()
    httpRequest.get('guest.getAccountLogList',{thirdAccountId:userinfo.thirdAccountId,lat:latitude,lon:longitude}).then(res=>{
      Taro.hideLoading();
      res =  trnasStoreCardData(res, 1);
      this.setState({
        data:res
      })
      
    },error=>{
      Taro.hideLoading();
    })
  }
  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}
  onScrollToLower (){

  }
  render() {
    const {data} = this.state;
    const that=  this;
    return (
      <View>
        {renderList(that)}
      </View>

    );
  }
  clickCard({shopId,distance}){
    Taro.setStorageSync('forHomeShopInfo',{shopId,distance,from:'visitedStore'});
    pushNavigation('home')
  }
  toDdetail({shopId,distance},e){
    e&&e.stopPropagation(); // 阻止事件冒泡
    pushNavigation('storeDetail',{shopId,distance,})
  }
}
export default connect(
  ({ globalData }) => ({
    globalData
  }),
  dispatch => ({

  })
)(VisitedStore);

const renderList = that=>{
  const {data} = that.state;
  if(data.length == 0){
    return (
      <View className="noresultWrapper">
      <Image
        src={require("../../images/noreuslt.png")}
        className="noreuslt"
      />
      <View className="noresult_tip">
          没有到过的店
      </View>
    </View>
    )
  }
  return (
    <ScrollView className="wrapper" scrollY onScrollToLower={that.onScrollToLower.bind(that)}>
    {data.map(item=>{
      return (
        <View className="store_card" onClick={that.clickCard.bind(that,item)}>
          <StoreCard data={item} actionFn={that.toDdetail.bind(that,item)} />
        </View>
      )
    })}
    <View className="bottom_tip"><NoMore /></View>
</ScrollView>
  )
}
