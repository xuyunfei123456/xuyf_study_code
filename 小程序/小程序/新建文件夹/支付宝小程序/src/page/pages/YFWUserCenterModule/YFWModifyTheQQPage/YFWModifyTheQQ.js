import { Block, View, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
// pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn.js
import { UserCenterApi } from '../../../../apis/index.js'
import './YFWModifyTheQQ.scss'
const userCenterApi = new UserCenterApi()

class YFWModifyTheQQ extends Taro.Component {
    constructor(props) {
        super(props)
        this.state = {
            userInfoModel: {},
            qq: ''
        }

    }

    bindChange_qq = e => {
        this.setState({ qq: e.detail.value })
    }

    save = () => {
        let qq = this.state.qq
        if (qq.length > 0) {
            userCenterApi.updateUserQQ(qq).then(userInfoModel => {
                Taro.showToast({
                    title: '修改成功',
                    duration: 2000
                })
            })
            Taro.navigateBack({})
        } else {
            Taro.showToast({
                title: '请输入正确QQ号',
                duration: 2000
            })
        }
    }
    config = {
        navigationBarTitleText: '修改QQ',
        navigationBarBackgroundColor: '#49ddb8',
        navigationBarTextStyle: 'white'
    }

    render() {
        const { qq } = this.state
        return (
            <View className="container">
                <View className="container-name">
                    <Input
                        className="newName"
                        value={qq}
                        onInput={this.bindChange_qq}
                        maxLength={14}
                        placeholder="请输入新的QQ号码"
                        type="number"
                    ></Input>
                </View>
                <View onClick={this.save} className="btnBtom">
                    <View className="address-add">保存</View>
                </View>
            </View>
        )
    }
}

export default YFWModifyTheQQ
