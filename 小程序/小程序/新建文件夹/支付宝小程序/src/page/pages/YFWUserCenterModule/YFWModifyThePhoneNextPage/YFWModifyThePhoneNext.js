import { Block, View, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { is_phone_number } from '../../../../utils/YFWPublicFunction.js'
import { UserCenterApi } from '../../../../apis/index.js'
import './YFWModifyThePhoneNext.scss'
const userCenterApi = new UserCenterApi()
let oldermobile = ''

export default class YFWModifyThePhoneNext extends Taro.Component {
    constructor(props) {
        super(props)
        this.state = {
            phoneNum: '',
            yzmNum: '',
            disabled: false,
            getYZMCode: '获取验证码'
        }
    }

    componentWillMount() {
        let options = this.$router.params
        oldermobile = options.oldermobile
        console.log(oldermobile)
    }

    phone_num = e => {
        let num = e.currentTarget.dataset.name
        this.setState({
            [num]: e.detail.value.replace(/\s+/g, ''), //去除空格
            phoneNum: e.detail.value
        })
    }

    yzm_num = e => {
        let num = e.currentTarget.dataset.name
        this.setState({
            [num]: e.detail.value.replace(/\s+/g, ''),
            yzmNum: e.detail.value
        })
    }

    getCode = res => {
        // let that = this
        if (this.state.phoneNum == '') {
            Taro.showToast({
                title: '手机号不能为空',
                icon: 'none',
                duration: 800
            })
            return
        } else if (!is_phone_number(this.state.phoneNum)) {
            Taro.showToast({
                title: '请输入正确的手机号',
                icon: 'none',
                duration: 800
            })
            return
        }
        //发请求同时 更改倒计时ui
        userCenterApi.getNewMobileSMSCode(this.state.phoneNum).then(
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

    commit = e => {
        userCenterApi
            .updateUserMobile(this.state.phoneNum, this.state.yzmNum, oldermobile)
            .then(
                res => {
                    Taro.navigateBack({
                        delta: 2
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

    render() {
        const { disabled, getYZMCode } = this.state
        return (
            <Block>
                <View className="container-phone">
                    <Input
                        className="confirm-code"
                        placeholderClass="placeholder-code"
                        type="number"
                        data-name="phone"
                        onInput={this.phone_num}
                        placeholder="请输入手机号"
                        maxlength="11"
                    ></Input>
                </View>
                <View className="container">
                    <View className="divLine"></View>
                </View>
                <View className="container-yzm">
                    <Input
                        className="confirm-code"
                        placeholderClass="placeholder-code"
                        type="number"
                        data-name="yzm"
                        onInput={this.yzm_num}
                        placeholder="请输入验证码"
                        maxlength="6"
                    ></Input>
                    <View className="get_Code">
                        <View
                            className="get-Code_ol"
                            disabled={disabled}
                            onClick={this.getCode}>
                            {getYZMCode}
                        </View>
                    </View>
                </View>
                <View className="container">
                    <View className="divLine"></View>
                </View>
                <View className="btnBtom">
                    <View className="address-add" onClick={this.commit}>确定</View>
                </View>
            </Block>
        )
    }
}