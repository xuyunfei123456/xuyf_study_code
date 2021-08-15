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
import "./confirmReceiptQRcode.less";

class ConfirmReceiptQRCode extends Component {

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
        const { shopInfo } = this.state;
        return (
            <ScrollView scrollY className="cr-wrap">
                <View className="cr-item">
                   <View className="qr-title">向骑手展示签收码</View>
                   <Image className="qr-code" src={require("../../images/default_ava.png")}></Image>
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
          
          
            </ScrollView>
        );
    }
}
export default ConfirmReceiptQRCode;