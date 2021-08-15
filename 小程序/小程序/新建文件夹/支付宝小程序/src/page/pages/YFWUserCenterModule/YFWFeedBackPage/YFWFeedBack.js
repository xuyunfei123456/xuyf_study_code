import { Block, View, Textarea, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { UserCenterApi } from '../../../../apis/index.js'
import './YFWFeedBack.scss'
const userCenterApi = new UserCenterApi()
let phoneNum, qq, ssid

export default class YFWFeedBack extends Taro.Component {
    constructor(props) {
        super(props)
        this.state = {
            textarea: ''
        }
    }

    componentWillMount() {
        Taro.setNavigationBarTitle({
            title: '意见反馈'
        })
        this.getUserInfo()
    }

    componentWillUnmount() {
        clearTimeout(this.timer)
    }

    bindChange_name = e => {
        this.setState({ textarea: e.detail.value })
    }

    commit = () => {
        let textarea = this.state.textarea
        if (textarea.length > 0) {
            this.getCommit()
        } else {
            Taro.showToast({
                title: '请填写反馈内容',
                duration: 2000
            })
        }
    }

    getUserInfo = () => {
        userCenterApi.getUserAccountInfo().then(res => {
            phoneNum = res.default_mobile
            qq = res.qq
        })
    }

    getCommit = () => {
        ssid = Taro.getStorageSync('cookieKey')
        userCenterApi.feedBack(phoneNum, qq, ssid).then(res => {
            Taro.showToast({
                title: '反馈成功',
                icon: 'none',
                duration: 500
            })
            this.timer = setTimeout(function () {
                Taro.navigateBack({
                    delta: 1
                })
            }, 400)
        })
    }

    config = {
        navigationBarTitleText: '意见反馈',
        navigationBarBackgroundColor: '#49ddb8',
        navigationBarTextStyle: 'white'
    }

    render() {
        return (
            <View className="container">
                <View className="divLine"></View>
                <View className="opinion-back">
                    <Textarea
                        className={process.env.TARO_ENV == 'alipay' ? "opinion_alipay" : "opinion"}
                        onInput={this.bindChange_name}
                        maxlength="150"
                        placeholder="您的意见对我非常重要，我们会不断的优化和改善，努力为您带来更好的体验，谢谢！"
                        autoHeight="true"
                        placeholderStyle="color:#999"
                        enableNative={false}
                    ></Textarea>
                </View>
                <View onClick={this.commit} className="btnBtom">
                    <View className="address-add">提交</View>
                </View>
            </View>
        )
    }
}