import { View ,Image} from "@tarojs/components";
import { Component } from "react";
import Taro from "@tarojs/taro";
import "./navBar.less";

export default class NavBar extends Component {
  constructor() {
    super();
    this.state = {
        navHeight:"",
        navTop:"",
        jnHeight:"",
    };
  }
  componentWillMount() {
    let navBarInfo = Taro.getStorageSync('navBarInfo');
    this.setState({
        ...navBarInfo
    })
  }
  back(){
    Taro.navigateBack();
  }
  render() {
      console.log(this.props,'this.props')
      const {title,textColor,bgColor,back=true} = this.props.data;
      const {navHeight,jnHeight,navTop} = this.state;
    return (
      <View className="navBar" style={`height:${navHeight}px;background-color:${bgColor}`}>
        
        <View
          className="naviTitle"
          style={`padding-top:${navTop}px;height:${jnHeight}px;color:${textColor}`}
        >
          {back && 
          <View className='back-wrapper'>
            <Image className='back' src={require('../../images/right_graypng.png')} onClick={this.back.bind(this)}/>
          </View>
          }
          {title}
        </View>
      </View>
    );
  }
}
