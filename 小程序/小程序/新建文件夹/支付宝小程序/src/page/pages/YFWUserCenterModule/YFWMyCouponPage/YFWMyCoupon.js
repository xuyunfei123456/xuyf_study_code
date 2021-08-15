import {
  Block,
  View,
  ScrollView,
  Swiper,
  SwiperItem,
  Image,
  Text,
} from "@tarojs/components";
import Taro, { Component, Config } from "@tarojs/taro";
import { config } from "../../../../config.js";
import { UserCenterApi, PublicApi } from "../../../../apis/index.js";
const userCenterApi = new UserCenterApi();
import { isNotEmpty, tcpImage } from "../../../../utils/YFWPublicFunction.js";
import { pushNavigation } from "../../../../apis/YFWRouting.js";
import Titleview from "../../../../components/YFWTitleView/YFWTitleView";
import NoHasCoupon from "../../../../components/YFWNoHasCoupon/YFWNoHasCoupon";
import "./YFWMyCoupon.scss";
const publicApi = new PublicApi();
export default class YFWMyCoupon extends Taro.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectIndex: 0,
      dataSource: [
        {
          id: 0,
          name: "全部",
          items: [],
          pageEnd: false,
          pageIndex: 1,
        },
        {
          id: 1,
          name: "单品券",
          items: [],
          pageEnd: false,
          pageIndex: 1,
        },
        {
          id: 2,
          name: "店铺券",
          items: [],
          pageEnd: false,
          pageIndex: 1,
        },
        {
          id: 3,
          name: "平台券",
          items: [],
          pageEnd: false,
          pageIndex: 1,
        },
      ],
      listHeight: 600,

      env_type: process.env.TARO_ENV,
      windowHeight:null,
    };
  }

  componentWillMount() {
    let that = this;
    Taro.getSystemInfo({
      success: function (res) {
        that.state.windowHeight = res.windowHeight;
        let clientHeight = res.windowHeight;
        let clientWidth = res.windowWidth;
        let ratio = 750 / clientWidth;
        that.state.ratio = ratio;
        let query = Taro.createSelectorQuery();
        query.select("#separateView").boundingClientRect();
        query.selectViewport().scrollOffset();
        query.exec(function (res) {
          let height = (clientHeight - res[0].bottom) * ratio;
          let _listHeight = clientHeight * ratio - 180;
          that.setState({
            listHeight: _listHeight,
          });
        });
      },
    });
    this.state.dataSource.map((item, index) => {
      this.getData(item);
    });
  }

  showMore = () => {
    let that = this;
    let query = Taro.createSelectorQuery();
    query.select("#more_image").boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(function (res) {
      let bottom = res[0].bottom * that.state.ratio;
      that.selectComponent("#moreview").showModal(bottom + 30);
    });
  };

  /**跳转商家 */
  itemClick = (e) => {
    let item = e.currentTarget.dataset.item;
    if (item.dict_bool_status != 0) {
      return;
    }
    if (item.dict_coupons_type == 1) {
      pushNavigation("get_shop_detail", { value: item.storeid });
    } else if (item.dict_coupons_type == 2) {
      if (isNotEmpty(item.medicineid)) {
        pushNavigation("get_goods_detail", { value: item.medicineid });
      } else {
        pushNavigation("get_shop_goods_detail", {
          value: item.store_medicineid,
        });
      }
    } else {
      pushNavigation("get_home");
    }
  };
  // 跳转到优惠券使用记录页面
  couponUseRecord() {
    pushNavigation("get_my_coupon_type");
  }

  /**顶部点击事件 */
  changeIndex = (event) => {
    let index = event.currentTarget.dataset.index;
    this.setState({
      selectIndex: index,
    });
  };

  /**侧滑 */
  swiperChangIndex = (event) => {
    if (event.detail.source == "touch") {
      this.setState({
        selectIndex: event.detail.current,
      });
    }
  };

  requestNextPage = (e) => {
    let item = this.state.dataSource[this.state.selectIndex]
    if(item.pageEnd){
      return
    }else{
      this.getData(item)
    }
  };

  hideLoadingView = () => {
    this.setState({
      pageEnd: false,
    });
  };
  // 跳转到领取中心页面
  couponGetCenter() {
    publicApi.getCouponUrl().then(
      (res) => {
        pushNavigation("get_h5", { value: res.coupon_url });
      },
      (error) => {
        console.log(error);
      }
    );
  }
  _goCoupon() {
    this.couponGetCenter();
  }
  getTimeString(startStr, endStr) {
    let time_start = startStr.split(" ")[0];
    let time_end = endStr.split(" ")[0];
    let start_time = time_start.replace(/-/gi, ".");
    let end_time = time_end.replace(/-/gi, ".");
    return start_time + "-" + end_time;
  }

  setType(type) {
    if (type == 1) {
      return "店铺";
    } else if (type == 2) {
      return "单品";
    } else {
      return "平台";
    }
  }

  /**获取优惠劵信息 */
  getData = (item) => {
    let that = this;
    userCenterApi
      .getMyCoupons(item.pageIndex, "0", item.id)
      .then((response) => {
        let data = response.dataList || [];
        ++item.pageIndex;
        if (data.length < 20) {
          item.pageEnd = true;
        }
        item.items = item.items.concat(data);
        item.total = response.rowCount
        that.state.dataSource[item.id] = item;
        that.setState({
          dataSource: that.state.dataSource,
        });
      });
  };

  config = {
    navigationBarTitleText: "我的优惠券",
    navigationBarBackgroundColor: "#49ddb8",
    navigationBarTextStyle: "white",
    pullRefresh:"false",
    allowsBounceVertical :'NO'

  };

  render() {
    const {
      selectIndex,
      dataSource,
      listHeight,
      pageEnd,
      env_type,
    } = this.state;
    let windowHeight = this.state.windowHeight
    return (
      <View className="container" style={{height:windowHeight}}>
        <View className="goodsView">
          <View
            className="goodsView-top"
          >
            {dataSource.map((item, index) => {
              let _name = item.name ? item.name + "(" + item.total + ")" : "";
              return (
                <Block>
                  <View
                    className="goodsView-top-item"
                    onClick={this.changeIndex}
                    data-index={index}
                    id={"item-" + index}
                  >
                    <Titleview
                      title={_name}
                      showLine={index == selectIndex}
                      fontSize={28}
                    ></Titleview>
                  </View>
                </Block>
              );
            })}
          </View>
          <View className="separate" id="separateView"></View>
          <Swiper
            current={selectIndex}
            className="goodsView-content"
            onChange={this.swiperChangIndex}
            style={"height:" + listHeight + "rpx;"}
          >
            {dataSource.map((info, swiperIndex) => {
              return (
                <Block>
                  <SwiperItem>
                    <ScrollView
                      className="goodsView-swiper-item"
                      scrollY="true"
                      onScrollToLower={this.requestNextPage}
                      style={"height:" + listHeight + "rpx;"}
                    >
                      {dataSource[swiperIndex].items.length > 0 ? (
                        <View>
                          {dataSource[swiperIndex].items.map((item, index) => {
                            if (item.storelogourl) {
                              item.storelogourl =
                                item.storelogourl.indexOf("http") == -1
                                  ? config.cdn_url + item.storelogourl
                                  : item.storelogourl;
                            }
                            if (item.intro_image) {
                              item.intro_image =
                                item.intro_image.indexOf("http") == -1
                                  ? config.cdn_url + item.intro_image
                                  : item.intro_image;
                            }
                            return (
                              <View
                                className="coupon"
                                onClick={this.itemClick}
                                data-item={item}
                              >
                                <View className="cou_left">
                                  <Image
                                    src={
                                      item.dict_bool_status == 1
                                        ? item.intro_image
                                        : item.storelogourl
                                        ? item.storelogourl
                                        : item.intro_image
                                    }
                                    className="leftImg"
                                  ></Image>
                                </View>
                                <View className="cou_center">
                                  <View className="mony">
                                    <Text>¥</Text>
                                    {item.price}
                                    <Text className="fullR">
                                      {item.use_condition_price_desc}
                                    </Text>
                                  </View>

                                  <View className="rg_one">
                                    <View className={"evem"}>
                                      {this.setType(item.dict_coupons_type)}
                                    </View>
                                    <View className={"rg_oneSec"}>
                                      {item.store_title}
                                    </View>
                                    <View className="cear"></View>
                                  </View>
                                  <View className="rg_three myflex">
                                    <Text className="rg_threeO">
                                      {this.getTimeString(
                                        item.start_time,
                                        item.expire_time
                                      )}
                                    </Text>
                                  </View>
                                </View>
                                <View className="cou_right">
                                  <Text className="use_go">去使用</Text>
                                </View>
                              </View>
                            );
                          })}
                          <View
                            className={
                              env_type == "alipay"
                                ? "onloading"
                                : "onloading-alipay"
                            }
                          >
                            <View className="load-wrap">
                              {!info.pageEnd ? (
                                <View className="loading-more">
                                  <Image
                                    src={require("../../../../images/loading_cycle.gif")}
                                    className="loading"
                                  ></Image>
                                  <View className="text">加载更多...</View>
                                </View>
                              ) : (
                                <View className="load-wrap">
                                  <View className="loadover">
                                    没有更多数据了~
                                  </View>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      ) : (
                        <NoHasCoupon
                          goCoupon={this._goCoupon.bind(this)}
                        ></NoHasCoupon>
                      )}
                    </ScrollView>
                  </SwiperItem>
                </Block>
              );
            })}
          </Swiper>
          <View className="bottom_coupon">
            <View onClick={this.couponUseRecord}>优惠券使用记录</View>
            <View className="cut-off-rule"></View>
            <View onClick={this.couponGetCenter}>领取中心</View>
          </View>
        </View>
      </View>
    );
  }
}
