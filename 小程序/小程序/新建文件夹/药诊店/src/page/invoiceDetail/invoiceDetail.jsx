import { Component } from "react";
import { View, Image, Text, Block, ScrollView, Radio, Button, Input } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./invoiceDetail.less";
import { HTTP } from "../../utils/http";
import { pushNavigation } from "../../apis/YFWRouting";
import createOrder from '../../images/createOrder.png';
import orderSend from '../../images/orderSend.png';
import createInvoicev from '../../images/createInvoice.png';
import invoiceDetail from '../../images/invoiceDetail.png';
const httpRequest = new HTTP();

class InvoiceDel extends Component {
  constructor() {
    super();
    this.state = {
      invoiceModel:null,
      explain: [
        { pic: createOrder, name: "订单下单" },
        { pic: orderSend, name: "订单发货" },
        { pic: createInvoicev, name: "商家开具" },
        { pic: invoiceDetail, name: "查看发票" }
      ],
      explainInfo: [{ title: "发票类型", info: "" }, { title: "发票抬头", info: "" }, { title: "身份证号", info: "" }, { title: "发票内容", info: "" }],
      invoiceInfo: [
        { vInfo: "1.发票金额不含优惠券、满减、积分等优惠扣减金额；" },
        { vInfo: "2.商家若无法开具电子普通发票，则开具纸质发票，发票随货寄出或者发货后2日内寄出，若未收到可要求商家补开并寄出；" },
        { vInfo: "3.电子发票：" },
        { vInfo: "(1)电子普通发票是税局认可的有效付款凭证，其法律效力、基本用途、基本使用规定同纸质发票，可支持报销入账，如需纸质发票可自行打印下载；" },
        { vInfo: "(2)电子普通发票则在发货后2日内开出，若商家未开出可联系商家开出；" },
        { vInfo: "(3)用户可点击“我的订单-查看发票”查询，分享链接至电脑端下载打印。" }
      ],
      currentInvoiceStatus:1,
    }
  }
  //跳转到发票展示页面
  onClickGoToInvoiceShow(url){
    url = encodeURIComponent(url)
    pushNavigation('invoiceShow',{url,})
  }
  componentWillMount() { 
    let invoiceModel = Taro.getStorageSync('invoiceModel');
    invoiceModel.invocieName = invoiceModel.InvoiceType == 1 ?'增值税电子普通发票':'增值税纸质普通发票';
    invoiceModel.invoiceStatusName = invoiceModel.InvoiceStatus == 0 ?'未开票':'已开票'
    let explainInfo = this.state.explainInfo.map((item,index)=>{
      item.info = index == 0 ?invoiceModel.invocieName : index == 1 ? invoiceModel.InvoiceApplicant : index == 2 ?invoiceModel.InvoiceCode : '商品明细' ;
      return item;
    })
    this.setState({
      invoiceModel,
      explainInfo,
    })
  }
  componentDidMount() { }
  componentWillUnmount() { }
  componentDidShow() { }
  componentDidHide() { }
  componentDidCatchError() { }
  componentDidNotFound() { }
  render() {
    let { explain, explainInfo, invoiceInfo ,currentInvoiceStatus,invoiceModel} = this.state;
    return (
      <View className="invoice-wrap">
        <View className="invoice-item">
          <View className="invoice-item-title"><Text>发票状态:</Text>
          <Text className="result">{invoiceModel.invoiceStatusName}</Text>

          </View>
       {currentInvoiceStatus==3&&
            <View className="invoice-item-center-status">

            <View className="mod">
              <View className="mod-left">
                <View>配送单位</View>
                <View className="matter">申通快递</View>
              </View>
            </View>

            <View className="mod track-num">
              <View className="mod-left">
                <View>物流单号</View>
                <View className="matter">XXXXXXXXXXXXXXXXX</View>
              </View>
              <View className="mod-right">查物流</View>
            </View>

          </View>
       }
        </View>
        <View className="invoice-item">
          <View className="invoice-item-title">开票说明</View>
          <View className="invoice-item-center-explain">
            {explain.map((eItem, eIndex) => {
              return (
                <Block>
                  <View className="explain-item">
                    <View className="pic-bgc"><Image src={eItem.pic} className="pic"></Image></View>
                    <View className="name"><Text>{eItem.name}</Text></View>
                  </View>
                  {(explain.length > eIndex + 1) && <View className="progress-bar"></View>}
                </Block>
              )
            })

            }

          </View>
        </View>
        <View className="invoice-item">
          <View className="invoice-item-title"><Text>发票状态</Text></View>
          <View className="invoice-item-center-info">
            {explainInfo.map((eItem, eIndex) => {
              return (
                <View className="mod">
                  <View className="mod-left">
                    <View className="mmode-left-title">{eItem.title}</View>
                    <View className="matter">{eItem.info}</View>
                  </View>
                </View>
              )
            })}
            {invoiceModel.InvoiceImageUrl&&<View className="check-invoice-btn" onClick={this.onClickGoToInvoiceShow.bind(this,invoiceModel.InvoiceImageUrl)}>查看发票</View>}
          </View>
        </View>
        <View className="invoice-info">
          <View className="title">发票须知</View>
          <View className="content">
            {invoiceInfo.map((vItem, vIndex) => {
              return (
                <View className="strip">{vItem.vInfo}</View>
              )
            })}
          </View>
        </View>
      </View>
    );
  }
}
export default InvoiceDel;