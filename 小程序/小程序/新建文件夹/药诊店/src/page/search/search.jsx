import { Component } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { View, Image, ScrollView, Text } from "@tarojs/components";
import { AtSearchBar } from "taro-ui";
import MedicineBag from "../../components/MedicineBag/MedicineBag";
import BagGoodsCard from "../../components/bagGoodsCard/bagGoodsCard";
import { transFormData } from "../../utils/YFWPublicFunction";
import { HTTP } from "../../utils/http";
import { pushNavigation } from "../../apis/YFWRouting";
import NoMore from "../../components/noMore/noMore";
const httpRequest = new HTTP();
import "./search.less";

export default class Search extends Component {
  constructor() {
    super();
    this.state = {
      searchFlag: true,
      resultList: [],
      holdList: [],
      shopCartCount: "",
      shopCar: [],
      CartTotal: "",
      shopCarOpened: false,
      deleteType: "none", //类型 'all'=> 显示全部删除 'none'=>不显示全部删除
      historyWords: [],
      searchValue: "",
      pageSize: 10,
      pageIndex: 1,
      pageEnd:false,
      pageType: "nosearch" //type类型  'nosearch'=>什么都没搜索,'holder'=>根据搜索值展示匹配列表 'result'=>搜索结果页
    };
  }
  componentWillMount() {
    let instance = getCurrentInstance();
    let params = instance.router.params;
    this.state.shopId = params.shopId;
  }

  componentDidMount() {
    this.getShopCar();
    this.getShopCarCount();
  }

  componentWillUnmount() {}

  componentDidShow() {
    let history = Taro.getStorageSync("history");
    if (history && history[this.state.shopId]) {
      let _data = history[this.state.shopId];
      this.setState({
        historyWords: _data
      });
    }
  }

  componentDidHide() {}
  getShopCar() {
    httpRequest.get("sell_ordercart.getCart", {}).then(res => {
      if (res && res.MedicineList) {
        res.MedicineList = transFormData(res.MedicineList);
        this.state.shopCar = res.MedicineList;
        let resultList = this.state.resultList;
        if (resultList.length != 0) {
          let idarr = [];
          for (let i = 0, len = resultList.length; i < len; i++) {
            idarr.push(resultList[i].id);
            for (let item of this.state.shopCar) {
              if (item.id == resultList[i].id) {
                resultList[i].count = item.count;
                break;
              } else {
                resultList[i].count = 0;
              }
            }
          }
        }
        this.setState({
          shopCar: res.MedicineList,
          CartTotal: res.CartTotal,
          resultList
        });
        if (res.MedicineList.length == 0) {
          this.setState({
            shopCarOpened: false
          });
        }
      }
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
  onBlur(e) {
    console.log("blue", e);
    let { value } = e.detail;
    if (!value) {
      this.setState({
        pageType: "nosearch"
      });
    }
  }
  searchClick() {
    if (!this.state.searchValue) return;
    this.state.pageIndex = 1;
    this.state.pageEnd = false;
    this.state.resultList = [];
    this.getList(this.state.searchValue);
    this.addHistory({NameCN:this.state.searchValue})
  }
  serachClear() {
    this.state.pageIndex = 1;
    this.state.pageEnd = false;
    this.setState({
      searchValue: "",
      pageType: "nosearch"
    });
  }
  deleteWord(e) {
    let _data = this.state.historyWords.filter(item => item != e);
    this.setState({
      historyWords: _data
    });
    let historyWord = Taro.getStorageSync("history");
    historyWord[this.state.shopId] = _data;
    Taro.setStorageSync("history", historyWord);
  }
  clickDeletePic() {
    if (this.state.historyWords.length == 0) return;
    this.setState({
      deleteType: "all"
    });
  }
  completeDelete() {
    this.setState({
      deleteType: "none"
    });
  }
  inputChange(e) {
    const { shopId } = this.state;
    httpRequest
      .get("guest.getFastSearchMedicineInfo", { keywords: e, shopId })
      .then(res => {
        this.setState({
          searchValue: e,
          holdList: res
        });
        this.state.searchValue = e;
        if (e && this.state.pageType != "holder") {
          this.setState({
            pageType: "holder"
          });
        }
      });
  }
  getList(e) {
    const { shopId, pageSize, pageIndex,pageEnd } = this.state;
    if(pageEnd){
      return
    }
    let param = {
      conditions: {
        shopId,
        keywords: e
      },
      pageSize,
      pageIndex
    };
    httpRequest.get("guest.getMedicinePageData", { ...param }).then(res => {
      let resultList = transFormData(res.dataList);
      let noMoreTip,_data =[];
      if (resultList.length != 0) {
        for (let i = 0, len = resultList.length; i < len; i++) {
          for (let item of this.state.shopCar) {
            if (item.id == resultList[i].id) {
              resultList[i].count = item.count;
              break;
            } else {
              resultList[i].count = 0;
            }
          }
        }
        console.log(this.state.resultList,resultList)
        _data = this.state.resultList.concat(resultList);
        this.state.resultList = _data;
        this.state.pageEnd = _data.length == res.rowCount ? true : false; //判断是否还有数据
        noMoreTip = this.state.pageEnd ? "没有更多了" : "正在加载...";
        ++this.state.pageIndex; //分页+1
      }
      this.setState({
        resultList:_data,
        searchFlag: false,
        pageType: "result",
        noMoreTip
      });
    });
  }
  clickDeleteAll() {
    let that = this;
    Taro.showModal({
      content: "是否删除全部历史搜索?",
      icon: "none",
      cancelColor: "",
      cancelText: "取消",
      confirmText: "删除",
      confirmColor: "#00b187",
      success: function(res) {
        if (res.confirm) {
          that.setState({
            historyWords: [],
            deleteType: "none"
          });
          let id = that.state.shopId + "";
          Taro.setStorageSync("history", { [id]: [] });
        }
      }
    });
  }
  clickHolderList(item) {
    this.setState({
      resultList: [],
      searchFlag: true
    });
    this.state.pageIndex = 1;
    this.state.pageEnd = false;
    this.state.resultList = [];
    this.getList(item.NameCN);
    this.setState({
      pageType: "result",
      searchValue: item.NameCN
    });
    this.addHistory(item)
  }
  addHistory(item){
    let history = Taro.getStorageSync("history");
    history = history || {};
    if (history[this.state.shopId] && history[this.state.shopId].length != 0) {
      let _data = history[this.state.shopId];
      if (!_data.includes(item.NameCN)) {
        _data.unshift(item.NameCN);
        if (_data.length > 20) {
          _data.length = 20;
        }
        this.setState({
          historyWords: _data
        });
        history[this.state.shopId] = _data;
        Taro.setStorageSync("history", history);
      }
    } else {
      let historyData = [];
      historyData.unshift(item.NameCN);
      this.setState({
        historyWords: historyData
      });
      history[this.state.shopId] = historyData;
      Taro.setStorageSync("history", history);
    }
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
          duration: 2000
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
          let userinfo = Taro.getStorageSync("userinfo");
          httpRequest
            .get("sell_ordercart.deleteCartGoodsById", {
              cartId: id.join(),
              thirdAccountId: userinfo.thirdAccountId
            })
            .then(
              res => {
                if (that.state.resultList.length != 0) {
                  that.state.resultList = that.state.resultList.map(item => {
                    item.count = 0;
                    return item;
                  });
                }
                that.setState({
                  shopCarOpened: false,
                  shopCar: [],
                  shopCartCount: 0,
                  resultList: that.state.resultList
                });
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
  clickHistoryWord(item) {
    this.state.pageIndex = 1;
    this.state.pageEnd = false;
    this.state.resultList = [];
    this.getList(item);
    this.setState({
      searchValue: item
    });
  }
  submitOrder() {
    const { shopCar } = this.state;
    if (shopCar.length == 0) return;
    let cartIdArr = shopCar.map(item => item.cartId);
    console.log(cartIdArr.join());
    pushNavigation("submitOrder", { cartIdArr: cartIdArr.join() });
  }
  toGoodsDetail({ shopId, id }) {
    pushNavigation("goodsDetail", { shopId, shopMedicineId: id });
  }
  ScrollToLower() {
    if (this.state.pageEnd) return;
    this.getList(this.state.searchValue);
  }
  render() {
    let that = this;
    const {
      pageType,
      shopCartCount,
      shopCarOpened,
      shopCar,
      CartTotal,
      searchValue
    } = this.state;
    return (
      <View className="search">
        <View className="searchBar">
          <AtSearchBar
            actionName="搜索"
            value={searchValue}
            onBlur={this.onBlur.bind(this)}
            onActionClick={this.searchClick.bind(this)}
            onClear={this.serachClear.bind(this)}
            placeholder={"搜索药品"}
            onChange={this.inputChange.bind(this)}
            onConfirm={this.searchClick.bind(this)}
          />
        </View>
        <ScrollView scrollY className="result">
          {renderType(pageType, that)}
        </ScrollView>
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
      </View>
    );
  }
}
const renderType = (type, that) => {
  if (type == "result") {
    const { resultList, searchFlag ,noMoreTip} = that.state;
    if (resultList.length != 0) {
      return (
        <ScrollView
          className="resultWrapper"
          scrollY
          lowerThreshold={100}
          onScrollToLower={that.ScrollToLower.bind(that)}
        >
          {resultList.map(item => {
            return (
              <View
                className="list_item"
                onClick={that.toGoodsDetail.bind(that, item)}
              >
                <BagGoodsCard
                  data={item}
                  minusClick={e => {
                    e && e.stopPropagation();
                    that.minusClick(item);
                  }}
                  plusClick={e => {
                    e && e.stopPropagation();
                    that.plusClick(item);
                  }}
                />
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
      <View className="noresult">
        <Image
          className="noresult_pic"
          src={require("../../images/noreuslt.png")}
        ></Image>
        <Text className="noresult_text">找不到商品</Text>
      </View>
    );
  } else if (type == "nosearch" || !type) {
    const { historyWords, deleteType } = that.state;
    return (
      <ScrollView className="resultWrapper" scrollY>
        <View className="history">
          <View className="history_title">历史搜索</View>
          {renderDeleteType(that, deleteType)}
        </View>
        <View className="history_words">
          {historyWords.map(item => {
            return (
              <View className="history_words_wrapper">
                <Text onClick={that.clickHistoryWord.bind(that, item)}>
                  {item}
                </Text>
                {deleteType == "all" && (
                  <Image
                    className="wrong"
                    src={require("../../images/search_del.png")}
                    onClick={that.deleteWord.bind(that, item)}
                  ></Image>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  } else if (type == "holder") {
    const { holdList } = that.state;
    return (
      <ScrollView className="resultWrapper" scrollY>
        {holdList.map(item => {
          return (
            <View
              className="holder_list_item"
              onClick={that.clickHolderList.bind(that, item)}
            >
              {item.NameCN}
            </View>
          );
        })}
      </ScrollView>
    );
  }
};
const renderDeleteType = (that, type) => {
  if (type == "none") {
    return (
      <Image
        className="history_delete"
        src={require("../../images/delete.png")}
        onClick={that.clickDeletePic.bind(that)}
      ></Image>
    );
  }
  return (
    <View className="delete_all">
      <Text
        className="delete_all_text"
        onClick={that.clickDeleteAll.bind(that)}
      >
        全部删除
      </Text>
      <View className="line"></View>
      <Text
        className="delete_complete"
        onClick={that.completeDelete.bind(that)}
      >
        完成
      </Text>
    </View>
  );
};
