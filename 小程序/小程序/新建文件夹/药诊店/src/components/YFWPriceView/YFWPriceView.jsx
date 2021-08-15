import { View, Text ,Image} from "@tarojs/components";
import "./YFWPriceView.less";
import { safe,toDecimal,isNotEmpty } from '../../utils/YFWPublicFunction'
export const YFWPriceView =(props) =>{
    const {color="#ff3300",largeFontSize=20,smallFontSize=16,fontWeight="bold",rmbFontWeight=100,bold,hasMember,bigImage}=props;
    const smallStyle='color:'+color+';font-size:'+smallFontSize+'px;font-weight:'+fontWeight+';'
    const rmbStyle='color:'+color+';font-size:'+smallFontSize+'px;'
    const largeStyle='color:'+color+';font-size:'+largeFontSize+'px;font-weight:'+fontWeight+';'
    const memberImg = bigImage ? require('../../images/memberPrice-big.png') : require('../../images/memberPrice-small.png')
    let {price}=props;
    price=safe(price)
    let hasRise=price.indexOf('起')!==-1;
    price=price.replace('起','');
    price=toDecimal(price);
    const priceList=price.split('.');
    const integer_part=isNotEmpty(priceList) ? priceList[0] : 0;
    const decimals_part=isNotEmpty(priceList) ? priceList[1]+(hasRise ? '起' : '') : '00';

    // const {discount,isInvalid}=props;
    // const discountStyle = 'color: '+discountColor+';font-size: '+(fontSize*0.67)+'rpx;line-height:'+(fontSize*0.67)+'rpx;border:solid 1px '+discountColor+';border-radius: 8rpx;padding: 2px 6rpx;margin-left: 10rpx;'
    // const invalidStyle = 'color: #fff;font-size: '+(fontSize*0.67)+'rpx;line-height:'+(fontSize*0.67)+'rpx;border-radius: 30rpx;padding: 2px 10rpx;margin-left: 30rpx;background-color:#ccc';
    return(
    <View className='flexBox'>
        <Text style={bold==0? rmbStyle : smallStyle}>¥</Text>
        <Text className="largeStyle" style={largeStyle}>{safe(integer_part)+'.'}</Text>
        <Text className='smallStyle' style={smallStyle}>{safe(decimals_part)}</Text>
        {hasMember && <Image className={`${bigImage ? 'memberPrice-big':'memberPrice-small'}`} src={memberImg}></Image>}
    </View>
    )
}