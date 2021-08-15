import { Block, View, Input, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { UserCenterApi } from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
import { isNotEmpty, safe, is_phone_number } from '../../../../utils/YFWPublicFunction.js'
import './YFWModifyThePhone.scss'

export default class YFWModifyThePhone extends Taro.Component {
    constructor(props) {
        super(props)
        this.state = {
            userInfoModel: {},
            mobile: '',
            phone: '',
            disabled: false,
            getYZMCode: '获取验证码',
            yzmNum: ''
        }
    }

    componentWillMount(options = this.$router.params || {}) {
        let that = this
        let mobile = options.mobile
        let default_mobile = options.default_mobile
        if (isNotEmpty(mobile)) {
            that.setState({
                mobile: mobile,
                phone: default_mobile
            })
        }
    }

    yzm_num = e => {
        var num = e.currentTarget.dataset.name
        this.setState({
            [num]: e.detail.value.replace(/\s+/g, ''),
            yzmNum: e.detail.value
        })
    }

    getCode = e => {
        if (this.state.phone == '') {
            Taro.showToast({
                title: '手机号不能为空',
                icon: 'none',
                duration: 800
            })
            return
        } else if (!is_phone_number(this.state.phone)) {
            Taro.showToast({
                title: '请输入正确的手机号',
                icon: 'none',
                duration: 800
            })
            return
        }
        //发请求同时 更改倒计时ui
        userCenterApi.getOldMobileSMSCode().then(
            res => {
                this._countdownTimes()
            },
            err => {
                Taro.showToast({
                    title: err.msg,
                    icon: 'none',
                    duration: 500
                })
            }
        )
    }

    _countdownTimes = () => {
        let that = this
        let times = 60
        let i = setInterval(function () {
            times--
            if (times <= 0) {
                that.setState({
                    disabled: false,
                    getYZMCode: '获取验证码'
                })
                clearInterval(i)
            } else {
                that.setState({
                    getYZMCode: '重新获取' + times + 's',
                    disabled: true
                })
            }
        }, 1000)
    }

    commit = () => {
        //跳转到修改手机号
        userCenterApi.verifySMSCode(this.state.yzmNum).then(
            res => {
                Taro.navigateTo({
                    url:
                        '../YFWModifyThePhoneNextPage/YFWModifyThePhoneNext?oldermobile=' +
                        this.state.yzmNum
                })
            },
            err => {
                Taro.showToast({
                    title: err.msg,
                    icon: 'none',
                    duration: 500
                })
            }
        )
    }

    config = {
        navigationBarTitleText: '修改手机号',
        navigationBarBackgroundColor: '#49ddb8',
        navigationBarTextStyle: 'white'
    }

    render() {
        const { mobile, yzm, getYZMCode } = this.state
        return (
            <Block>
                <View className="confirm">{'已认证手机: ' + mobile}</View>
                <View className="container-name">
                    <Input
                        className="confirm-code"
                        value={yzm}
                        data-name="yzm"
                        type="number"
                        onInput={this.yzm_num}
                        placeholder="请输入验证码"
                        maxlength="6"
                    ></Input>
                    <View className="get_line">
                        <Text className="get-Code_sl">|</Text>
                    </View>
                    <View className="get_Code" onClick={this.getCode}>
                        <Text className="get-Code_ol">{getYZMCode}</Text>
                    </View>
                </View>
                <View className="container">
                    <View className="divLine"></View>
                </View>
                <View className="row">
                    <Text className="row-sl">若原手机已停用，请联系商城客服修改</Text>
                </View>
                <View onClick={this.commit} className="btnBtom">
                    <View className="address-add">提交</View>
                </View>
            </Block>
        )
    }
}