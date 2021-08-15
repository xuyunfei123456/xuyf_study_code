import Taro, { Component } from '@tarojs/taro'
import { View, Image, RichText, Text } from '@tarojs/components'
import { sublie, subAfter} from '../../../../../../utils/YFWPublicFunction.js'
import './YFWOrderListItemComponent.scss'
class YFWOrderListItemComponent extends Component {

    config = {
        component: true
    }
    static defaultProps = {
        listData:{}
    }

    componentWillMount () { }

    componentDidMount () { }

    render() {
        const { listData } = this.props
        return (
          <View className="medicine_list">
            <Image className="medicine_image" src={listData.img_url}></Image>
            <View>
              <View className="medicine_info_top">
                <View className="medicien_name">
                  {listData.PrescriptionType == 1 && (
                    <Image
                      src={require('../../../../../../images/ic_drug_track_label.png')}
                      className="medicine_type_icon"
                    ></Image>
                  )}
                  {listData.PrescriptionType == 2 && (
                    <Image
                      src={require('../../../../../../images/ic_drug_track_label.png')}
                      className="medicine_type_icon"
                    ></Image>
                  )}
                  {listData.PrescriptionType == 0 && (
                    <Image
                      src={require('../../../../../../images/ic_OTC.png')}
                      className="medicine_type_icon"
                    ></Image>
                  )}
                  {listData.title}
                </View>
                <View style="flex:1"></View>
                <Text className="small-Price">
                  ¥<Text className="price">{sublie(listData.price) + '.'}</Text>
                  <Text className="small-Price">
                    {subAfter(listData.price)}
                  </Text>
                </Text>
                {/*  <text class='price'>¥{{listData.price}}</text>  */}
              </View>
              <View className="medicine_info_bottom">
                <Text className="medicine_standard">{listData.standard}</Text>
                <View style="flex:1"></View>
                <Text className="qty">{'x' + listData.quantity}</Text>
              </View>
            </View>
            <View></View>
          </View>
        )
    }
}

export default YFWOrderListItemComponent