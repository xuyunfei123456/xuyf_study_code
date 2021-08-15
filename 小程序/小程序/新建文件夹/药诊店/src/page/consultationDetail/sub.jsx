import { Component } from "react";
import { View, Image, Text, ScrollView, Slider } from "@tarojs/components";
import { AtSlider } from "taro-ui";
import "./consultationDetail.less";

export default class ConsultationDetail extends Component {
  constructor() {
    super();
    this.state = {
      playSetinterval:null,
      currentMin:'00',
      currentSec:'00',
      audioValue:0,
      playStatus:2,
    };
  }
  componentWillMount() {
    let that = this;
    if (process.env.TARO_ENV == "weapp") {
      let innerAudioContext = wx.createInnerAudioContext();
      innerAudioContext.autoplay = false;
      innerAudioContext.src = "http://down.kjzhan.com/soft2020/d1/4x.mp3";
      innerAudioContext.play();
      innerAudioContext.pause();
      innerAudioContext.onPlay(()=>{
        console.log("innerAudioContext", innerAudioContext);
        clearInterval(that.state.playSetinterval);
        that.state.playSetinterval = setInterval(()=>{
          let progress,innerAudioContext = that.state.innerAudioContext;
          console.log('e.currentTime',innerAudioContext.currentTime)
          let _tiem = parseInt(innerAudioContext.currentTime)
          if (_tiem != undefined) {
            progress = parseInt(100 * _tiem / innerAudioContext.duration);
          } else {
            progress=0;
          }
          var currentMin = parseInt(_tiem / 60),
          currentSec = parseInt(_tiem % 60);
          if (currentMin.toString().length == 1) {
            currentMin = `0${currentMin}`;
          } else {
            currentMin = `${currentMin}`;
          }
          if (currentSec.toString().length == 1) {
            currentSec = `0${currentSec}`;
          } else {
            currentSec = `${currentSec}`;
          }
          that.setState({
            audioValue:progress,
            currentMin,
            currentSec,
          })
        },1000)
      })
      innerAudioContext.onPause(()=>{
        console.log('pause')
      })
      innerAudioContext.onEnded(()=>{
        setTimeout(()=>{
          clearInterval(that.state.playSetinterval)
          this.setState({
            audioValue:0,
            currentMin:'00',
            currentSec:'00',
            playStatus:2,
          })
        },3000)

      })
      innerAudioContext.onCanplay(() => {
        var durationInterval = setInterval(() => {
          if (innerAudioContext.duration) {
            this.state.duration = innerAudioContext.duration;
            let timeArr = this.transTimeToClock(innerAudioContext.duration)
            that.setState({
              minTime: timeArr[0],
              secTime: timeArr[1]
            });
            clearInterval(durationInterval);
          }
        }, 500);
      });
      innerAudioContext.onError(res => {
        console.log(res.errMsg);
        console.log(res.errCode);
      });
      this.state.innerAudioContext = innerAudioContext;
    }
  }
  transTimeToClock(time){
    let min = parseInt(time / 60),
    sec = parseInt(time % 60);
    //小程序无法使用padstart，采用以下方式补全时间格式
    if (min.toString().length == 1) {
      min = `0${min}`;
    } else {
      min = `${min}`;
    }
    if (sec.toString().length == 1) {
      sec = `0${sec}`;
    } else {
      sec = `${sec}`;
    }
    return [min,sec]
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}
  clickDotContent() {
    this.setState({
      showDot: false
    });
  }
  dotClick() {
    this.setState({
      showDot: !this.state.showDot
    });
  }
  dragAudioSlider(e) {
    if(e.detail.value == 100){
      console.log('拖拽到100')
      this.state.innerAudioContext.stop();
      clearInterval(this.state.playSetinterval)
      this.state.playStatus = 2;
      this.setState({
        currentMin: '00',
        currentSec:'00',
        playStatus:2,
        audioValue:0
      })
      return
    }
    this.setState({
      audioValue: e.detail.value
    });
    let _seek = parseFloat(this.state.duration *e.detail.value/100);
    let timeArr = this.transTimeToClock(_seek);
    this.setState({
      minTime: timeArr[0],
      secTime: timeArr[1]
    });
    this.state.innerAudioContext.seek(_seek)
    this.state.innerAudioContext.play()
  }
  changeStatus() {
    const { playStatus } = this.state;
    if (playStatus == 1) {
      this.state.playStatus = 2;
      this.state.innerAudioContext.pause();
    } else {
      this.state.playStatus = 1;
      this.state.innerAudioContext.play();
    }
    this.setState({
      playStatus: playStatus == 1 ? 2 : 1
    });
  }
  audioChange(){
    clearInterval(this.state.playSetinterval)
    this.state.innerAudioContext.pause();
  }
  render() {
    const { showDot } = this.state;
    let that = this;
    return (
      <View className="consultationDetail">
        <ScrollView className="wrapper" scrollY>
          <View className="status">
            <Image
              className="status_img"
              src={require("../../images/bg_red.png")}
            ></Image>
            <View className="status_text">
              <Image
                className="status_text_pic"
                src={require("../../images/onlineHospital.png")}
              ></Image>
              <View className="status_text_content">诊疗中...</View>
            </View>
          </View>
          <View className="doctor_info">
            <Image
              className="jswz"
              src={require("../../images/jswz.png")}
            ></Image>
            <Image
              className="doctor_ava"
              src={require("../../images/onlineHospital.png")}
            ></Image>
            <View className="doctor_job">
              <View className="doctor_name">
                孙晓峰<Text className="doctor_level">主任医师</Text>
              </View>
              <View className="doctor_company">
                <View className="company_level">三甲</View>
                <View className="doctor_company_name">
                  复旦大学附属华山医院
                  <Text className="doctor_belong">内科</Text>
                </View>
              </View>
            </View>
          </View>
          <View className="consultation_detail">
            <View className="sick flexrow">
              <View className="consultationDetail_item_left">患者</View>
              <View className="sick_right consultationDetail_item_right">
                李蛋 男 55岁
              </View>
            </View>
            <View className="disease flexrow">
              <View className="consultationDetail_item_left">病情病情</View>
              <View className="disease_right consultationDetail_item_right">
                最近喉咙不舒服，干痒，时不时眼睛还有些流眼泪，皮肤有些过敏起皮，后背瘙痒，疑似什么皮炎
              </View>
            </View>
            <View className="picarr flexrow">
              <View className="consultationDetail_item_left"></View>
              <View className="disease_right consultationDetail_item_right">
                {[1, 1, 1, 1, 1].map(item => {
                  return <Image className="rx_pic"></Image>;
                })}
              </View>
            </View>
          </View>
          <View className="order_detail">
            <View className="order_no flexrow">
              <View className="consultationDetail_item_left">问诊单号</View>
              <View className="consultationDetail_item_right">
                <Text>WZD1154498496165564654</Text>
                <Image
                  src={require("../../images/copy.png")}
                  className="copy"
                ></Image>
              </View>
            </View>
            <View className="order_time flexrow">
              <View className="consultationDetail_item_left">下单时间</View>
              <View className="consultationDetail_item_right">
                2020-11-12 18:20:56
              </View>
            </View>
            <View className="pay_mode flexrow">
              <View className="consultationDetail_item_left">支付方式</View>
              <View className="consultationDetail_item_right">支付宝支付</View>
            </View>
            <View className="pay_time flexrow">
              <View className="consultationDetail_item_left">支付时间</View>
              <View className="consultationDetail_item_right">
                2020-11-12 18:21:56
              </View>
            </View>
            <View className="consultation_money flexrow">
              <View className="consultationDetail_item_left">问诊金额</View>
              <View className="consultationDetail_item_right">
                <Text className="money_sumbol">￥</Text>
                <Text className="money_int">12.</Text>
                <Text className="money_float">99</Text>
              </View>
            </View>
            <View className="consultation_coupon flexrow">
              <View className="consultationDetail_item_left">问诊券</View>
              <View className="consultationDetail_item_right">
                <Text className="money_sumbol">-￥</Text>
                <Text className="money_int">12.</Text>
                <Text className="money_float">99</Text>
              </View>
            </View>
            <View className="pay_money">
              <Text className="pay_title">实付金额</Text>
              <Text className="money_sumbol">￥</Text>
              <Text className="money_int">12.</Text>
              <Text className="money_float">99</Text>
            </View>
            <View className="radio flexrow">
              <View className="radio_left">问诊录音</View>
              <View className="radio_right">正在生成，请耐心等待</View>
            </View>
          </View>
          {[1].map(item => {
            return <View className="radio_wrapper">{renderRadio(that)}</View>;
          })}
        </ScrollView>
        <View className="bottom_area">
          <View className="other" onClick={this.dotClick.bind(this)}>
            <Image
              className="dot"
              src={require("../../images/dot.png")}
            ></Image>
            <View
              className="hideBtns_wrapper"
              style={`display:${showDot ? "flex" : "none"}`}
            >
              <View className="hide_btns">
                {["删除"].map(w => {
                  return (
                    <View
                      className="hide_btns_item"
                      onClick={this.clickDotContent.bind(this)}
                    >
                      {w}
                    </View>
                  );
                })}
              </View>
              <View className="arrow"></View>
            </View>
          </View>
          <View className="btns">
            {["再次问诊", "查看处方"].map(item => {
              return <View className="btn">{item}</View>;
            })}
          </View>
        </View>
      </View>
    );
  }
}
const renderRadio = that => {
  const { audioValue, minTime, secTime ,currentMin,currentSec,playStatus} = that.state;
  let playpic = playStatus == 1 ? require('../../images/choosed.png') : require('../../images/close_two.png')
  return (
    <View>
      <View className="radio_content">
        <View className="radio_top">
          <View className="radio_top_left">
            <View className="radio_name">问诊录音</View>
            <View className="radio_time">2020-11-12 18:20:56</View>
          </View>
          <Image
            className="radio_top_right"
            src={playpic}
            onClick={that.changeStatus.bind(that)}
          />
        </View>
      </View>
      <Slider
        onChange={that.dragAudioSlider.bind(that)}
        activeColor="#00b187"
        block-size="12"
        value={audioValue}
        onChanging={that.audioChange.bind(that)}
      />
      <View className="radio_tota_time">
        <View className="radio_tota_time_left">
          {`${currentMin || "00"}:${currentSec || "00"}`}
        </View>
        <View className="radio_tota_time_right">
          {`${minTime || "00"}:${secTime || "00"}`}
        </View>
      </View>
    </View>
  );
};
