import { Component } from "react";
import { View, Image, Text, Block } from "@tarojs/components";
import Taro,{getCurrentInstance, getCurrentPages} from "@tarojs/taro";
import "./applyRefund.less";
import { connect } from "react-redux";
import { changeState } from "../../store/actions/index";
import { HTTP } from "../../utils/http";
import { pushNavigation } from "../../apis/YFWRouting";
import { AtActionSheet, AtActionSheetItem } from 'taro-ui';
import OrderListCard from "../../components/OrderListCard/OrderListCard";
import { YFWPriceView } from "../../components/YFWPriceView/YFWPriceView"
import { transOrderCardData, toDecimal } from "../../utils/YFWPublicFunction";
const httpRequest = new HTTP();
class ApplyRefund extends Component {
    constructor() {
        super();
        this.state = {
            refundPrice: "200",
            shopList: [],
            isOpenedReasonList: false,
            currentReasonIndex: -1,
            reasonResult: "",
            reasonList: []
        }
    }
    componentWillMount() {
        let instance = getCurrentInstance();
        const {orderNo,freshPage} =instance.router.params;
        this.state.orderNo = orderNo;
        this.state.freshPage = freshPage;
        if(orderNo){
            this.getDetail(orderNo)
        } 
    }
    getDetail(orderNo){
        httpRequest.get('order.getOrderDetail',{orderNo,}).then(res=>{
            if(res&&res.OrderDetails){
                let shopList = transOrderCardData(res.OrderDetails || [])
                this.setState({
                    shopList,
                    refundPrice:res.ReceiveMoney,
                })
            }
        })
    }
    //切换是否弹出退款理由弹框
    onChangeReasonList() {
        let { isOpenedReasonList } = this.state;
        if (isOpenedReasonList == false) {
            isOpenedReasonList = true
        }
        this.setState({ isOpenedReasonList })
    }
    //选择退款理由
    handleClickReason(event) {
        let { currentReasonIndex } = this.state;
        let index = event.currentTarget.dataset.reason;
        if (currentReasonIndex == index) {
            currentReasonIndex = -1
        } else {
            currentReasonIndex = index;
        }
        this.setState({
            currentReasonIndex
        })
    }
    //点击底部取消按钮退款理由弹框关闭
    handleCancelReasonList() {
        let { reasonResult, reasonList, currentReasonIndex, isOpenedReasonList } = this.state;
        if (currentReasonIndex < 0) {
            reasonResult = ""
        } else {
            let reasonItem = reasonList[currentReasonIndex];
            let _reason = reasonItem.reason;
            reasonResult = _reason;
        }
        isOpenedReasonList = false;
        this.setState({
            reasonResult,
            isOpenedReasonList
        })
    }
    // 退款理由弹框被关闭触发的事件
    handleCloseReasonList() {
        this.handleCancelReasonList()
    }
    //提交事件
    handleClickSubmit() {
        let { reasonResult } = this.state;
        if (reasonResult == "") {
            Taro.showToast({
                title: '请选择退款理由',
                icon: 'none',
                duration: 1500
            })
            return false;
        }
    Taro.showLoading({ title: '加载中...' ,mask:true})
    httpRequest.get("order.applyReturn", { orderNo:this.state.orderNo, desc:reasonResult}).then(
      res => {
        Taro.showToast({
            title: '退款成功',
            icon: 'none',
            duration: 1500
        })
        Taro.setStorageSync(this.state.freshPage,1)
        setTimeout(()=>{
            Taro.navigateBack()
        },1000)
      },
      error => {
        Taro.hideLoading();
        Taro.showToast({
          title: error.msg || "申请退款异常",
          icon: "none",
          duration: 2000
        });
      }
    );
    }
    componentDidMount() { 
        this.getReason();
    }
    getReason(){
        httpRequest.get('order.getApplyReturnMoneyDesc').then(res=>{
            this.setState({
                reasonList:res || []
            })

        })
    }
    componentWillReceiveProps(nextProps, nextContext) { }
    componentWillUnmount() { }
    componentDidShow() { }
    componentDidHide() { }
    componentDidCatchError() { }
    componentDidNotFound() { }
    render() {
        let { refundPrice, shopList, isOpenedReasonList, reasonList, currentReasonIndex, reasonResult } = this.state;
        return (
            <View className="applyRefund-wrap">
                <View className="applyRefund-item">
                    <View className="applyRefund-item-title">
                        <Text>退款商品</Text>
                    </View>
                    <View className="applyRefund-item-center">
                        {
                            shopList.map((spItem, spIndex) => {
                                return(
                                <View className="shopList">
                                    <OrderListCard data={spItem}></OrderListCard>
                                </View>
                                )
                            })
                        }
                    </View>
                </View>
                <View className="applyRefund-item">
                    <View className="applyRefund-item-title">
                        <Text>退款金额</Text>
                        <YFWPriceView price={refundPrice} color="#333333" largeFontSize="14" smallFontSize="12"></YFWPriceView>
                    </View>
                </View>
                <View className="applyRefund-item">
                    <View className="applyRefund-item-title">
                        <Text>退款理由</Text>
                        <View className="title-right" onClick={this.onChangeReasonList.bind(this)}>
                            {(reasonResult == "") &&
                                <Block>
                                    <Text className="reason">点击选择理由（必选）</Text>
                                    <Image src={require("../../images/arrow_right_small.png")} className="arrow-right"></Image>
                                </Block>
                            }
                            {(reasonResult != "") &&
                                <Block>
                                    <Text className="reason">{reasonResult}</Text>
                                </Block>
                            }
                        </View>
                    </View>
                </View>
                <View className="applyRefund-item">
                    <View className="applyRefund-item-title">
                        <Text>退款方式</Text>
                        <Text className="title-right">微信返还</Text>
                    </View>
                </View>
                <AtActionSheet isOpened={isOpenedReasonList} cancelText='关闭' title='退款理由' onCancel={this.handleCancelReasonList.bind(this)} onClose={this.handleCloseReasonList.bind(this)}>
                    {reasonList.map((rlItem, rlIndex) => {
                        return (
                            <View data-reason={rlIndex} onClick={this.handleClickReason.bind(this)}>
                                <AtActionSheetItem>
                                    <View className="reason-content">{rlItem.reason}</View>
                                    {rlIndex == currentReasonIndex ? <Image src={require("../../images/0icon_danxuan_xuanzhong.png")} className="reason-btn"></Image> : <Image src={require("../../images/0icon_danxuan_moren.png")} className="reason-btn"></Image>}
                                </AtActionSheetItem>
                            </View>
                        )
                    })

                    }
                </AtActionSheet>
                <View className="applyRefund-submit-btn" onClick={this.handleClickSubmit.bind(this)}>提交</View>
            </View>
        );
    }
}
export default ApplyRefund;