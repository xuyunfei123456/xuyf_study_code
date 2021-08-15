import { View, Image, Text } from "@tarojs/components";
import { AtFloatLayout } from "taro-ui";
import BagGoodsCard from "../../components/bagGoodsCard/bagGoodsCard";
import "./MedicineBag.less";

const MedicineBag = props => {
  const { shopCar,shopCarOpened,shopCartCount,CartTotal} = props;
  return (
    <View className="medicineBagWrapper">
      <View className={`contentWrapper ${shopCarOpened ?'bag_shadow':''}`}>
        <View className="bagWrapper" onClick={props.clickBag}>
          <Image
            src={
              shopCar.length > 0
                ? require("../../images/bag.png")
                : require("../../images/emptyBag.png")
            }
            className="bag"
          ></Image>
          {shopCartCount > 0 && (
            <View className="shop_car_count" onClick={props.clickBag}>
              {shopCartCount}
            </View>
          )}
        </View>

        <View className="carInfo">
          {bottom_center(shopCar,CartTotal)}
          {/* <View className="postMoney">另需配送费￥8.00</View> */}
        </View>
        <View className={shopCar.length > 0 ? "submit" : "disSubmit"} onClick={()=>{props.submitOrder()}}>
          {shopCar.length > 0 ? "去结算" : "￥0起送"}
        </View>
      </View>
      <AtFloatLayout isOpened={shopCarOpened} onClose={props.bagClose}>
        <View className="shopCarWrapper">
          <View className="shopCar_title">
            <View className="shopCar_title_text">
              购物车<Text className="shopCar_count">{`（共${shopCartCount}件商品）`}</Text>
            </View>
            <View className="shopcar_empty" onClick={props.emptyBag}>
              <Image
                className="empty_pic"
                src={require("../../images/empty.png")}
              ></Image>
              <Text>清空</Text>
            </View>
          </View>
          {shopCar.map((item,index) => {
            return (
              <View className="shopCar_list_item">
                <BagGoodsCard
                  data={item}
                  minusClick={()=>{props.bagMinus(item)}}
                  plusClick={()=>{props.bagPlus(item)}}
                />
              </View>
            );
          })}
        </View>
      </AtFloatLayout>
    </View>
  );
};
export default MedicineBag;
const bottom_center = (shopCar,CartTotal) => {
  if (shopCar.length == 0) {
    return (
      <View>
        <View className="nogoods">未选购商品</View>
      </View>
    );
  }
  return <View className="priceAll">￥{CartTotal}</View>;
};
