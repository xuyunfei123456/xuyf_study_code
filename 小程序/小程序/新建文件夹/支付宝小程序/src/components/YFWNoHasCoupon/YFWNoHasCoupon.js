import { Block, View, Image } from '@tarojs/components'
import Taro, { Component, Config } from "@tarojs/taro";
import './YFWNoHasCoupon.scss'
class NoHasCoupon extends Component {
    config = {
        component: true
    }
    static defaultProps = {

    }
    goCouponAction(){
        this.props.goCoupon();
    }
    render() {
        return (
            <Block>
                <Image className="no_coupon" src={require("../../images/ic_no_coupon.png")}></Image>
                <View className="no_coupon_txt">暂无优惠券</View>
                <View className="go_coupon_center" onClick={this.goCouponAction}>前往领券中心></View>
            </Block>
        )
    }
}