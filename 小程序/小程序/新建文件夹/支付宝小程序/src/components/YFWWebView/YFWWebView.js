import { Block, WebView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { config } from '../../config'
import './YFWWebView.scss'

class YFWWebView extends Taro.Component {
    constructor(props){
        super(props)
        this.state = {
            path: '',
            share:'',
            name:''
          }
    }

  componentWillMount(options = this.$router.params || {}) {
    if (!options.params) {
      return;
    }
    let dic = typeof(options.params) == 'string' && JSON.parse(options.params) || {}
    if (dic.type == 'receive_h5') {
      let _url = decodeURIComponent(dic.url);
      _url = this.getEnv(_url)
      this.setState({
        path:_url ,
        share: decodeURIComponent(dic.share),
        name:dic.name
      })
      return;
    }
  }
  getEnv(url){
    let env = process.env.TARO_ENV;
    if(url.indexOf('?')!=-1){
      url = `${url}&client=app_${env}`
    }else{
      url = `${url}?client=app_${env}`
    }
    return url;
  }
  onPullDownRefresh = () => {}
  onReachBottom = () => {}
  onShareAppMessage = (options) => {
    let param = {
      type: 'receive_h5',
      url: encodeURIComponent(this.state.share),
    };
    if(process.env.TARO_ENV === 'alipay'){
      let _path = "";
      if(this.state.name  == '签到'){
        _path = 'page/tabBar/YFWHomePage/YFWHome'
      }else{
        _path = 'components/YFWWebView/YFWWebView?params='+JSON.stringify(param) //分享地址
      }
      return {
        title: this.state.name,
        desc: '',
        path: _path

      };
    }else if(process.env.TARO_ENV === 'weapp'){
      return {
        // 'desc': desc, //标题
        title: '分享内容',
        path:
          '/components/YFWWebView/YFWWebView?params=' +
          JSON.stringify({ value: this.state.path }), //分享地址
        success: function(res) {
          // 转发成功
          Taro.showToast({
            title: '转发成功',
            icon: 'success',
            duration: 2000
          })
        },
        fail: function(res) {
          // 转发失败
        }
      }
    }

  }
  onReceiveMessage = msg => {
    console.log(msg)
    Taro.showToast({
      title: JSON.stringify(msg),
      icon: 'none',
      duration: 2000
    })
  }
  config = {}

  render() {
    const { path } = this.state
    return <WebView src={path} onMessage={this.onReceiveMessage}></WebView>
  }
} // components/YFWWebView/YFWWebView.js

export default YFWWebView
