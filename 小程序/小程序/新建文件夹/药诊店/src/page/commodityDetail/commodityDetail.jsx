import Taro, { getCurrentInstance } from "@tarojs/taro";
import { Component } from "react";
import {
  View,
  Swiper,
  SwiperItem,
  Text,
  Image,
  ScrollView,
  Block
} from "@tarojs/components";
import "./commodityDetail.less";
import {
  isNotEmpty,
  convertImg,
  safe,
  toDecimal,
  coverAuthorizedTitle
} from "../../utils/YFWPublicFunction";
import { connect } from "react-redux";
import { changeState } from "../../store/actions/index";
import { HTTP } from "../../utils/http";
import { handleResponse } from "../../utils/responseHandle";
import { MedicineNameView } from "../../components/YFWMedicineNameView/YFWMedicineNameView";
import { YFWPriceView } from "../../components/YFWPriceView/YFWPriceView";
import MedicineBag from "../../components/MedicineBag/MedicineBag";
import { transFormData } from "../../utils/YFWPublicFunction";
import { pushNavigation } from "../../apis/YFWRouting";
const httpRequest = new HTTP();
class CommodityDetail extends Component {
  constructor() {
    super();
    this.state = {
      shopCar: [],
      shopCartCount: "",
      shopCarOpened: false,
      storeMedicineId: "",
      storeShopMedicineId: "",
      distance: "",
      navHeight: "", //导航栏底部到窗口顶部的距离
      navTop: "", //胶囊按钮与顶部的距离
      windowHeight: "", //页面可用高度
      ratio: 0.5, //比例
      jnHeight: "", //胶囊的高度
      currentIndex: 0,
      storeMedicineId: "",
      wrapperHeight: "",
      medicine_images: [], // 商品图片数组
      medicine_image_index: 1, // 顶部图片滑动时当前滑块索引
      goodsInfo: {},
      medicine_info: {
        medicine_id: 0,
        store_medicine_id: 0,
        price: "", // 价格
        discount: "", // 返现折扣价
        real_price: "", // 真实价格
        medicine_type: "-1", // 类型 OTC、单轨、双轨
        medicine_type_status: false,
        medicine_typedesc: "", // 药品类型解释
        medicine_typeurl: "", // 单双轨说明页链接
        medicine_icon: "", // 药品类型图片
        medicine_name: "", // 药品名称
        medicine_image: "", // 药品图片
        medicine_indications: "", // 功能主治
        medicine_authorizetion: "", // 批准文号
        medicine_authorizetionTitle: "", //批准文号、注册证号
        medicine_standard: "", // 规格
        medicine_dosage_form: "", // 剂型/型号
        medicine_manufacturer: "", // 生产厂家
        medicine_bentrusted_name: "", // 上市许可人
        medicine_notice: "", // 风险提示
        medicine_vacation: "", // 节假日提示字段
        medicine_waring: "", // 警示语
        medicine_promptinfo: "", // 禁止销售提示
        medicine_namecn: "", // 通用名
        medicine_nameen: "", // 英文名
        medicine_py_namecn: "", // 拼音名称
        medicine_period: "", // 有效期
        medicine_period_to: "", // 有效期至
        medicine_aliascn: "", // 品牌
        medicine_guide: null, // 说明书
        medicine_guide_show: 0, // 是否显示说明书 默认不显示
        reserve: ""
      },
      medicine_detail: [
        {
          title: "基本信息",
          notice: "",
          medicine_image_list: [],
          isShow: 1,
          items: [
            {
              title: "通用名",
              subtitle: ""
            },
            {
              title: "商品品牌",
              subtitle: ""
            },
            {
              title: "批准文号",
              subtitle: ""
            },
            {
              title: "包装规格",
              subtitle: ""
            },
            {
              title: "剂型/型号",
              subtitle: ""
            },
            {
              title: "英文名称",
              subtitle: ""
            },
            {
              title: "汉语拼音",
              subtitle: ""
            },
            {
              title: "有效期",
              subtitle: ""
            },
            {
              title: "生产企业",
              subtitle: ""
            }
          ]
        },
        {
          title: "说明书",
          isShow: 0,
          notice:
            "友情提示：商品说明书均由药房网商城工作人员手工录入，可能会与实际有所误差，仅供参考，具体请以实际商品为准",
          items: []
        },
        {
          title: "服务保障",
          notice: "",
          isShow: 1,
          promise: {
            title: "药房网商城承诺",
            qualification: {
              icon: "",
              type: "",
              link: ""
            },
            items: [
              {
                //   icon: require("../../../../images/YFWGoodsDetailModule/goods_deail_qualification.png"),
                title: "品质保障",
                content:
                  "药房网商城在售商品均由正规实体签约商家供货，商家提供品质保证。在购物过程中发现任何商家有违规行为，请直接向我们投诉举报！"
              },
              {
                //   icon: require("../../../../images/YFWGoodsDetailModule/goods_deail_invoice.png"),
                title: "提供发票",
                content: "药房网商城所有在售商家均可提供商家发票"
              }
            ]
          },
          store_qualification: {
            title: "商家资质",
            items: []
          },
          store_images: {
            title: "商家实景",
            items: []
          },
          returned_standard: {
            title: "退换货标准",
            return_policy: {
              title: "退换货政策",
              content:
                "由商品售出之日（以实际收货时间为准）起七日内符合退换货条件的商品享受退换货政策。"
            },
            return_condition: {
              title: "退换货条件",
              items: [
                "因物流配送导致外包装污损、破损的商品。",
                "经质量管理部门检验，确属产品本身存在质量问题。",
                "国家权威管理部门发布公告的产品（如停售、召回等）。",
                "因商家失误造成发货错误，如商品的名称、规格、数量、产品批次等信息与所订商品不符。"
              ]
            },
            return_explain: {
              title: "特殊说明",
              content:
                "因药品是特殊商品，依据中华人民共和国《药品经营质量管理规范》及其实施细则（GSP）、《互联网药品交易服务审批暂行规定》等法律、法规的相关规定：药品一经售出，无质量问题，不退不换。"
            },
            return_process: {
              title: "退换货流程",
              items: [
                "联系商家客服或自行确认符合退换货政策",
                "在线提交退换货申请及相关证明",
                "退换货申请通过后寄回商品",
                "确认商家为您重寄的商品或退款"
              ]
            }
          }
        }
      ],
      currentIndex: 0,
      paramsData: null,
      scrollTop: 0,
      paramsDelTop: 10,
    };
  }
  getShopCar() {
    let that = this;
    httpRequest.get("sell_ordercart.getCart", {}).then(res => {
      if (res && res.MedicineList) {
        res.MedicineList = transFormData(res.MedicineList);
        that.state.shopCar = res.MedicineList;
        let goodsInfo = {};
        for (let item of res.MedicineList) {
          if (item.id == that.state.storeShopMedicineId) {
            goodsInfo = item;
            break;
          }
        }
        if (JSON.stringify(goodsInfo) == "{}") {
          let _d = that.state.goodsInfo_original;
          goodsInfo = {
            name: _d.name,
            standard_name: _d.standard_name,
            standard_type: _d.standard_type,
            priceInt: _d.priceInt,
            priceFloat: _d.priceFloat,
            shopPrice: _d.shopPrice, //RetailPrice 售价
            medicineIntorImage: _d.medicineIntorImage,
            reserve: _d.reserve,
            maxBuyQty: _d.maxBuyQty,
            unit: _d.unit,
            count: "0", //CarAmount为购物车中的数量
            id: _d.id,
            shopId: _d.shopId,
            prescription: _d.prescription
          };
        }
        that.setState({
          shopCar: res.MedicineList,
          CartTotal: res.CartTotal,
          goodsInfo,
        });
        if (res.MedicineList.length == 0) {
          that.setState({
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
  componentWillMount() {
    this.state.scrollTop = 0;
    let instance = getCurrentInstance();
    let params = instance.router.params;
    let _shopId = params.shopId;
    let _shopMedicineId = params.shopMedicineId;
    this.state.storeMedicineId = _shopId;
    this.state.storeShopMedicineId = _shopMedicineId;
    this.setState({
      storeMedicineId: _shopId,
      storeShopMedicineId: _shopMedicineId
    });
    let that = this;
    Taro.getSystemInfo({
      success: function(res) {
        let ratio = res.windowWidth / 375;
        let windowHeight = res.windowHeight * ratio;
        that.state.wrapperHeight = windowHeight;
      }
    });
  }
  componentDidMount() {
    this.fetchGoodsDetail();
    this.fetchShopDetail();
    this.getShopCarCount();
  }
  componentWillUnmount() {}
  componentDidShow() {}
  componentDidHide() {}
  //调用商品数据接口
  fetchGoodsDetail() {
    const { storeMedicineId, storeShopMedicineId } = this.state;
    return new Promise((resolve, reject) => {
      httpRequest
        .get("guest.getMedicineDetail", {
          shopId: storeMedicineId,
          shopMedicineId: storeShopMedicineId
        })
        .then(
          response => {
            if (isNotEmpty(response)) {
              let _m = toDecimal(response.RetailPrice);
              _m = _m.split(".");
              this.state.goodsInfo_original={
                name: response.NameCN,
                standard_name: response.TrocheType,
                standard_type: response.Standard,
                priceInt: _m[0],
                priceFloat: _m[1],
                shopPrice: response.RetailPrice, //RetailPrice 售价
                medicineIntorImage: response.intro_image_url,
                reserve: response.Reserve,
                maxBuyQty: response.StoreMaxBuyQty,
                unit: response.Unit,
                count: "0", //CarAmount为购物车中的数量
                id: response.id,
                shopId: response.shopid,
                prescription: response.dict_medicine_type
              }
              console.log('this.state.goodsInfo_original',this.state.goodsInfo_original)
              this.getShopCar();
              response = handleResponse(response);
              resolve(response);
              this.dealGoodsImagesInfo(response);
              this.dealGoodsInfo(response);
              this.dealGoodsExplainInfo(response);
              this.dealGoodsBaseInfo(response);
            }
          },
          error => {
            reject(error);
          }
        );
    });
  }
  //调用商家数据接口
  fetchShopDetail() {
    const { storeMedicineId } = this.state;
    httpRequest
      .get("guest.getStoreInfo", {
        shopId: storeMedicineId
      })
      .then(response => {
        if (isNotEmpty(response)) {
          response = handleResponse(response);
          this.dealShopsInfo(response);
        }
      });
  }
  //滑动顶部图片事件
  onSwiperChangeIndex(event) {
    if (event.detail.source == "touch") {
      const index = event.detail.current + 1;
      this.setState({
        medicine_image_index: index
      });
    }
  }
  // 解析商品图片
  dealGoodsImagesInfo(response) {
    let medicine_images = [];
    if (response.intro_image_url) {
      let intro_img_result = response.intro_image_url;
      let list = intro_img_result.split("|");
      list.map((item, index) => {
        item = convertImg(item);
        medicine_images.push(item);
      });
    }
    this.setState({
      medicine_images: medicine_images
    });
  }
  //解析商品详情
  dealGoodsInfo(response) {
    //药品信息
    const medicine = response;
    //功能主治
    const medicine_indications = medicine.applicability

      .replace(/<[^>]+>/g, "")
      .replace(/(↵|\r|\n)/g, "")
      .trim();
    //药品类型
    let medicien_icon = "";
    let medicien_typedesc = "";
    let medicien_type_status = false;
    const medicine_type = Number.parseInt(medicine.dict_medicine_type);

    if (medicine_type == 0) {
      //OTC
      medicien_type_status = true;
      medicien_icon = "../../images/otc.png";
      medicien_typedesc = "请在医务人员指导下购买和使用，禁忌或者注意事项详见说明书";
    } else if (medicine_type == 1 || medicine_type == 3) {
      //单轨
      medicien_type_status = true;
      medicien_icon = "../../images/rx.png";
      medicien_typedesc = "处方药指凭医师处方购买和使用的药品";
    } else if (medicine_type == 2) {
      //双轨
      medicien_type_status = true;
      medicien_icon = "../../images/rx.png";
      medicien_typedesc = "处方药指凭医师处方购买和使用的药品";
    }
    let { medicine_info } = this.state;
    medicine_info.medicine_type = medicine_type;
    medicine_info.medicien_icon = medicien_icon;
    medicine_info.price = toDecimal(response.RetailPrice);
    medicine_info.medicine_typedesc = medicien_typedesc;
    medicine_info.medicien_type_status = medicien_type_status;
    medicine_info.medicine_dosage_form = safe(medicine.TrocheType); // 剂型/型号
    medicine_info.medicine_standard = safe(medicine.Standard); //包装规格
    medicine_info.medicine_name = safe(medicine.NameCN);
    medicine_info.medicine_indications = safe(medicine_indications);
    medicine_info.medicine_namecn = safe(medicine.m_namecn);
    medicine_info.medicine_aliascn = safe(medicine.AliasCN);
    medicine_info.medicine_authorizetion = safe(medicine.AuthorizedCode);
    medicine_info.medicine_period = safe(medicine.m_period);
    medicine_info.medicine_manufacturer = safe(medicine.MillTitle);
    medicine_info.medicine_py_namecn = safe(medicine.m_aliasen);
    medicine_info.medicine_nameen = safe(medicine.m_nameen);
    medicine_info.reserve = response.Reserve;
    medicine_info.medicine_guide_show = Number.parseInt(
      medicine.dict_bool_lock
    );
    medicine_info.BolUseCustomerPrice = response.BolUseCustomerPrice;
    medicine_info.CustomerPrice = response.CustomerPrice;
    medicine_info.medicine_guide = medicine.m_guide || {};
    this.setState({
      medicine_info: medicine_info
    });
  }
  //解析基本信息
  dealGoodsBaseInfo(response) {
    let { medicine_info, medicine_detail } = this.state;
    let baseInfo = medicine_detail[0];
    // baseInfo.notice = safe(response.package_prompt_info);
    let baseInfoItems = baseInfo.items;
    let subtitles = [
      medicine_info.medicine_namecn,
      medicine_info.medicine_aliascn,
      medicine_info.medicine_authorizetion,
      medicine_info.medicine_standard,
      medicine_info.medicine_dosage_form,
      medicine_info.medicine_nameen,
      medicine_info.medicine_py_namecn,
      medicine_info.medicine_period,
      medicine_info.medicine_manufacturer
    ];
    baseInfoItems.map((subItem, subIndex) => {
      if (subItem.title == "批准文号") {
        subItem.title = coverAuthorizedTitle(subtitles[subIndex]);
      }
      subItem.subtitle = subtitles[subIndex];
    });
    this.setState({
      medicine_detail: medicine_detail
    });
  }
  //解析说明书信息
  dealGoodsExplainInfo(response) {
    //药品信息
    let { medicine_info, medicine_detail } = this.state;
    let _guide = response.m_guide;
    if (medicine_info.medicine_guide_show == 0) {
      return;
    } else if (medicine_info.medicine_guide_show == 1) {
      let explainKeys = Object.keys(_guide);
      let explainItems = [];
      let explainInfo = medicine_detail[1];
      explainKeys.map((kItem, kIndex) => {
        const explainTitle = kItem;
        const explainContent = _guide[kItem];
        const explainItem = {
          title: "【" + explainTitle + "】",
          content: explainContent
        };
        explainItems.push(explainItem);
        explainInfo.items = explainItems;
        explainInfo.isShow = 1;
        medicine_detail[1] = explainInfo;
      });
    }
    this.setState({
      medicine_detail: medicine_detail
    });
  }
  // 解析商家信息
  dealShopsInfo(response) {
    let { medicine_detail } = this.state;
    const qualificationList = response.CertImageList;

    const liveActionList = response.StoreImageList;

    let shopInfo = medicine_detail[2];
    let qualificationItems = [];
    if (isNotEmpty(qualificationList)) {
      qualificationList.map((qItem, qIndex) => {
        const qualificationItem = {
          qualificationImg: qItem.image_url,
          qualificationName: qItem.image_name
        };
        qualificationItems.push(qualificationItem);
        shopInfo.store_qualification.items = qualificationItems;
        medicine_detail[2] = shopInfo;
      });
    } else {
      return [];
    }
    let liveActionItems = [];
    if (isNotEmpty(liveActionList)) {
      liveActionList.map((laItem, laIndex) => {
        const liveActionItem = {
          liveActionImg: laItem.image_url
        };
        liveActionItems.push(liveActionItem);
        shopInfo.store_images.items = liveActionItems;
        medicine_detail[2] = shopInfo;
      });
    } else {
      return [];
    }
    this.setState({
      medicine_detail: medicine_detail
    });
  }
  showRuler() {}
  // 点击减少商品数量
  onClickMinusNum() {}
  // 点击增加商品数量
  onClickPlusNum() {}
  //点击切换标签
  handleClickParamsTag(event) {
    let { currentIndex } = this.state;
    let index = event.currentTarget.dataset.index;
    currentIndex = index;
    this.state.paramsDelTop = this.state.paramsDelTop == 0 ? 1 : 0;
    this.setState({
      currentIndex: index,
      paramsDelTop: this.state.paramsDelTop
    });
  }
  //说明书 药品名称换行操作
  lineFeed(content) {
    let _content = content.replace(/(↵|\r)/g, "\n").trim();
    return _content;
  }
  //页面滚动事件
  mainScroll(e) {

  }
  //  渲染顶部商品图片
  renderMedicineImages() {
    const { medicine_images } = this.state;
    const { medicine_image_index } = this.state;
    return (
      <View className="detail-header" style={"position:relative"}>
        <Swiper
          className="detail-header-swiper"
          circular={true}
          onChange={this.onSwiperChangeIndex.bind(this)}
        >
          {medicine_images.map((imgItem, imgIndex) => {
            return (
              <SwiperItem key={imgIndex.toString()}>
                <Image
                  src={imgItem}
                  className="detail-header-image"
                  mode="aspectFit"
                ></Image>
              </SwiperItem>
            );
          })}
        </Swiper>
        <View
          style={medicine_images.length == 0 ? "display:none" : "display:block"}
          className="detail-num"
        >
          {medicine_image_index.toString() +
            "/" +
            medicine_images.length.toString()}
        </View>
      </View>
    );
  }
  /** 渲染药品价格、名称、功能主治等 */
  renderMedicineInfo() {
    const { medicine_info, goodsInfo } = this.state;
    const memBer = medicine_info.BolUseCustomerPrice ? true:false;
    console.log('goodsInfo',goodsInfo)
    return (
      <View className="detail-name-goods">
        <View className="detail-name-title">
          <MedicineNameView
            medicineType={medicine_info.medicine_type}
            name={medicine_info.medicine_name}
            fontWeight="bold"
            medicienTypedesc={medicine_info.medicine_typedesc}
            medicineDosageForm={medicine_info.medicine_dosage_form}
            medicineStandard={medicine_info.medicine_standard}
          ></MedicineNameView>
          {medicine_info.reserve && (
            <View className="reserve">库存<Text style={`margin-left:8px`}>{medicine_info.reserve}</Text></View>
          )}
        </View>
        <View className="detail-price-area">
          <YFWPriceView price={memBer? medicine_info.CustomerPrice:medicine_info.price} bold={0} hasMember={memBer} bigImage></YFWPriceView>
          <View className="detail-cart-num">
            {goodsInfo.count>0 && (
              <Image
                className="minus"
                src={require("../../images/minus.png")}
                onClick={this.minusClick.bind(this, goodsInfo)}
              ></Image>
            )}
            {goodsInfo.count>0 && (
              <Text className="num">{goodsInfo.count}</Text>
            )}
            <Image
              className="plus"
              src={require("../../images/plus.png")}
              onClick={this.plusClick.bind(this, goodsInfo)}
            ></Image>
          </View>
        </View>
        {memBer && (
          <View className="oldPrice">{`¥ ${medicine_info.price}`}</View>
        )}
      </View>
    );
  }
  //主治功能
  renderMedicineMajor() {
    const { medicine_info } = this.state;
    return (
      <View className="detail-name-major">
        <View className="detail-major-title">主治功能</View>
        <View className="detail-major-content">
          {medicine_info.medicine_indications}
        </View>
      </View>
    );
  }
  renderMedicineParams() {
    const {
      medicine_detail,
      currentIndex,
      medicine_images,
      paramsDelTop,
    } = this.state;
    let returnItems =
      medicine_detail[2].returned_standard.return_condition.items;
    let processItems =
      medicine_detail[2].returned_standard.return_process.items;
    return (
      <View className="detail-name-params">
        <View
          className={"detail-params-title posi-sticky"}
        >
          {medicine_detail.map((gpItem, gpIndex) => {
            return (
              <View>
                <View
                  className="detail-params-title-item"
                  data-index={gpIndex}
                  onClick={this.handleClickParamsTag.bind(this)}
                >
                  <Text
                    style={
                      gpItem.isShow == 1 ? "display:block" : "display:none"
                    }
                  >
                    {gpItem.title}
                  </Text>
                  {currentIndex == gpIndex && (
                    <View className="onUnderLine"></View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
        <Block>
          {currentIndex == 0 && (
            <ScrollView
              scrollY
              className="detail-params-content-basic"
            >
              <View className="title">{medicine_detail[0].title}</View>
              <View className="main">
                {medicine_detail[0].items.map((bItem, bIndex) => {
                  return (
                    <View className="main-item">
                      <Text className="title">{bItem.title}</Text>
                      <Text className="del">{bItem.subtitle}</Text>
                    </View>
                  );
                })}
              </View>
              {medicine_images.map((item, index) => {
                return (
                  <View className="main">
                    <Image src={item} className="main-goodsImg"></Image>
                  </View>
                );
              })}
            </ScrollView>
          )}
          {currentIndex == 1 && (
            <ScrollView
              scrollY
              scrollTop={paramsDelTop}
              className="detail-params-content-description"
            >
              <View className="title">{medicine_detail[1].title}</View>
              <View className="main">
                {medicine_detail[1].items.map((dItem, dIndex) => {
                  return (
                    <View className="main-item">
                      <View className="head">{dItem.title}</View>
                      {dIndex == 0 && (
                        <Text className="del">
                          {this.lineFeed(dItem.content)}
                        </Text>
                      )}
                      {dIndex != 0 && (
                        <Text className="del">{dItem.content}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}
          {currentIndex == 2 && (
            <ScrollView
              scrollY
              scrollTop={paramsDelTop}
              className="detail-params-content-safe"
            >
              {/* 商家资质 */}
              <View className="title">
                {medicine_detail[2].store_qualification.title}
              </View>
              <View className="main-zz">
                {medicine_detail[2].store_qualification.items.map(
                  (qItem, qIndex) => {
                    return (
                      <View className="main-item">
                        <Image
                          className="img"
                          src={qItem.qualificationImg}
                        ></Image>
                        <View className="describe">
                          {qItem.qualificationName}
                        </View>
                      </View>
                    );
                  }
                )}
              </View>
              {/* 商家实景 */}
              <View className="title">
                {medicine_detail[2].store_images.title}
              </View>
              <View className="main-zz">
                {medicine_detail[2].store_images.items.map((qItem, qIndex) => {
                  return (
                    <View className="main-item">
                      <Image className="img" src={qItem.liveActionImg}></Image>
                    </View>
                  );
                })}
              </View>
              {/* 退换货标准 */}
              <View className="title">
                {medicine_detail[2].returned_standard.title}
              </View>
              <View className="main-return">
                {/* 退换货政策 */}
                <Block>
                  <View className="title">
                    {medicine_detail[2].returned_standard.return_policy.title}
                  </View>
                  <View className="content">
                    {medicine_detail[2].returned_standard.return_policy.content}
                  </View>
                </Block>
                {/* 退换货条件 */}
                <Block>
                  <View className="title">
                    {
                      medicine_detail[2].returned_standard.return_condition
                        .title
                    }
                  </View>
                  <View className="content">
                    {returnItems.map((tItem, tIndex) => {
                      return (
                        <View className="returnItem">
                          <View
                            className="circle"
                            style={
                              tIndex % 2 == 0
                                ? "background-color:#ff605e"
                                : "background-color:#1fdb9b"
                            }
                          ></View>
                          <Text>{tItem}</Text>
                        </View>
                      );
                    })}
                  </View>
                </Block>
                <Block>
                  <View className="title">
                    {medicine_detail[2].returned_standard.return_explain.title}
                  </View>
                  <View className="content">
                    {
                      medicine_detail[2].returned_standard.return_explain
                        .content
                    }
                  </View>
                </Block>
                <Block>
                  <View className="title">
                    {medicine_detail[2].returned_standard.return_process.title}
                  </View>
                  <View className="content">
                    {processItems.map((pItem, pIndex) => {
                      return (
                        <View className="processItem">
                          <View className="left">
                            <View className="circle"></View>
                            <View
                              className="line"
                              style={
                                pIndex == processItems.length - 1
                                  ? "display:none"
                                  : ""
                              }
                            ></View>
                          </View>
                          <Text>{pItem}</Text>
                        </View>
                      );
                    })}
                  </View>
                </Block>
              </View>
            </ScrollView>
          )}
        </Block>
      </View>
    );
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
                let goodsInfo = that.state.goodsInfo;
                goodsInfo.count = 0;
                that.setState({
                  shopCarOpened: false,
                  shopCar: [],
                  shopCartCount: 0,
                  goodsInfo
                });
                Taro.hideLoading();
              },
              err => {
                Taro.hideLoading();
              }
            );
        }
      }
    });
  }
  submitOrder() {
    const { shopCar } = this.state;
    if (shopCar.length == 0) return;
    let cartIdArr = shopCar.map(item => item.cartId);
    console.log(cartIdArr.join());
    pushNavigation("submitOrder", { cartIdArr: cartIdArr.join() });
  }
  render() {
    const {
      wrapperHeight,
      shopCarOpened,
      shopCar,
      CartTotal,
      shopCartCount,
      medicine_images
    } = this.state;
    return (
      <Block>
        <ScrollView
          scrollY
          onScroll={this.mainScroll.bind(this)}
          className="wrapper"
        >
          {this.renderMedicineImages()}
          {this.renderMedicineInfo()}
          {this.renderMedicineMajor()}
          {this.renderMedicineParams()}
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
      </Block>
    );
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
}
export default connect(
  ({ globalData }) => ({ globalData }),
  dispatch => ({
    changeState(data) {
      dispatch(changeState(data));
    }
  })
)(CommodityDetail);
