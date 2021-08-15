import Taro, { Component } from "@tarojs/taro";
import { View, Text, Image, Block } from "@tarojs/components";
import { AtBadge } from "taro-ui";
import "./YFWSellersListView.scss";
import { pushNavigation } from "../../../../apis/YFWRouting";
import {
  SaleComparePricesApi,
  ShopCarApi,
  UserCenterApi,
} from "../../../../apis/index";
const userCenterApi = new UserCenterApi();
import { YFWSellersListGoodsInfoModel } from "./model/YFWSellersListGoodsInfoModel";
import { YFWSellersShopInfoModel } from "./model/YFWSellersShopInfoModel";
import {
  isLogin,
  safeObj,
  safe,
  isNotEmpty,
  getAppSystemConfig,
  deepCopyObj,
} from "../../../../utils/YFWPublicFunction";
import YFWMedicineNameView from "../../../../components/YFWMedicineNameView/YFWMedicineNameView";
import YFWPriceView from "../../../../components/YFWPriceView/YFWPriceView";
import YFWFooterRefresh from "../../../../components/YFWFooterRefresh/YFWFooterRefresh";
import YFWFloatLayout from "../../../../components/YFWFloatLayout/YFWFloatLayout";
import { getName } from "src/model/YFWMedicineInfoModel";
import {
  set as setGlobalData,
  get as getGlobalData,
} from "../../../../global_data";
const saleComparePricesApi = new SaleComparePricesApi();
const shopCarApi = new ShopCarApi();

export default class YFWSellersListView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollTop:null,
      note: {},
      hasFirstRequest: false,
      locationInfo: "",
      provinceArray: [],
      showAllAreaFlag: false,
      _query: {},
      fakeObj: {},
      showAllIntro: false,
      goodsId: 0,
      medicineInfo: {},
      goodsOriginInfo: {},
      dataSource: [],
      openStandard: false,
      fliterIndex: "", //
      selectPostage: false, // 是否选中包邮
      priceUp: false, // 价格升序
      sortIndex: 0, // 排序索引 0默认、1评价从高到低、2库存从高到低
      sortStick: false, // 筛选器悬浮
      currentIndex: 1,
      totalPage: 1,
      refreshStatus: "hidden",
      shopcarCount: 0,
      effectareaFlag: false,
      pageIndex: 1,
      sort: "",
      sorttype: "",
      period_type: 0,
      discount: 0,
      is_activit: 0,
      is_coupons: 0,
      min_price: "",
      max_price: "",
      regionid: "",
      remainingValidity: [
        {
          index: 0,
          name: "180天-1年",
          select: false,
          value: 1,
        },
        {
          index: 1,
          name: "1年以上",
          select: false,
          value: 2,
        },
        {
          index: 2,
          name: "2年以上",
          select: false,
          value: 3,
        },
      ],
      preferentialActivities: [
        {
          index: 0,
          name: "多买优惠",
          select: false,
          value: "discount",
        },
        {
          index: 1,
          name: "满减优惠",
          select: false,
          value: "is_activity",
        },
        {
          index: 2,
          name: "优惠券",
          select: false,
          value: "is_coupons",
        },
      ],
      _windowHeight: 0,
    };
  }

  componentWillMount() {
    const params = this.$router.params.params;
    if (isNotEmpty(params)) {
      const value = JSON.parse(decodeURIComponent(params));
      this.state.goodsId = value.value || 0;
    }
    this.loading = false;
    this.loadMore = true;
    this.updateSortTop = true;
    this.sortTop = 225;
    this.listTopHeight = 270;
    this.windowHeight = 0;
    Taro.getSystemInfo({
      success: (res) => {
        this.state._windowHeight = res.windowHeight;
      },
    });
  }

  componentDidMount() {
    this.fetchSellersInitData();
    this.windowHeight = Taro.getSystemInfoSync().windowHeight;
    userCenterApi
      .getProvinceAndCityInfo(0)
      .then((result) => {
        var result = result.map((item, index) => {
          item.name = item.region_name;
          item.select = false;
          item.index = index;
          return item;
        });
        let areaData = [];
        if (result && result.length > 9) {
          let copyObj = deepCopyObj(result);
          areaData = copyObj.slice(0, 8);
          areaData.push({
            name: "查看全部...",
            isShowAll: true,
          });
        }
        let locationInfo = getGlobalData("address");
        this.setState({
          provinceArray: result,
          areaData: areaData.length == 0 ? result : areaData,
          locationInfo,
        });
      })
      .then((error) => {});
  }

  componentDidShow() {
    this.fetchShopCarCount();
  }

  // onReachBottom() {
  //   if (this.loading === true || this.loadMore === false) {
  //     return;
  //   }
  //   this.state.pageIndex++;
  //   this.fetchSellersShopListMoreData();
  // }
  onScrollToLower() {
    if (this.loading === true || this.loadMore === false) {
      return;
    }
    this.state.pageIndex++;
    this.fetchSellersShopListMoreData();
  }
  onPageScroll(event) {
    if (this.updateSortTop === true) {
      this.updateSortTop = false;
      const query = Taro.createSelectorQuery();
      query.selectViewport().scrollOffset();
      query.select("#fliter-view").boundingClientRect();
      query.exec((res) => {
        if (!res[1]) {
          return;
        }
        this.sortTop = res[0].scrollTop + res[1].top + res[1].height;
        this.listTopHeight = res[0].scrollTop + res[1].top + res[1].height * 4;
      });
    }

    const { scrollTop } = event;
    const { sortStick } = this.state;
    if (scrollTop >= this.sortTop && !sortStick) {
      this.setState({
        sortStick: true,
      });
    } else if (scrollTop < this.sortTop && sortStick) {
      this.setState({
        sortStick: false,
      });
    }

    const scrollDistance = scrollTop - this.listTopHeight + this.windowHeight;
    if (scrollDistance > 0) {
      const { currentIndex } = this.state;
      const { totalPage } = this.state;
      const pageIndex = Math.min(
        Number.parseInt(scrollDistance / 1100) + 1,
        totalPage
      );
      if (pageIndex !== currentIndex) {
        this.setState({
          currentIndex: pageIndex,
        });
      }
    }
  }

  onShareAppMessage() {
    const { goodsId } = this.state;
    const { medicineInfo } = this.state;
    return {
      title: safe(medicineInfo.title),
      path:
        "/page/pages/YFWSellersListModule/YFWSellersListViewPage/YFWSellersListView?params=" +
        JSON.stringify({ value: goodsId }),
      imageUrl: safe(medicineInfo.img_url),
    };
  }

  /** 比价页初始化数据 */
  fetchSellersInitData() {
    if (this.loading === true || this.loadMore === false) {
      return;
    }
    this.updateSortTop = true;
    this.loading = true;
    const { goodsId } = this.state;
    let conditions = {
      sort: "", //排序规则 {sort:'score',sorttype:'desc'} == 综合 {sort:'distance',sorttype:'asc'} == 距离  {sort:'sprice',sorttype:'desc'} == 价格降序 {sort:'sprice',sorttype:'asc'} == 价格升序
      sorttype: "",
      medicineid: goodsId, //商品ID
      period_type: "0", //剩余有效期 0 == 不选  1 == 108天-1年  2 == 1年以上  3 == 2年以上
      discount: "0", //0、1 是否选中多买优惠
      is_activity: "0", //是否选中满减优惠
      is_coupons: "0", //是否选中优惠券
      min_price: "", //最小价格
      max_price: "", //最大价格
      regionid: "", //所在地 地区ID 根据接口 paramMap.set('__cmd', 'guest.sys_region.getListByParentId');paramMap.set('regionid', 0); 获取所有所在地 取返回数据的id字段
      lat: getGlobalData("latitude"), //
      lng: getGlobalData("longitude"), //
      user_city_name: getGlobalData("city"), //
      user_region_id: getGlobalData("region_id"), //
    };
    saleComparePricesApi.getGoodsAndShopData(conditions, 1).then(
      (response) => {
        this.loading = false;
        this.dealGoodsInfo(response.goodsInfo);
        getAppSystemConfig().then(
          (info) => {
            this.dealShopGoodsList(response.shopsInfo);
          },
          (error) => {
            this.dealShopGoodsList(response.shopsInfo);
          }
        );
        this.setState({
          hasFirstRequest: true,
        });
      },
      (error) => {
        this.loading = false;
        this.setState({
          hasFirstRequest: true,
        });
      }
    );
  }

  /** 获取更多数据 */
  fetchSellersShopListMoreData() {
    if (this.loading === true || this.loadMore === false) {
      return;
    }
    this.loading = true;
    const {
      goodsId,
      sort,
      sorttype,
      period_type,
      discount,
      is_activity,
      is_coupons,
      min_price,
      max_price,
      regionid,
      pageIndex,
    } = this.state;
    this.setState({ refreshStatus: "loading" });
    let conditions = {
      sort: sort, //排序规则 {sort:'score',sorttype:'desc'} == 综合 {sort:'distance',sorttype:'asc'} == 距离  {sort:'sprice',sorttype:'desc'} == 价格降序 {sort:'sprice',sorttype:'asc'} == 价格升序
      sorttype: sorttype,
      medicineid: goodsId, //商品ID
      period_type: period_type, //剩余有效期 0 == 不选  1 == 108天-1年  2 == 1年以上  3 == 2年以上
      discount: discount, //0、1 是否选中多买优惠
      is_activity: is_activity, //是否选中满减优惠
      is_coupons: is_coupons, //是否选中优惠券
      min_price: min_price, //最小价格
      max_price: max_price, //最大价格
      regionid: regionid, //所在地 地区ID 根据接口 paramMap.set('__cmd', 'guest.sys_region.getListByParentId');paramMap.set('regionid', 0); 获取所有所在地 取返回数据的id字段
      lat: getGlobalData("latitude"), //
      lng: getGlobalData("longitude"), //
      user_city_name: getGlobalData("city"), //
      user_region_id: getGlobalData("region_id"), //
    };
    saleComparePricesApi.getSaleShopsList(conditions, pageIndex).then(
      (response) => {
        this.loading = false;
        getAppSystemConfig().then(
          (info) => {
            this.dealShopGoodsList(response);
          },
          (error) => {
            this.dealShopGoodsList(response);
          }
        );
      },
      (error) => {
        this.loading = false;
        if (this.state.pageIndex > 1) {
          this.state.pageIndex--;
        }
        this.setState({ refreshStatus: "hidden" });
      }
    );
  }

  /** 获取购物车数量 */
  fetchShopCarCount() {
    const login = isLogin();
    if (login) {
      shopCarApi.getShopCarCount().then((response) => {
        this.setState({
          shopcarCount: response.cartCount,
        });
      });
    }
  }

  /** 处理商品信息 */
  dealGoodsInfo(goodsInfo) {
    const goodsInfoModel = YFWSellersListGoodsInfoModel.getGoodsInfo(goodsInfo);
    if (!goodsInfoModel) {
      return;
    }
    let showFlag = false,
      showAllIntro = true;
    if (
      goodsInfoModel.applicability.length &&
      goodsInfoModel.applicability.length < 22
    ) {
      showFlag = true;
    }
    if (
      goodsInfoModel.applicability.length &&
      goodsInfoModel.applicability.length > 47
    ) {
      goodsInfoModel.applicabilityCut = goodsInfoModel.applicability.substring(
        0,
        47
      );
      showAllIntro = false;
    }
    this.state.medicineInfo = goodsInfoModel;
    this.setState({
      medicineInfo: goodsInfoModel,
      goodsOriginInfo: goodsInfo,
      effectareaFlag: showFlag,
      showAllIntro,
    });
    if (goodsInfoModel.name_cn) {
      Taro.setNavigationBarTitle({ title: goodsInfoModel.name_cn });
    }
  }
  dealShopGoodsList(shopGoodsList) {
    const { medicineInfo } = this.state;
    let { dataSource } = this.state;
    const shopGoodsListModels = YFWSellersShopInfoModel.getModelArray(
      shopGoodsList
    );
    shopGoodsListModels.map((shopItem) => {
      shopItem.is_add_cart = medicineInfo.isCanSale;
    });
    if (this.state.pageIndex > 1) {
      dataSource = dataSource.concat(shopGoodsListModels);
    } else {
      dataSource = shopGoodsListModels;
    }
    let _status = "hidden";
    if (shopGoodsListModels.length < 10) {
      this.loadMore = false;
      _status = "nomore";
    } else {
      this.loadMore = true;
    }
    this.setState({
      dataSource: dataSource,
      totalPage: shopGoodsList.pageCount + 1,
      refreshStatus: _status,
      note: shopGoodsList.note || {},
    });
  }
  /**
   * 隐藏弹窗
   */
  hideModal() {
    let animation = Taro.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0,
    });
    this.animation = animation;
    animation.translateX(300).step();
    this.setState({
      animationData: animation.export(),
    });
    let that = this;
    if (this.state.isShow) {
      setTimeout(
        function () {
          animation.translateX(0).step();
          that.setState({
            animationData: animation.export(),
            isShow: false,
          });
          //wx.showTabBar({});
        }.bind(this),
        200
      );
    }
  }
  backAction() {
    this.setState({
      showAllAreaFlag: false,
    });
  }
  wrapperOnScroll(e){
    if(this.state.scrollTop == 0){
      this.setState({
        scrollTop:null
      })
    }

  }
  render() {
    const { hasFirstRequest, _windowHeight, refreshStatus,scrollTop } = this.state;

    return (
      <View>
        <ScrollView
          onScrollToLower={this.onScrollToLower}
          className="sellers"
          scrollY
          style={"height:" + _windowHeight + "px"}
          scrollTop={scrollTop}
          onScroll={this.wrapperOnScroll}
        >
          {this.renderMedicineInfoView()}
          {this.renderTrendAndStandardsView()}
          {hasFirstRequest && this.renderFilterView()}
          {this.renderShopListView()}
          <YFWFooterRefresh status={refreshStatus} />
          {this.renderBottomStickView()}
          {this.renderSellersModals()}
          {this.renderChooseModal()}
        </ScrollView>
      </View>
    );
  }
  PriceChange(e) {
    let newVal = e.detail.value,
      type = e.currentTarget.dataset.type;
    newVal = newVal.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
    newVal = newVal.replace(/^\./g, ""); //验证第一个字符是数字而不是字符
    newVal = newVal.replace(/\.{2,}/g, "."); //只保留第一个.清除多余的
    newVal = newVal.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    newVal = newVal.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); //只能输入两个小数
    console.log("newVal==" + newVal);
    this.setState({
      [type]: newVal,
    });
  }
  itemClickAction(e) {
    let item = e.currentTarget.dataset.info;
    let index = e.currentTarget.dataset.index;
    let type = e.currentTarget.dataset.type;
    if (item.isShowAll) {
      this.setState({
        showAllAreaFlag: true,
        showType: type,
      });
    } else if (type == "provinceArray" || type == "areaData") {
      let _data = JSON.parse(JSON.stringify(this.state["provinceArray"]));
      _data = _data.map((item) => {
        item.select = item.select ? false : item.index == index ? true : false;
        return item;
      });
      let _data2 = JSON.parse(JSON.stringify(this.state["areaData"]));
      _data2 = _data2.map((item) => {
        item.select = item.select ? false : item.index == index ? true : false;
        return item;
      });
      this.setState({
        provinceArray: _data,
        areaData: _data2,
      });
    } else if (type == "preferentialActivities") {
      let _data = JSON.parse(JSON.stringify(this.state[type]));
      _data = _data.map((item) => {
        if (item.index == index) {
          item.select = !item.select;
        }
        return item;
      });
      this.setState({
        preferentialActivities: _data,
      });
    } else {
      let _data = JSON.parse(JSON.stringify(this.state[type]));
      _data = _data.map((item) => {
        item.select = item.select ? false : item.index == index ? true : false;
        return item;
      });
      this.setState({
        [type]: _data,
      });
    }
  }
  /** 点击、滚动穿透 */
  handleCatchTap(event) {
    event.stopPropagation();
    return true;
  }
  renderChooseModal() {
    const { isShow, showAllAreaFlag, animationData } = this.state;
    return (
      <View className="modal-back" animation={animationData} hidden={!isShow}>
        <View className="hidemodal" onClick={this.hideModal}></View>
        {showAllAreaFlag && this.renderAreas()}
        <ScrollView
          style="overflow-y: scroll;-webkit-overflow-scrolling: touch;"
          scrollY
          className="modal-content"
        >
          <View className="box-content">
            {!showAllAreaFlag && this.renderHasShow()}
            {showAllAreaFlag && this.renderNoShow()}
          </View>
        </ScrollView>
        <View className="bottom_container">
          <View
            onClick={this.resetAction}
            className="bottom_content bottom_left"
          >
            <View>重置</View>
          </View>
          <View
            onClick={this.confirmAction}
            className="bottom_content bottom_right"
          >
            <View>确定</View>
          </View>
        </View>
      </View>
    );
  }
  renderHasShow() {
    const {
      min_price,
      remainingValidity,
      preferentialActivities,
      areaData,
      max_price,
    } = this.state;
    return (
      <Block>
        <Text className="Manufacturers-title">{"价格区间"}</Text>
        <View className="brands-content">
          <Input
            placeholder="最低价"
            className="topViewSearchInput"
            placeholderClass="inputplaceholder"
            value={min_price}
            onInput={this.PriceChange}
            confirmType={"done"}
            data-type="min_price"
            type="digit"
          ></Input>
          <Text style="margin-left:5%">-</Text>
          <Input
            placeholder="最高价"
            className="topViewSearchInput"
            placeholderClass="inputplaceholder"
            value={max_price}
            onInput={this.PriceChange}
            confirmType={"done"}
            data-type="max_price"
            type="digit"
          ></Input>
        </View>
        <Text className="Manufacturers-title">{"剩余效期"}</Text>
        <View className="brands-content">
          {remainingValidity.map((item, index) => {
            return (
              <Block key={index}>
                <View
                  onClick={this.itemClickAction}
                  data-type="remainingValidity"
                  data-info={item}
                  data-index={index}
                  className={"content " + (item.select ? "select" : "")}
                >
                  <View>{item.name}</View>
                </View>
              </Block>
            );
          })}
        </View>
        <Text className="Manufacturers-title">{"优惠活动"}</Text>
        <View className="brands-content">
          {preferentialActivities.map((item, index) => {
            return (
              <Block key={index}>
                <View
                  onClick={this.itemClickAction}
                  data-type="preferentialActivities"
                  style="width:28%"
                  data-info={item}
                  data-index={index}
                  className={"content " + (item.select ? "select" : "")}
                >
                  <View>{item.name}</View>
                </View>
              </Block>
            );
          })}
        </View>
        <Text className="Manufacturers-title">{"所在地"}</Text>
        <View className="brands-content">
          {areaData.map((item, index) => {
            return (
              <Block key={index}>
                <View
                  onClick={this.itemClickAction}
                  style="width:28%"
                  data-type="areaData"
                  data-info={item}
                  data-index={index}
                  className={
                    "content " +
                    (item.isShowAll ? "more" : item.select ? "select" : "")
                  }
                >
                  <View>{item.name}</View>
                </View>
              </Block>
            );
          })}
        </View>
      </Block>
    );
  }
  renderNoShow() {
    const { provinceArray } = this.state;
    return (
      <Block>
        <View className="center_content">
          {provinceArray.map((item, index) => {
            return (
              <Block key={index}>
                <View
                  onClick={this.itemClickAction}
                  data-type="provinceArray"
                  data-info={item}
                  data-index={item.index}
                  className="cell"
                >
                  <View
                    className={
                      "cell_title " + (item.select ? "cell_title_select" : "")
                    }
                  >
                    {item.name}
                  </View>
                  {item.select && (
                    <Image
                      className="cell_select"
                      src={require("../../../../images/duihao.png")}
                    ></Image>
                  )}
                </View>
                <View className="cell_line"></View>
              </Block>
            );
          })}
        </View>
      </Block>
    );
  }
  renderAreas() {
    return (
      <View className="top_container">
        <Image
          className="top_back"
          src={require("../../../../images/top_back_green.png")}
          onClick={this.backAction}
        >
          back
        </Image>
        <View className="top_title">{"所在地"}</View>
      </View>
    );
  }
  resetAction() {
    let _provinceArray = JSON.parse(JSON.stringify(this.state.provinceArray));
    _provinceArray = _provinceArray.map((item) => {
      item.select = false;
      return item;
    });
    let _areaData = JSON.parse(JSON.stringify(this.state.areaData));
    _areaData = _areaData.map((item) => {
      item.select = false;
      return item;
    });
    this.setState({
      provinceArray: _provinceArray,
      areaData: _areaData,
      min_price: "",
      max_price: "",
      is_activity: 0,
      is_coupons: 0,
      period_type: 0,
      discount: 0,
      regionid: "",
    });
    if (!this.state.showAllAreaFlag) {
      let _preferentialActivities = JSON.parse(
        JSON.stringify(this.state.preferentialActivities)
      );
      _preferentialActivities = _preferentialActivities.map((item) => {
        item.select = false;
        return item;
      });
      let _remainingValidity = JSON.parse(
        JSON.stringify(this.state.remainingValidity)
      );
      _remainingValidity = _remainingValidity.map((item) => {
        item.select = false;
        return item;
      });
      this.setState({
        remainingValidity: _remainingValidity,
        preferentialActivities: _preferentialActivities,
      });
    }
  }
  confirmAction() {
    if (
      this.state.min_price &&
      this.state.max_price &&
      parseFloat(this.state.min_price) > parseFloat(this.state.max_price)
    ) {
      Taro.showToast({
        title: "最低价不能大于最高价",
        icon: "none",
      });
      return false;
    }
    for (let item of this.state.remainingValidity) {
      if (item.select) {
        this.state.period_type = item.value;
        break;
      } else {
        this.state.period_type = "";
      }
    }

    let _preferentialActivities = this.state.preferentialActivities.map(
      (item) => {
        if (item.select) {
          this.state[item.value] = 1;
        } else {
          this.state[item.value] = 0;
        }
        return item;
      }
    );
    let _areaData = this.state.areaData.map((item) => item);
    let _provinceArray = this.state.provinceArray.map((item) => item);
    for (let item of this.state.provinceArray) {
      if (item.select) {
        this.state.regionid = item.id;
        break;
      } else {
        this.state.regionid = "";
      }
    }
    let fakeObj = {};
    (fakeObj.min_price = this.state.min_price),
      (fakeObj.max_price = this.state.max_price),
      (fakeObj.remainingValidity = this.state.remainingValidity),
      (fakeObj.preferentialActivities = _preferentialActivities),
      (fakeObj.areaData = _areaData),
      (fakeObj.provinceArray = _provinceArray);
    this.setState({
      fakeObj,
    });
    this.hideModal();
    this.loadMore = true;
    this.fetchSellersShopListMoreData(); //查询数据
  }
  showAllArea() {
    this.setState({
      showAllIntro: !this.state.showAllIntro,
    });
  }
  onFliterAverageClick(e) {
    if (this.loading) {
      return;
    }
    this.setState({
      fliterIndex: 2,
    });
    this.state.pageIndex = 1;
    this.loadMore = true;
    this.state.sort = "score";
    this.state.sorttype = "desc";
    this.fetchSellersShopListMoreData();
  }
  /** 渲染药品信息 */
  renderMedicineInfoView() {
    const { medicineInfo, effectareaFlag, showAllIntro } = this.state;
    const medicineType = Number.parseInt(medicineInfo.prescriptionType);
    const color = medicineInfo.isCanSale ? "#333333" : "#999999";

    return (
      <Block>
        {medicineInfo.title && (
          <View className="sellers-medicine-view">
            <Image
              className="sellers-medicine-image"
              src={medicineInfo.img_url}
              mode="widthFix"
            />
            <View className="sellers-medicine-info">
              <YFWMedicineNameView
                name={medicineInfo.title}
                medicineType={medicineType}
                color={color}
                fontWeight="bold"
              />
              <Text className="sellers-light-text sellers-13-text sellers-margin-top-5">
                产品规格:
                <Text className="sellers-dark-text">
                  {medicineInfo.standard}
                </Text>
              </Text>
              <Text className="sellers-light-text sellers-13-text sellers-margin-top-5">
              剂型:
                <Text className="sellers-dark-text">
                  {medicineInfo.troche_type}
                </Text>
              </Text>
              <Text className="sellers-light-text sellers-13-text sellers-margin-top-5">
                {medicineInfo.authorizedTitle}:
                <Text className="sellers-dark-text">
                  {medicineInfo.authorized_code}
                </Text>
              </Text>
              <Text className="sellers-light-text sellers-13-text sellers-margin-top-5">
                生产企业:
                <Text className="sellers-dark-text">
                  {medicineInfo.mill_title}
                </Text>
              </Text>
            </View>
            <View className="effectDrug">
              {effectareaFlag && <View className="effectarea1"></View>}
              <View className="effectarea2">
                {showAllIntro
                  ? medicineInfo.applicability
                  : medicineInfo.applicabilityCut}
                {medicineInfo.applicability.length > 47 && (
                  <Text
                    style="color:#1fdb9b;float:right"
                    onClick={this.showAllArea}
                  >
                    {showAllIntro ? "收起" : "...展开全部"}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
        <View className="sellers-medicine-line"></View>
      </Block>
    );
  }

  /** 渲染价格趋势、规格 */
  renderTrendAndStandardsView() {
    const { medicineInfo } = this.state;

    return (
      <Block>
        {medicineInfo.shop_num && (
          <View className="sellers-trend-standard-view" id="fliter-view">
            <View className="sellers-trend-view">
              <Text className="sellers-green-text sellers-13-text">
                {medicineInfo.shop_num}
                <Text className="sellers-light-text"> 个商家报价</Text>
              </Text>
              <Image
                className="sellers-trend-action"
                src={require("../../../../images/thumb.png")}
                mode="widthFix"
                onClick={this.onPriceTrendClick.bind(this)}
              />
            </View>
            <View className="sellers-trend-line">
              <View></View>
            </View>
            <View
              className="sellers-standard-view"
              onClick={this.onStandardsClick.bind(this)}
            >
              <View></View>
              <Text className="sellers-dark-text sellers-13-text">
                {medicineInfo.standard}
              </Text>
              <Image
                src={require("../../../../images/bijia/down.png")}
                mode="widthFix"
              />
            </View>
          </View>
        )}
      </Block>
    );
  }

  /** 渲染筛选栏 */
  renderFilterView() {
    const { fliterIndex } = this.state;
    const { selectPostage } = this.state;
    const { priceUp } = this.state;
    const { sortStick } = this.state;

    const selectTextClass =
      "sellers-green-text sellers-14-text sellers-bold-text";
    const normalTextClass =
      "sellers-dark-text sellers-14-text sellers-bold-text";
    let priceIcon = require("../../../../images/order_by_default.png");
    let priceText = "价格";
    if (fliterIndex === 1) {
      priceIcon = priceUp
        ? require("../../../../images/order_by_plus.png")
        : require("../../../../images/order_by_minus.png");
      priceText = priceUp ? "价格(升)" : "价格(降)";
    }
    const stickClass = sortStick ? "sellers-filter-fixed" : "";
    return (
      <View>
        {sortStick && <View className="sellers-filter-space"></View>}
        <View className={stickClass}>
          <View className="sellers-filter-view sellers-content-between">
            <View
              className="sellers-content-center"
              onClick={this.onFliterDistanceClick.bind(this)}
            >
              <Text
                className={
                  fliterIndex === 0 ? selectTextClass : normalTextClass
                }
              >
                距离
              </Text>
            </View>
            <View
              className="sellers-content-center"
              onClick={this.onFliterPriceClick.bind(this)}
            >
              <Text
                className={
                  fliterIndex === 1 ? selectTextClass : normalTextClass
                }
              >
                {priceText}
              </Text>
              <Image
                src={priceIcon}
                className="sellers-filter-icon"
                mode="widthFix"
              />
            </View>
            <View
              className="sellers-content-center"
              onClick={this.onFliterAverageClick.bind(this)}
            >
              <Text
                className={
                  fliterIndex === 2 ? selectTextClass : normalTextClass
                }
              >
                综合
              </Text>
            </View>
            <View
              className="sellers-content-end"
              onClick={this.onFliterPostageClick.bind(this)}
            >
              <Text
                className={selectPostage ? selectTextClass : normalTextClass}
              >
                筛选
              </Text>
              <Image
                src={require("../../../../images/choose_kind.png")}
                className="sellers-filter-icon2"
                mode="widthFix"
              />
            </View>
          </View>
        </View>
      </View>
    );
  }
  getName(name) {
    let period_to =
      name.indexOf("剩余有效期") !== -1 ? name : "有效期至：" + name;
    return period_to;
  }
  /** 渲染药品商店列表 */
  renderShopListView() {
    const { dataSource, note, locationInfo, hasFirstRequest } = this.state;
    const login = isLogin();
    return (
      <View>
        {hasFirstRequest && (
          <View class="address">
            <View style="width:25rpx;height:25rpx;margin-right:16rpx;flex-shrink:0">
              <Image
                src={require("../../../../images/icon_dingwei.png")}
                style="width:100%;height:100%;vertical-align:text-top"
              />
            </View>
            <Text>{locationInfo}</Text>
          </View>
        )}

        {note.content && (
          <View class="couponText">
            <View style="flex-shrink:0">
              <Image
                src={note.img_url}
                style={
                  "width:" +
                  (note.img_width || 25) +
                  "rpx;height:" +
                  (note.img_height || 25) +
                  "rpx;vertical-align:middle;margin-right:16rpx"
                }
              />
            </View>

            <Text>{note.content}</Text>
          </View>
        )}

        {dataSource.map((shopItem, shopItemIndex) => {
          const period_to = shopItem.period_to
            ? this.getName(shopItem.period_to)
            : "";
          return (
            <View
              key={shopItemIndex.toString()}
              className="sellers-shop-item"
              onClick={this.onShopListItemClick.bind(this, shopItem)}
            >
              <View className="sellers-shop-item-line"></View>
              <View className="sellers-shop-item-content sellers-column">
                <View
                  className="sellers-row sellers-content-between"
                  style="line-height: 15px;"
                >
                  <Text className="sellers-dark-text sellers-14-text sellers-shop-name">
                    {shopItem.title}
                  </Text>
                  <YFWPriceView price={shopItem.price} />
                </View>
                <View className="sellers-row sellers-algin-center sellers-content-between sellers-margin-top-10">
                  <View className="sellers-row sellers-algin-center">
                    <Image
                      className="sellers-shop-star"
                      src={require("../../../../images/bijia/star.png")}
                      mode="widthFix"
                    />
                    <Text className="sellers-light-text sellers-12-text sellers-margin-right-10">
                      {Number.parseFloat(shopItem.star).toFixed(1)}
                    </Text>
                    <Text className="sellers-light-text sellers-12-text">
                      {shopItem.region}
                    </Text>
                  </View>
                  {shopItem.shipping_price != "0.00" && (
                    <Text className="sellers-light-text sellers-12-text">
                      {"运费" + shopItem.shipping_price + "元"}
                    </Text>
                  )}
                  {shopItem.shipping_price == "0.00" && (
                    <Text className="sellers-light-text sellers-12-text">
                      包邮
                    </Text>
                  )}
                </View>
                <View className="sellers-row sellers-algin-end sellers-content-between">
                  <View className="sellers-column">
                    <View className="sellers-row sellers-algin-center">
                      <Text className="sellers-light-text sellers-12-text sellers-margin-right-10">
                        {"库存" + shopItem.reserve}
                      </Text>
                      <Text className="sellers-light-text sellers-12-text">
                        {period_to}
                      </Text>
                    </View>
                    <View className="sellers-row sellers-algin-center sellers-margin-top-5">
                      {shopItem.scheduled_name && (
                        <Text className="sellers-shop-schedule">
                          {shopItem.scheduled_name}
                        </Text>
                      )}
                      {shopItem.logistics_desc && (
                        <Text className="sellers-shop-freepostage">
                          {shopItem.logistics_desc}
                        </Text>
                      )}
                      {shopItem.coupons_desc && (
                        <Text className="sellers-shop-coupon">
                          <Text>券</Text>
                          {shopItem.coupons_desc}
                        </Text>
                      )}
                      {shopItem.activity_desc && (
                        <Text className="sellers-shop-activity">
                          {shopItem.activity_desc}
                        </Text>
                      )}
                      {shopItem.discount && (
                        <Text className="sellers-shop-discount">
                          {shopItem.discount}
                        </Text>
                      )}
                    </View>
                    {shopItem.medicine_package_desc && (
                      <View className="sellers-row sellers-algin-center sellers-margin-top-3">
                        <Text className="sellers-shop-treatment">疗程装</Text>
                        <Text className="sellers-light-text sellers-10-text">
                          {shopItem.medicine_package_desc}
                        </Text>
                      </View>
                    )}
                  </View>
                  {/* {(login&&shopItem.is_add_cart) && <View className='sellers-row sellers-algin-end sellers-content-center sellers-shop-car'>
                    <Image src={require('../../../../images/bijia/gwche.png')} mode='widthFix' />
                  </View>} */}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  /** 渲染底部悬浮操作按钮 */
  renderBottomStickView() {
    const { currentIndex,pageIndex } = this.state;
    const { totalPage } = this.state;
    const { shopcarCount } = this.state;

    return (
      <View className="sellers-row sellers-algin-end sellers-content-between sellers-bottom">
        {shopcarCount !== 0 && (
          <AtBadge value={shopcarCount} maxValue={99}>
            <Image
              className="sellers-bottom-icon"
              src={require("../../../../images/bijia/gwche2.png")}
              mode="widthFix"
              onClick={this.onSellersShopCarClick.bind(this)}
            />
          </AtBadge>
        )}
        {shopcarCount === 0 && (
          <Image
            className="sellers-bottom-icon"
            src={require("../../../../images/bijia/gwche2.png")}
            mode="widthFix"
            onClick={this.onSellersShopCarClick.bind(this)}
          />
        )}
        <View className="sellers-row sellers-algin-center sellers-content-center sellers-page-view">
          <Text className="sellers-white-text sellers-10-text">
            {pageIndex + "/ " + totalPage}
          </Text>
        </View>
        <Image
          className="sellers-bottom-icon"
          src={require("../../../../images/bijia/gotop.png")}
          mode="widthFix"
          onClick={this.onSellersTopClick.bind(this)}
        />
      </View>
    );
  }

  /** 渲染modal和底部刷新组件 */
  renderSellersModals() {
    const { openStandard } = this.state;
    const { medicineInfo } = this.state;
    const { refreshStatus } = this.state;
    const standards = medicineInfo.standards || [];
    const medicineType = Number.parseInt(medicineInfo.prescriptionType);
    const color = medicineInfo.isCanSale ? "#333333" : "#999999";
    return (
      <Block>
        <YFWFloatLayout
          title=""
          isOpened={openStandard}
          onClose={this.onCloseStandardsModal.bind(this)}
        >
          <View className="gooddetail">
            <Image
              className="gooddetail_pic"
              src={medicineInfo.img_url}
              mode="widthFix"
            />
            <View className="goodsdetail_info">
              <YFWMedicineNameView
                name={medicineInfo.title}
                medicineType={medicineType}
                color={color}
                fontWeight="bold"
                fontSize="28"
              />
              <View className="goodsdetail_info_pzwh">
                <Text style="color:#999">批准文号:</Text>
                <Text>{medicineInfo.authorized_code}</Text>
              </View>
            </View>
          </View>
          <View className="sellers-standard-modal-content">
            {standards.map((standardItem) => {
              const itemClass = standardItem.select
                ? "sellers-standard-item-select"
                : "sellers-standard-item-normal";
              const itemIcon = standardItem.select
                ? require("../../../../images/chooseBtnWhite3x.png")
                : require("../../../../images/checkout_unsel.png");
              const itemTitleClass = standardItem.select
                ? "sellers-white-text sellers-14-text"
                : "sellers-green-text sellers-14-text";
              return (
                <View
                  className={
                    itemClass +
                    " sellers-row sellers-content-between sellers-algin-center"
                  }
                  onClick={this.onStandardItemClick.bind(this, standardItem)}
                >
                  <Text className={itemTitleClass}>
                    {standardItem.standard}
                  </Text>
                  <Image
                    className="sellers-standard-item-icon"
                    src={itemIcon}
                    mode="widthFix"
                  />
                </View>
              );
            })}
          </View>
        </YFWFloatLayout>
      </Block>
    );
  }

  /** 去购物车 */
  onSellersShopCarClick() {
    pushNavigation("get_shopping_car");
  }

  /** 点击回到顶部 */
  onSellersTopClick() {
    Taro.pageScrollTo({ scrollTop: 10 });
    this.setState({
      scrollTop:0
    })
  }

  /** 价格趋势 */
  onPriceTrendClick() {
    const { goodsId } = this.state;
    pushNavigation("get_price_trend", { value: goodsId });
  }

  /** 点击展示规格选项 */
  onStandardsClick() {
    this.setState({
      openStandard: true,
    });
  }

  /** 关闭规格modal */
  onCloseStandardsModal() {
    this.setState({
      openStandard: false,
    });
  }

  /** 点击切换规格 */
  onStandardItemClick(standardItem) {
    const { medicineInfo } = this.state;
    if (medicineInfo.standard !== standardItem.standard) {
      this.state.goodsId = standardItem.id;
      this.state.pageIndex = 1;
      this.loadMore = true;
      this.fetchSellersInitData();
    }
    this.setState({
      openStandard: false,
    });
  }

  /** 点击距离筛选 */
  onFliterDistanceClick() {
    if (this.loading) {
      return;
    }
    this.setState({
      fliterIndex: 0,
    });
    this.state.pageIndex = 1;
    this.loadMore = true;
    this.state.sort = "distance";
    this.state.sorttype = "asc";
    this.fetchSellersShopListMoreData();
  }

  /** 点击价格筛选 */
  onFliterPriceClick() {
    if (this.loading) {
      return;
    }
    const { priceUp } = this.state;

    this.setState({
      fliterIndex: 1,
      priceUp: !priceUp,
    });
    this.state.pageIndex = 1;
    this.loadMore = true;
    this.state.sort = "sprice";
    this.state.sorttype = !priceUp ? "asc" : "desc";
    this.fetchSellersShopListMoreData();
  }

  /** 点击筛选 */
  onFliterPostageClick() {
    if (JSON.stringify(this.state.fakeObj) != "{}") {
      let _obj = this.state.fakeObj,
        _query = {};
      _query = {
        min_price: _obj.min_price || "",
        max_price: _obj.max_price || "",
        preferentialActivities:
          _obj.preferentialActivities || this.state.preferentialActivities,
        remainingValidity:
          _obj.remainingValidity || this.state.remainingValidity,
        areaData: _obj.areaData || this.state.areaData,
        provinceArray: _obj.provinceArray || this.state.provinceArray,
      };
      this.setState(_query);
    }
    let animation = Taro.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0,
    });
    this.animation = animation;

    if (!this.state.isShow) {
      animation.translateX(300).step();
      this.setState({
        animationData: animation.export(),
        isShow: true,
      });
    }
    let that = this;
    setTimeout(
      function () {
        animation.translateX(0).step();
        that.setState({
          animationData: animation.export(),
        });
      }.bind(this),
      0
    );
  }

  /** 点击列表item */
  onShopListItemClick(shopItem) {
    const { goodsOriginInfo } = this.state;
    const medicine = {
      id: shopItem.shop_goods_id,
      price: shopItem.price,
      price_desc: shopItem.price_desc,
      discount: shopItem.discount,
      dict_medicine_type: goodsOriginInfo.dict_medicine_type,
      aliascn: goodsOriginInfo.aliascn,
      namecn: goodsOriginInfo.namecn,
      authorized_code: goodsOriginInfo.authorized_code,
      applicability: goodsOriginInfo.applicability
        .replace(/<[^>]+>/g, "")
        .replace(/(↵|\r|\n|&|=|\?)/g, "")
        .trim(),
      scheduled_name: shopItem.scheduled_name,
      image_list: goodsOriginInfo.image_list,
      standard: goodsOriginInfo.standard,
      troche_type: goodsOriginInfo.troche_type,
      title: shopItem.title,
      nameen: goodsOriginInfo.nameen,
      py_namecn: goodsOriginInfo.py_namecn,
      period: goodsOriginInfo.period,
      period_to: shopItem.period_to,
      buy_prompt_info: goodsOriginInfo.buy_prompt_info,
      bentrusted_store_name: goodsOriginInfo.bentrusted_store_name,
      rx_giude_url: goodsOriginInfo.rx_giude_url,
      region: shopItem.region,
      reserve: shopItem.reserve,
      shipping_price: shopItem.shipping_price,
      star: shopItem.star,
      shop_id: shopItem.shop_id,
      manufacturer: goodsOriginInfo.title,
    };
    medicine.applicability=""; //置空描述 有些描述过长导致请求接口时 referer过大 请求失败
    pushNavigation("get_shop_goods_detail", {
      type: "sellers",
      value: shopItem.shop_goods_id,
      data: medicine,
    });
  }
}
