import { Block, View, Image } from '@tarojs/components'
import Taro, {Component} from '@tarojs/taro'
import './YFWRefreshView.scss'
let lastY = 0
const PULL_DEFAULT = -1 //默认
const PULL_LT_HEIGHT = 1 //下拉小于高度
const PULL_GT_HEIGHT = 2 //下拉大于高度
const PULL_REFRESHING = 0 //刷新中
let platform = 'ios',
  scale = (375 / Taro.getSystemInfoSync().windowWidth) * 2

export default class YFWRefreshView extends Component {
    config = {
        component: true,
        disableScroll: true
    }
    constructor (props) {
        super (...arguments)
        const { isRefresh } = props
        this.state = {
            _isRefresh: isRefresh,
            pullState: PULL_DEFAULT, // 刷新状态 -1:默认  1:开始下拉  2: 达到下拉最大距离  0: 正在刷新 
            dynamicHeight: 0, //刷新布局动态高度
            refreshHeight: 150, //触发刷新的最小高度
            scrollTop: 0
        }
    }

    componentDidMount() {
        platform = Taro.getSystemInfoSync().platform
        scale = Taro.getSystemInfoSync().windowWidth / 375 * 2
    }

    componentWillReceiveProps (nextProps) {
      const { isRefresh } = nextProps
      const { _isRefresh } = this.state
  
      // if (_isRefresh !== isRefresh) {
      //   this.setState({
      //     pullState: PULL_DEFAULT,
      //     dynamicHeight: 0
      //   }, () => {
      //     Taro.pageScrollTo({ scrollTop: 0, duration: 0 })
      //   })
      // }
    }
    //停止刷新
    stopPullRefresh() {
        // this._pullStateChange(PULL_DEFAULT, 0)
        console.log('停止刷新')
        this.setState({
          pullState: PULL_DEFAULT,
          dynamicHeight: 0
        }, () => {
          Taro.pageScrollTo({ scrollTop: 0, duration: 0 })
        })
  
    }

    //是否正在刷新
    isRefreshing() {
        return PULL_REFRESHING == this.state.pullState
    }

    //是否下拉状态
    isPullState() {
        return PULL_DEFAULT != this.state.pullState
    }
    //页面触摸开始事件，必须在触摸开始方法中调用此方法

    handletouchstart(event) {
      console.log('触摸开始')
        lastY = event.touches[0].clientY
    }

    //页面触摸移动事件，必须在触摸开始方法中调用此方法
    handletouchmove(event) {
        console.log('触摸移动')
        let clientY = event.touches[0].clientY
        let offsetY = clientY - lastY
        if (this.state.scrollTop > 0 || offsetY < 0) return
        // if (0 == this.state.pullState) return
        let dynamicHeight = this.state.dynamicHeight + offsetY
        if (dynamicHeight > this.state.refreshHeight) {
          this._pullStateChange((0 == this.state.pullState) ? 0 : PULL_GT_HEIGHT, dynamicHeight)
        } else {
          dynamicHeight = dynamicHeight < 0 ? 0 : dynamicHeight //如果动态高度小于0处理
          this._pullStateChange((0 == this.state.pullState) ? 0 : PULL_LT_HEIGHT, dynamicHeight)
        }
        lastY = event.touches[0].clientY
    }

    //页面触摸结束事件，必须在触摸开始方法中调用此方法
    handletouchend(event) {
      console.log('结束')
        let refreshHeight = this.state.refreshHeight
        if (0 == this.state.pullState) {
          this._pullStateChange(PULL_REFRESHING, refreshHeight)
          return
        }
        let dynamicHeight = this.state.dynamicHeight
        if (this.state.scrollTop > 0 && PULL_DEFAULT != this.state.pullState) {
          // let top = this.state.scrollTop / Taro.getSystemInfoSync().windowWidth * 20
          //2 * this.state.scrollTop 两倍表示px转rpx，  所以这里必须进行单位转换
          if (dynamicHeight - scale * this.state.scrollTop > refreshHeight) {
            this._pullStateChange(PULL_REFRESHING, refreshHeight)
            //刷新事件 回调出去
            if(this.props.onRefresh){
              this.props.onRefresh("Refresh")
            }
          } else {
            this._pullStateChange(PULL_DEFAULT, 0)
            Taro.pageScrollTo({ scrollTop: 0, duration: 0 })
          }
          return
        }
        if (dynamicHeight >= this.state.refreshHeight) {
          this._pullStateChange(PULL_REFRESHING, refreshHeight)
          //刷新事件 回调出去
          if(this.props.onRefresh){
            this.props.onRefresh("Refresh")
          }
        } else {
          this._pullStateChange(PULL_DEFAULT, 0)
        }
    }

    //页面触摸取消事件，必须在触摸开始方法中调用此方法
    handletouchcancel(event) {
      console.log('取消')
        this._pullStateChange(PULL_DEFAULT, 0)
    }
    //下拉状态监听
    _pullStateChange(states, dynamicHeight) {
        this.setState({ pullState: states, dynamicHeight: dynamicHeight })
    }

    //页面滚动
    onPageScroll(event) {
        console.log('页面滚动')
        if (event.scrollTop > 0 && PULL_DEFAULT != this.state.pullState) {
          //2 * this.state.scrollTop 两倍表示px转rpx，  所以这里必须进行单位转换
          if (this.state.dynamicHeight - scale * event.scrollTop < this.state.refreshHeight) {
            this.setState({
              pullState: PULL_LT_HEIGHT
            })
          } else {
            this.setState({
              pullState: PULL_GT_HEIGHT
            })
          }
        }
        this.state.scrollTop = event.scrollTop
    }

    //是否是安卓平台
    _isAndriod() {
        return 'ios' == platform
    }
    render() {
        const { dynamicHeight, refreshHeight } = this.state
        return (
            <View
                style={'height:' + dynamicHeight + 'rpx;position: relative;'}
                className="refresh-container"
            >
                <View
                className="refresh-layout"
                style={'height:' + refreshHeight + 'rpx;'}
                >
                    <Image
                        className="loading_cycle"
                        src={require('../../images/loading_cycle.gif')}
                    ></Image>
                </View>
                <Image
                className="bg_image"
                src={require('../../images/loading_bg.png')}
                ></Image>
            </View>
        )
    }

}

YFWRefreshView.defaultProps = {
  isRefresh:true,
  onRefresh: null
}