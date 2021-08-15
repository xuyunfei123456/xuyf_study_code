import Taro, { Component } from '@tarojs/taro';
import { 
  View,
  ScrollView,
  Swiper,
  SwiperItem,
  Text,
  Button,
  Image
} from '@tarojs/components';

import { GoodsDetailApi } from '../../../../apis/index'
import FooterRefresh from '../../../../components/YFWFooterRefresh/YFWFooterRefresh'

import './YFWGoodsAllComments.scss'
import { 
  isNotEmpty,
} from '../../../../utils/YFWPublicFunction.js'

const commentApi = new GoodsDetailApi()

export default class YFWGoodsAllComments extends Component {

  config = {
    navigationBarTitleText: '全部评论',
    enablePullDownRefresh: true
  }

  constructor (props) {
    super(props)

    this.state = {
      storeId: 0,
      refreshStatus: 'hidden',
      pageIndex: 1,
      datasource: []
    }
  }

  componentWillMount() {
    const params = this.$router.params.params
    if (isNotEmpty(params)) {
      const value = JSON.parse(decodeURIComponent(params))
      this.state.storeId = value.shopId || 0 
    }
    this.moreData = true
    this.loading = false

    this.fetchData()
  }

  /** 下拉刷新 */
  onPullDownRefresh() {
    this.state.pageIndex = 1
    this.moreData = true

    this.fetchData(true)
  }

  /** 触底刷新 */
  onReachBottom() {
    this.state.pageIndex++
    this.fetchData()
  }

  /** 
   * 获取数据
   *  @param isPull 是否是下拉刷新
   */
  fetchData(isPull) {
    const { storeId } = this.state
    const { pageIndex } = this.state

    if (storeId === 0 || this.loading === true || this.moreData === false) {
      return
    } 

    this.loading = true
    this.setState({
      refreshStatus: 'loading'
    })

    commentApi.getEvaluationList(storeId, pageIndex).then((response) => {

      const list = response.dataList || []
      let { datasource } = this.state

      if (pageIndex === 1) {
        datasource = list
      } else {
        datasource = datasource.concat(list)
      }

      if (isPull) {
        Taro.stopPullDownRefresh()
      } 
      this.loading = false
      let _status = 'hidden'
      if (list.length < 20) {
        _status = 'nomore'
        this.moreData = false
      }

      this.setState({
        datasource: datasource,
        refreshStatus: _status
      })
    }, (error) => {
      if (isPull) {
        Taro.stopPullDownRefresh()
      }

      if (pageIndex > 1) {
        this.state.pageIndex--
      }

      this.loading = false
      this.setState({
        refreshStatus: 'hidden'
      })
    })
  }

  render() {
    const { datasource } = this.state
    const { refreshStatus } = this.state

    return(
      <View className='comment'>
        {datasource.map((comment, commentIndex) => {
          return(
            <View className='comment-item' key={commentIndex.toString()}>
              <View className='comment-row'>
                <Image className='comment-image' src={comment.intro_image} />
                <Text className='comment-name'>{comment.account_name}</Text>
                <Text className='comment-time'>{comment.create_time}</Text>
              </View>
              <Text className='comment-content'>{comment.content}</Text>
            </View>
          )
        })}
        <FooterRefresh status={refreshStatus} />
      </View>
    )
  }
}