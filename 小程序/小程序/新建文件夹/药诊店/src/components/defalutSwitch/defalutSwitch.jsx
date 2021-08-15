import Taro from "@tarojs/taro";
import { AtSwitch } from 'taro-ui';
import { View, Text } from '@tarojs/components';
import './defalutSwitch.less'
const Default=props=>{
    const {data}=props;
    return(
        <View className="default">
        <View className="title">{data.setDefaultTitle}<Text className="txt">{data.setDefaultContent}</Text></View>
        <AtSwitch className="switch" color={data.onColor} checked={data.defaultVal} onChange={props.defaultChange} />
    </View>
    )
}
export default Default;