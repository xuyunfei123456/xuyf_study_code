import { Component } from 'react'
import { View, ScrollView,Image,Text } from '@tarojs/components'
import { AtButton } from 'taro-ui'

import './addressList.less'

export default class addressList extends Component {
  constructor() {
    super();
    this.state = {

    };
  }
  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    const that = this;
    return (
      <ScrollView className='addressList' scrollY>
        {[1,23,34,1,1].map(item=>{
          return renderAddress(that,'list')
        })}
        <View className="outArea">以下地址超出配送范围</View>
        {[1,23,34].map(item=>{
          return renderAddress(that,'out_area_list')
        })}
      </ScrollView>
    )
  }
}

const renderAddress = (that,type)=>{
  let _color="";
  if(type == 'out_area_list'){
    _color = "#999"
  }
  return (
    <View className="list">
        <View className="listOne">
          {["默认", "家"].map(item => {
                let text_color,
                  bg_color = "";
                  if(type == 'out_area_list'){
                    text_color = "#999";
                    bg_color = "#eee";
                  }else{
                    if (item == "默认") {
                      text_color = "#eb3131";
                      bg_color = "#ffe3e3";
                    } else if (item == "家") {
                      text_color = "#00b187";
                      bg_color = "#e9fff8";
                    }
                  }

                return (
                  <View
                    className="label"
                    style={`background:${bg_color};color:${text_color}`}
                  >
                    {item}
                  </View>
                );
              })}
              <View className="city">上海市</View>
              <View className="country">浦东新区</View>
              <View className="town">康桥镇</View>
        </View>
        <View className="listTwo">
          <View className="listTwo_left" style={`color:${_color}`}>
          康弘路508弄 康桥宝坻 26号201室
          </View>
          <Image className="listTwo_right" src={require('../../images/write_gray.png')}></Image>
        </View>
        <View className="listThree">
          <Text className="name">孙晓峰</Text>
          <Text className="phone">13023199150</Text>
        </View>
    </View>
  )
}
