import { Block, View, Image, Text } from '@tarojs/components'
import Taro, { Component, Config } from "@tarojs/taro";
import './YfwWaterfallGoods.scss'


class YfwWaterfallGoods extends Component {

  config = {
      component: true
  }

  static defaultProps = {
    imgWrapperHeight: '0.00',
    hasActivity: '#ff3300',
    postdata: 30,
  }


  componentWillMount () { }

  componentDidMount () { }


  render() {
    const { imgWrapperHeight, postdata, hasActivity } = this.props
    return (
      <View className="wrapper">
        <View
          className="goods_img"
          style={'height:' + imgWrapperHeight + 'rpx;'}
        >
          <Image
            className="img"
            src={postdata.intro_image}
            mode="widthFix"
          ></Image>
          {hasActivity && (
            <Image
              className="activity_img"
              src={postdata.imgurl}
              mode="widthFix"
            ></Image>
          )}
        </View>
        <View className="name_wrapper">
          {(postdata.dict_medicine_type == 1 ||
            postdata.dict_medicine_type == 2 ||
            postdata.dict_medicine_type == 3 ||
            postdata.dict_medicine_type == 0) && (
            <Image
              className="name_img"
              src={
                postdata.dict_medicine_type == 0
                  ? require('../../images/ic_drug_OTC.png')
                  : postdata.dict_medicine_type == 1 ||
                    postdata.dict_medicine_type == 2 ||
                    postdata.dict_medicine_type == 3
                  ? require('../../images/ic_drug_track_label.png')
                  : ''
              }
            ></Image>
          )}
          <View className="name">{postdata.name}</View>
        </View>
        <View className="standard">{postdata.standard}</View>
        <View className="price">
          <View className="nowPrice">{'￥' + postdata.price}起</View>
          <View className="oldPrice"></View>
        </View>
        {postdata.shop_num && (
          <View className="shopnum">
            {postdata.shop_num}
            <Text className="shop_num_text">个商家在售</Text>
          </View>
        )}
      </View>
    )
  }
}

export default YfwWaterfallGoods

