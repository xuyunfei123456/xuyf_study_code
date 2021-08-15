import Taro, { Component, Config } from "@tarojs/taro";
import { View, Text, Block, Image, Input } from "@tarojs/components";
import { SearchApi, ShopDetailApi } from "../../../../apis/index.js";
const searchApi = new SearchApi();
const shopDetailApi = new ShopDetailApi();
import { YFWHotWordsModel } from "./Model/YFWHotWordsModel.js";
import { YFWSearchShopModel } from "./Model/YFWSearchShopModel.js";
import {
    isNotEmpty,
    safeObj,
    dismissKeyboard_yfw,
    isEmpty,
    itemAddKey,
} from "../../../../utils/YFWPublicFunction.js";
import { getModelArray } from "../../../../components/GoodsItemView/model/YFWGoodsListModel.js";
import { scanCode } from "../../../../utils/YFWScanCode.js";
import SearchHistoryView from "../../../../components/YFWSearchHistoryView/YFWSearchHistoryView";
import Searchrelevantwordsview from "../../../../components/YFWSearchRelevantWordsView/YFWSearchRelevantWordsView";
import GoodsView from "../../../../components/GoodsItemView/YFWGoodsListView";
import FilterBoxModal from "../../../../components/YFWFilterBoxModal/YFWFilterBoxModal";
import SearchShopResult from "../../../../components/YFWSearchShopResult/YFWSearchShopResult";
import NoGoodsView from "../../../../components/GoodsItemView/YFWNoGoodsListView";
import YFWMoreModal from "../../../../components/YFWMoreModal/YFWMoreModal";
import {
    set as setGlobalData,
    get as getGlobalData,
} from "../../../../global_data";
import "./YFWSearch.scss";
export default class YFWSearch extends Component {
    config = {
        navigationBarTitleText: "搜索",
        disableScroll: true,
    };

    constructor(props) {
        super(props);
        this.state = {
            placeholder: '搜索症状、药品、药店、品牌',
            standard: "",
            showSpecification: false,
            type: 1,
            isOpenMore: false,
            searchValue: "",
            address: "",
            searchText: "",
            shopID: "",
            edit: true,
            resetFilter: false,
            showType: "goods",
            searchEndtype: 0, //0代表搜索框无二维码，1代表有
            hotWords: [],
            historyWords: [],
            relevantData: [], //联想
            toggleCloseBtn:0,

            pageIndex: 1,
            sort: "",
            sorttype: "",
            list: [],

            associationGoodsData: [],
            associationShopsData: [],
            brands: "",
            manufacturers: "",

            pageEnd: false,
            shopList: [],
        };
    }
    componentWillMount() {
        let _param = this.$router.params.params;
        if (_param) {
            _param = JSON.parse(_param);
            this.setState({
                showSpecification: _param.showSpecification ? true : false,
                placeholder: _param.placeholder || '搜索症状、药品、药店、品牌'
            });
        }
        //热门搜索
        this.requestHotData();
        //历史记录
        this.requestHistoryData();
        let options = this.$router.params;
        let _paramobj = options.params && JSON.parse(options.params);
        let screenData =
            (_paramobj && _paramobj.storeid) ||
            this.state.shopID;
        let searchData =
            (_paramobj &&_paramobj.value) ||
            this.state.searchValue;
        let  searchText =_paramobj&& _paramobj._value || "";
        this.setState({
            shopID: screenData + "",
            searchValue: searchData,
            address: getGlobalData("address"),
            searchText,
        });
        if(searchText){
            if (this.state.showType === 'shop') {
              this.clickSearchShopMethod(searchText)
            } else if (this.state.showType === 'goods') {
              this.clickSearchMethod(searchText)
            }
          }
        if (isNotEmpty(searchData)) {
            Taro.setNavigationBarTitle({
                title: this.state.searchValue,
            });
            this.requestGoodsData(searchData);
        } else {
            Taro.setNavigationBarTitle({
                title: "搜索",
            });
        }
    }
    //热门搜索数据
    requestHotData() {
        searchApi.getHotSearchKeywords().then((response) => {
            let dataArray = YFWHotWordsModel.getModelArray(response);
            this.setState({
                hotWords: dataArray,
            });
        });
    }
    //历史搜索记录
    requestHistoryData() {
        let dataArray = Taro.getStorageSync("kSearchHistoryKey") || [];
        if (isNotEmpty(this.state.shopID)) {
            dataArray = dataArray.filter((item) => item.showType === "goods");
        }
        dataArray = itemAddKey(dataArray);
        this.setState({
            historyWords: dataArray,
        });
    }

    //搜索联想数据
    requestRelevantData(keyWords) {
        searchApi.getAssociateKeywords(keyWords).then((response) => {
            let dataArray = response;
            this.setState({
                relevantData: dataArray,
            });
        });
    }

    requestHandleData(text, type) {
        if (isNotEmpty(this.state.shopID)) {
            this.requestShopGoodsData(text);
        } else {
            if (type == "click") {
                this.state.pageIndex = 1;
            }
            if (this.state.showType === "goods") {
                this.requestGoodsData(text);
            } else {
                this.requestShopData(text);
            }
        }
    }

    /* 商品搜索结果数据 */
    requestGoodsData(text) {
        searchApi
            .searchGoods(
                text,
                this.state.pageIndex,
                "",
                this.state.sort,
                this.state.brands,
                this.state.manufacturers,
                this.state.standard
            )
            .then((response) => {
                if (this.state.pageIndex === 1 && response.dataList.length === 0) {
                    // 第一次搜索商家无数据
                    this.requestAssociationGoodsOrShopsData();
                    return;
                }
                let data = getModelArray(response.dataList, "all_goods_search");
                if (this.state.pageIndex == 1) {
                    this.state.list = data;
                } else {
                    this.state.list = this.state.list.concat(data);
                }
                if (this.state.pageIndex == 1) {
                    let that = this;
                    setTimeout(() => {
                        if (data.length < 9) {
                            that.hideLoadingView();
                        } else {
                            this.setState({
                                pageEnd: false,
                            });
                        }
                    }, 50);
                } else {
                    if (data.length < 9) {
                        this.hideLoadingView();
                    } else {
                        this.setState({
                            pageEnd: false,
                        });
                    }
                }
                this.setState({
                    list: this.state.list,
                    associationGoodsData: [],
                });
            });
    }
    /* 商家搜索结果数据 */
    requestShopData(text) {
        searchApi.searchShops(text, this.state.pageIndex).then((response) => {
            let responseArray = YFWSearchShopModel.getModelArray(response.dataList);
            console.log(response);
            if (
                (isEmpty(response.dataList) || response.dataList === null) &&
                this.state.pageIndex === 1
            ) {
                this.requestAssociationGoodsOrShopsData();
                return;
            }

            this.setState({
                shopList:
                    this.state.pageIndex === 1
                        ? responseArray
                        : this.state.shopList.concat(responseArray),
                associationGoodsData: [],
            });

            if (responseArray.length < 14) {
                this.hideLoadingView();
            }
        });
    }
    /* 店铺搜索结果数据 */
    requestShopGoodsData(text) {
        let that = this;
        shopDetailApi
            .getShopGoods(
                this.state.shopID,
                "",
                this.state.sort,
                this.state.pageIndex,
                text
            )
            .then((response) => {
                if (this.state.pageIndex == 1 && response.dataList.length === 0) {
                    this.hideLoadingView();
                    return;
                }
                let data = getModelArray(response.dataList, "shop_medicine_recomand");

                if (this.state.pageIndex == 1) {
                    this.state.list = data;
                } else {
                    this.state.list = this.state.list.concat(data);
                }

                if (this.state.pageIndex == 1) {
                    let that = this;
                    setTimeout(() => {
                        if (data.length < 20) {
                            that.hideLoadingView();
                        }
                        // that.selectComponent("#goodsView").setState({
                        //   list: that.state.list
                        // })
                    }, 50);
                } else {
                    if (data.length < 20) {
                        this.hideLoadingView();
                    }

                    //   this.selectComponent("#goodsView").setState({
                    //     list: this.state.list
                    //   })
                }
                this.setState({
                    list: this.state.list,
                });
            });
    }
    /* 商品商家搜索无结果数据 */
    requestAssociationGoodsOrShopsData() {
        if (isEmpty(this.state.shopID)) {
            if (this.state.showType === "goods") {
                searchApi.getAssociationGoods().then((response) => {
                    let data = getModelArray(response, "hot_search_goods");
                    this.setState({
                        associationGoodsData: data,
                        list: [],
                    });
                });
            } else {
                searchApi.getAssociationShop().then((response) => {
                    let data = YFWSearchShopModel.getModelArray(response.dataList);
                    this.setState({
                        associationShopsData: data,
                        shopList: [],
                    });
                });
            }
        }
    }
    // clickSearchShopMethod=(e)=> {
    //     this.searchShopMethod(this.state.searchText);
    //     this.addHistory('shop', this.state.searchText);
    // }
    bindScanTap () {
        scanCode()
    }
    
    removeKeywords () {
        this.setState({
            searchText: "",
            type: 1,
            resetFilter: true,
            showType: "goods",
        });
    }

    //点击热门搜索
    clickHotItemMethod = (e) => {
        this.setState({
            brands: '', manufacturers: '', standard: ''
          })
        console.log(e.name)
        this.state.showType = 'goods'
        this.hotItemMethod(e.name)
        this.addHistory('goods', e.name)
    }
    //点击删除选定的历史搜索标签
    clickClearHistoryItemMethod=(e) =>{
        let _index=parseInt(e.name.key)
        let _newHistoryWords=[]
        let _historyWords=this.state.historyWords
        _historyWords.splice(_index,1)
        _historyWords.map((item,index) =>{
            item.key=index;
        })
        _newHistoryWords=_historyWords
        Taro.removeStorageSync("kSearchHistoryKey");
        this.setState({
            historyWords:_newHistoryWords
        })
    }
    //点击切换全部删除按钮显示隐藏
    onClickToggleCloseMethod(){
        if (this.state.toggleCloseBtn == 0) {
            this.setState({
                toggleCloseBtn:1
            })
        } else {
            this.setState({
                toggleCloseBtn:0
            })
        }
    }
    //点击删除按钮
    clearHistoryMethod = () => {
        Taro.showModal({
            content: '是否全部删除搜索历史?',
            cancelColor: '#999999',
            cancelText: '取消',
            confirmColor: '#49ddb8',
            confirmText: '确定',
            success:(res) =>{
                if(res.confirm){
                    Taro.removeStorageSync("kSearchHistoryKey");
                    this.setState({
                        historyWords: [],
                    });
                }else if(res.cancel){

                }
            }
        })
 
    };

    //搜索店铺
    clickSearchShopMethod = () => {
        this.searchShopMethod(this.state.searchText);
        this.addHistory("shop", this.state.searchText);
    };
    searchShopMethod(text) {
        this.setState({
            searchText: text,
            showType: "shop",
            edit: false,
            type: 3,
            list: [],
            shopList: [],
            associationShopsData: [],
            pageEnd: false,
        });
        this.state.showType = "shop";
        this.requestHandleData(text, "click");
    }
    //点击历史搜索
    clickHistoryItemMethod = (e) => {
        this.setState({
            brands: "",
            manufacturers: "",
            standard: "",
        });
        console.log(e.name);
        let item = e.name;
        let text = item.value;
        if (item.showType == "shop") {
            this.searchShopMethod(text);
        } else if (item.showType == "goods") {
            this.hotItemMethod(text);
        }
    };

    hotItemMethod(text) {
        this.state.pageIndex = 1;
        this.searchMethod(text);
        this.setState({
            searchText: text,
            edit: false,
            showType: "goods",
            associationGoodsData: [],
            list: [],
            sort: "",
        });
    }

    searchMethod(text) {
        if (text.length > 0) {
            this.setState({
                type: 3,
                resetFilter: true,
                showType: "goods",
                list: [],
                shopList: [],
                associationGoodsData: [],
            });
            //搜索结果页
            this.requestHandleData(text);
        }
    }
    //添加历史搜索数据
    addHistory(showType, value) {
        var array = this.state.historyWords;
        if (isEmpty(array)) {
            array = [];
        }
        var object = {
            showType: showType,
            value: value,
        };

        //判断历史记录是否有重复记录
        let repeat = array.some(function (item) {
            return item.showType == showType && item.value == value;
        });
        if (repeat) {
            array.splice(
                array.findIndex(
                    (item) => item.showType == showType && item.value == value
                ),
                1
            );
            array.unshift(object);
        } else {
            array.unshift(object);
        }
        Taro.setStorageSync("kSearchHistoryKey", array);
    }
    //搜索框变化
    onChangeText(e) {
        let text = e.detail.value;
        this.setState({
            searchText: text,
            edit: true,
        });
        if (text.length > 0) {
            if (this.state.type == 1 || this.state.type == 3) {
                this.setState({
                    type: 2,
                });
                this.requestRelevantData(text);
            }
        } else {
            this.setState({
                type: 1,
                resetFilter: true,
                showType: "goods",
                searchEndtype: 0,
            });
        }
    }
    //结束编辑时
    onEndEditing(e) {
        if (this.state.type == 2) {
            this.requestRelevantData(e.detail.value);
        }
        if (this.state.type == 1) {
            this.setState({
                searchEndtype: 1,
            });
        }
    }
    //获取焦点响应事件
    onFocus(e) {
        if (this.state.type == 1) {
            this.setState({
                searchEndtype: 0,
            });
        }
        this.onChangeText({detail:{value:this.state.searchText}})
    }

    //确定/搜索按钮
    searchClick(e) {
        let text = e.detail.value
            ? e.detail.value
            : e.currentTarget.dataset.keyWord
                ? e.currentTarget.dataset.keyWord
                : e.currentTarget.dataset.keyword;
        text = text.replace(/(^\s*)|(\s*$)/g, "");
        if (!text) return;
        if (this.state.showType == "shop") {
            console.log("搜索商家");
            this.clickSearchShopMethod(text);
        } else if (this.state.showType == "goods") {
            console.log("搜索商品");
            this.clickSearchMethod(text);
        }
    }
    //点击查询
    clickSearchMethod(text) {
        this.searchMethod(text);
        this.addHistory("goods", text);
    }

    changeFilter = (info) => {
        //{brands:品牌集合   manufacturers:厂家}
        console.log(info, "new filter");
        let brand = isEmpty(info.brands) ? "" : info.brands.join(","),
            manufacturer = isEmpty(info.manufacturers)
                ? ""
                : info.manufacturers.join(","),
            standard = isEmpty(info.selectspecificationsArray)
                ? ""
                : info.selectspecificationsArray.join(",");
        this.setState({
            brands: brand,
            manufacturers: manufacturer,
            pageIndex: 1,
            standard,
        });
        this.state.pageIndex = 1;
        this.state.brands = brand;
        this.state.manufacturers = manufacturer;
        this.state.standard = standard;
        if (isEmpty(this.state.searchValue)) {
            this.requestHandleData(this.state.searchText);
        } else {
            this.requestGoodsData(this.state.searchValue);
        }
    };

    componentDidShow() { }

    openUtilityMenu() {
        console.log("tababr");
        this.setState({ isOpenMore: true });
    }
    changeSortType = (e) => {
        console.log("qq" + e.sort);

        this.setState({
            sort: e.sort,
            pageIndex: 1,
            pageEnd: false,
        });
        this.state.sort = e.sort;
        this.state.pageIndex = 1;
        if (isEmpty(this.state.searchValue)) {
            this.requestHandleData(this.state.searchText);
        } else {
            this.requestGoodsData(this.state.searchValue);
        }
    };
    openControlPanel = () => {
        console.log("筛选");
        if (this.state.searchValue.length == 0) {
            let filterBox = this.filterBox.$component
                ? this.filterBox.$component
                : this.filterBox;
            this.filterBox && filterBox.showModal();
        } else {
            let filterBoxx = this.filterBoxx.$component
                ? this.filterBoxx.$component
                : this.filterBoxx;
            this.filterBoxx && filterBoxx.showModal();
        }
    };
    requestNextPage = () => {
        if (isEmpty(this.state.searchValue)) {
            if (!this.state.pageEnd) {
                this.state.pageIndex = this.state.pageIndex + 1;
                this.requestHandleData(this.state.searchText);
            } else {
                this.setState({
                    pageEnd: true,
                });
            }
        } else {
            if (!this.state.pageEnd) {
                this.state.pageIndex = this.state.pageIndex + 1;
                this.requestGoodsData(this.state.searchValue);
            } else {
                this.setState({
                    pageEnd: true,
                });
            }
        }
    };
    hideLoadingView() {
        this.setState({
            pageEnd: true,
        });
    }

    render() {
        const { searchValue } = this.state;
        const { isOpenMore } = this.state;
        return (
            <View className="container">
                {searchValue.length == 0
                    ? this.renderSearchHistory()
                    : this.renderShopGoods()}
                <YFWMoreModal
                    isOpened={isOpenMore}
                    onClose={() => this.setState({ isOpenMore: false })}
                />
            </View>
        );
    }

    /* 搜索默认页面渲染 */
    renderSearchHistory() {
        const { searchText } = this.state;
        const { type } = this.state;
        const { searchEndtype } = this.state;
        const { hotWords } = this.state;
        const { historyWords,toggleCloseBtn } = this.state;
        const { shopID } = this.state;
        const { relevantData } = this.state;
        const { associationGoodsData } = this.state;
        const { showType } = this.state;
        const { list } = this.state;
        const { associationShopsData } = this.state;
        const { pageEnd } = this.state;
        const { shopList, showSpecification, placeholder } = this.state;
        return (
            <View>
                <View className="toSearchView">
                    <View className="topSearchInputView">
                        <Image
                            className="searchIcon"
                            src={require("../../../../images/YFWStoreModule/top_bar_search.png")}
                            mode="aspectFit"
                        />
                        <Input
                            placeholder={placeholder}
                            className="topViewSearchInput"
                            placeholderClass="inputplaceholder"
                            value={searchText}
                            onInput={this.onChangeText}
                            onBlur={this.onEndEditing}
                            onConfirm={this.searchClick}
                            autoFocus={true}
                            onFocus={this.onFocus}
                            confirmType={"search"}
                            focus={true}
                        ></Input>
                        {type == 2 && (
                            <Image
                                className="search-del"
                                src={require("../../../../images/search_del.png")}
                                onClick={this.removeKeywords}
                            ></Image>
                        )}
                        {/* {(searchText.length > 0 ? type == 3 : searchEndtype == 1) && (
                            <Image
                                className="qr_sys"
                                src={require("../../../../images/qr_sys.png")}
                                onClick={this.bindScanTap}
                            ></Image>
                        )} */}
                                                    <Image
                                className="qr_sys"
                                src={require("../../../../images/qr_sys.png")}
                                onClick={this.bindScanTap}
                            ></Image>
                    </View>
                    <View
                        className="topViewSearchBotton"
                        onClick={type == 3 ? this.openUtilityMenu : this.searchClick}
                        data-keyWord={searchText}
                    >
                        {type != 3 && <Text>搜索</Text>}
                        {type == 3 && (
                            <Image
                                src={require("../../../../images/more_white.png")}
                                mode="aspectFit"
                                id="more_image"
                            ></Image>
                        )}
                    </View>
                </View>
                {type == 1 && (
                    <View className="scroll">
                        <SearchHistoryView
                            toggleCloseBtn={toggleCloseBtn}
                            hotWords={hotWords}
                            historyWords={historyWords}
                            id="searchHistoryView"
                            onClickHotItemMethod={this.clickHotItemMethod}
                            onClearHistoryMethod={this.clearHistoryMethod}
                            onClickHistoryItemMethod={this.clickHistoryItemMethod}
                            onClickToggleCloseMethod={this.onClickToggleCloseMethod.bind(this)}
                            onclickClearHistoryItemMethod={this.clickClearHistoryItemMethod}
                        />
                    </View>
                )}
                {type == 2 && (
                    <View className="scroll">
                        <Searchrelevantwordsview
                            data={relevantData}
                            id="searchRelevantWordsView"
                            shop_id={shopID}
                            keyWords={searchText}
                            onClickHotItemMethod={this.clickHotItemMethod}
                            onClickSearchShopMethod={this.clickSearchShopMethod}
                        />
                    </View>
                )}
                {type == 3 && (
                    <View className="scroll">
                        {associationGoodsData.length > 0 && showType == "goods" ? (
                            <View>
                                <NoGoodsView
                                    onChangeSortType={this.changeSortType}
                                    onOpenControlPanel={this.openControlPanel}
                                    list={associationGoodsData}
                                />
                            </View>
                        ) : (
                            <View>
                                {showType == "goods" && (
                                    <GoodsView
                                        list={list}
                                        pageEnd={pageEnd}
                                        onRequestNextPage={this.requestNextPage}
                                        onChangeSortType={this.changeSortType}
                                        onOpenControlPanel={this.openControlPanel}
                                        froms={shopID.length > 0 ? "shop_search" : "search"}
                                    />
                                )}
                                {showType == "shop" && (
                                    <View>
                                        {(shopList.length > 0 ||
                                            associationShopsData.length == 0) && (
                                                <View className="scroll">
                                                    <SearchShopResult
                                                        onRequestNextPage={this.requestNextPage}
                                                        model={shopList}
                                                        isResult={true}
                                                        pageEnd={pageEnd}
                                                    />
                                                </View>
                                            )}
                                        {shopList.length <= 0 && associationShopsData.length != 0 && (
                                            <View className="scroll">
                                                <SearchShopResult
                                                    model={associationShopsData}
                                                    isResult={false}
                                                    pageEnd={pageEnd}
                                                />
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                )}
                <FilterBoxModal
                    showSpecification={showSpecification}
                    ref={this.refFilterBox}
                    onChangeFilter={this.changeFilter}
                    keywords={searchText}
                    froms="YFWSearchDetailListView"
                />
            </View>
        );
    }
    refFilterBox = (node) => (this.filterBox = node);
    renderShopGoods() {
        const { list } = this.state;
        const { searchValue } = this.state;
        const { pageEnd } = this.state;
        return (
            <View>
                <View className="toSearchView">
                    <View className="kind-white"></View>
                    <View className="kind-text">
                        <Text>{searchValue}</Text>
                    </View>
                    <View className="topViewSearchBotton" onClick={this.openUtilityMenu}>
                        <Image
                            src={require("../../../../images/more_white.png")}
                            mode="aspectFit"
                        ></Image>
                    </View>
                </View>
                <View className="scroll">
                    {list.length > 0 && (
                        <Block>
                            <GoodsView
                                list={list}
                                pageEnd={pageEnd}
                                onChangeSortType={this.changeSortType}
                                onRequestNextPage={this.requestNextPage}
                                onOpenControlPanel={this.openControlPanel}
                                froms="search"
                            ></GoodsView>
                        </Block>
                    )}
                </View>
                <FilterBoxModal
                    ref={this.refFilterBoxx}
                    onChangeFilter={this.changeFilter}
                    keywords={searchValue}
                    froms="YFWSearchDetailListView"
                />
            </View>
        );
    }

    refFilterBoxx = (nodel) => (this.filterBoxx = nodel);
    // ResGoodsView = (modal) => this.goodsModal = modal
}
