import { Component } from "react";
import {
    View,
    ScrollView,
    Text,
    Image,
    Button,
    Block
} from "@tarojs/components";
import Taro from "@tarojs/taro";
import OrderListCard from "../../components/OrderListCard/OrderListCard"
import "./confirmReceipt.less";

class ConfirmReceipt extends Component {

    constructor() {
        super();
        this.state = {
            shopInfo: [
                { si: "1 . 查看商品外包装，确认是否有人为刮损、涂改；" },
                { si: "2 . 查看商品【生产日期、有效期至】，确认是否已过期；" },
                { si: "3 . 查看商品【规格、数量、批准文号】，确认是否一致；" },
                { si: "4 . 查看商品，确认是否破损；" },
                { si: "5 . 核对商家发货时所填[产品批号]是否与所收商品【产品批号】一致。" }
            ],
            cardListData: [
                {
                    cl: {
                        intorImage: '../../images/default_ava.png', prescription: '0', name: '三九胃泰', standard: '20g*6袋', retailPriceInt: '20',retailPriceFloat:'00',
                        kind: [{ count: '99', lotNum: '产品批号  20201053' }, { count: '99', lotNum: '产品批号  20201053' }]
                    }
                },
                {
                    cl: {
                        intorImage: '../../images/default_ava.png', prescription: '0', name: '三九胃泰', standard: '20g*6袋',retailPriceInt: '20',retailPriceFloat:'00',
                        kind: [{ count: '99', lotNum: '产品批号  20201053' }, { count: '99', lotNum: '产品批号  20201053' }]
                    }
                },
                {
                    cl: {
                        intorImage: '../../images/default_ava.png', prescription: '0', name: '三九胃泰', standard: '20g*6袋',retailPriceInt: '20',retailPriceFloat:'00',
                        kind: [{ count: '99', lotNum: '产品批号  20201053' }, { count: '99', lotNum: '产品批号  20201053' }]
                    }
                }
            ]

        }
    }

    componentWillMount() { }
    componentDidMount() { }
    componentWillReceiveProps(nextProps, nextContext) { }
    componentWillUnmount() { }
    componentDidShow() { }
    componentDidHide() { }
    componentDidCatchError() { }
    componentDidNotFound() { }
    render() {
        const { shopInfo, cardListData } = this.state;
        return (
            <ScrollView scrollY className="cr-wrap">
                <View className="cr-item">
                    <View className="info-title">
                        <Image className="radio-pic" src={require("../../images/radio.png")}></Image>
                        <Text>为保证购药安全，请确认所收商品相关信息，包括：</Text>
                    </View>
                    <View className="info-ul">
                        {
                            shopInfo.map((item, index) => {
                                return (
                                    <View className="info-li"><Text>{item.si}</Text>{item.si.includes("5") && <View className="look"><Text>（</Text><Text className="look-btn">查看【产品批号】示例图</Text><Text>）</Text></View>}</View>
                                )
                            })
                        }
                    </View>
                </View>
                <View className="cr-item cr-item-list">
                    <View className="shop-title">商家发货时所填<Text className="green">【产品批号】</Text>如下：</View>
                    {cardListData.map((clItem, clIndex) => {
                        return (
                            <View className="orderList">
                                <OrderListCard data={clItem.cl}></OrderListCard>
                            </View>


                        )
                    })}

                </View>
                <View className="bom"><View className="bom-btn">出示验证码</View></View>
            </ScrollView>
        );
    }
}
export default ConfirmReceipt;