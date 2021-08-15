import { Component } from "react";
import { View, Map } from "@tarojs/components";
import Taro from "@tarojs/taro";

import "./map.less";

export default class MapPage extends Component {
  constructor() {
    super();
    this.state = {
      latitude: 31.216134,
      longitude: 121.635174,
      markers: [],
    };
  }
  componentWillMount() {
    let storeInfo = Taro.getStorageSync('storeInfo');
    const {lat,lng,title,logo_image_url} = storeInfo;
    let markers = [{
      id: 1,
      latitude: lat,
      longitude: lng,
      name: title,
      iconPath:logo_image_url,
      width:84,
      height:60
    }];
    this.setState({
      latitude:lat,
      longitude:lng,
      markers,
    })
  }

  componentDidMount() {
    this.mapCtx = wx.createMapContext('myMap')
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    const {latitude,longitude,markers,covers} = this.state;
    return (
      <View class="map">
          <Map
            id="myMap"
            style="width: 100%; height: 100%;"
            latitude={latitude}
            longitude={longitude}
            markers={markers}
            showLocation
          ></Map>
      </View>
    );
  }
}
