
import { View,Image ,Text} from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./StoreCard.less";

const StoreCard=props=>{
  const {data} = props;
  let _h = Taro.pxTransform(data.height || 244),_w = Taro.pxTransform(data.width || 702.666);
  return (
    <View style={`height:${_h};widht:${_w};`} className="card_wrapper">
        <View className="header">
            <Image className="storePic" src={data.logo_image_url}></Image>
            <View className="titleAndTime">
              <View className="header_name">{data.name}</View>
              <View className="timeAndDistance">
                <View className="header_time_row">
                  <Image className="header_time_pic" src={require("../../images/timelogo.png")} />
                  <View className="header_time">营业时间 :<Text className="timeText">{data.time}</Text></View>
                </View>
                <View className={`${data.distance ? 'header_distance' : 'nodistance'}`}><Text className="distanceOrder">{data.nearst?'离您最近':''}</Text>距您{data.distance}</View>
              </View>
            </View>
        </View>
        <View className="bottom">
          <View className="bottom_left">
          <Image
                className="bottom_addressPic"
                src={require("../../images/addresslogo.png")}
              ></Image>
              <View className="bottom_address">{data.address}</View>
          </View>
          <View className="bottom_right">
              <View className="action" onClick={props.actionFn}>
                <Text>{data.actionText}</Text>
              <Image src={require('../../images/right_green.png')} className="arrow" />
              </View>
          </View>
        </View>
    </View>
  )
}
export default StoreCard