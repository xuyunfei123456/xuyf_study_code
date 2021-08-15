import { Block, View, Image, Text, ScrollView } from '@tarojs/components'
import Taro, { Component, Config } from '@tarojs/taro'
var util = require('../../../../utils/util.js')
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { HealthAskApi } from '../../../../apis/index.js'
import { tcpImage, safe, toDecimal } from '../../../../utils/YFWPublicFunction.js'
import { getItemModel } from '../../../../components/GoodsItemView/model/YFWGoodsItemModel.js'
const healthAskApi = new HealthAskApi()
const myhealAsk = new HealthAskApi()
import { YFWHealthAskDetailModel } from './Model/YFWHealthAskDetailModel.js'
import './YFWHealthAskDetail.scss'
import HealthAskAssociationItemView from '../../../../components/YFWHealthAskAssociationItemView/YFWHealthAskAssociationItemView'
import HealthAskQuestionItemView from '../../../../components/YFWHealthAskQuestionItemView/YFWHealthAskQuestionItemView'
import CollectionGoodsItem from '../../../../components/GoodsItemView/CollectionGoodsItem'
class YFWHealthAskDetail extends Taro.Component {
  config = {
    navigationBarTitleText: '问题详情',
  }
  constructor(props){
    super(props)
    this.state = {
      isOpenMore:false,
      delQ: '',
      qutions: '',
      showDocotr: '',
      delarr: [],
      relateProduct: [],
      introImg: [],
      headP: [],
      docImg: '',
      isImgshow: false,
      dataInfo: {
        ask_detail:{
          item_ask_reply:[]
        }
      },
      askReplayId: undefined
    }
  }
  /**
   * 生命周期函数--监听页面加载
   */
  btnMyask() {
    pushNavigation('get_submit_ASK')
  }
  componentWillMount() {
    let params = this.$router.params.params
    let val = (params && JSON.parse(params).value) || ''
    this.infDel(val)
  }
  // 问题详情接口调用
  infDel(myID) {
    Taro.showLoading({
      title: '加载中'
    })
    healthAskApi.getAskDetail(myID).then(res => {
      Taro.hideLoading()
      console.log(res, 'res.infDel')
      if (res.intro_image == '') {
        this.setState({
          isImgshow: false
        })
      } else {
        this.setState({
          isImgshow: true
        })
      }
      let isDelarr = []
      let isHeadP = []
      res.reply_accepted_items.map(item => {
        item.status = 'yi'
        isDelarr.push(item)
        isHeadP.push(tcpImage(item.intro_image))
      })
      res.reply_unaccepted_items.map(item => {
        item.status = 'un'
        isDelarr.push(item)
        isHeadP.push(tcpImage(item.intro_image))
      })
      this.setState({
        dataInfo: YFWHealthAskDetailModel.getModelArray(res),
        qutions: res,
        docImg: res.intro_image
      })
    })
    // 关联产品接口
    healthAskApi.getRecommendGoods(myID).then(res => {
      console.log(res, '关联产品接口')
      let myProduct = []
      myProduct = res.map(info => {
        return getItemModel(info, 'health_medicine_list')
      })
      this.setState({
        relateProduct: myProduct
      })
    })
  }
  //跳转到医师主页
  getDoctor(e) {
    let doctor = e.currentTarget.dataset.item
    let params = {
      doctor: doctor
    }
    pushNavigation('get_ask_pharmacist', params)
  }
  //相关问题
  onReply(e) {
    let dell = e.currentTarget.dataset.item
    let params = {
      dell: dell
    }
    pushNavigation('get_ask_detail', params)
  }
  //查看图片
  imgUrl() {
    Taro.previewImage({
      urls: [this.state.docImg]
    })
  }
  //跳转到医生所在药店
  onHospital(e) {
    let hops = e.currentTarget.dataset.item
    console.log(hops, 'hops')
    let params = {
      value: hops.shop_id
    }
    pushNavigation('get_shop_detail', params)
  }
  //跳转到买药页面
  goBuy(e) {
    let drugs = e.currentTarget.dataset.item
    let params = {
      value: drugs.id
    }
    console.log(drugs, '买药页面')
    pushNavigation('get_shop_goods_detail', params)
  }
  //跳转到搜索页
  goSearch() {
    pushNavigation('get_ASK_Search')
  }
  clickGoodsItemMethod(e) {
    let id = e.currentTarget.dataset.id
    pushNavigation('get_shop_goods_detail', { value: id })
  }
  clickAskAppendButtonMethod(e) {
    let myID = e.currentTarget.dataset.id

    if (e.currentTarget.dataset.item.type == 'submit_ask_questions_append') {
      //追问
      var that = this

      that.state.askReplayId = myID
      that.setState({
        askReplayId: that.state.askReplayId,
        isOpenMore:true,
      })
    } else if (
      e.currentTarget.dataset.item.type.type == 'submit_ask_questions_adopt'
    ) {
      //采纳
      let myID = e.currentTarget.dataset.id
      healthAskApi.acceptReplay(myID).then(res => {
        Taro.showToast({
          title: '采纳成功',
          icon: 'success'
        })
        this.infDel(myID)
      })
    }
  }
  formSubmit(e) {
    let text = e.detail.text
    healthAskApi.insertReplay(this.state.askReplayId, text).then(res => {
      this.infDel(this.state.askReplayId)
    })
  }
  render() {
    const { qutions, docImg, isImgshow, dataInfo, relateProduct,isOpenMore } = this.state
    return (
      <Block>
        <View className="out-skip">
          <HealthAskAssociationItemView
            onFormSubmit={this.formSubmit}
            isOpened={isOpenMore} 
            onClose={() => this.setState({ isOpenMore: false })}
          ></HealthAskAssociationItemView>
          <View className="topView">
            <View className="topSearchView" onClick={this.goSearch}>
              <View className="search_input_view">
                <Image
                  className="search_icon"
                  src={require('../../../../images/search.png')}
                ></Image>
                <Text className="placeholder">请输入疾病或症状</Text>
              </View>
              <View className="search-text">
                <Text>搜索</Text>
              </View>
            </View>
          </View>
        </View>
        {/*  问题  */}
        <View className="top-view">
          <View className="title-view">
            <Image className="title_icon"></Image>
            <Text>{qutions.title}</Text>
            <Image
              className="title_icon1"
              src={require('../../../../images/icon_wen.png')}
            ></Image>
          </View>
          <View className="ask-sex">
            <Image src={qutions.account_intro_image}></Image>
            <Text>{qutions.dict_sex}</Text>
            <Text className="ask-sex-text">{qutions.age}</Text>
            <Text>{qutions.create_time}</Text>
          </View>
          <View className="reply-quey">
            <View>{qutions.description}</View>
            {isImgshow && (
              <Image
                src={docImg}
                mode="widthFix"
                className="hedPort"
                onClick={this.imgUrl}
              ></Image>
            )}
          </View>
        </View>
        <View className="rel-view">
          <View className="relp-view">
            <Image
              className="title_icon"
              src={require('../../../../images/icon_da.png')}
            ></Image>
            <View>
              医生问答
              <Text className="title_ask-text">
                {'（' + dataInfo.ask_detail.item_ask_reply.length + '条回复）'}
              </Text>
            </View>
          </View>
          <View className="line-view"></View>
          {dataInfo.ask_detail.item_ask_reply.length > 0 && (
            <Block>
              {dataInfo.ask_detail.item_ask_reply.map((item, index) => {
                return (
                  <Block>
                    <View className="doctor-ask">
                      <View className="doctor-view">
                        <View className="doctor-item">
                          <Image src={item.intro_image}></Image>
                          <View
                            className="doctor-text"
                            onClick={this.getDoctor}
                            data-item={item}
                          >
                            <Text>{item.account_name}</Text>
                          </View>
                          <View className="doctor-item-view">
                            <Text
                              style={
                                'color:' +
                                (item.type === '药师' ? '#dab96b' : '#ec8028')
                              }
                            >
                              {item.type}
                            </Text>
                          </View>
                          <View
                            className="shop-name"
                            onClick={this.onHospital}
                            data-item={item}
                          >
                            {item.shop_name}
                          </View>
                        </View>
                      </View>
                      <View className="reply_content_detail">{item.desc}</View>
                      {item.relative_goods_item.length > 0 && (
                        <ScrollView
                          scrollX="true"
                          scrollY="false"
                          className="relative-view"
                        >
                          {item.relative_goods_item.map((item, index) => {
                            return (
                              <Block key={index}>
                                <View
                                  className="relative-view-context"
                                  onClick={this.clickGoodsItemMethod}
                                  data-id={item.shop_goods_id}
                                >
                                  <View className="relative-view-context-view">
                                    <Image src={item.image_file}></Image>
                                    <Text className="relative-view-context-text">
                                      {item.name_cn}
                                    </Text>
                                  </View>
                                </View>
                              </Block>
                            )
                          })}
                        </ScrollView>
                      )}
                      {item.item_ask_append.length > 0 && (
                        <View className="append-view">
                          {item.item_ask_append.map((item, index) => {
                            return (
                              <Block key={index}>
                                <View className="append-view-context">
                                  <Text className="append-view-text">
                                    {'追问：' + item.desc}
                                  </Text>
                                  {item.item_ask_appendreply.length > 0 && (
                                    <Block>
                                      {item.item_ask_appendreply.map(
                                        (item, index) => {
                                          return (
                                            <Block key={index}>
                                              <View className="appendreply-view">
                                                {'医生：' + item.desc}
                                              </View>
                                            </Block>
                                          )
                                        }
                                      )}
                                    </Block>
                                  )}
                                </View>
                              </Block>
                            )
                          })}
                        </View>
                      )}
                      {item.buttons.length > 0 ? (
                        <View className="button-view">
                          <View className="button-context">
                            <View
                              className="button-context-view"
                              onClick={this.clickAskAppendButtonMethod}
                              data-item={item.buttons[0]}
                              data-id={item.id}
                              id="AppendButton-view"
                            >
                              <Text>{item.buttons[0].name}</Text>
                            </View>
                            <View
                              className="button-context-view"
                              onClick={this.clickAskAppendButtonMethod}
                              data-item={item.buttons[1]}
                              data-id={item.id}
                            >
                              <Text>{item.buttons[1].name}</Text>
                            </View>
                          
                          </View>
                          <Text className="button-context-text">
                            {item.time}
                          </Text>
                        </View>
                      ) : item.status_id === '3' ? (
                        <View className="button-view">
                          <View className="button-context mag-button">
                            <Image
                              src={require('../../../../images/yfwsk/caina.png')}
                            ></Image>
                            <Text>{item.status}</Text>
                          </View>
                          <Text className="button-context-text">
                            {item.time}
                          </Text>
                        </View>
                      ) : (
                        <View className="button-view justify">
                          <Text className="button-context-text">
                            {item.time}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Block>
                )
              })}
            </Block>
          )}
        </View>
        {/*  相关问题  */}
        <View className="rel-view">
          <View className="rel-title">相关问题</View>
          <View className="botmLine">
            <View></View>
          </View>
          <HealthAskQuestionItemView
            data={dataInfo.item_related}
            froms="pharmacist_ask"
          ></HealthAskQuestionItemView>
        </View>
        {/*  相关产品  */}
        <View className="rel-view">
          <View className="rel-title">相关药品</View>
          <View className="question-swiper-item">
            {relateProduct.map((item, index) => {
              return (
                <Block key={item.id}>
                  <View className="question-content-item">
                    <CollectionGoodsItem
                      data={item}
                      showcar={item.isShowCart}
                    ></CollectionGoodsItem>
                  </View>
                </Block>
              )
            })}
          </View>
        </View>
      </Block>
    )
  }
}

export default YFWHealthAskDetail
