import { Component } from "react";
import { View, Image, ScrollView } from "@tarojs/components";
import { HTTP } from "../../utils/http";
import GoodsCard from "../../components/GoodsCard/GoodsCard";
import { pushNavigation } from "../../apis/YFWRouting";
import { isLogin, transFormData } from "../../utils/YFWPublicFunction";
import NoMore from "../../components/noMore/noMore";
import "./index.less";
const httpRequest = new HTTP();
export default class Index extends Component {
  constructor() {
    super();
    this.state = {
      outFlag:false,
      tabList: [],
      refreshType: false,
      currentDataIndex:0
    };
  }
  componentWillMount() {
    this.getCategory(100000);
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}
  getCategory(shopId) {
    httpRequest.get("guest.getMedicineCategory", { shopId }).then(
      res => {
        if (res && res.length != 0) {
          res = res.map((item,index) => {
            item.title =
              item.CategoryName.length > 4
                ? item.CategoryName.substring(0, 4) + "..."
                : item.CategoryName;
            item.pageSize = 10;
            item.pageIndex = 1;
            item.pageEnd = false;
            item.noMoreTip = "没有更多了";
            item.active = index == 0 ? true:false;
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
            refreshType: false,
          });
        } else {
          let _data = this.state.tabList[index];
          _data.pageEnd = true; //判断是否还有数据
          _data.noMoreTip = "没有更多了";
          this.state.tabList[index] = _data;
          this.setState({
            tabList: this.state.tabList,
            refreshType: false,
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
  tabClick(index,e) {
    this.setState({
      currentDataIndex: index,
      outFlag:true,
    },()=>{
      if (!this.state.tabList[index].firstClick) {
        this.state.tabList[index].firstClick = true;
        this.getPageData(index,this.state.tabList[index]);
      }
    });


  }
  render() {
    const { tabList ,currentDataIndex,outFlag} = this.state;
    const rightData = tabList[currentDataIndex] || {}
    console.log('outFlag',outFlag)
    return (
      <View className="allGoodsWrapper">
        <ScrollView className="leftscroll" scrollY>
          {tabList.map((item,index) => {
            return <View className={`tabitem ${currentDataIndex ==index? 'tabItem_active':''}`} onClick={this.tabClick.bind(this,index)}>{item.title}</View>;
          })}
        </ScrollView>
        <ScrollView className={`rightscroll ${currentDataIndex != 10000 ? 'fadeAmi':''}}`} scrollY>
          <View className="AtTabs_title">{rightData.CategoryName}</View>
          {rightData.data &&
            rightData.data.map((k, m) => {
              return (
                <View
                  className="goods_card_wrapper"
                >
                  <GoodsCard
                    data={k}
                  />
                </View>
              );
            })}
          <View className="noMore_wrapper">
            <NoMore tip={rightData.noMoreTip} />
          </View>
        </ScrollView>
      </View>
    );
  }
}
