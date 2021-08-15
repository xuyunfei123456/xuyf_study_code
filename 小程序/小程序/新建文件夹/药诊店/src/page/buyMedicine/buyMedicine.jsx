import { Component } from "react";
import { View, Image, ScrollView } from "@tarojs/components";
import { AtTabs, AtTabsPane } from "taro-ui";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import "./buyMedicine.less";
import { connect } from "react-redux";
import { HTTP } from "../../utils/http";
import GoodsCard from "../../components/GoodsCard/GoodsCard";
import MedicineBag from "../../components/MedicineBag/MedicineBag";
import { pushNavigation } from "../../apis/YFWRouting";
import { isLogin, transFormData } from "../../utils/YFWPublicFunction";
import NoMore from "../../components/noMore/noMore";
const httpRequest = new HTTP();

class BuyMedicine extends Component {
  constructor() {
    super();
    this.state = {
      refreshType: false,
      storeInfo: {},
      CartTotal: "",
      shopCartCount: "",
      userinfo: {}, //用户相关信息
      shopCarOpened: false, //是否显示购物车中得东西
      navHeight: "", //导航栏底部到窗口顶部的距离
      navTop: "", //胶囊按钮与顶部的距离
      ratio: 0.5, //比例
      jnHeight: "", //导航栏的高度
      tabList: [],
      tabCurrent: 0,
      shopCar: [],
      storeDistance:"",
    };
  }
  componentWillMount() {
    let instance = getCurrentInstance();
    const { shopId, openCar } = instance.router.params;
    if (shopId) {
      this.getCategory(shopId);
      this.state.shopId = shopId;
    }
    let that = this;
    Taro.getSystemInfo({
      success: function(res) {
        console.log("systeminfo", res);
        let menuButtonObject;
        //当wx.getMenuButtonBoundingClientRect失效时  设置默认参数
        try {
          menuButtonObject = wx.getMenuButtonBoundingClientRect();
        } catch (error) {
          if (res.statusBarHeight && res.statusBarHeight >= 44) {
            menuButtonObject = {
              bottom: 80,
              height: 32,
              left: 281,
              right: 368,
              top: 48,
              width: 87
            };
          } else {
            menuButtonObject = {
              bottom: 56,
              height: 32,
              left: 320,
              right: 407,
              top: 24,
              width: 87
            };
          }
        }
        let statusBarHeight = res.statusBarHeight,
          navTop = menuButtonObject.top, //胶囊按钮与顶部的距离
          navHeight =
            statusBarHeight +
            menuButtonObject.height +
            (menuButtonObject.top - statusBarHeight) * 2, //导航高度
          ratio = res.windowWidth / 375;
        that.state.navHeight = navHeight;
        that.state.navTop = navTop;
        that.setState({
          navHeight,
          navTop,
          ratio,
          jnHeight: menuButtonObject.height,
          statusBarHeight
        });
      }
    });
    let userinfo = Taro.getStorageSync("userinfo");
    let storeInfo = Taro.getStorageSync("storeInfo");
    this.setState({
      userinfo: userinfo || {},
      storeInfo: storeInfo || {},
      shopCarOpened: openCar,
    });
    let storeDistance = Taro.getStorageSync('storeDistance');
    this.setState({
      storeDistance,
    })
  }
  getShopCar() {
    httpRequest.get("sell_ordercart.getCart", {}).then(res => {
      if (res && res.MedicineList && res.MedicineList.lenght != 0) {
        res.MedicineList = transFormData(res.MedicineList);
        this.state.shopCar = res.MedicineList;
        this.setState({
          shopCar: res.MedicineList,
          CartTotal: res.CartTotal
        });
        if (res.MedicineList.length == 0) {
          this.setState({
            shopCarOpened: false
          });
        }
        this.changeTabList();
      }
    });
  }
  changeTabList() {
    //购物车中商品改变后 对列表商品的数量重新赋值
    let shopCarData = this.state.shopCar;
    let _data = this.state.tabList;
    if (_data.length == 0) return;
    if (shopCarData.length == 0) {
      this.emptyTablist();
      return;
    }
    let idarr = [];
    for (let i = 0, len = shopCarData.length; i < len; i++) {
      idarr.push(shopCarData[i].id);
      _data = _data.map(item => {
        item.data &&
          item.data.map(child => {
            if (child.id == shopCarData[i].id) {
              child.count = shopCarData[i].count;
            } else {
              if (!idarr.includes(child.id)) {
                child.count = 0;
              }
            }
            return child;
          });
        return item;
      });
    }
    this.setState({
      tabList: _data
    });
  }
  getShopCarCount() {
    httpRequest.get("sell_ordercart.getCartCount", {}).then(res => {
      if (res) {
        this.setState({
          shopCartCount: res.cartCount
        });
      }
    });
  }
  getLogin() {
    httpRequest.get("guest.login", { mobile, shopId: this.state.shopId }).then(
      res => {
        if (JSON.stringify(res) !== "{}") {
          Taro.setStorageSync("userinfo", res);
          this.setState({
            userinfo: res
          });
        }
      },
      err => {
        console.log(error);
      }
    );
  }
  getCategory(shopId) {
    httpRequest.get("guest.getMedicineCategory", { shopId }).then(
      res => {
        if (res && res.length != 0) {
          res = res.map(item => {
            item.title =
              item.CategoryName.length > 4
                ? item.CategoryName.substring(0, 4) + "..."
                : item.CategoryName;
            item.pageSize = 10;
            item.pageIndex = 1;
            item.pageEnd = false;
            item.noMoreTip = "没有更多了";
            return item;
          });
          this.getPageData(0, res[0]);
          this.setState({
            tabList: res
          });
        }
      },
      error => {}
    );
  }
  getPageData(index, item) {
    let param = {
      pageSize: item.pageSize,
      pageIndex: item.pageIndex,
      conditions: {
        selectCategoryId: item.Id,
        shopId: item.ShopId
      }
    };

    httpRequest.get("guest.getMedicinePageData", { ...param }).then(
      res => {
        if (res && res.dataList.length != 0) {
          res.dataList = transFormData(res.dataList);
          let _data = this.state.tabList[index];
          _data.data =
            _data.data != undefined
              ? _data.data.concat(res.dataList)
              : res.dataList; //追加数据
          _data.pageEnd = _data.data.length == res.rowCount ? true : false; //判断是否还有数据
          _data.noMoreTip = _data.pageEnd ? "没有更多了" : "正在加载...";
          ++_data.pageIndex; //分页+1
          this.state.tabList[index] = _data;
          this.setState({
            tabList: this.state.tabList,
            refreshType: false
          });
          this.changeTabList();
        } else {
          let _data = this.state.tabList[index];
          _data.pageEnd = true; //判断是否还有数据
          _data.noMoreTip = "没有更多了";
          this.state.tabList[index] = _data;
          this.setState({
            tabList: this.state.tabList,
            refreshType: false
          });
        }
      },
      error => {
        this.setState({
          refreshType: false
        });
      }
    );
  }
  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {
    if (this.state.userinfo.thirdAccountId) {
      this.getShopCar(); //获取购物车数据
      this.getShopCarCount();
      //记录最近到过的店
      let oldId = Taro.getStorageSync("oldId");
      if (oldId) {
        if (oldId != this.state.shopId) this.addRecord(); //最近两次进入的店不同  追加记录
      } else {
        this.addRecord();
      }
    }
  }

  componentDidHide() {}
  addRecord() {
    Taro.setStorage({
      key: "oldId",
      data: this.state.shopId
    });
    httpRequest
      .get("guest.editThirdAccountLog", {
        thirdAccountId: this.state.userinfo.thirdAccountId,
        shopId: this.state.shopId
      })
      .then(res => {});
  }
  tabClick(e) {
    if (!this.state.tabList[e].firstClick) {
      this.state.tabList[e].firstClick = true;
      this.getPageData(e, this.state.tabList[e]);
    }
    this.setState({
      tabCurrent: e
    });
  }
  minusClick(data, e) {
    e && e.stopPropagation(); // 阻止事件冒泡
    this.editBag(data.id, data.count - 1, 1);
  }
  plusClick(data, e) {
    e && e.stopPropagation(); // 阻止事件冒泡
    let _reserve = data.reserve,
      _maxBuy = data.maxBuyQty,
      _min,
      _type;
    if (!_reserve || _reserve == 0) {
      Taro.showToast({
        title: "该商品暂无库存",
        icon: "none"
      });
      return false;
    }
    if (_maxBuy == 0 || !_maxBuy) {
      _min = _reserve;
      _type = "_reserve";
    } else {
      if (parseInt(_reserve) >= parseInt(_maxBuy)) {
        _min = _maxBuy;
        _type = "_maxBuy";
      } else {
        _min = _reserve;
        _type = "_reserve";
      }
    }
    if (parseInt(data.count) + 1 > _min) {
      let msg =
        _type == "_reserve" ? "已经达到库存上限" : `商家限购${_maxBuy}件`;
      Taro.showToast({
        title: msg,
        icon: "none"
      });
      return false;
    }
    this.editBag(data.id, data.count + 1, 1);
  }
  editBag(id, quantity, type) {
    let param = {
      quantity
    };
    if (type == 1) {
      param.shopMedicineId = id;
    } else {
      param.cartId = id;
    }
    Taro.showLoading({ title: "加载中...", mask: true });
    httpRequest.get("sell_ordercart.editCart", { ...param }).then(
      res => {
        if (res) {
          this.getShopCar();
          this.getShopCarCount();
        }
        Taro.hideLoading();
      },
      error => {
        Taro.hideLoading();
        Taro.showToast({
          title: error.msg || "操作失败",
          icon: "none",
          duration: 3000
        });
      }
    );
  }
  clickBag() {
    if (this.state.shopCar.length == 0) return;
    this.setState({
      shopCarOpened: !this.state.shopCarOpened
    });
  }
  bagClose() {
    this.setState({
      shopCarOpened: false
    });
  }
  emptyBag() {
    let that = this;
    Taro.showModal({
      content: "确认清空购物车吗?",
      icon: "none",
      cancelColor: "",
      cancelText: "取消",
      confirmText: "确定",
      confirmColor: "#00b187",
      success: function(res) {
        if (res.confirm) {
          Taro.showLoading({ title: "加载中...", mask: true });
          let id = that.state.shopCar.map(item => {
            return item.cartId;
          });
          httpRequest
            .get("sell_ordercart.deleteCartGoodsById", {
              cartId: id.join(),
              thirdAccountId: that.state.userinfo.thirdAccountId
            })
            .then(
              res => {
                that.setState({
                  shopCarOpened: false,
                  shopCar: [],
                  shopCartCount: 0
                });
                that.emptyTablist();
                Taro.hideLoading();
                Taro.showToast({
                  title: "已清空购物车",
                  icon: "none"
                });
              },
              err => {
                Taro.hideLoading();
              }
            );
        }
      }
    });
  }
  emptyTablist() {
    this.state.tabList = this.state.tabList.map(item => {
      let _item =
        item.data &&
        item.data.map(child => {
          child.count = 0;
          return child;
        });
      item.data = _item;
      return item;
    });
    this.setState({
      tabList: this.state.tabList
    });
  }
  search() {
    pushNavigation("search", { shopId: this.state.shopId });
  }
  back() {
    Taro.navigateBack();
  }
  goodsDetail(k) {
    pushNavigation("goodsDetail", { shopId: k.shopId, shopMedicineId: k.id });
  }
  submitOrder() {
    const { shopCar } = this.state;
    if (shopCar.length == 0) return;
    if (!isLogin()) {
      pushNavigation("login");
      return false;
    }
    let cartIdArr = shopCar.map(item => item.cartId);
    console.log("购物车cartid", cartIdArr.join());
    pushNavigation("submitOrder", { cartIdArr: cartIdArr.join() });
  }
  ScrollToLower(index, item) {
    if (item.pageEnd) return;
    this.getPageData(index, item);
  }
  topRefresh(index, item) {
    item.pageIndex = 1;
    item.pageEnd = false;
    item.data = undefined;
    this.setState({
      refreshType: true
    });
    this.getPageData(index, item);
  }
  render() {
    const {
      navTop,
      navHeight,
      jnHeight,
      tabList,
      tabCurrent,
      shopCar,
      shopCarOpened,
      aaaaa,
      shopCartCount,
      CartTotal,
      storeInfo,
      refreshType,
      storeDistance,
    } = this.state;
    let bottomtip = aaaaa ? 62 : 0; //底部提示的高度
    let _bodybottom = Taro.pxTransform(139.334 + bottomtip), //底部提示的高度+底部购物袋的高度
      _bodytop = Taro.pxTransform(201.334);
    const rightData = tabList[tabCurrent] || {};
    return (
      <View className="wrapper">
        <Image
          src={require("../../images/home_top.png")}
          className="home_top_bg"
        />
        <View className="navigation" style={`height:${navHeight}px`}>
          <View
            className="naviTitle"
            style={`padding-top:${navTop}px;height:${jnHeight}px`}
          >
            <Image
              className="back"
              src={require("../../images/left_white.png")}
              onClick={this.back.bind(this)}
            ></Image>
            <View className="searchGoods" onClick={this.search.bind(this)}>
              <Image
                src={require("../../images/search.png")}
                className="searchPic"
              ></Image>
              <View className="searchText">输入商品名称</View>
            </View>
          </View>
        </View>
        <View className="storeCard" style={`top:${navHeight + 10}px`}>
          <Image
            className="storeCard_left"
            src={storeInfo.logo_image_url}
            mode="widthFix"
          ></Image>
          <View className="storeCard_middle">
            <View className="storeCard_title">{storeInfo.title}</View>
            <View className="storeCard_distance">距您{storeDistance}</View>
          </View>
          {/* <View className="storeCard_right">
            <View className="changeStore_text">切换</View>
            <View className="change_symbol"></View>
          </View> */}
        </View>
        <View
          className="bodyWrapper"
          style={`top:${_bodytop};bottom:${_bodybottom};margin-top:${navHeight +
            20}px`}
        >
          <ScrollView className="scrollleft" scrollY>
            {tabList.map((item, index) => {
              return (
                <View
                  className={`tabItem_title ${
                    tabCurrent == index ? "choosedItem" : ""
                  }`}
                  onclick={this.tabClick.bind(this,index)}
                >
                  {item.title}
                </View>
              );
            })}
          </ScrollView>
          <ScrollView
            scrollY
            className="scrollright"
            lowerThreshold={100}
            onScrollToLower={this.ScrollToLower.bind(
              this,
              tabCurrent,
              rightData
            )}
            refresherEnabled={true}
            enableBackToTop={true}
            refresherTriggered={refreshType}
            onRefresherRefresh={this.topRefresh.bind(
              this,
              tabCurrent,
              rightData
            )}
          >
            <View className="AtTabs_title">{rightData.CategoryName}</View>
            {rightData.data &&
              rightData.data.map((k, m) => {
                return (
                  <View
                    className="goods_card_wrapper"
                    onClick={this.goodsDetail.bind(this, k)}
                  >
                    <GoodsCard
                      data={k}
                      minusClick={this.minusClick.bind(this, k)}
                      plusClick={this.plusClick.bind(this, k)}
                    />
                  </View>
                );
              })}
            <View className="noMore_wrapper">
              <NoMore tip={rightData.noMoreTip} />
            </View>
          </ScrollView>
        </View>
        <MedicineBag
          shopCar={shopCar}
          shopCarOpened={shopCarOpened}
          clickBag={this.clickBag.bind(this)}
          emptyBag={this.emptyBag.bind(this)}
          bagMinus={this.minusClick.bind(this)}
          bagPlus={this.plusClick.bind(this)}
          bagClose={this.bagClose.bind(this)}
          shopCartCount={shopCartCount}
          CartTotal={CartTotal}
          submitOrder={this.submitOrder.bind(this)}
        />
        {aaaaa && <View className="bottom_tip">店铺已打烊</View>}
      </View>
    );
  }
}

export default connect(
  ({ globalData }) => ({
    globalData
  }),
  dispatch => ({})
)(BuyMedicine);
