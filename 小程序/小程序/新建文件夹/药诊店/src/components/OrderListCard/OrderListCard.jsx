import { View, Image, Text, Block } from "@tarojs/components";
import {getMedicineType} from '../../utils/YFWPublicFunction'
import "./OrderListCard.less";

const OrderListCard = props => {
  const { data } = props;
  let medicineType = getMedicineType(data.prescription || '')
  return (
    <View className="OrderListCard">
      <View className="OrderListCard_left">
        <View className="pic">
          <Image className="img" mode="widthFix" src={data.intorImage}></Image>
        </View>
        <View className="content">
            <View className="title">
              {medicineType&&<Image className="medicine_type" src={medicineType}></Image>}
              <Text className="brandName">999</Text>
              <Text className="goods_name">{data.name}</Text>
            </View>
            <View className="standard">{data.standard}</View>
            {data.kind&&<View className="lnListLeft">
              {
                data.kind.map((kItem,kIndex) =>{
                  return(
                    <View className="lotNumber">{kItem.lotNum}</View>
                  )
                })
              }
              </View>}
           
        </View>
      </View>
      <View className="OrderListCard_right">
        <View className="price">￥ <Text className="int">{data.retailPriceInt}</Text>.<Text className="float">{data.retailPriceFloat}</Text></View>
     
          {data.kind && <View className="lnListRight">
            {
                data.kind&&data.kind.map((kItem,kIndex) =>{
                  return(
                    <View className="num">x{kItem.count}</View>
                  )
                })
            }
            </View>}
     
        
        {!data.kind&&<View className="num">x{data.count}</View>}
      </View>
    </View>
  );
};
export default OrderListCard;
