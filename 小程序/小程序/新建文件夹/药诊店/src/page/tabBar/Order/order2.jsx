//此备份为状态多选的备份
import { Component } from "react";
import { View, Image, ScrollView, Text } from "@tarojs/components";
import Taro, { render } from "@tarojs/taro";
import OrderListCard from "../../../components/OrderListCard/OrderListCard";
import "./Order.less";
import { connect } from "react-redux";
import { changeState } from "../../../store/actions/index";
import { HTTP } from "../../../utils/http";
import { pushNavigation } from "../../../apis/YFWRouting";
import NoMore from "../../../components/noMore/noMore";
import { transOrderCardData } from "../../../utils/YFWPublicFunction";
const httpRequest = new HTTP();
class Order extends Component {
  constructor() {
    super();

    this.state = {
      selectedTypeName:'',
      scrollTop:1,
      refreshType: false,
      noMoreTip: "正在加载...",
      dataList: [],
      pageEnd: false,
      hasLogin: "unknown", //登录状态
      shopId: '',
      choosedFilter: [],
      showShadow_one: false,
      showShadow_two: false,
      sendTypeAni: false,
      statesAni: false,
      pageIndex: 1,
      typeArr: [],
      selectedTypeValue: "",
      statusArr: [],
      fakeStatusArr: [],
      showDot: false
    };
  }
  componentWillMount() {
    let userinfo = Taro.getStorageSync("userinfo");
    this.state.userinfo = userinfo;
    this.state.shopId = userinfo.shopId
    this.setState({
      userinfo,
      hasLogin: userinfo.mobile ? true : false,
      shopId:userinfo.shopId
    });
  }

  componentDidMount() {
    if(!this.state.shopId)return;
    this.state.fakeStatusArr = JSON.parse(JSON.stringify(this.state.statusArr));
    this.getSearch();//获取查询条件
    this.getlist();
  }
  getSearch(){
    httpRequest.get('guest.getOrderSearchMap').then(res=>{
      if(res){
        let _data = res.OrderTypeList || [],_name='';
        _data = _data.map(item=>{
          if(item.key == '全部'){
            item.choosed = true;
            this.state.selectedTypeValue = item.value;
            this.state.selectedTypeName = item.key;
            _name = item.key;
          }else{
            item.choosed = false;
          }
          return item
        })
        this.setState({
          typeArr:_data,
          statusArr:res.OrderSearchStatus || [],
          selectedTypeName:_name
        })
      }
    },error=>{
      console.log('guest.getOrderSearchMap',error)
    })
  }
  getlist() {
    const { shopId, thirdAccountId } = this.state.userinfo;
    let { pageIndex, pageEnd, dataList,selectedTypeValue,choosedFilter } = this.state;
    choosedFilter = choosedFilter.map(item=>item.value)
    if (pageEnd) return;
    let param = {
      conditions: {
        shopId,
        thirdAccountId,
        ordersearchStatus:choosedFilter.join(),
        orderShippingMethod:selectedTypeValue
      },
      pageSize: 10,
      pageIndex
    };
    console.log('param',param)
    httpRequest.get("order.getOrderList", { ...param }).then(res => {
      if (res.dataList && res.dataList.length != 0) {
        res.dataList = res.dataList.map(item => {
          item.MedicineList = transOrderCardData(item.MedicineList);
          return item;
        });
        dataList = pageIndex == 1 ? [] : dataList;
        dataList = dataList.concat(res.dataList);
        this.setState({
          dataList: dataList,
          pageEnd: dataList.length == res.rowCount ? true : false,
          pageIndex: ++pageIndex,
          refreshType: false,
          noMoreTip:
            dataList.length == res.rowCount ? "没有更多了" : "正在加载..."
        });
      }
    });
  }
  topRefresh() {
    this.state.pageIndex = 1;
    this.state.pageEnd = false;
    this.setState({
      refreshType: true
    });
    this.getlist();
  }
  componentWillUnmount() {}

  componentDidShow() {}
  ScrollToLower() {
    if(pageEnd)return;
    this.getlist();
  }
  componentDidHide() {}
  chooseType(_type) {
    if (_type == "sendType") {
      this.setState({
        sendTypeAni: !this.state.sendTypeAni,
        showShadow_one: !this.state.showShadow_one,
        statesAni: false,
        showShadow_two: false
      });
    } else if (_type == "status") {
      this.setState({
        sendTypeAni: false,
        statesAni: !this.state.statesAni,
        showShadow_two: !this.state.showShadow_two,
        showShadow_one: false
      });
    }
  }
  sendTypeClick({value,key}) {
    if (value == this.state.selectedTypeValue) return;
    this.state.selectedTypeValue = value;
    this.state.selectedTypeName = key;
    let _data = this.state.typeArr.map(item => {
      item.choosed = value == item.value ? true : false;
      return item;
    });
    this.setState({
      typeArr: _data,
      selectedTypeValue: value,
      selectedTypeName:key,
      sendTypeAni: false,
      showShadow_one: false
    });
    this.state.pageEnd = false;
    this.state.pageIndex = 1;
    this.getList();
  }
  statusClick(value) {
    let _data = this.state.statusArr.map(item => {
      item.choosed = value == item.value ? !item.choosed : item.choosed;
      return item;
    });
    this.state.statusArr = _data;
    this.setState({
      statusArr: _data
    });
  }
  resetStatus() {
    let statusArr = this.state.statusArr.map(item=>{
      item.choosed = false;
      return item;
    });
    this.setState({
      statusArr
    });
  }
  confirmStatus() {
    let choosedFilter = this.state.statusArr.filter(item => item.choosed);
    let fakeStatusArr = JSON.parse(JSON.stringify(this.state.statusArr));
    this.setState({
      fakeStatusArr,
      statesAni: false,
      showShadow_two: false,
      choosedFilter
    });
    this.state.pageEnd = false;
    this.state.pageIndex=1;
    this.state.choosedFilter = choosedFilter;
    this.getlist();
  }
  shadowTwoClick() {
    let statusArr = JSON.parse(JSON.stringify(this.state.fakeStatusArr));
    this.setState({
      showShadow_two: false,
      statusArr,
      statesAni: false
    });
  }
  shadowOneClick() {
    this.setState({
      showShadow_one: false,
      sendTypeAni: false
    });
  }
  dotClick() {
    this.setState({
      showDot: !this.state.showDot
    });
  }
  clickDotContent() {
    this.setState({
      showDot: false
    });
  }
  premession(hasLogin) {
    pushNavigation(hasLogin ? "changeStore" : "login");
  }
  btnClick(val,item,e){
    if(val == 'pay_order'){
      this.pay();
    }else if(val == 'cancel_order'){
      this.cancelOrder(item);
    }
  }
  cancelOrder(item){
    Taro.showLoading({ title: '加载中...' ,mask:true})
    httpRequest.get('order.cancel',{orderNo:item.OrderNo}).then(res=>{
      if(res){
        this.state.pageIndex = 1;
        this.state.pageEnd = false;
        this.getlist();
        this.setState({
          scrollTop:0
        })
      }
      Taro.hideLoading();
    },error=>{
      Taro.hideLoading();
      Taro.showToast({
        title: error.msg || '取消订单异常',
        icon: 'none',
        duration: 2000
      })
    })
  }
  render() {
    const {
      choosedFilter,
      showShadow_one,
      showShadow_two,
      sendTypeAni,
      statesAni,
      typeArr,
      statusArr,
      hasLogin,
      selectedTypeName
    } = this.state;
    let that = this;
    return (
      <View className="order">
        {showShadow_one && (
          <View
            className="shadow showShadow_one"
            onClick={this.shadowOneClick.bind(this)}
          ></View>
        )}
        {showShadow_two && (
          <View
            className="shadow showShadow_two"
            onClick={this.shadowTwoClick.bind(this)}
          ></View>
        )}
        <View
          className={`filter ${sendTypeAni ? "sendTypeAni" : ""} ${
            statesAni ? "statesAni" : ""
          }`}
        >
          <View className="filter_top">
            <View
              className="filter_left choosed"
              onClick={this.chooseType.bind(this, "sendType")}
            >
              {selectedTypeName}
              <Image
                className={`trangle_down ${sendTypeAni ? "rotate" : ""}`}
                src={require("../../../images/trangle_down.png")}
              ></Image>
            </View>

            <View className="filter_right">
              <View
                className={`filter_name ${
                  choosedFilter.length != 0 ? "choosed" : ""
                }`}
                onClick={this.chooseType.bind(this, "status")}
              >
                状态筛选
              </View>
              {choosedFilter.length != 0 && (
                <View className="choosed_num">{choosedFilter.length}</View>
              )}
              <Image
                className="filter_icon"
                src={require("../../../images/filter.png")}
              ></Image>
            </View>
          </View>

          {sendTypeAni && (
            <View className={`filter_list`}>
              {typeArr.map(n => {
                return (
                  <View className="filter_list_item" key={n.key}>
                    {n.choosed && (
                      <Image
                        src={require("../../../images/correct.png")}
                        className="correct"
                      ></Image>
                    )}
                    <View
                      className={`filter_list_item_text ${
                        n.choosed ? "choosed" : ""
                      }`}
                      onClick={this.sendTypeClick.bind(this, n)}
                    >
                      {n.key}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
          {statesAni && (
            <View className="status_wrapper">
              <View className="status_list">
                {statusArr.map(q => {
                  return (
                    <View
                      className={`status_list_item ${
                        q.choosed ? "choosed" : ""
                      }`}
                      onClick={this.statusClick.bind(this, q.value)}
                    >
                      {q.key}
                    </View>
                  );
                })}
              </View>
              <View className="buttons">
                <View
                  className="btn reset"
                  onClick={this.resetStatus.bind(this)}
                >
                  重置
                </View>
                <View
                  className="btn confirm"
                  onClick={this.confirmStatus.bind(this)}
                >
                  确定
                </View>
              </View>
            </View>
          )}
        </View>
        {hasLogin != "unknown" && renderList(that, hasLogin)}
      </View>
    );
  }
}
const renderList = (that, hasLogin) => {
  const { showDot, shopId, dataList, noMoreTip, refreshType,scrollTop } = that.state;
  if (hasLogin && shopId) {
    return (
      <ScrollView
        className="scroll"
        lowerThreshold={100}
        onScrollToLower={that.ScrollToLower.bind(that)}
        scrollY
        refresherEnabled={true}
        enableBackToTop={true}
        refresherTriggered={refreshType}
        onRefresherRefresh={that.topRefresh.bind(that)}
        scrollTop={scrollTop}
      >
        {dataList.map(item => {
          return (
            <View className="list">
              <View className="titleLine">
                <View className="left">
                  <View className="typePic bySelf">{item.OrderTypeName}</View>
                  <View className="storeName">{item.ShopTitle}</View>
                </View>
                <View className="right">{item.OrderStatusName}</View>
              </View>
              {item.MedicineList &&
                item.MedicineList.map(m => {
                  return (
                    <View className="listCard">
                      <OrderListCard data={m} />
                    </View>
                  );
                })}
              <View className="total">
                <View className="num size">共2件</View>
                <View className="sum size">合计</View>
                <View className="price_int">￥145.</View>
                <View className="price_float">90</View>
              </View>
              <View className="operation">
                <View className="left" onClick={that.dotClick.bind(that)}>
                  <Image
                    className="dot"
                    src={require("../../../images/dot.png")}
                  ></Image>
                  <View
                    className="hideBtns_wrapper"
                    style={`display:${showDot ? "flex" : "none"}`}
                  >
                    <View className="hide_btns">
                      {["删除"].map(w => {
                        return (
                          <View
                            className="hide_btns_item"
                            onClick={that.clickDotContent.bind(that)}
                          >
                            {w}
                          </View>
                        );
                      })}
                    </View>
                    <View className="arrow"></View>
                  </View>
                </View>
                <View className="right">
                  {item.Buttons &&
                    item.Buttons.map(k => {
                      return (
                        <View
                          className={`button ${
                            k.value == "pay_order" ? "border_green" : ""
                          }`}
                          onClick={that.btnClick.bind(that, k.value,item)}
                        >
                          {k.text}
                        </View>
                      );
                    })}
                </View>
              </View>
            </View>
          );
        })}
        <View className="bottom_tip">
          <NoMore tip={noMoreTip} />
        </View>
      </ScrollView>
    );
  }
  return (
    <View className="noList">
      <Image
        className="nolist_bg"
        src={require("../../../images/noData.png")}
      ></Image>
      <Text className="nodata_tips">
        {hasLogin ? "选择门店后才能查看订单哦" : "登录后才能查看订单哦"}
      </Text>
      <View
        className="nolistBtn"
        onClick={that.premession.bind(that, hasLogin)}
      >
        {hasLogin ? "选择门店" : "去登录"}
      </View>
    </View>
  );
};
export default connect(
  ({ globalData }) => ({
    globalData
  }),
  dispatch => ({
    changeState(data) {
      dispatch(changeState(data));
    }
  })
)(Order);
