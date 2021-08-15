import { View } from "@tarojs/components";
import "./noMore.less";

const noMore = props => {
  const {tip} = props;
  return (
    <View className="noMore">
      <View className='noMore_text'>{tip || '没有更多了'}</View>
    </View>
  );
};
export default noMore;