import Taro, { Component } from "@tarojs/taro";
import {
  View,
  Swiper,
  SwiperItem,
  Text,
  Image,
  ScrollView,
  Button,
  Block,
} from "@tarojs/components";
import "./YFWGoodsDetail.scss";
import {
  isNotEmpty,
  safeObj,
  safe,
  convertImg,
  tcpImage,
  toDecimal,
  coverAuthorizedTitle,
  getAppSystemConfig,
  isLogin,
} from "../../../../utils/YFWPublicFunction";
import { pushNavigation } from "../../../../apis/YFWRouting.js";
import YFWPriceView from "../../../../components/YFWPriceView/YFWPriceView";
import TitleView from "../../../../components/YFWTitleView/YFWTitleView";
import MedicineNameView from "../../../../components/YFWMedicineNameView/YFWMedicineNameView";
import YFWCouponModal from "../../../../components/YFWCouponModal/YFWCouponModal";
import YFWDiscountModal from "../../../../components/YFWDiscountModal/YFWDiscountModal";
import YFWPackageModal from "../../../../components/YFWPackageModal/YFWPackageModal";
import YFWAptitudeModal from "../../../../components/YFWAptitudeModal/YFWAptitudeModal";
import YFWMoreModal from "../../../../components/YFWMoreModal/YFWMoreModal";
import {
  GoodsDetailApi,
  ShopDetailApi,
  ShopCarApi,
} from "../../../../apis/index.js";
import { get as getGlobalData } from "../../../../global_data";
import { config } from "../../../../config";
import { AtAvatar } from "taro-ui";
const goodsDetailApi = new GoodsDetailApi();
const storeDetailApi = new ShopDetailApi();
const shopCarApi = new ShopCarApi();

export default class YFWGoodsDetail extends Component {
  config = {
    navigationBarTitleText: "商品详情",
    pullRefresh: false,
    allowsBounceVertical: "NO",
  };

  constructor(props) {
    super(props);

    this.state = {
      firstShowFlag: true,
      limit_buy_prompt: "",
      activityItem: {},
      opacityAnimation: {},
      translateAnimation: {},
      rulerFlag: false,
      verFlag: 0,
      prohibit_sales_btn_text: "",
      paramFlag: false,
      medicine_show_discount: [],
      medicine_freepostage_list: [],
      wx_rx_is_buy: 1,
      storeMedicineId: 0, // 20649658 6724020 23392736 23596928 22345534
      isIphoneX: getGlobalData("isIphoneX"),
      isLoading: false,
      isOpenMore: false, // 更多弹窗
      isOpenCoupon: false, // 优惠券弹窗
      isOpenDiscount: false, // 促销活动弹窗
      isOpenPackage: false, // 选择单品、套餐、疗程装弹窗
      isOpenAptitude: false, // 查看商家资质、实景弹窗
      shop_cart_count: 0,
      showWhiteBack: true, // 只有从比价页来的时候，不显示空白
      isShowTopItem: false, // 是否展示顶部标题
      topItemIndex: 0, // 顶部选中标题索引
      isCollection: false, // 是否收藏
      isSuspensionBaseInfo: false, // 基本信息、说明书、服务保障是否悬浮
      medicine_status: 0, // 底部按钮状态 0空白view 1可销售 2暂不销售 3在线客服
      medicine_images: [], // 商品图片数组
      medicine_image_index: 1, // 顶部图片滑动时当前滑块索引
      medicine_services: [], // 24小时发货、品质保障、提供发票
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
      },
      wrapperHeight: "",
      medicine_logistics: {
        logisyics_amount: "", // 运费
        start_city: "", // 发货地址
        end_city: "", // 收货地址
      },
      medicine_inventory: {
        inventory: 0, // 库存
        limitation: 0, // 限购
      },
      medicine_coupons: [], // 优惠券列表,
      medicine_discount: [], // 促销
      medicine_style: {
        medicine_single: [], // 单品规格
        medicine_combo: [], // 套餐
        medicine_treatment: [], // 疗程装
        medicine_packages: [], // 套装
      },
      medicine_selectInfo: {
        type: 0, // 选择的类型 0单品 1套餐 2疗程装
        desc: "single", // 单品single 套餐commbo 疗程装treatment
        name: "选择单品", // 选择的名称
        modalName: "",
        selectIndex: 0, // 套装选择的索引
        selectModel: {}, // 套装信息
        quantity: 1, // 选择的数量
        isBuy: false, // 提交需求、加入需求单
      }, // 药品的单品、套餐、疗程装信息
      medicine_store: {
        store_logo: "", // 药店logo
        store_name: "", // 药店名称
        store_score: 5.0, // 药店评分
        store_score_images: [
          require("../../../../images/YFWGoodsDetailModule/goods_deail_star.png"),
          require("../../../../images/YFWGoodsDetailModule/goods_deail_star.png"),
          require("../../../../images/YFWGoodsDetailModule/goods_deail_star.png"),
          require("../../../../images/YFWGoodsDetailModule/goods_deail_star.png"),
          require("../../../../images/YFWGoodsDetailModule/goods_deail_star.png"),
        ], // 药店评分
        store_id: 0, // 药店id
        store_recommend_medicine: [], // 商店推荐商品
        store_images: [], // 商家实景
        store_aptitude: [], // 商家资质
        store_contracted: true, // 商家是否认证
        store_modal: {
          type: 1, // 1.商家资质 2.店铺实景
          image_list: [], // 图片数组
          name: "暂无资质图片", // 暂无资质图片 暂无实景图片
          isShowLeft: false, // 显示左箭头
          isShowRight: false, // 显示右箭头
          index: 0, // 当前滑动页数
        },
      },
      medicine_question: 0, // 常见问题
      medicine_comment: {
        count: "0", // 评论数量
        comment_list: [], // 列表
      },
      medicine_detail_index: 0, // 默认基本信息
      medicine_detail: [
        {
          title: "基本信息",
          notice: "",
          medicine_image_list: [],
          isShow: 1,
          items: [
            {
              title: "通用名",
              subtitle: "",
            },
            {
              title: "商品品牌",
              subtitle: "",
            },
            {
              title: "批准文号",
              subtitle: "",
            },
            {
              title: "包装规格",
              subtitle: "",
            },
            {
              title: "剂型/型号",
              subtitle: "",
            },
            {
              title: "英文名称",
              subtitle: "",
            },
            {
              title: "汉语拼音",
              subtitle: "",
            },
            {
              title: "有效期",
              subtitle: "",
            },
            {
              title: "生产企业",
              subtitle: "",
            },
          ],
        },
        {
          title: "说明书",
          notice:
            "友情提示：商品说明书均由药房网商城工作人员手工录入，可能会与实际有所误差，仅供参考，具体请以实际商品为准",
          items: [],
          isShow: 0,
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
              link: "",
            },
            items: [
              {
                icon: require("../../../../images/YFWGoodsDetailModule/goods_deail_qualification.png"),
                title: "品质保障",
                content:
                  "药房网商城在售商品均由正规实体签约商家供货，商家提供品质保证。在购物过程中发现任何商家有违规行为，请直接向我们投诉举报！",
              },
              {
                icon: require("../../../../images/YFWGoodsDetailModule/goods_deail_invoice.png"),
                title: "提供发票",
                content: "药房网商城所有在售商家均可提供商家发票",
              },
            ],
          },
          store_qualification: {
            title: "商家资质",
            items: [],
          },
          store_images: {
            title: "商家实景",
            items: [],
          },
          returned_standard: {
            title: "退换货标准",
            return_policy: {
              title: "退换货政策",
              content:
                "由商品售出之日（以实际收货时间为准）起七日内符合退换货条件的商品享受退换货政策。",
            },
            return_condition: {
              title: "退换货条件",
              items: [
                "因物流配送导致外包装污损、破损的商品。",
                "经质量管理部门检验，确属产品本身存在质量问题。",
                "国家权威管理部门发布公告的产品（如停售、召回等）。",
                "因商家失误造成发货错误，如商品的名称、规格、数量、产品批次等信息与所订商品不符。",
              ],
            },
            return_explain: {
              title: "特殊说明",
              content:
                "因药品是特殊商品，依据中华人民共和国《药品经营质量管理规范》及其实施细则（GSP）、《互联网药品交易服务审批暂行规定》等法律、法规的相关规定：药品一经售出，无质量问题，不退不换。",
            },
            return_process: {
              title: "退换货流程",
              items: [
                "联系商家客服或自行确认符合退换货政策",
                "在线提交退换货申请及相关证明",
                "退换货申请通过后寄回商品",
                "确认商家为您重寄的商品或退款",
              ],
            },
          },
        },
      ],
    };
  }

  // 系统方法
  componentWillMount() {
    const params = this.$router.params.params;
    if (isNotEmpty(params)) {
      const value = JSON.parse(decodeURIComponent(params));
      this.state.storeMedicineId = value.value || 0;

      this.dealParams(value);
    }
    // 评价、详情的top、顶部item高度
    this.shouldUpdateTop = true; // 是否要重新获取以下字段
    this.qusetionCommentTop = 1104; // 评论滚动距离
    this.goodsDetailTop = 1539; // 基本信息、说明书、服务保障滚动距离
    this.stickViewHeight = 83; // 基本信息、说明书、服务保障高度
    this.topViewHeight = 50; // 顶部View高度
    let res = Taro.getSystemInfoSync();
    this.windowHeight = res.windowHeight;
    this.ratio = res.windowWidth / 750;
    this.state.wrapperHeight = this.windowHeight;
  }

  componentDidMount() {
    this.fetchGoodsDetail();
  }

  scrollfn(event) {
    // 获取评论、详情的位置
    if (this.shouldUpdateTop === true) {
      this.shouldUpdateTop = false;
      const query = Taro.createSelectorQuery();
      query.selectViewport().scrollOffset();
      query.select("#header-view").boundingClientRect();
      query.select("#question-comment").boundingClientRect();
      query.select("#stick-header").boundingClientRect();
      query.exec((res) => {
        this.topViewHeight = res[1].height;
        this.qusetionCommentTop = res[0].scrollTop + res[2].top - res[1].height;
        this.goodsDetailTop =
          res[0].scrollTop + res[2].top - res[1].height + res[2].height;
        this.stickViewHeight = res[3].height;
      });
    }
    const { scrollTop } = event.detail;
    const { isShowTopItem } = this.state;

    if (scrollTop >= 50 && !isShowTopItem) {
      this.state.isShowTopItem = true
      this.setState({
        isShowTopItem: true,
      });
    } else if (scrollTop < 50 && isShowTopItem) {
      this.state.isShowTopItem = false
      this.setState({
        isShowTopItem: false,
      });
    }

    const { topItemIndex } = this.state;
    if (scrollTop < this.qusetionCommentTop - 5 && topItemIndex !== 0) {
      this.setState({
        topItemIndex: 0,
      });
    } else if (
      scrollTop >= this.qusetionCommentTop - 5 &&
      scrollTop < this.goodsDetailTop - 5 &&
      topItemIndex !== 1
    ) {
      this.setState({
        topItemIndex: 1,
      });
    } else if (scrollTop >= this.goodsDetailTop - 5 && topItemIndex !== 2) {
      this.setState({
        topItemIndex: 2,
      });
    }

    const { isSuspensionBaseInfo } = this.state;
    if (scrollTop >= this.goodsDetailTop && !isSuspensionBaseInfo) {
      this.state.isSuspensionBaseInfo = true;
      this.setState({
        isSuspensionBaseInfo: true,
      });
    } else if (scrollTop < this.goodsDetailTop && isSuspensionBaseInfo) {
      this.state.isSuspensionBaseInfo = false;
      this.setState({
        isSuspensionBaseInfo: false,
      });
    }
  }

  onShareAppMessage(event) {
    let { storeMedicineId } = this.state;
    let { medicine_info } = this.state;
    let { medicine_images } = this.state;
    return {
      title: safe(medicine_info.medicine_namecn),
      path:
        "/page/pages/YFWGoodsDetailModule/YFWGoodsDetailPage/YFWGoodsDetail?params=" +
        JSON.stringify({ value: storeMedicineId }),
      imageUrl: safe(medicine_images[0]),
    };
  }

  // 请求数据
  /** 获取商品详情 */
  fetchGoodsDetail() {
    const { storeMedicineId } = this.state;
    if (storeMedicineId === 0) {
      return;
    }

    this.setState({ isLoading: true });
    goodsDetailApi.getGoodsDetailInfo(storeMedicineId).then(
      (response) => {
        if (isNotEmpty(response)) {
          if (isNotEmpty(response.note)) {
            this.setState({
              activityItem: response.note,
            });
          }
          if (response.medicineid) {
            this.setState({ isLoading: false });
            // 商品不存在、返回一个比价页的id
            Taro.showModal({
              content: "商品已下架!",
              cancelColor: "#1fdb9b",
              cancelText: "返回",
              confirmColor: "#1fdb9b",
              confirmText: "去比价页",
              success(res) {
                if (res.confirm) {
                  // 前往比价页
                  pushNavigation(
                    "get_goods_detail",
                    { value: response.medicineid },
                    "redirect"
                  );
                } else {
                  Taro.navigateBack();
                }
              },
            });
          } else {
            let appSystemConfig = getGlobalData("appSystemConfig");
            this.setState({ isLoading: false, showWhiteBack: false });
            let _ver = config.app_version;

            getAppSystemConfig().then(
              (info) => {
                this.setState({
                  wx_rx_is_buy: parseInt(info.wx_rx_is_buy) != 0,
                  verFlag: _ver == info.alipayminiapp_audit_version ? 1 : 2,
                });
                let _this = this;
                setTimeout(() => {
                  const query = Taro.createSelectorQuery();
                  query.select("#bottomOperate").boundingClientRect();
                  query.exec((rect) => {
                    _this.setState({
                      activityHieght: rect && rect[0] ? rect[0].height : 0,
                    });
                  });
                }, 50);
              },
              (error) => {}
            );
            this.dealGoodsImagesInfo(response);
            this.dealGoodsInfo(response);
            this.dealGoodsLogisticsInfo(response);
            this.dealGoodsCouponAndDiscountInfo(response);
            this.dealGoodsComboInfo(response);
            this.dealGoodsQuestionAndCommentInfo(response);
            this.dealGoodsBaseInfo(response);
            this.dealGoodsExplainInfo(response);

            this.fetchStoreDetail(response);
            this.fetchStoreRecommendMedicne(response);
            this.fetchStoreQualification(response);
            this.fetchVacation();
          }
        } else {
          this.setState({ isLoading: false });
          Taro.showModal({
            content: "商品不存在!",
            showCancel: false,
            confirmColor: "#1fdb9b",
            success(res) {
              Taro.navigateBack();
            },
          });
        }
      },
      (error) => {
        this.setState({ isLoading: false });
      }
    );
  }

  currentDate = () => {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let myDate = date.getDate();
    let timestamp = year + "年" + month + "月" + myDate + "日";
    return timestamp;
  };

  /** 获取药店详情数据 */
  fetchStoreDetail(res) {
    const storeId = res.storeid;

    storeDetailApi.getShopInfo(storeId).then(
      (response) => {
        this.setState({ isLoading: false });
        if (isNotEmpty(response)) {
          let score = response.total_star.toFixed(1);
          let scores = score.toString().split(".");
          let a = parseInt(scores[0]) + (parseInt(scores[1]) == 0 ? 0 : 1);

          let { medicine_store } = this.state;
          const { store_score_images } = medicine_store;
          medicine_store.store_name = response.title;
          medicine_store.store_id = response.shop_id;
          medicine_store.store_logo = response.logo_image;
          medicine_store.store_score = score;
          medicine_store.store_score_images = store_score_images.slice(0, a);
          medicine_store.store_contracted =
            response.dict_store_status == 4 ? true : false;

          this.setState({
            medicine_store: medicine_store,
          });
          let currentTime = this.currentDate();
          let recentDataInfo = {
            shop_goods_id: this.state.medicine_info.store_medicine_id,
            time_stamp: currentTime,
            shop_name: response.title,
            medicine_price: toDecimal(res.price),
            img_url: res.medicine_info.image_list[0],
            authCode: res.medicine_info.authorized_code,
            standard: res.medicine_info.standard,
            name_cn: res.medicine_info.namecn,
          };
          try {
            let value = Taro.getStorageSync("recentBrowse");
            if (value) {
              if (value && typeof value == "object") {
                let currentData = value[currentTime];
                if (typeof currentData == "object") {
                  currentData[
                    this.state.medicine_info.store_medicine_id
                  ] = recentDataInfo;
                } else {
                  value[currentTime] = {
                    [this.state.medicine_info
                      .store_medicine_id]: recentDataInfo,
                  };
                }
                Taro.setStorageSync("recentBrowse", value);
              } else {
                Taro.setStorageSync("recentBrowse", {
                  [currentTime]: {
                    [this.state.medicine_info
                      .store_medicine_id]: recentDataInfo,
                  },
                });
              }
            } else {
              Taro.setStorageSync("recentBrowse", {
                [currentTime]: {
                  [this.state.medicine_info.store_medicine_id]: recentDataInfo,
                },
              });
            }
          } catch (e) {}
        }
      },
      (error) => {
        this.setState({ isLoading: false });
      }
    );
  }

  /** 获取药店推荐药品 */
  fetchStoreRecommendMedicne(res) {
    const storeId = res.storeid;

    storeDetailApi.getShopRecommendGoods(storeId).then(
      (response) => {
        let { medicine_store } = this.state;
        this.setState({ isLoading: false });
        if (isNotEmpty(response)) {
          let recommend = [];
          for (let index = 0; index < response.length; index++) {
            let medicine = response[index];
            medicine.intro_image = tcpImage(medicine.intro_image);
            medicine.price = toDecimal(medicine.price);
            recommend.push(medicine);
          }

          medicine_store.store_recommend_medicine = recommend;
        }

        this.setState({
          medicine_store: medicine_store,
        });
      },
      (error) => {
        this.setState({ isLoading: false });
      }
    );
  }

  /** 获取商家资质、实景图片、平台资质图片 */
  fetchStoreQualification(res) {
    const storeId = res.storeid;
    const storeParams = { name: "storeQualification", shopID: storeId };
    const paltParams = { name: "paltformQualification" };

    goodsDetailApi
      .getShopAndPlatformQualification(storeParams, paltParams)
      .then(
        (response) => {
          this.setState({ isLoading: false });
          if (isNotEmpty(response)) {
            let { medicine_detail } = this.state;
            let { medicine_store } = this.state;
            let serviceProtection = medicine_detail[2];

            // 平台资质
            const paltformQualification = response.paltformQualification;
            let qualification = serviceProtection.promise.qualification;
            qualification.icon = paltformQualification.imageurl;
            qualification.link = paltformQualification.link;
            qualification.type = paltformQualification.type;

            // 商家资质、实景
            const storeQualification = response.storeQualification;
            let zz_items = isNotEmpty(storeQualification.zz_items)
              ? storeQualification.zz_items
              : [];
            let sj_items = isNotEmpty(storeQualification.sj_items)
              ? storeQualification.sj_items
              : [];

            serviceProtection.promise.qualification = qualification;
            serviceProtection.store_qualification.items = zz_items;
            serviceProtection.store_images.items = sj_items;
            medicine_detail[2] = serviceProtection;
            medicine_store.store_images = sj_items;
            medicine_store.store_aptitude = zz_items;
            medicine_store.store_modal.image_list = zz_items;
            medicine_store.store_modal.isShowRight = zz_items.length > 1;

            this.setState({
              medicine_detail: medicine_detail,
              medicine_store: medicine_store,
            });
          }
        },
        (error) => {
          this.setState({ isLoading: false });
        }
      );
  }

  /** 获取购物车数量 */
  fetchShopCartNum() {
    shopCarApi.getShopCarCount().then(
      (response) => {
        this.setState({ isLoading: false });
        if (isNotEmpty(response)) {
          let count = response.cartCount ? response.cartCount : 0;
          Taro.setStorageSync("shopCarCount", count);
          count = count > 99 ? "99+" : count;
          this.setState({
            shop_cart_count: count,
          });
        }
      },
      (error) => {
        this.setState({ isLoading: false });
      }
    );
  }

  /** 获取节假日信息 */
  fetchVacation() {
    goodsDetailApi.getVacationInfo().then(
      (response) => {
        if (isNotEmpty(response)) {
          let { medicine_info } = this.state;
          medicine_info.medicine_vacation = safe(response);
          this.setState({
            medicine_info: medicine_info,
          });
        }
        this.setState({ isLoading: false });
      },
      (error) => {
        this.setState({ isLoading: false });
      }
    );
  }

  // 解析数据
  /** 解析从比价页传递过来的商品数据 */
  dealParams(params) {
    if (params.type === "sellers") {
      const medicine = params.data;
      Taro.setNavigationBarTitle({
        title: medicine.namecn,
      });

      this.setState({
        showWhiteBack: false,
      });

      let { medicine_info } = this.state;
      let { medicine_images } = this.state;
      let { medicine_image_index } = this.state;
      let { medicine_services } = this.state;
      let { medicine_logistics } = this.state;
      let { medicine_inventory } = this.state;
      let { medicine_store } = this.state;
      let { medicine_detail } = this.state;

      // 图片
      let medicineImages = [];
      for (let index = 0; index < medicine.image_list.length; index++) {
        let imgae_url = medicine.image_list[index];
        imgae_url = convertImg(imgae_url);
        medicineImages.push(imgae_url);
      }

      // 服务
      let service = ["品质保障", "提供发票", "退货款规则"];
      if (medicine.scheduled_name) {
        service.unshift(medicine.scheduled_name);
      }

      // 功能主治
      let medicine_indications = medicine.applicability;
      if (medicine_indications.indexOf("<p>") != -1) {
        medicine_indications = medicine_indications.replace("<p>", "");
        medicine_indications = medicine_indications.replace("</p>", "");
      }

      // 药品类型icon
      let medicien_icon = "";
      let medicien_typedesc = "";
      let medicien_type_status = false;
      if (medicine.dict_medicine_type == 0) {
        // OTC
        medicien_type_status = true;
        medicien_icon = "/images/ic_OTC.png";
      } else if (
        medicine.dict_medicine_type == 1 ||
        medicine.dict_medicine_type == 3
      ) {
        // 单轨
        medicien_type_status = true;
        medicien_icon = "/images/ic_drug_track_label.png";
        medicien_typedesc = "处方药指凭医师处方购买和使用的药品";
      } else if (medicine.dict_medicine_type == 2) {
        // 双轨
        medicien_type_status = true;
        medicien_icon = "/images/ic_drug_track_label.png";
        medicien_typedesc = "处方药指凭医师处方或在药师指导下购买和使用的药品";
      }

      // 基本信息
      let baseInfo = medicine_detail[0];
      baseInfo.medicine_image_list = medicineImages;

      let subtitles = [
        medicine.namecn,
        medicine.aliascn,
        medicine.authorized_code,
        medicine.standard,
        medicine.troche_type,
        medicine.nameen,
        medicine.py_namecn,
        medicine.period,
        medicine.manufacturer,
      ];
      for (let index = 0; index < subtitles.length; index++) {
        let model = baseInfo.items[index];
        let subtitle = subtitles[index];
        if (model.title === "批准文号") {
          model.title = coverAuthorizedTitle(subtitle);
        }
        model.subtitle = subtitle;
      }

      (medicine_images = medicineImages),
        (medicine_image_index = 1),
        (medicine_services = service),
        (medicine_info.medicine_id = medicine.id),
        (medicine_info.price = toDecimal(medicine.price)),
        (medicine_info.discount = safe(medicine.discount)),
        (medicine_info.medicine_type = medicine.dict_medicine_type),
        (medicine_info.medicine_type_status = medicien_type_status),
        (medicine_info.medicine_typedesc = medicien_typedesc),
        (medicine_info.medicine_icon = medicien_icon),
        (medicine_info.medicine_name =
          safe(medicine.aliascn) + " " + safe(medicine.namecn)),
        (medicine_info.medicine_indications = safe(medicine_indications)),
        (medicine_info.medicine_authorizetion = safe(medicine.authorized_code)),
        (medicine_info.medicine_authorizetionTitle = coverAuthorizedTitle(
          medicine.authorized_code
        )),
        (medicine_info.medicine_standard = safe(medicine.standard)),
        (medicine_info.medicine_dosage_form = safe(medicine.troche_type)),
        (medicine_info.medicine_manufacturer = safe(medicine.title)),
        (medicine_info.medicine_namecn = safe(medicine.namecn)),
        (medicine_info.medicine_nameen = safe(medicine.nameen)),
        (medicine_info.medicine_py_namecn = safe(medicine.py_namecn)),
        (medicine_info.medicine_period = safe(medicine.period)),
        (medicine_info.medicine_period_to = safe(medicine.period_to)),
        (medicine_info.medicine_aliascn = safe(medicine.aliascn)),
        (medicine_info.medicine_promptinfo = safe(medicine.buy_prompt_info)),
        (medicine_info.medicine_bentrusted_name = safe(
          medicine.bentrusted_store_name
        )),
        (medicine_info.medicine_typeurl = safe(medicine.rx_giude_url)),
        (medicine_logistics.logisyics_amount = safe(medicine.shipping_price)),
        (medicine_logistics.start_city = safe(medicine.region)),
        (medicine_logistics.end_city = safe(getGlobalData("city"))),
        (medicine_inventory.inventory = safe(medicine.reserve)),
        (medicine_store.store_name = safe(medicine.title)),
        (medicine_store.store_id = safe(medicine.shop_id)),
        (medicine_detail[0] = baseInfo);
      this.setState({
        medicine_images: medicineImages,
        medicine_image_index: medicine_image_index,
        medicine_services: medicine_services,
        medicine_info: medicine_info,
        medicine_inventory: medicine_inventory,
        medicine_store: medicine_store,
        medicine_detail: medicine_detail,
      });
    }
  }

  /** 解析商品图片 */
  dealGoodsImagesInfo(response) {
    // 药品信息
    const medicine = response.medicine_info;

    // 商品图片处理
    let medicine_images = [];
    for (let index = 0; index < medicine.image_list.length; index++) {
      let imgae_url = medicine.image_list[index];
      imgae_url = convertImg(imgae_url);
      medicine_images.push(imgae_url);
    }

    // 24小时发货、品质保障、提供发票
    let service = ["品质保障", "提供发票", "退货款规则"];
    if (response.scheduled_days) {
      service.unshift(response.scheduled_days);
    }

    this.setState({
      medicine_images: medicine_images,
      medicine_services: service,
    });
  }

  /** 解析商品信息 */
  dealGoodsInfo(response) {
    // 药品信息
    const medicine = response.medicine_info;
    Taro.setNavigationBarTitle({ title: safe(medicine.namecn) });

    // 功能主治
    const medicine_indications = medicine.applicability
      .replace(/<[^>]+>/g, "")
      .replace(/(↵|\r|\n)/g, "")
      .trim();

    // 药品类型icon
    let medicien_icon = "";
    let medicien_typedesc = "";
    let medicien_type_status = false;
    const medicine_type = Number.parseInt(medicine.dict_medicine_type);
    if (medicine_type === 0) {
      // OTC
      medicien_type_status = true;
      medicien_icon = "/images/ic_OTC.png";
    } else if (medicine_type === 1 || medicine_type == 3) {
      // 单轨
      medicien_type_status = true;
      medicien_icon = "/images/ic_drug_track_label.png";
      medicien_typedesc = "处方药指凭医师处方购买和使用的药品";
    } else if (medicine_type === 2) {
      // 双轨
      medicien_type_status = true;
      medicien_icon = "/images/ic_drug_track_label.png";
      medicien_typedesc = "处方药指凭医师处方或在药师指导下购买和使用的药品";
    }
    // 底部按钮状态
    let medicine_status = 0;
    if (response.button_show) {
      medicine_status = 1;
    } else {
      medicine_status = 2;
    }

    let { medicine_info } = this.state;
    let { medicine_selectInfo } = this.state;
    medicine_info.medicine_id = medicine.id;
    medicine_info.store_medicine_id = response.store_medicine_id;
    medicine_info.price = toDecimal(response.price);
    medicine_info.real_price = toDecimal(response.real_price);
    medicine_info.discount = safe(response.price_desc);
    medicine_info.medicine_type = medicine_type;
    medicine_info.medicine_type_status = medicien_type_status;
    medicine_info.medicine_typedesc = medicien_typedesc;
    medicine_info.medicine_icon = medicien_icon;
    medicine_info.medicine_name =
      safe(medicine.aliascn) + " " + safe(medicine.namecn);
    medicine_info.medicine_image = convertImg(safeObj(medicine.image_list)[0]);
    medicine_info.medicine_indications = safe(medicine_indications);
    medicine_info.medicine_authorizetion = safe(medicine.authorized_code);
    medicine_info.medicine_authorizetionTitle = coverAuthorizedTitle(
      medicine.authorized_code
    );
    medicine_info.medicine_standard = safe(medicine.standard);
    medicine_info.medicine_dosage_form = safe(medicine.troche_type);
    medicine_info.medicine_manufacturer = safe(medicine.title);
    medicine_info.medicine_namecn = safe(medicine.namecn);
    medicine_info.medicine_nameen = safe(medicine.nameen);
    medicine_info.medicine_py_namecn = safe(medicine.py_namecn);
    medicine_info.medicine_period = safe(medicine.period);
    medicine_info.medicine_period_to = safe(response.period_to);
    medicine_info.medicine_aliascn = safe(medicine.aliascn);
    medicine_info.medicine_notice = safe(medicine.medication_prompt);
    medicine_info.medicine_waring = safe(medicine.warning_tip);
    medicine_info.medicine_promptinfo = safe(response.buy_prompt_info);
    medicine_info.medicine_bentrusted_name = safe(
      medicine.bentrusted_store_name
    );
    medicine_info.medicine_guide = medicine.guide || {};
    medicine_info.medicine_typeurl = safe(medicine.rx_giude_url);
    medicine_info.medicine_guide_show = Number.parseInt(
      safe(medicine.dict_bool_lock)
    );
    medicine_selectInfo.modalName = "已选择：" + safe(medicine.standard);
    this.setState({
      prohibit_sales_btn_text: response.prohibit_sales_btn_text || "暂不销售",
      medicine_info: medicine_info,
      medicine_selectInfo: medicine_selectInfo,
      medicine_status: medicine_status,
      isCollection: response.is_favorite,
    });
  }

  /** 解析运费、库存信息 */
  dealGoodsLogisticsInfo(response) {
    let { medicine_logistics } = this.state;
    let { medicine_inventory } = this.state;

    medicine_logistics.logisyics_amount = response.shipping_price;
    medicine_logistics.start_city = response.store_address;
    medicine_logistics.end_city = getGlobalData("city"); // 获取定位后才能知晓
    medicine_inventory.inventory = response.reserve;
    medicine_inventory.limitation = response.max_buyqty;

    this.setState({
      medicine_logistics: medicine_logistics,
      medicine_inventory: medicine_inventory,
    });
  }

  /** 解析优惠券、促销活动信息 */
  dealGoodsCouponAndDiscountInfo(response) {
    // 优惠券
    let coupons_list = this.couponModelWithArray(response.coupons_list);

    // 满减
    let discount_list = this.discountModelWithArray(response.activity_list);
    let discountStr = this.freepostageModelWithStr(discount_list);
    //包邮
    let freepostage_list = this.freepostageModelWithArray(
      response.freepostage_list
    );

    let freepostageStr = this.freepostageModelWithStr(freepostage_list);

    this.setState({
      medicine_coupons: coupons_list,
      medicine_discount: discount_list,
      medicine_discountStr: discountStr,
      medicine_freepostage_list: freepostage_list,
      medicine_freepostageStr: freepostageStr,
      medicine_show_discount: discount_list.slice(0, 3),
    });
  }

  freepostageModelWithStr(freepostage) {
    let freepostageStr = "";
    let freepostage_list = [];
    if (isNotEmpty(freepostage)) {
      for (let index = 0; index < freepostage.length; index++) {
        let activeModel = freepostage[index];
        let discountModel = activeModel.title;
        freepostage_list.push(discountModel);
      }
    }
    freepostageStr = freepostage_list.join("，");
    return freepostageStr;
  }
  /**
   * 优惠券模型处理
   */
  couponModelWithArray(coupon_list) {
    let coupons = [];

    if (isNotEmpty(coupon_list)) {
      for (let index = 0; index < coupon_list.length; index++) {
        let model = coupon_list[index];
        (model.name =
          parseFloat(model.use_condition_price) > 0
            ? "满" + model.use_condition_price + "减" + model.price + "元"
            : model.price + "元"),
          coupons.push(model);
      }

      return coupons;
    }
  }
  /**
   * 满减、包邮模型处理
   * activeArray 满减活动
   * postageArray 包邮活动
   */
  discountModelWithArray(activeArray) {
    let discount_list = [];
    // 满减
    if (isNotEmpty(activeArray)) {
      for (let index = 0; index < activeArray.length; index++) {
        let activeModel = activeArray[index];
        let title =
          "满" +
          activeModel.condition_price +
          "元减" +
          activeModel.sub_price +
          "元";
        let name =
          "满" + activeModel.condition_price + "减" + activeModel.sub_price;
        let discountModel = {
          type: 0,
          title: title,
          name: name,
          reduce_price: activeModel.reduce_price,
          condition_price: activeModel.condition_price,
          sub_price: activeModel.sub_price,
        };
        discount_list.push(discountModel);
      }
    }

    return discount_list;
  }
  /** 解析单品、套餐、疗程装信息 */
  dealGoodsComboInfo(response) {
    // 单品
    let single_list = [];
    if (isNotEmpty(response.other_standard_list)) {
      single_list = response.other_standard_list;
    }

    // 套装
    let combo_list = [];
    let treatment_list = [];
    let name = "选择单品";
    if (isNotEmpty(response.package_list)) {
      for (let index = 0; index < response.package_list.length; index++) {
        let model = response.package_list[index];
        model.price = toDecimal(model.price);
        model.original_price = toDecimal(model.original_price);

        if (model.package_type == 0) {
          for (let idx = 0; idx < model.medicine_list.length; idx++) {
            let medicine = model.medicine_list[idx];
            medicine.image_url = tcpImage(medicine.image_url);
            medicine.price = toDecimal(medicine.price);
          }

          combo_list.push(model);
        } else {
          treatment_list.push(model);
        }
      }

      if (combo_list.length > 0 && treatment_list.length > 0) {
        name = "选择单品、套餐、疗程装";
      } else if (combo_list.length > 0) {
        name = "选择单品、套餐";
      } else if (treatment_list.length > 0) {
        name = "选择单品、疗程装";
      }
    }

    let { medicine_style } = this.state;
    let { medicine_selectInfo } = this.state;
    medicine_style.medicine_single = single_list;
    medicine_style.medicine_packages = combo_list.concat(treatment_list);
    medicine_style.medicine_combo = combo_list;
    medicine_style.medicine_treatment = treatment_list;
    medicine_selectInfo.name = name;

    this.setState({
      medicine_style: medicine_style,
      medicine_selectInfo: medicine_selectInfo,
    });
  }

  /** 解析问题和评论信息 */
  dealGoodsQuestionAndCommentInfo(response) {
    let { medicine_question } = this.state;
    let { medicine_comment } = this.state;

    medicine_question = response.question_ask_count;
    medicine_comment.count = response.evaluation_count;
    medicine_comment.comment_list = isNotEmpty(
      safeObj(response.evaluation_list)
    )
      ? safeObj(response.evaluation_list)
      : [];

    this.setState({
      medicine_question: medicine_question,
      medicine_comment: medicine_comment,
    });
  }

  /** 解析基本信息 */
  dealGoodsBaseInfo(response) {
    let { medicine_detail } = this.state;
    let baseInfo = medicine_detail[0];
    const { medicine_info } = this.state;
    const { medicine_images } = this.state;

    baseInfo.notice = safe(response.package_prompt_info);
    baseInfo.medicine_image_list = medicine_images;
    medicine_detail[0] = baseInfo;

    const subtitles = [
      medicine_info.medicine_namecn,
      medicine_info.medicine_aliascn,
      medicine_info.medicine_authorizetion,
      medicine_info.medicine_standard,
      medicine_info.medicine_dosage_form,
      medicine_info.medicine_nameen,
      medicine_info.medicine_py_namecn,
      medicine_info.medicine_period,
      medicine_info.medicine_manufacturer,
    ];
    for (let index = 0; index < subtitles.length; index++) {
      let model = baseInfo.items[index];
      let subtitle = subtitles[index];
      if (model.title == "批准文号") {
        model.title = coverAuthorizedTitle(subtitle);
      }
      model.subtitle = subtitle;
    }

    this.setState({
      medicine_detail: medicine_detail,
      limit_buy_prompt: response.limit_buy_prompt,
    });
  }

  /** 解析说明书信息 */
  dealGoodsExplainInfo(response) {
    const { medicine_info } = this.state;

    if (medicine_info.medicine_guide_show === 1) {
      let { medicine_detail } = this.state;
      const explain = response.medicine_info.guide;
      let explainInfo = medicine_detail[1];
      const explainKeys = Object.keys(explain);
      let explainItems = [];

      for (let index = 0; index < explainKeys.length; index++) {
        const explainTitle = explainKeys[index];
        const explainItem = {
          title: "【" + explainTitle + "】",
          subtitle: explain[explainTitle],
        };
        explainItems.push(explainItem);
      }

      explainInfo.isShow = 1;
      explainInfo.items = explainItems;
      medicine_detail[1] = explainInfo;

      this.setState({
        medicine_detail: medicine_detail,
      });
    }
  }
  freepostageModelWithArray(freepostageArray) {
    let freepostag = [];

    if (isNotEmpty(freepostageArray)) {
      for (let index = 0; index < freepostageArray.length; index++) {
        let activeModel = freepostageArray[index];
        let discountModel = {
          type: 1,
          title: activeModel.title + activeModel.not_region_name,
          name: "满" + activeModel.condition_price + "元包邮",
          not_region_name: activeModel.not_region_name,
        };
        freepostag.push(discountModel);
      }
    }
    return freepostag;
  }
  changeParamFlag() {
    this.setState({
      paramFlag: !this.state.paramFlag,
    });
  }
  hideReturnModal() {
    if (this.state.rulerFlag) {
      let that = this;
      let translateAni = Taro.createAnimation({
        duration: 300,
        timingFunction: "linear",
      });
      translateAni.translateY(600).step();

      let opacityAni = Taro.createAnimation({
        duration: 300,
        timingFunction: "linear",
      });
      opacityAni.opacity(0).step();

      that.setState({
        translateAnimation: translateAni.export(),
        opacityAnimation: opacityAni.export(),
      });

      setTimeout(
        function () {
          opacityAni.opacity(0).step();
          translateAni.translateY(0).step();
          that.setState({
            translateAnimation: translateAni.export(),
            opacityAnimation: opacityAni.export(),
            rulerFlag: false,
          });
        }.bind(this),
        300
      );
    }
  }
  // 渲染
  /** 渲染 */
  render() {
    const {
      isLoading,
      showWhiteBack,
      rulerFlag,
      verFlag,
      activityItem,
      activityHieght,
      isOpenPackage,
      wrapperHeight,
    } = this.state;
    let _w = null;
    if (verFlag != 0 && activityItem.content && activityHieght) {
      _w = 180 * this.ratio;
    } else {
      _w = 100 * this.ratio;
    }
    return (
      <ScrollView
        scrollY
        style={"height:" + wrapperHeight + "px;padding-bottom:" + _w}
        classNmae="back-white"
        onScroll={this.scrollfn}
        id="scroll"
      >
        {this.renderMedicineImages()}
        {this.renderService()}
        {this.renderMedicineInfo()}
        {this.renderLogistics()}
        {this.renderGoodsParams()}
        {/* {this.renderCouponAndDiscount()} */}
        {this.renderPackage()}
        {this.renderStore()}
        {this.renderQuestionAndComments()}
        {this.renderStickHeader()}
        {this.renderGoodsDetailInfo()}
        {this.renderHeaderAction()}
        {verFlag != 0 &&
          activityItem.content &&
          activityHieght &&
          this.renderActivity()}
        {verFlag != 0 && this.renderBottomAction()}
        {this.renderModals()}
        {isLoading && this.renderLoading()}
        {showWhiteBack && this.renderWhiteBack()}
        {rulerFlag && this.renderRuler()}
        <View style="position:absolute;top:300px;color:red;font-size:28px" onClick={this.aaaaaaa.bind(this,300)}>111111111111</View>
        <View style="position:absolute;top:350px;color:red;font-size:28px" onClick={this.aaaaaaa.bind(this,0)}>222222222222222</View>
        <View style="position:absolute;top:380px;color:red;font-size:28px" onClick={this.aaaaaaa.bind(this,600)}>11111133111111</View>
      </ScrollView>
    );
  }
  aaaaaaa(e){
    console.log('dasdasdasda',e)
    Taro.pageScrollTo({
      scrollTop:parseInt(e),
      duration:300
    })
  }
  /*活动跳转*/
  activityRedirect() {
    pushNavigation("get_h5", { value: this.state.activityItem.url });
  }
  renderActivity() {
    const {
      img_height,
      img_width,
      img_url,
      url,
      content,
    } = this.state.activityItem;
    const { activityHieght } = this.state;
    const img_height_new = img_height ? img_height / 2 : 12;
    const img_width_new = img_width ? img_width / 2 : 12;
    return (
      <View className="activeity" style={"bottom:" + activityHieght}>
        <View style="flex-shrink:0;">
          <Image
            src={img_url}
            style={
              "height:" + img_height_new + "px;width:" + img_width_new + "px"
            }
          ></Image>
        </View>
        <View className="activity_content">{content}</View>
        {url && (
          <Image
            src={require("../../../../images/icon_arrow_y.png")}
            className="activity_arrow"
            onClick={this.activityRedirect}
          ></Image>
        )}
      </View>
    );
  }
  renderWhiteBack() {
    return <View className="goods-detail-whiteBack"></View>;
  }
  /*  退款货款规则弹框  */
  renderRuler() {
    const {
      medicine_services,
      opacityAnimation,
      translateAnimation,
    } = this.state;
    return (
      <View className="modal">
        <View
          className="modal-back"
          onClick={this.hideReturnModal}
          animation={opacityAnimation}
        ></View>
        <View className="modal-content" animation={translateAnimation}>
          <View className="modal-return-head">
            <View className="modal-view"></View>
            <View className="modal-title">服务说明</View>
            <View onClick={this.hideReturnModal} className="modal-view">
              <Image
                className="modal-close"
                src={require("../../../../images/search_del.png")}
              ></Image>
            </View>
          </View>
          <ScrollView className="modal-center-view" scrollY>
            {medicine_services.map((item, index) => {
              return (
                <Block key="index">
                  <View className="modal-return-view">
                    <Image
                      mode="widthFix"
                      src={require("../../../../images/YFWGoodsDetailModule/goods_deail_service.png")}
                    ></Image>
                    <Text>{item}</Text>
                  </View>
                </Block>
              );
            })}
            <View className="modal-return-warn">
              依据《药品经营质量管理规范》第三章第八节相关规定：药品一经售出、无质量问题、不退不换
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  /** 渲染loading */
  renderLoading() {
    return (
      <View className="goods-detail-loading flex-row flex-content-center flex-align-center">
        <Image
          className="goods-detail-loading-icon"
          src={require("../../../../images/loading_cycle.gif")}
          mode="widthFix"
        />
      </View>
    );
  }
  //展示退货规则
  showRuler(type) {
    if (type == "退货款规则") {
      if (!this.state.rulerFlag) {
        let that = this;
        let opacityAni = Taro.createAnimation({
          duration: 300,
          timingFunction: "linear",
        });
        opacityAni.opacity(0).step();

        let translateAni = Taro.createAnimation({
          duration: 300,
          timingFunction: "linear",
        });
        translateAni.translateY(600).step();

        that.setState({
          rulerFlag: true,
          opacityAnimation: opacityAni.export(),
          translateAnimation: translateAni.export(),
        });

        setTimeout(
          function () {
            opacityAni.opacity(1).step();
            translateAni.translateY(0).step();
            that.setState({
              opacityAnimation: opacityAni.export(),
              translateAnimation: translateAni.export(),
            });
          }.bind(this),
          0
        );
      }
    }
  }
  /** 渲染顶部商品图片 */
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
          {medicine_images.map((image_url, imageIndex) => {
            return (
              <SwiperItem key={imageIndex.toString()}>
                <Image
                  src={image_url}
                  className="detail-image"
                  mode="aspectFit"
                  onClick={this.onLookBigPictureClick.bind(
                    this,
                    1,
                    imageIndex,
                    medicine_images
                  )}
                />
              </SwiperItem>
            );
          })}
        </Swiper>
        <View
          className="detail-images-indexcer flex-row flex-content-center flex-align-center text-13 text-white text-bold"
          hidden={medicine_images.length === 0}
        >
          {medicine_image_index.toString() +
            "/" +
            medicine_images.length.toString()}
        </View>
      </View>
    );
  }

  /** 渲染24小时发货、品质保障 */
  renderService() {
    const { medicine_services } = this.state;

    return (
      <View className="detail-services flex-row flex-wrap" style={"width:100%"}>
        {medicine_services.map((service) => {
          return (
            <View
              className="flex-row flex-content-center flex-align-center"
              onClick={this.showRuler.bind(this, service)}
            >
              <Image
                className="services-item-icon"
                src={require("../../../../images/YFWGoodsDetailModule/goods_deail_service.png")}
              />
              <Text
                className="services-item-title text-12 text-black"
                style={service == "退货款规则" ? "margin-right:4px" : ""}
              >
                {service}
              </Text>
              {service == "退货款规则" && (
                <Image
                  class="services-item-icon"
                  src={require("../../../../images/icon_arrow_more.png")}
                  style={"height:12px;width:8px"}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  }
  /**
   * 优惠券弹窗
   */
  showCouponModal() {
    this.setState({
      isOpenCoupon: true,
    });
  }
  /** 渲染药品价格、名称、功能主治等 */
  renderMedicineInfo() {
    const {
      medicine_info,
      medicine_coupons,
      medicine_freepostage_list,
      medicine_show_discount,
      medicine_discount,
    } = this.state;

    return (
      <View>
        <View
          className="detail-price-name flex-column"
          style={"position:relative"}
        >
          <View className="detail-price flex-row flex-content-between flex-align-center">
            <YFWPriceView
              price={medicine_info.price}
              fontSize={38}
              discount={medicine_info.discount}
            />
            <Image
              className="detail-share-icon"
              src={require("../../../../images/YFWGoodsDetailModule/goods_deail_share.png")}
              mode="widthFix"
            />
            <Button className="detail-share-button" openType="share"></Button>
          </View>
          {(medicine_coupons.length > 0 ||
            medicine_discount.length > 0 ||
            medicine_freepostage_list.length > 0) && (
            <View className="detail-column-view">
              {(medicine_coupons.length > 0 ||
                medicine_discount.length > 0 ||
                medicine_freepostage_list.length > 0) && (
                <View
                  className="detail-coupon-content-view"
                  onClick={this.showCouponModal}
                >
                  <View className="detail-coupon-itemview">
                    {medicine_coupons.length > 0 && (
                      <View className="detail-discount-coupon">
                        <Text style="font-size: 24rpx; color: #FF6363; text-align: center; margin-right: 2rpx;">
                          劵
                        </Text>
                        <View className="detail-coupon-title"></View>
                        <Text style="font-size: 24rpx; color: #FF6363; margin-left: 3rpx">
                          {medicine_coupons[0].name}
                        </Text>
                      </View>
                    )}
                    {medicine_show_discount.length > 0 && (
                      <View className="detail-discount-activity">
                        {medicine_show_discount[0].name}
                      </View>
                    )}
                    {medicine_freepostage_list.length > 0 && (
                      <View className="detail-discount-freepostage">
                        <Text>{medicine_freepostage_list[0].name}</Text>
                      </View>
                    )}
                  </View>
                  <View className="detail-check-view">
                    <Text style="font-size: 28rpx; color: #999;">
                      {medicine_coupons.length == 0 ? "包邮说明" : "领劵"}
                    </Text>
                    <Image
                      src={require("../../../../images/around_detail_icon.png")}
                      className="detail-detail-icon"
                    ></Image>
                  </View>
                </View>
              )}
            </View>
          )}
          <View className="detail-name flex-column">
            <MedicineNameView
              medicineType={medicine_info.medicine_type}
              name={safe(medicine_info.medicine_name)}
              fontWeight="bold"
            />
          </View>
          <View
            className="detail-indications text-size text-black text-ellipsis text-line-3 width-screen"
            style="text-overflow: initial;"
          >
            {medicine_info.medicine_indications}
          </View>
          {medicine_info.medicine_typedesc.length > 0 && (
            <View
              className="lookMedicineService"
              onClick={this.onMedicineNameClick}
            >
              <View className="detail-typedesc text-12 text-light">
                {medicine_info.medicine_typedesc}
              </View>
              <Image
                src={require("../../../../images/wenhao.png")}
                className="wenhao"
              ></Image>
            </View>
          )}
        </View>
        {this.renderLine()}
      </View>
    );
  }

  /** 渲染运费、库存 */
  renderLogistics() {
    const { medicine_logistics } = this.state;
    const { medicine_inventory } = this.state;
    const { medicine_info, limit_buy_prompt } = this.state;

    return (
      <View>
        <View className="detail-logistics-invetory">
          <View className="detail-logistics-invetory flex-row flex-align-center">
            <Text className="detail-normal-title">运费</Text>
            <Text className="text-black text-13 detail-margin-right-10">
              {medicine_logistics.logisyics_amount}
            </Text>
            <View className="detail-logistics-line"></View>
            <Text className="text-black text-13 detail-margin-right-10">
              {medicine_logistics.start_city}
            </Text>
            <Image
              className="detail-logistics-icon"
              src={require("../../../../images/YFWGoodsDetailModule/goods_deail_fly.png")}
            ></Image>
            <Text className="text-black text-13 detail-margin-right-10">
              {medicine_logistics.end_city}
            </Text>
          </View>
          <View className="detail-logistics">
            <Text className="detail-normal-title">库存</Text>
            <Text className="text-black text-13 detail-margin-right-10">
              {medicine_inventory.inventory}
            </Text>
            {medicine_inventory.limitation > 0 && (
              <Text className="text-orange text-13 detail-margin-right-10">
                {"(" + limit_buy_prompt + ")"}
              </Text>
            )}
            {medicine_info.medicine_period_to && (
              <Text className="text-black text-13 detail-margin-right-10">
                有效期至
              </Text>
            )}
            <Text className="text-black text-13 detail-margin-right-10">
              {medicine_info.medicine_period_to}
            </Text>
          </View>
        </View>
        {this.renderLine()}
      </View>
    );
  }

  /** 渲染药品参数 */
  renderGoodsParams() {
    const { medicine_info, paramFlag } = this.state;

    return (
      <View>
        <View
          className="detail-goods-parmas flex-row"
          style={"position:relative"}
        >
          <Text className="detail-normal-title detail-margin-top-5">参数</Text>
          <View className="detail-goods-parmas-view">
            <View className="detail-goods-parmas-item flex-row">
              <Text className="detail-medicine-params-title">
                {medicine_info.medicine_authorizetionTitle}
              </Text>
              <Text className="text-black text-13">
                {medicine_info.medicine_authorizetion}
              </Text>
            </View>
            <View className="detail-goods-parmas-item flex-row">
              <Text className="detail-medicine-params-title">规格</Text>
              <Text className="text-black text-13">
                {medicine_info.medicine_standard}
              </Text>
            </View>
            {paramFlag && (
              <View>
                <View className="detail-goods-parmas-item flex-row">
                  <Text className="detail-medicine-params-title">
                    剂型/型号
                  </Text>
                  <Text className="text-black text-13">
                    {medicine_info.medicine_dosage_form}
                  </Text>
                </View>
                <View className="detail-goods-parmas-item flex-row">
                  <Text className="detail-medicine-params-title">生产企业</Text>
                  <Text className="text-black text-13">
                    {medicine_info.medicine_manufacturer}
                  </Text>
                </View>
                {medicine_info.medicine_bentrusted_name.length > 0 && (
                  <View className="detail-goods-parmas-item flex-row">
                    <Text className="detail-medicine-params-title">
                      上市许可人
                    </Text>
                    <Text className="text-black text-13">
                      {medicine_info.medicine_bentrusted_name}
                    </Text>
                  </View>
                )}
                {medicine_info.medicine_period.length > 0 && (
                  <View className="detail-goods-parmas-item flex-row">
                    <Text className="detail-medicine-params-title">有效期</Text>
                    <Text className="text-black text-13">
                      {medicine_info.medicine_period}
                    </Text>
                  </View>
                )}
                {medicine_info.medicine_waring.length > 0 && (
                  <View className="goods-notice-view">
                    <Image
                      className="params-icon"
                      src={require("../../../../images/YFWGoodsDetailModule/goods_deail_vacation.png")}
                      mode="widthFix"
                    />
                    <Text className="text-light text-12 text-height-15">
                      {medicine_info.medicine_waring}
                    </Text>
                  </View>
                )}
                {medicine_info.medicine_vacation.length > 0 && (
                  <View className="goods-notice-view">
                    <Image
                      className="params-icon"
                      src={require("../../../../images/YFWGoodsDetailModule/goods_deail_vacation.png")}
                      mode="widthFix"
                    />
                    <Text className="text-light text-12 text-height-15">
                      {medicine_info.medicine_vacation}
                    </Text>
                  </View>
                )}
                {medicine_info.medicine_notice.length > 0 && (
                  <View className="goods-notice-view">
                    <Image
                      className="params-icon"
                      src={require("../../../../images/YFWGoodsDetailModule/goods_deail_notice.png")}
                      mode="widthFix"
                    />
                    <Text className="text-light text-12 text-height-15">
                      {medicine_info.medicine_notice}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <View onClick={this.changeParamFlag} className="openAndClose">
            <Text style="padding-right:10rpx">展开</Text>
            <Image
              src={require("../../../../images/down_arrow.png")}
              style="height:12rpx;width:24rpx;"
              className={paramFlag ? "trans" : ""}
            ></Image>
          </View>
        </View>
        {this.renderLine()}
      </View>
    );
  }

  /** 渲染优惠券、促销活动 */
  // renderCouponAndDiscount() {
  //   const { medicine_coupons } = this.state
  //   const { medicine_discount } = this.state
  //   const discount_list = medicine_discount.length > 3 ? medicine_discount.slice(0, 3) : medicine_discount
  //   const showCoupon = medicine_coupons.length > 0
  //   const showDiscount = medicine_discount.length > 0

  //   if (showCoupon || showDiscount) {
  //     return(
  //       <View>
  //         <View className='detail-coupon-discount'>
  //           {showCoupon && <View className='detail-coupon flex-row flex-content-between flex-align-center flex-1' onClick={this.onCouponClick.bind(this)}>
  //             <Text className='detail-normal-title'>领券</Text>
  //             <ScrollView className='detail-coupon-view flex-row flex-nowrap flex-align-center'>
  //               {medicine_coupons.map(coupon => {
  //                 return (
  //                   <View className='detail-coupon-item-view'>
  //                     <View className='detail-coupon-item flex-row flex-content-center flex-align-center text-12 text-red'>{coupon.name}</View>
  //                   </View>
  //                 )
  //               })}
  //             </ScrollView>
  //             <Image className='detail-arrow-icon' src={require('../../../../images/around_detail_icon.png')} />
  //           </View>}
  //           {showDiscount && <View className='detail-discount flex-row flex-1' onClick={this.onDiscountClick.bind(this)}>
  //             <Text className='detail-normal-title detail-margin-top-5'>促销</Text>
  //             <View className='flex-column flex-1'>
  //               {discount_list.map(discount => {
  //                 return(
  //                   <View className='detail-discount-view-item-view flex-row flex-1 flex-align-center'>
  //                     {discount.type === 0 && <Text className='detail-discount-type detail-discount-back-yellow'>满减</Text>}
  //                     {discount.type === 1 && <Text className='detail-discount-type detail-discount-back-blue'>包邮</Text>}
  //                     <Text className='text-black text-13 detail-discount-text text-ellipsis text-line-1'>{discount.title}</Text>
  //                   </View>
  //                 )
  //               })}
  //             </View>
  //             <Image className='detail-arrow-icon detail-margin-top-5' src={require('../../../../images/around_detail_icon.png')} />
  //           </View>}
  //         </View>
  //         {this.renderLine()}
  //       </View>
  //     )
  //   }
  // }

  /** 渲染单品、套餐、疗程装 */
  renderPackage() {
    const { medicine_style } = this.state;
    const { medicine_selectInfo, firstShowFlag } = this.state;

    return (
      <View onClick={this.onSingleAndPackageClick.bind(this)}>
        <View className="detail-package flex-row flex-content-between flex-align-center">
          <Text className="detail-normal-title">选择</Text>
          <View
            style="padding:2px"
            className="detail-package-title flex-row flex-1 text-13 text-black text-ellipsis text-line-1"
          >
            {firstShowFlag
              ? medicine_selectInfo.name
              : medicine_selectInfo.modalName}
          </View>
          <Image
            className="detail-arrow-icon"
            src={require("../../../../images/around_detail_icon.png")}
          />
        </View>
        {medicine_style.medicine_packages.length > 0 && (
          <View className="detail-package-view flex-row flex-wrap detail-margin-bottom-10">
            {medicine_style.medicine_packages.map(
              (packageItem, packageItemIndex) => {
                return (
                  <View
                    key={packageItemIndex.toString()}
                    className="detail-package-item flex-row flex-align-center text-12 text-normal"
                  >
                    {packageItem.name}
                  </View>
                );
              }
            )}
          </View>
        )}
        {this.renderLine()}
      </View>
    );
  }

  /** 渲染商店 */
  renderStore() {
    const { medicine_store } = this.state;

    return (
      <View>
        <View className="detail-store-view">
          <View className="flex-row">
            <Image
              src={medicine_store.store_logo}
              className="detail-store-logo"
              mode="aspectFit"
            />
            <View className="detail-store-name-view flex-column flex-1">
              <Text className="text-black text-15 text-bold detail-store-name text-ellipsis text-line-1">
                {medicine_store.store_name}
              </Text>
              <View>
                {medicine_store.store_score_images.map((score) => {
                  return <Image className="detail-store-score" src={score} />;
                })}
              </View>
            </View>
            <View
              className="detail-store-aptitude flex-row flex-align-center"
              onClick={this.onStoreAptitudeClick.bind(this)}
            >
              <Text className="text-13 text-orange">查看资质</Text>
              <Image
                className="detail-red-arrow"
                src={require("../../../../images/YFWGoodsDetailModule/goods_deail_arrow_yellow.png")}
              />
            </View>
          </View>
          <ScrollView
            className="detail-store-center-view flex-row flex-nowrap"
            scrollX
          >
            {medicine_store.store_recommend_medicine.map(
              (medicine, medicineIndex) => {
                return (
                  <View
                    className="detail-store-medicine-view"
                    key={medicineIndex.toString()}
                  >
                    <View
                      className="detail-store-medicine-item flex-column flex-content-between flex-align-center"
                      onClick={this.onStoreMedicineClick.bind(this, medicine)}
                    >
                      <Image
                        src={medicine.intro_image}
                        className="detail-store-medicine-image"
                      />
                      <Text className="detail-store-medicine-name text-ellipsis text-line-1 text-11 text-black">
                        {medicine.medicine_name}
                      </Text>
                      <YFWPriceView price={medicine.price} fontSize={22} />
                    </View>
                  </View>
                );
              }
            )}
          </ScrollView>
          <View className="flex-row flex-content-evenly flex-align-center">
            <View
              className="detail-store-button-back"
              onClick={this.onStoreAllMedicineClick.bind(this)}
            >
              <View className="detail-store-button flex-row flex-content-center flex-align-center back-white">
                <Image
                  className="detail-store-button-icon"
                  src={require("../../../../images/YFWGoodsDetailModule/goods_deail_all.png")}
                />
                <Text className="text-green text-15 text-bold">全部商品</Text>
              </View>
            </View>
            <View
              className="detail-store-button-back"
              onClick={this.onStoreClick.bind(this)}
            >
              <View className="detail-store-button flex-row flex-content-center flex-align-center">
                <Image
                  className="detail-store-button-icon"
                  src={require("../../../../images/YFWGoodsDetailModule/goods_deail_store.png")}
                />
                <Text className="text-white text-15 text-bold">进入店铺</Text>
              </View>
            </View>
          </View>
        </View>
        {this.renderLine()}
      </View>
    );
  }

  /** 渲染问题和评论 */
  renderQuestionAndComments() {
    const { medicine_question } = this.state;
    const { medicine_comment } = this.state;

    return (
      <View id="question-comment">
        <View
          className="detail-question-comment flex-row flex-content-between flex-align-center"
          onClick={this.onQuestionClick.bind(this)}
        >
          <View className="flex-row flex-align-center flex-1">
            <Text className="text-black text-15">
              {"常见问题(" + medicine_question.toString() + ")"}
            </Text>
          </View>
          <Text className="text-red text-13">查看全部</Text>
          <Image
            className="detail-red-arrow"
            src={require("../../../../images/YFWGoodsDetailModule/goods_deail_arrow_red.png")}
          />
        </View>
        <View className="detail-qc-line"></View>
        <View
          className="detail-question-comment flex-row flex-content-between flex-align-center"
          onClick={this.onCommentClick.bind(this)}
        >
          <View className="flex-row flex-align-center flex-1">
            <Text className="text-black text-15">
              {"顾客评论(" + medicine_comment.count + ")"}
            </Text>
          </View>
          <Text className="text-red text-13">查看全部</Text>
          <Image
            className="detail-red-arrow"
            src={require("../../../../images/YFWGoodsDetailModule/goods_deail_arrow_red.png")}
          />
        </View>
        <View>
          {medicine_comment.comment_list.map((comment) => {
            return (
              <View className="comment-item flex-column" taroKey={comment.id}>
                <View className="flex-row flex-align-center">
                  <Image className="comment-image" src={comment.intro_image} />
                  <Text className="text-11 text-normal flex-1 flex-column">
                    {comment.account_name}
                  </Text>
                  <Text className="text-10 text-light">
                    {comment.create_time}
                  </Text>
                </View>
                <Text className="comment-content text-13 text-black">
                  {comment.content}
                </Text>
              </View>
            );
          })}
        </View>
        {this.renderLine()}
      </View>
    );
  }

  /** 渲染基本信息、说明书、服务保障tab */
  renderStickHeader() {
    const { medicine_detail } = this.state;
    const { medicine_detail_index } = this.state;
    const { notice } = medicine_detail[medicine_detail_index];
    const { isSuspensionBaseInfo } = this.state;
    const stickClass = isSuspensionBaseInfo ? "detail-bsa-stick" : "back-white";

    return (
      <View className="flex-column">
        {isSuspensionBaseInfo && (
          <View className="flex-column width-screen">
            <View className="width-screen height-50"></View>
            {notice.length > 0 && (
              <View className="detail-bsa-view-notice" style={"opacity: 0"}>
                <Text className="text-orange text-12 text-height-15">
                  {notice}
                </Text>
              </View>
            )}
          </View>
        )}
        <View
          id="stick-header"
          className={"flex-column width-screen " + stickClass}
        >
          <View className="detail-bsa-view-normal flex-row flex-content-evenly">
            {medicine_detail.map((detailItem, detailItemIndex) => {
              const selected = medicine_detail_index === detailItemIndex;
              const fontSize = selected ? 36 : 30;
              const fontColor = selected ? "#1fdb9b" : "#333";

              return (
                <View
                  className="detail-bsa-view-item"
                  onClick={this.onStickChangeIndex.bind(this, detailItemIndex)}
                  taroKey={detailItemIndex}
                  hidden={detailItem.isShow === 0}
                >
                  <TitleView
                    fontWeight="bold"
                    fontSize={fontSize}
                    fontColor={fontColor}
                    title={detailItem.title}
                    largeStyle={selected}
                    showLine={selected}
                  />
                </View>
              );
            })}
          </View>
          {notice.length > 0 && (
            <View className="detail-bsa-view-notice">
              <Text className="text-orange text-12 text-height-15">
                {notice}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  /** 渲染基本信息、说明书、服务保障 */
  renderGoodsDetailInfo() {
    const { medicine_detail } = this.state;
    const { medicine_detail_index } = this.state;
    const { isIphoneX } = this.state;

    return (
      <View className="detail-margin-bottom-50">
        {medicine_detail_index === 0 && this.renderBaseInfo()}
        {medicine_detail_index === 1 && this.renderExplainInfo()}
        {medicine_detail_index === 2 && this.renderServiceInfo()}
        {isIphoneX && <View className="detail-ipx-space"></View>}
      </View>
    );
  }

  /** 渲染基本信息 */
  renderBaseInfo() {
    const { medicine_detail } = this.state;
    const { medicine_detail_index } = this.state;
    const { medicine_images } = this.state;
    const detailInfo = medicine_detail[medicine_detail_index];

    return (
      <View>
        {this.renderDetailTitle(detailInfo.title)}
        <View className="detail-base-info-view">
          {detailInfo.items.map((paramItem, paramItemIndex) => {
            return (
              <View className="flex-row" key={paramItemIndex.toString()}>
                <Text className="detail-baseinfo-item-title text-12 text-light">
                  {paramItem.title}
                </Text>
                <Text className="text-12 text-black">{paramItem.subtitle}</Text>
              </View>
            );
          })}
        </View>
        {this.renderLine()}
        {medicine_images.map((imageItem, imageItemIndex) => {
          return (
            <View
              className="flex-column flex-content-center flex-align-center"
              key={imageItemIndex.toString()}
            >
              <Image
                className="detail-base-image"
                src={imageItem}
                mode="aspectFit"
              />
              {this.renderLine()}
            </View>
          );
        })}
      </View>
    );
  }

  /** 渲染说明书 */
  renderExplainInfo() {
    const { medicine_detail } = this.state;
    const { medicine_detail_index } = this.state;
    const detailInfo = medicine_detail[medicine_detail_index];

    return (
      <View>
        {this.renderDetailTitle(detailInfo.title)}
        <View className="detail-explain-info-view flex-column back-white">
          {detailInfo.items.map((paramItem, paramItemIndex) => {
            return (
              <View
                className="detail-explain-item flex-column"
                key={paramItemIndex.toString()}
              >
                <Text className="text-13 text-black text-bold detail-margin-bottom-5">
                  {paramItem.title}
                </Text>
                <Text className="text-12 text-height-15 text-normal">
                  {paramItem.subtitle}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  /** 渲染服务保障 */
  renderServiceInfo() {
    return (
      <View>
        {this.renderPromise()}
        {this.renderStoreAptitude()}
        {this.renderStoreLive()}
        {this.renderReturnRules()}
      </View>
    );
  }

  /** 渲染药房网商城承诺 */
  renderPromise() {
    const { medicine_detail } = this.state;
    const { medicine_detail_index } = this.state;
    const detailInfo = medicine_detail[medicine_detail_index];
    const { promise } = detailInfo;

    return (
      <View>
        {this.renderDetailTitle(promise.title)}
        <View className="detail-service-info-view flex-column back-white">
          {promise.items.map((promisItem, promisItemIndex) => {
            return (
              <View
                className="detail-service-info-item flex-column"
                key={promisItemIndex.toString()}
              >
                <View className="flex-row flex-align-center detail-margin-bottom-5">
                  <Image
                    className="detail-service-icon"
                    src={promisItem.icon}
                  />
                  <Text className="text-12 text-height-15 text-black text-bold">
                    {promisItem.title}
                  </Text>
                </View>
                <Text className="text-12 text-height-15 text-normal">
                  {promisItem.content}
                </Text>
              </View>
            );
          })}
        </View>
        <Image
          className="detail-base-service-quali"
          src={promise.qualification.icon}
          onClick={this.onPlatformAptitudeClick.bind(
            this,
            promise.qualification
          )}
        />
      </View>
    );
  }

  /** 渲染商家资质 */
  renderStoreAptitude() {
    const { medicine_detail } = this.state;
    const { medicine_detail_index } = this.state;
    const detailInfo = medicine_detail[medicine_detail_index];
    const { store_qualification } = detailInfo;

    if (store_qualification.items.length > 0) {
      return (
        <View>
          {this.renderDetailTitle(store_qualification.title)}
          <View className="detail-store-quali-view flex-row flex-content-between flex-wrap back-gray">
            {store_qualification.items.map(
              (qualitifiItem, qualitifiItemIndex) => {
                return (
                  <View
                    className="detail-store-quali-item flex-column back-white"
                    key={qualitifiItemIndex.toString()}
                    onClick={this.onLookBigPictureClick.bind(
                      this,
                      2,
                      qualitifiItemIndex,
                      store_qualification.items
                    )}
                  >
                    <Image
                      className="detail-store-quali-item-image"
                      src={qualitifiItem.image_url}
                    />
                    <Text className="detail-store-quali-item-name text-ellipsis text-line-1 text-black text-11">
                      {qualitifiItem.image_name}
                    </Text>
                  </View>
                );
              }
            )}
          </View>
        </View>
      );
    }
  }

  /** 渲染商家实景 */
  renderStoreLive() {
    const { medicine_detail } = this.state;
    const { medicine_detail_index } = this.state;
    const detailInfo = medicine_detail[medicine_detail_index];
    const { store_images } = detailInfo;

    if (store_images.items.length > 0) {
      return (
        <View>
          {this.renderDetailTitle(store_images.title)}
          <View className="flex-column back-gray">
            {store_images.items.map((liveItem, liveItemIndex) => {
              return (
                <View
                  className="detail-store-live-item flex-column back-white"
                  key={liveItemIndex.toString()}
                  onClick={this.onLookBigPictureClick.bind(
                    this,
                    2,
                    liveItemIndex,
                    store_images.items
                  )}
                >
                  <Image
                    className="detail-store-live-item-image"
                    src={liveItem.image_url}
                    mode="aspectFit"
                  />
                </View>
              );
            })}
          </View>
        </View>
      );
    }
  }

  /** 渲染退换货标准 */
  renderReturnRules() {
    const { medicine_detail } = this.state;
    const { medicine_detail_index } = this.state;
    const detailInfo = medicine_detail[medicine_detail_index];
    const { returned_standard } = detailInfo;
    const { return_policy } = returned_standard;
    const { return_condition } = returned_standard;
    const { return_explain } = returned_standard;
    const { return_process } = returned_standard;

    return (
      <View>
        {this.renderDetailTitle(returned_standard.title)}
        <View className="detail-return-rules-view flex-column back-white">
          <Text className="text-12 text-height-15 text-bold text-black detail-margin-bottom-5 detail-margin-top-10">
            {return_policy.title}
          </Text>
          <Text className="text-12 text-height-15 text-normal">
            {return_policy.content}
          </Text>
          <Text className="text-12 text-height-15 text-bold text-black detail-margin-bottom-5 detail-margin-top-10">
            {return_condition.title}
          </Text>
          {return_condition.items.map((condition, conditionIndex) => {
            return (
              <View className="flex-row" key={conditionIndex.toString()}>
                {conditionIndex % 2 === 0 && (
                  <View className="detail-return-red-circle"></View>
                )}
                {conditionIndex % 2 === 1 && (
                  <View className="detail-return-green-circle"></View>
                )}
                <Text className="text-12 text-height-15 text-normal">
                  {condition}
                </Text>
              </View>
            );
          })}
          <Text className="text-12 text-height-15 text-bold text-black detail-margin-bottom-5 detail-margin-top-10">
            {return_explain.title}
          </Text>
          <Text className="text-12 text-height-15 text-normal">
            {return_explain.content}
          </Text>
          <Text className="text-12 text-height-15 text-bold text-black detail-margin-bottom-5 detail-margin-top-10">
            {return_process.title}
          </Text>
          {return_process.items.map((condition, conditionIndex) => {
            return (
              <View className="flex-row" key={conditionIndex.toString()}>
                <View className="detail-return-green-circle"></View>
                <Text className="text-12 text-height-15 text-normal">
                  {condition}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  /** 小标题 */
  renderDetailTitle(title) {
    return (
      <View className="detail-base-title-view flex-row">
        <Text className="text-13 text-bold text-black">{title}</Text>
      </View>
    );
  }

  /** 分割线 */
  renderLine() {
    return <View className="line" />;
  }

  /** 渲染顶部操作按钮 */
  renderHeaderAction() {
    const { shop_cart_count } = this.state;
    const { isShowTopItem } = this.state;
    const { topItemIndex } = this.state;
    const headerBackColor = isShowTopItem ? "white" : "transparent";
    const cla =
      topItemIndex == 0 ? "text-15 text-green" : "text-15 text-black";
      const cla1 =
      topItemIndex == 1 ? "text-15 text-green" : "text-15 text-black";
      const cla2 =
      topItemIndex == 2 ? "text-15 text-green" : "text-15 text-black";
    return (
      <View
        id="header-view"
        className="detail-header-action flex-row flex-content-between width-screen height-50"
        style={"background-color:"+headerBackColor}
      >
        <View className="detail-header-right-view"></View>
        {isShowTopItem && (
          <View className="detail-header-center-view flex-row flex-content-evenly flex-align-center">
            <View
              className="detail-header-center-item flex-column flex-content-center flex-align-center"
              onClick={this.onTopItemClick.bind(this, 0)}
            >
              <Text className={cla}>商品</Text>
            </View>
            <View
              className="detail-header-center-item flex-column flex-content-center flex-align-center"
              onClick={this.onTopItemClick.bind(this, 1)}
            >
              <Text className={cla1}>评价</Text>
            </View>
            <View
              className="detail-header-center-item flex-column flex-content-center flex-align-center"
              onClick={this.onTopItemClick.bind(this, 2)}
            >
              <Text className={cla2}>详情</Text>
            </View>
          </View>
        )}
        <View className="detail-header-right-view flex-row flex-content-end flex-align-center">
          <View
            className="detail-header-right-item flex-column flex-content-center flex-align-center"
            onClick={this.onTopShopCartClick.bind(this)}
          >
            <Image
              className="detail-header-right-item-icon"
              src={require("../../../../images/YFWGoodsDetailModule/goods_deail_cart.png")}
            />
            {shop_cart_count > 0 && (
              <View>
                <Text className="detail-shop-cart">
                  {shop_cart_count > 99 ? "99+" : shop_cart_count}
                </Text>
              </View>
            )}
          </View>
          <View
            className="detail-header-right-item flex-column flex-content-center flex-align-center"
            onClick={this.onTopMoreClick.bind(this)}
          >
            <Image
              className="detail-header-right-item-icon"
              src={require("../../../../images/YFWGoodsDetailModule/goods_deail_more.png")}
            />
          </View>
        </View>
      </View>
    );
  }

  /** 渲染底部操作按钮 */
  renderBottomAction() {
    const { isCollection } = this.state;
    const { isIphoneX } = this.state;
    const { medicine_status } = this.state;
    const {
      medicine_info,
      wx_rx_is_buy,
      prohibit_sales_btn_text,
      verFlag,
    } = this.state;
    let that = this;
    const collectionIcon = isCollection
      ? require("../../../../images/YFWGoodsDetailModule/goods_deail_collect-select.png")
      : require("../../../../images/YFWGoodsDetailModule/goods_deail_collect-normal.png");
    const collectionTitle = isCollection ? "已收藏" : "收藏";
    return (
      <View className="bottom-action" id="bottomOperate">
        {medicine_status === 2 && (
          <View className="detail-bottom-unsale-info text-14 text-white">
            {medicine_info.medicine_promptinfo}
          </View>
        )}
        <View className="detail-bottom-line"></View>
        <View className="flex-row width-screen height-50 back-white">
          <View className="detail-bottom-left-view flex-row flex-content-evenly flex-align-center">
            {medicine_info.medicine_type <= 0 && (
              <View
                className="detail-bottom-left-item flex-column flex-content-center flex-align-center"
                onClick={this.onServiceClick.bind(this)}
              >
                <Image
                  className="detail-bottom-left-item-icon"
                  src={require("../../../../images/YFWGoodsDetailModule/goods_deail_consult.png")}
                  mode="widthFix"
                />
                <Text className="text-10 text-bold text-black">咨询</Text>
              </View>
            )}

            <View
              className="detail-bottom-left-item flex-column flex-content-center flex-align-center"
              onClick={this.onStoreClick.bind(this)}
            >
              <Image
                className="detail-bottom-left-item-icon"
                src={require("../../../../images/YFWGoodsDetailModule/goods_deail_shop.png")}
                mode="widthFix"
              />
              <Text className="text-10 text-bold text-black">店铺</Text>
            </View>
            <View
              className="detail-bottom-left-item flex-column flex-content-center flex-align-center"
              onClick={this.onCollectionClick.bind(this)}
            >
              <Image
                className="detail-bottom-left-item-icon"
                src={collectionIcon}
                mode="widthFix"
              />
              <Text className="text-10 text-bold text-black">
                {collectionTitle}
              </Text>
            </View>
          </View>
          {medicine_status == 0 && <View></View>}
          {medicine_status == 1 && (
            <Block>
              {verFlag == 1 && this.renderallowed()}
              {verFlag == 2 && this.rendernotallowed()}
            </Block>
          )}
          {medicine_status === 2 && (
            <View className="detail-bottom-right-view">
              <View
                className="back-light  flex-column flex-content-center flex-align-center"
                style="height:100%"
              >
                <Text className="text-15 text-bold text-white">
                  {prohibit_sales_btn_text}
                </Text>
              </View>
            </View>
          )}
        </View>
        {isIphoneX && <View className="detail-ipx-space"></View>}
      </View>
    );
  }
  renderallowed() {
    const { medicine_info, wx_rx_is_buy } = this.state;
    if (medicine_info.medicine_type <= 0) {
      return (
        <View style={"width:55%;display:flex"}>
          <View
            style={"width:50%;display:flex"}
            className="detail-bottom-right-item flex-column flex-content-center flex-align-center detail-yellow-back"
            onClick={this.onAddShopCartClick.bind(this)}
          >
            <Text className="text-15 text-bold text-white">加入购物车</Text>
          </View>
          <View
            style={"width:50%;display:flex"}
            className="detail-bottom-right-item flex-column flex-content-center flex-align-center detail-red-back"
            onClick={this.onBuyClick.bind(this)}
          >
            <Text className="text-15 text-bold text-white">立即购买</Text>
          </View>
        </View>
      );
    }
    return this.renderallowChild();
  }
  renderallowChild() {
    return (
      <View
        className="back-green container flex-column flex-content-center flex-align-center"
        style={"background-color:#999;width:55%"}
      >
        <Text className="text-15 text-bold text-white">暂不销售</Text>
      </View>
    );
  }
  rendernotallowed() {
    const { medicine_info, wx_rx_is_buy } = this.state;
    if (wx_rx_is_buy || medicine_info.medicine_type < 0) {
      return (
        <View style={"width:55%;display:flex"}>
          <View
            style={"width:50%;display:flex"}
            className="detail-bottom-right-item flex-column flex-content-center flex-align-center detail-yellow-back"
            onClick={this.onAddShopCartClick.bind(this)}
          >
            <Text className="text-15 text-bold text-white">
              {medicine_info.medicine_type > 0 ? "加入需求单" : "加入购物车"}
            </Text>
          </View>
          <View
            style={"width:50%;display:flex"}
            className="detail-bottom-right-item flex-column flex-content-center flex-align-center detail-red-back"
            onClick={this.onBuyClick.bind(this)}
          >
            <Text className="text-15 text-bold text-white">
              {medicine_info.medicine_type > 0 ? "提交需求" : "立即购买"}
            </Text>
          </View>
        </View>
      );
    }
    return this.rendernotallowChild();
  }
  rendernotallowChild() {
    return (
      <View
        className="back-green container flex-column flex-content-center flex-align-center"
        onClick={this.onServiceClick.bind(this)}
      >
        <Text className="text-15 text-bold text-white">在线咨询</Text>
      </View>
    );
  }
  /** 渲染所有底部弹窗 */
  renderModals() {
    const { medicine_coupons } = this.state;
    const { isOpenCoupon } = this.state;
    const { medicine_discount } = this.state;
    const { isOpenDiscount } = this.state;
    const { isOpenPackage } = this.state;
    const { storeMedicineId } = this.state;
    const { medicine_info } = this.state;
    const { medicine_style } = this.state;
    const { medicine_inventory } = this.state;
    const { medicine_selectInfo } = this.state;
    const { medicine_status } = this.state;
    const { medicine_store } = this.state;
    const { isOpenAptitude } = this.state;
    const {
      isOpenMore,
      medicine_discountStr,
      medicine_freepostageStr,
    } = this.state;
    const goods = {
      medicine_info: medicine_info,
      medicine_style: medicine_style,
      medicine_inventory: medicine_inventory,
      medicine_selectInfo: medicine_selectInfo,
      medicine_status: medicine_status,
      medicine_id: storeMedicineId,
    };

    return (
      <View>
        <YFWCouponModal
          coupons={medicine_coupons}
          discounts={medicine_discountStr}
          freepostages={medicine_freepostageStr}
          isShowDiscount={true}
          storeId={medicine_store.store_id}
          storeID={medicine_store.store_id}
          isOpened={isOpenCoupon}
          onClose={() => this.setState({ isOpenCoupon: false })}
        />
        <YFWDiscountModal
          discounts={medicine_discount}
          isOpened={isOpenDiscount}
          onClose={() => this.setState({ isOpenDiscount: false })}
        />
        <YFWPackageModal
          goods={goods}
          isOpened={isOpenPackage}
          onClose={() => this.setState({ isOpenPackage: false })}
          onCallBack={(selectInfo) =>
            this.setState({ medicine_selectInfo: selectInfo })
          }
          onCartCallBack={this.fetchShopCartNum.bind(this)}
        />
        <YFWAptitudeModal
          aptitudes={medicine_store.store_aptitude}
          lives={medicine_store.store_images}
          isOpened={isOpenAptitude}
          onClose={() => this.setState({ isOpenAptitude: false })}
        />
        <YFWMoreModal
          isOpened={isOpenMore}
          onClose={() => this.setState({ isOpenMore: false })}
        />
      </View>
    );
  }

  // 私有方法

  /** 顶部标题按钮点击方法 */
  onTopItemClick(index) {
    const { topItemIndex } = this.state;
    this.setState({
      topItemIndex:index
    })
    if (topItemIndex === index) {
      return;
    } else {
      let scrollTop = 1;
      if (index === 1) {
        scrollTop = this.qusetionCommentTop;
      } else if (index === 2) {
        scrollTop = this.goodsDetailTop;
      }
      setTimeout(()=>{
        Taro.pageScrollTo({
          scrollTop: scrollTop,
        });
      })

    }
  }

  /** 点击购物车按钮icon */
  onTopShopCartClick() {
    pushNavigation("get_shopping_car");
  }

  /** 点击更多按钮icon */
  onTopMoreClick() {
    this.setState({ isOpenMore: true });
  }

  /** 滑动顶部商品图片方法 */
  onSwiperChangeIndex(event) {
    if (event.detail.source == "touch") {
      const index = event.detail.current + 1;
      this.setState({
        medicine_image_index: index,
      });
    }
  }

  /** 进入常见问题界面 */
  onQuestionClick() {
    pushNavigation("goods_detail_qa");
  }

  /** 进入全部评论界面 */
  onCommentClick() {
    const { medicine_store } = this.state;
    pushNavigation("goods_detail_all_comments", {
      shopId: medicine_store.store_id,
    });
  }

  /** 基本信息、说明书、服务保障切换 */
  onStickChangeIndex(index) {
    const { medicine_detail_index } = this.state;
    if (medicine_detail_index !== index) {
      this.setState({
        medicine_detail_index: index,
      });
    }
  }

  /**
   * 点击查看大图
   * @param type 图片类型 1 商品图片 2 商店图片
   * @param currentIndex 当前浏览图片
   * @param images 图片源
   */
  onLookBigPictureClick(type, currentIndex, images) {
    let imageUrls = [];
    if (type === 1) {
      imageUrls = images;
    } else if (type === 2) {
      images.map((imageItem) => {
        imageUrls.push(imageItem.image_url);
      });
    }

    if (imageUrls.length > 0) {
      Taro.previewImage({
        current: imageUrls[currentIndex],
        urls: imageUrls,
      });
    }
  }

  /** 点击优惠券栏目 */
  onCouponClick() {
    this.setState({ isOpenCoupon: true });
  }

  /** 点击促销栏目 */
  onDiscountClick() {
    this.setState({ isOpenDiscount: true });
  }

  /** 点击选择单品、套餐、疗程装 */
  onSingleAndPackageClick() {
    if(this.state.medicine_status == 2){
      Taro.showToast({
        title:this.state.prohibit_sales_btn_text
      })
      return
    }
    this.setState({ isOpenPackage: true });
    this.state.firstShowFlag &&
      this.setState({
        firstShowFlag: false,
      });
  }

  /** 点击店铺内商品 */
  onStoreMedicineClick(medicine) {
    pushNavigation("get_shop_goods_detail", { value: medicine.id });
  }

  /** 点击全部商品按钮 */
  onStoreAllMedicineClick() {
    const { medicine_store } = this.state;
    pushNavigation("get_shop_detail_list", { value: medicine_store.store_id });
  }

  /** 点击查看店铺资质按钮 */
  onStoreAptitudeClick() {
    this.setState({ isOpenAptitude: true });
  }

  /** 点击店铺、进入店铺按钮 */
  onStoreClick() {
    const { medicine_store } = this.state;
    pushNavigation("get_shop_detail", { value: medicine_store.store_id });
  }

  /** 点击查看药品政策 */
  onMedicineNameClick() {
    const { medicine_info } = this.state;
    const medicineTypeItem = {
      name: "单双轨说明页",
      type: "get_h5",
      value: medicine_info.medicine_typeurl,
    };
    pushNavigation(medicineTypeItem.type, medicineTypeItem);
  }

  /** 点击查看平台资质 */
  onPlatformAptitudeClick(qualification) {
    const qualificationItem = {
      name: "资质证书",
      type: "get_h5",
      value: qualification.link,
    };
    pushNavigation(qualificationItem.type, qualificationItem);
  }

  /** 点击咨询按钮 */
  onServiceClick() {
    const concatItem = {
      name: "咨询客服",
      type: "get_h5",
      value: "https://m.yaofangwang.com/chat.html",
    };
    pushNavigation(concatItem.type, concatItem);
  }
  componentDidShow() {
    if (isLogin()) {
      if (this.state.scflag) {
        this.state.scflag = false;
        this.onCollectionClick();
      }
      this.fetchShopCartNum();
    } else {
      this.state.scflag = false;
    }
  }
  /** 点击收藏按钮 */
  onCollectionClick() {
    const { isCollection } = this.state;
    const { medicine_info } = this.state;
    const { medicine_store } = this.state;
    const login = isLogin();
    if (!login) {
      this.state.scflag = true;
      pushNavigation("get_author_login");
    }
    if (isCollection) {
      this.setState({ isLoading: true });
      goodsDetailApi
        .getCancleCollectGoods(
          medicine_info.medicine_id,
          medicine_store.store_id
        )
        .then(
          (response) => {
            Taro.showToast({
              title: "取消收藏成功",
              icon: "none",
              duration: 2000,
            });
            this.setState({
              isLoading: false,
              isCollection: false,
            });
          },
          (error) => {
            this.setState({ isLoading: false });
          }
        );
    } else {
      if (login) {
        this.setState({ isLoading: true });
      }
      goodsDetailApi
        .getCollectGoods(medicine_info.medicine_id, medicine_store.store_id)
        .then(
          (response) => {
            Taro.showToast({
              title: "收藏成功",
              icon: "none",
              duration: 2000,
            });
            this.setState({
              isLoading: false,
              isCollection: true,
            });
          },
          (error) => {
            this.setState({ isLoading: false });
          }
        );
    }
  }

  /** 点击加入需求单按钮 */
  onAddShopCartClick() {
    let { medicine_selectInfo } = this.state;
    medicine_selectInfo.isBuy = false;

    this.setState({
      medicine_selectInfo: medicine_selectInfo,
      isOpenPackage: true,
    });
  }

  /** 点击购买按钮 */
  onBuyClick() {
    let { medicine_selectInfo } = this.state;
    medicine_selectInfo.isBuy = true;

    this.setState({
      medicine_selectInfo: medicine_selectInfo,
      isOpenPackage: true,
    });
  }
}
