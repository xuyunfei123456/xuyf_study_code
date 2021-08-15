import { View, Image, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import {getMedicineType} from '../../utils/YFWPublicFunction';
import { YFWPriceView } from "../../components/YFWPriceView/YFWPriceView";
import "./bagGoodsCard.less";

const BagGoodsCard = props => {
  const { data } = props;
  const memBer = data.BolUseCustomerPrice ? true:false;
  let _pic = getMedicineType(data.prescription)
  return (
    <View
      style={`height:100%;`}
      className="bagGoodsCard"
    >
      <View className="card_left">
        <Image className="goods_pic" mode="widthFix" src={data.medicineIntorImage}></Image>
      </View>
      <View className="card_right">
        <View className="goods_name">
          <Image
            className="goods_type"
            src={_pic}
          ></Image>
          <View className="goods_name_text">{data.name}</View>
        </View>
        <View className="standard">
          <Text className="standard_name">{data.standard_name}</Text>
          <Text className="standard_type">{data.standard_type}</Text>
        </View>
        <View className="card_bottom">
          <View className="good_price">
          <YFWPriceView largeFontSize='14' smallFontSize='12' price={memBer? data.CustomerPrice:data.shopPrice} bold={0} hasMember={memBer}></YFWPriceView>
          {memBer && (
          <View className="oldPrice">{`¥ ${data.shopPrice}`}</View>
          )}
          </View>
          <View className="operation">
            {data.count >0 && <Image className="plus"  onClick={props.minusClick} src={require('../../images/minus.png')}></Image>}
            {data.count>0 && <Text className="count">{data.count}</Text>}
            <Image className="minus" className="minus" onClick={props.plusClick} src={require('../../images/plus.png')}></Image>
          </View>
        </View>
      </View>
    </View>
  );
};
export default BagGoodsCard;
