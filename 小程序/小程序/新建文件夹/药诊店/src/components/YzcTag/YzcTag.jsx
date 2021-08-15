import { View } from "@tarojs/components";
import "./YzcTag.less";

const YzcTag = props=>{
    const {title,bgcolor,} = props
    return (
        <View className={`yzc_tag ${bgcolor}`}>{title}</View>
    )

}

export default YzcTag
