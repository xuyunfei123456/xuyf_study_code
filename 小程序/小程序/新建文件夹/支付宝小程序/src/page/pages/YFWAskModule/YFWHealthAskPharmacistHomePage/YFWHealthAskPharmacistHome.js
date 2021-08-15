import { Block, View, Image, Text } from '@tarojs/components'
import Taro, { Component, Config } from '@tarojs/taro'

var util = require('../../../../utils/util.js')
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { tcpImage } from '../../../../utils/YFWPublicFunction.js'
import { HealthAskApi } from '../../../../apis/index.js'
import YFWMoreModal from '../../../../components/YFWMoreModal/YFWMoreModal'
import './YFWHealthAskPharmacistHome.scss'
const myhealAsk = new HealthAskApi()

class YFWHealthAskPharmacistHome extends Taro.Component {
  config = {
    navigationBarTitleText: '药师主页',
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white',
    onReachBottomDistance: 90
  }
  constructor(props){
    super(props)
    this.state = {
      doctorDel: '',
      docID: '',
      docImg: '',
      pageIndex: 1,
      ansList: [],
      loadhidden: false,
      hidden: false,
      allCount: '',
      isOpenMore:false,
    }
  }
  openUtilityMenu() {
    this.setState({isOpenMore:true})
  }
  /**
   * 生命周期函数--监听页面加载
   */
  componentWillMount(options) {
    let params = this.$router.params.params
    params = (params && JSON.parse(params)) || {}

    let doctor = params.doctor
    this.state.doctorDel = doctor
    this.setState({
      doctorDel: doctor
    })
    console.log(this.state.doctorDel, 'doctorDel')
    this.askData()
    this.ansList()
  }
  // 请求药师信息接口
  askData() {
    Taro.showLoading({
      title: '加载中...'
    })
    myhealAsk
      .getPharmacistInfo(this.state.doctorDel.pharmacist_id + '')
      .then(res => {
        Taro.hideLoading()
        console.log(res, '药师')
        this.setState({
          docID: res,
          docImg: tcpImage(res.intro_image)
        })
      })
  }
  pullOnLoading() {
    this.state.pageIndex++
    this.ansList()
  }
  // 问答列表
  ansList() {
    let pageindex = this.state.pageIndex < 1 ? 1 : this.state.pageIndex
    myhealAsk
      .getPharmacistAnswerList(
        this.state.doctorDel.pharmacist_id + '',
        pageindex
      )
      .then(res => {
        console.log(res, '药师回答')
        this.setState({
          ansList:
            this.state.pageIndex == 1
              ? res.dataList
              : this.state.ansList.concat(res.dataList),
          allCount: res.rowCount
        })
        if (res.dataList.length < 20) {
          this.setState({
            loadhidden: false,
            hidden: true
          })
        } else {
          this.setState({
            loadhidden: false,
            hidden: false
          })
        }
      })
      .then(err => {
        if (err != undefined) {
          this.state.pageIndex--
        } else {
        }
      })
  }
  //跳转到医生所在药店
  onHospital(e) {
    let hops = e.currentTarget.dataset.item
    console.log(hops, 'hops')
    let params = {
      value: hops.storeid
    }
    pushNavigation('get_shop_detail', params)
  }


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.state.hidden) {
      return
    }
    this.setState({
      loadhidden: true
    })

    this.pullOnLoading()
  }
  render() {
    const { docImg, docID, ansList, loadhidden, hidden ,isOpenMore} = this.state
    return (
      <Block>
        <View className="outSkip">
          <YFWMoreModal isOpened={isOpenMore} onClose={() => this.setState({ isOpenMore: false })}></YFWMoreModal>
          <View className="topViewSBotm">
            <View className="iSkip" onClick={this.openUtilityMenu}>
              <Image
                className="YFWMoreModal"
                src={require('../../../../images/more_white.png')}
                mode="aspectFit"
                id="more_image"
              ></Image>
            </View>
          </View>
        </View>
        <View className="bg-whit clearfix title">
          <Image src={docImg} mode="widthFix" className="hedPort"></Image>
          <View className="telRght">
            <View className="isname clearfix">
              <View className="docName aaqDel">{docID.name}</View>
              <View className="docProfe aaqDel">{docID.type}</View>
              <View
                className="hospital aaqDel"
                onClick={this.onHospital}
                data-item={docID}
              >
                {docID.practice_unit}
              </View>
            </View>
            <View className="isQuion clearfix">
              <View className="flt">
                <Image
                  className="inlMidle"
                  src={require('../../../../images/yfwsk/infgreen.png')}
                ></Image>
                <Text className="inlMidle">
                  {'已回复问题:' + docID.reply_count + '条'}
                </Text>
              </View>
              <View className="flt isfltRght">
                <Image
                  className="inlMidle"
                  src={require('../../../../images/yfwsk/caina.png')}
                ></Image>
                <Text className="inlMidle">
                  {'被采纳问题:' + docID.reply_accepted_count + '条'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {/*  热门问题  */}
        <View className="newQAll">
          <View className="newQuestion">
            <View className="newQTel">
              <Text className="newQTxt">全部问题</Text>
              <View className="clearBoth"></View>
            </View>
          </View>
          {/*  热门问题列表  */}
          {ansList.map((item, index) => {
            return (
              <Block key="index" data-item={item}>
                <View className="replyQuey noBorder">
                  <View className="replyOne">{item.title}</View>
                  <View className="replyDel">
                    <Text>回答：</Text>
                    {item.reply_content}
                  </View>
                  <View className="replyTwo replyFex">
                    <View className="replyTime timeRght">
                      {item.create_time}
                    </View>
                  </View>
                </View>
                <View className="borBotm"></View>
                <View className="clear"></View>
              </Block>
            )
          })}
        </View>
        {loadhidden && <View className="nomore">加载中...</View>}
        {hidden && <View className="nomore">没有更多了</View>}
      </Block>
    )
  }
}

export default YFWHealthAskPharmacistHome
