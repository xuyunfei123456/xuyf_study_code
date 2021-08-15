import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { pushNavigation } from '../../../apis/YFWRouting'
import {
    isEmpty, isNotEmpty, isLogin
} from '../../../utils/YFWPublicFunction.js'
class YFWJumpCenter extends Component {

    config = {
        navigationBarTitleText: ''
    }

    componentWillMount () { 
        let options = this.$router.params
        console.log(options)
        if (isEmpty(options.params)) {
            return
        }
        let obj = JSON.parse(options.params)
        console.log(obj)
        obj.value = obj.id;
        if (obj.type == "get_save_photo") {
            obj.value = obj.imgsrc;
        }
        if (isNotEmpty(obj.type)) {
            if (obj.type == "get_share") {
                // this.shareSign(obj)
            } else if (obj.type == "get_coupon_detail") {
                if (isLogin()) {
                    pushNavigation('get_coupon_detail', obj, 'redirect')
                }
            } else {
                pushNavigation(obj.type, obj, 'redirect')
            }
        } else {
        // this._webView.injectJavaScript('window.location.href=\'' + data + '\'');
        }
    }

    componentDidMount () { }

    render () {

        return (
            <Text></Text>
        )
    }
}

export default YFWJumpCenter