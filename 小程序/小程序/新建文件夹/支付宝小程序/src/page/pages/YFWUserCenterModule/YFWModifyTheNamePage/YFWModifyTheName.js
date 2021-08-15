import { Block, View, Text, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn.js
import { UserCenterApi } from '../../../../apis/index.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { set as setGlobalData, get as getGlobalData } from '../../../../global_data'
import './YFWModifyTheName.scss'
const userCenterApi = new UserCenterApi()

class YFWModifyTheName extends Taro.Component {
    config = {
      navigationBarBackgroundColor: '#49ddb8',
      navigationBarTitleText: '实名认证',
      navigationBarTextStyle: 'white'
    }
    state = {
        certification: 0,
        name: '',
        idcard: '',
        result: {},
        userDrugList: [],
        selfCerFlag: false,
        idcardFlag: true,
        testFlag: true,
        knowFlag: false,
        personSelfFlag: false
    }
    componentWillMount(){
        const params = this.$router.params.params
        if(params){
            let _data = params && JSON.parse(params) || {}
            const {certification,name,idcard} = _data;
            if(certification !=1){
              this.requestDataFromServer()
            }else{
              this.setState({
                certification,
                name,
                idcard,
              })
            }
          }else{
            this.state.from = 'other'
            userCenterApi.getUserAccountInfo().then(res=>{
              if(res){
                if(res.dict_bool_certification !=1){
                  this.requestDataFromServer()
                }else{
                  this.setState({
                    certification:res.dict_bool_certification || '',
                    name:res.real_name || '',
                    idcard:res.idcard_no || '',
                  })
                }
      
            }else{
              this.requestDataFromServer()
            }
            })
        }
    }
    componentDidShow(){

    }
    requestDataFromServer (pageIndex=0) {
        var that = this;
        userCenterApi.getUserdrug(pageIndex).then(result => {
          Taro.stopPullDownRefresh();
          if (result.length == 0) { 
            this.setState({
              selfCerFlag:true,
              idcardFlag:false, //不显示  不可编辑身份证号 那一行
              personSelfFlag:false, //不显示顶上  本人认证那一行
            })
          }else{
            let _result = result.map((item,index)=>{
              item.checked = index == 0 ? true:false;
              return item;
            })
            let userDrugList = pageIndex == 0 ? [] : this.state.userDrugList;
            userDrugList = userDrugList.concat(_result)
            this.setState({
              selfCerFlag:false,   //不展示  身份证号 姓名  即展示 用药人列表
              idcardFlag:false,    //不显示  不可编辑身份证号 那一行 
              personSelfFlag:true,  //显示顶上  本人认证那一行 用于切换到本人认证
              userDrugList,
              choosedDrugPersonName:userDrugList[0].real_name,
              choosedDrugPersonIdcard:userDrugList[0].idcard_no,
            })
          }
        }, error => {
          Taro.showToast({
            title: '获取用药人数据失败',
            icon: 'none',
          })
        })
    }
    idcardChange (e) {
    let { value } = e.detail;
    this.setState({
        idcard: value || '',
    })
    }
    nameChange(e){
    let { value } = e.detail;
    this.setState({
        name: value,
    })
    }
    certification(){
    let type = this.state.userDrugList.length == 0 ? 2:1;
    if(type == 2){
        if(!this.state.name){
        Taro.showToast({
            title: "请输入姓名",
            icon: 'none',//图标，支持"success"、"loading" 
            duration: 2000,//提示的延迟时间，单位毫秒，默认：1500 
            mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false 
        })
        return false; 
        }
        let _idcard = this.state.idcard,_testflag = true;
        let idcardReg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
        if (idcardReg.test(_idcard)){
        _testflag = false;
        } 
        if(!this.state.idcard || _testflag){
        Taro.showToast({
            title: "请输入正确的身份证号",
            icon: 'none',//图标，支持"success"、"loading" 
            duration: 2000,//提示的延迟时间，单位毫秒，默认：1500 
            mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false 
        })
        return false; 
        }
    }
    let postName = type == 2 ? this.state.name : this.state.choosedDrugPersonName, postidcard = type == 2 ? this.state.idcard : this.state.choosedDrugPersonIdcard;
    console.log(postName+'===='+postidcard)
    userCenterApi.certification({real_name:postName,idcard_no:postidcard,type,}).then(res=>{
        if(res){
            this.setState({
            knowFlag:true,
            personSelfFlag:false,
            name:postName,
            idcard:postidcard
            })
            let _certificationFlag = getGlobalData('certificationFlag'),
            _certification = getGlobalData('certification');
            setGlobalData('certificationFlag',true)
            etGlobalData('certification',1)
            if(this.state.from == 'other'){
            Taro.navigateBack({})
            }
        }
    },err=>{
        console.log('来自认证的错误信息:'+err.msg)
        Taro.showToast({
        title: err.msg,
        icon: 'none',
        })
    })
    }
    know(){
    this.setState({
        knowFlag:false,
        selfCerFlag:false,
        idcardFlag:true,
        userDrugList:[],
    })
    }
    cilckCircle(e){
    let _id = e.currentTarget.dataset.key,_name ,_idcard;
    let _data = this.state.userDrugList.map(item=>{
        if(item.id == _id){
        _name = item.real_name;
        _idcard = item.idcard_no;
        }
        item.checked = item.id == _id ? true:false; 
        return item;
    })
    this.state.choosedDrugPersonName = _name;
    this.state.choosedDrugPersonIdcard = _idcard;
    this.setState({
        userDrugList:_data
    })
    }
    selfCer(){
    this.setState({
        selfCerFlag:true,
        idcardFlag:false,
        personSelfFlag:false,
        userDrugList:[],
    })
    }
    render() {
      const {
        personSelfFlag,
        selfCerFlag,
        userDrugList,
        name,
        idcard,
        idcardFlag,
        knowFlag
      } = this.state
      return (
        <Block>
          <View className="container">
            {personSelfFlag && (
              <View className="self">
                <Text>实名认证</Text>
                <View className="selfCercition" onClick={this.selfCer}>
                  本人认证
                </View>
              </View>
            )}
            {selfCerFlag && (
              <View className="tip">
                为保证您的账号安全，请完成实名认证，确认此账户是本人使用
              </View>
            )}
            {userDrugList.length != 0 &&(
              <View className="tip">
                如下是已实名的用药人，可直接选择认证，一旦完成则不可更改
              </View>
            )}
            {userDrugList.length == 0  && !selfCerFlag && (
              <View className="name">
                <Text style="padding-left:32rpx">{'姓名：' + name}</Text>
              </View>
            )}
            {idcardFlag && (
              <View className="idcard">
                <Text style="padding-left:32rpx">{'身份证号：' + idcard}</Text>
              </View>
            )}
            {selfCerFlag && (
              <View className="selfCer">
                <View className="customer_left">姓名：</View>
                <View className="item_right">
                  <Input
                    type="text"
                    name="realname"
                    placeholderStyle="placeholdercla"
                    placeholderClass="placeholder"
                    maxlength="10"
                    onBlur={this.nameChange}
                    placeholder="请输入姓名"
                  ></Input>
                </View>
              </View>
            )}
            {selfCerFlag && (
              <View className="selfCer">
                <View className="customer_left">身份证号：</View>
                <View className="item_right">
                  <Input
                    type="number"
                    name="idcard"
                    placeholderStyle="placeholdercla"
                    placeholderClass="placeholder"
                    maxlength="18"
                    onBlur={this.idcardChange}
                    placeholder="请输入18位身份证号码"
                  ></Input>
                </View>
              </View>
            )}
            {userDrugList.length != 0 && (
              <View className="druglist">
                {userDrugList.map((item, data) => {
                  return (
                    <Block key={item.id}>
                      <View className="listWrapper">
                        <Image
                          className="icon-checkbox"
                          onClick={this.cilckCircle}
                          data-key={item.id}
                          src={
                            item.checked
                              ? '/images/icon_choose.png'
                              : '/images/icon_unchoose.png'
                          }
                        ></Image>
                        <View className="listName">{item.real_name}</View>
                        <View className="listsex">
                          {item.dict_sex == 1 ? '男' : '女'}
                        </View>
                        <View className="listCard">{item.idcard_no}</View>
                      </View>
                    </Block>
                  )
                })}
              </View>
            )}
            {(selfCerFlag || userDrugList.length != 0) && (
              <View className="bottom_container">
                <View onClick={this.certification} className="btnBtom">
                  <View className="cer-add">完成认证</View>
                </View>
                <View className="bottom_empty"></View>
              </View>
            )}
          </View>
          {knowFlag && (
            <View className="cer_success">
              <View className="modal">
                <Image
                  src={require('../../../../images/returnTips_close.png')}
                  className="returnTips_close"
                  onClick={this.know}
                ></Image>
                <View className="ver_tip">提示</View>
                <View className="ver_success_text">您已实名认证成功</View>
                <View
                  onClick={this.know}
                  style="width:50%;margin:40px auto"
                  className="btnBtom"
                >
                  <View className="cer-add">确定</View>
                </View>
              </View>
            </View>
          )}
        </Block>
      )
    }
  }
  
  export default YFWModifyTheName
