import Taro from '@tarojs/taro';
import { Component } from "react"
import { View, Text, Button, ScrollView, Image } from '@tarojs/components';
import { AtInput, AtTextarea } from 'taro-ui';
import { connect } from "react-redux";
import { changeState } from "../../store/actions/index";
import { bornYear, getGender, is_phone_number } from "../../utils/YFWPublicFunction";
import DefaultSwitch from '../../components/defalutSwitch/defalutSwitch'
import './shippingAddress.less'
class ShippingAddress extends Component {

    constructor() {
        super()
        this.state = {
            name: "",
            phone: "",
            area: "",
            houseNum: "",
            currentTab: 0,
            tabAs: [{ name: "家" }, { name: "公司" }, { name: "学校" }],
            defaultData:{
                defaultVal: false,
                onColor:"#1fdb9b",
                setDefaultTitle:"设为默认地址",
                setDefaultContent:"（每次下单会默认使用该地址）"
            },
           
            shippingSort: 1
        }
        this.saveName = this.saveName.bind(this)
        this.savePhone = this.savePhone.bind(this)
        this.saveCity = this.saveCity.bind(this)
        this.saveHouseNum = this.saveHouseNum.bind(this)
        this.changeTabs = this.changeTabs.bind(this)
        this.defaultChange = this.defaultChange.bind(this)
        this.onDel = this.onDel.bind(this)
        this.onSave = this.onSave.bind(this)
        this.onSaveAndUse = this.onSaveAndUse.bind(this)
        this.getLocation = this.getLocation.bind(this)
    }
    // 收货人姓名
    saveName(value,event) {
        const {name}=this.state;
        if(!value || name==value){
            return
        }
        this.setState({
            name:value
        })
    }
    //收货人手机号
    savePhone(value,event) {
        const { phone } = this.state;
        if (!value || value == phone) {
            return
        }
        if (is_phone_number(value)) {
            this.setState({
                phone: value
            })
        }
    }
    // 所在地区
    saveCity(value,event) {

    }
    // 详细地址
    saveHouseNum(event,cursor) {
        const {houseNum}=this.state;
        let _val=event.detail.value;
        if(!_val || houseNum==_val){
            return
        }
        this.setState({
            houseNum:_val
        })
    }
    //切换标签
    changeTabs(event) {
        let index = event.currentTarget.dataset.index;
        const { currentTab } = this.state;
        if (currentTab == index) return;
        this.state.currentTab = index;
        this.setState({
            currentTab: index
        })
    }
    //是否设为默认地址
    defaultChange() {
        const { defaultData } = this.state;
        if (defaultData.defaultVal == true) {
            this.state.defaultData.defaultVal = false
        } else {
            this.state.defaultData.defaultVal = true
        }
        this.setState({
            defaultData: this.state.defaultData
        })

    }
    //底部删除
    onDel() {

    }
    //编辑收货地址底部保存
    onSave() {

    }
    //新增收货地址底部保存
    onSaveAndUse() {
        let { changeState } = this.props;
        const { name } = this.state;
        const { phone } = this.state;
        const { area } = this.state;
        const { houseNum } = this.state;
        const { currentTab } = this.state;
        const { defaultVal } = this.state.defaultData;
        changeState({
            shippingInfo: {
                name,
                phone,
                area,
                houseNum,
                currentTab,
                defaultVal
            }
        })
  
       
    }
    //改变头部导航标题
    changeBarTitle() {
        if(this.state.shippingSort==1){
            Taro.setNavigationBarTitle({
                title: '新增收货地址'
            })
        }else{
            Taro.setNavigationBarTitle({
                title: '编辑收货地址'
            })
        }

    }
    //获取地址
    getLocation(){
        Taro.getLocation({
            type: 'wgs84',
            success: function (res) {
              const latitude = res.latitude
              const longitude = res.longitude
              const speed = res.speed
              const accuracy = res.accuracy
            }
            })
    }
    componentWillMount() { 
        this.changeBarTitle();
    }
    componentDidMount() { }
    componentWillUnmount() { }
    componentDidShow() { }
    componentDidHide() { }
    render() {
        const { name, phone, area, houseNum, tabAs, currentTab, defaultData, shippingSort } = this.state;
        return (
            <View className="wrapper">
                <View className="consignee">
                    <View className="consigneeItem">
                        <View className="title">收货人</View>
                        <AtInput
                            name='name'
                            type='text'
                            value={name}
                            placeholder='请填写收货人姓名'
                            className="input"
                            border={false}
                            onBlur={this.saveName}
                        />
                    </View>
                    <View className="consigneeItem">
                        <View className="title">手机号码</View>
                        <AtInput
                            name='phone'
                            type='text'
                            value={phone}
                            placeholder='请填写收货人手机号码'
                            className="input"
                            border={false}
                            onBlur={this.savePhone}
                        />
                    </View>
                    <View className="consigneeItem">
                        <View className="title">所在地区</View>
                        <AtInput
                            name='area'
                            type='text'
                            value={area}
                            placeholder='省市区县、乡镇等'
                            className="input area"
                            border={false}
                            onBlur={this.saveCity}
                        />
                        <View className="location" onClick={this.getLocation}>
                            <Image src={require("../../images/dingweiArea.png")} className="locationIcon"></Image>
                            <Text>定位</Text>
                        </View>
                    </View>
                    <View className="consigneeItem houseItem clearLine">
                        <View className="title" style="line-height:initial">详细地址</View>
                        <AtTextarea
                            count={false}
                            value={houseNum}
                            placeholder='如道路、门牌号、小区、楼栋号、单元室等...'
                            className="txtArea"
                            onBlur={this.saveHouseNum}
                        />
                    </View>
                </View>
                <View className="relation">
                    <View className="relationItem">
                        <View className="title">标签</View>
                        <View className="tabs">
                            {
                                tabAs.map((item, index) => {
                                    return (
                                        <View className={"tabItem " + (index == currentTab ? "onTabItem" : "")} data-index={index} onClick={this.changeTabs}>{item.name}</View>
                                    )
                                })
                            }

                        </View>
                    </View>
                  
                    <DefaultSwitch 
                    data={defaultData}
                    defaultChange={this.defaultChange}
                    ></DefaultSwitch>
                    {
                        shippingSort == 1 ? (
                            <View className="bottomAreaAdd">
                                <View className="saveBtn" onClick={this.onSaveAndUse}>保存</View>
                            </View>
                        ) : (
                            <View className="bottomAreaEdit">
                                <View className="delBtn" onClick={this.onDel}>删除</View>
                                <View className="saveBtn" onClick={this.onSave}>保存</View>
                            </View>
                        )
                    }
                </View>
            </View>
        )
    }
}
export default connect(
    ({ globalData }) => ({ globalData }),
    (dispatch) => ({
        changeState(data) {
            dispatch(changeState(data))
        }
    })
)(ShippingAddress);