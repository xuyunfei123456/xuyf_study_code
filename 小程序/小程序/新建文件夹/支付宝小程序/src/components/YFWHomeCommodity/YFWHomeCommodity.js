import Taro from '@tarojs/taro';
import "./YFWHomeCommodity.scss";
import {tcpImage} from "../../utils/YFWPublicFunction.js"
class HomeCommodity extends Taro.Component{
    config={component:true};
    static defaultProps={
        hcImage:"",
        hcName:"",
        hcPrice:""
    }
    render(){
        // const {image,name,price}=this.state;
        const {hcImage,hcName,hcPrice,bvItem}=this.props;
        return(
            <View className="goodsItem">
            <View className="shopPrint" style={"background-image:url(" + tcpImage(hcImage) + ");top:0px;"}></View>
            <View className="shopName">{hcName}</View>
            <View className="shopPrice"><text className="rmbSign">¥</text>{hcPrice}</View>
        </View>
        )
    }
}