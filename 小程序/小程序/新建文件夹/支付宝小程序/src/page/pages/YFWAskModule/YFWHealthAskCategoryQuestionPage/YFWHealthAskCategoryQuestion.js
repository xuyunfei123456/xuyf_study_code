import Taro, { Component, Config } from '@tarojs/taro'
import {
    Block,
    View,
    Image,
    Text
} from '@tarojs/components'
var util = require('../../../../utils/util.js')

import { HealthAskApi } from '../../../../apis/index.js'
const healthAskApi = new HealthAskApi()
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { YFWHealthAskCategoryQuestionModel } from './Model/YFWHealthAskCategoryQuestionModel.js'
import HealthAskQuestionItemView from '../../../../components/YFWHealthAskQuestionItemView/YFWHealthAskQuestionItemView'
import HealthAskCategory from '../../../../components/YFWHealthAskCategory/YFWHealthAskCategory'
import './YFWHealthAskCategoryQuestion.scss'

class YFWHealthAskCategoryQuestion extends Taro.Component {
  config = {
    navigationBarTitleText: '科室问题',
  }
  constructor(props){
    super(props)
    this.state = {
      loadhidden: false,
      hidden: false,
      classCont: [],
      replyQuey: [],
      showView: false,
      pageIndex: 1,
      pageSize: 10,
      isclassfy: {},
      datasource: {},
      hotCont: {},
      isPageCount: [],
      pageWher: '',
      departmentNamePy: '',
      isOpenMore:false,
    }
  }
  /* 生命周期函数--监听页面加载*/
  componentWillMount(options) {
    let params = this.$router.params.params
    params = (params && JSON.parse(params)) || {}
    let pageHomes = params.pageFrom
    let datasource = params.model
    let classfy = params.selectModel ? params.selectModel : params.model
    Taro.showLoading({
      title: '加载中...',
      icon: 'loading'
    })
    this.setState({
      datasource: datasource, // 选中大科室
      isclassfy: classfy // 选中小科室
    })
    this.state.isclassfy = classfy
    this.state.datasource = datasource
    if (pageHomes === 'healthHome' || pageHomes === 'searchPage') {
      this.requrClass()
      this.ask()
    } else if (pageHomes === 'pageAlldepart') {
      this.classCheck()
      this.ask()
    } else if (pageHomes === 'allOfPage') {
      //科室分类
      healthAskApi.getClassdpart(this.state.departmentNamePy).then(res => {
        this.setState({
          classCont: res
        })
      })
      this.ask()
    }
  }

  classCheck() {
    this.setState({
      classCont: this.state.datasource
    })
    console.log(this.state.classCont, 'classCont')
  }
  itemClick(event) {
    let model = event.context
    this.setState({
      isclassfy: model,
      showView: false
    })
    this.state.isclassfy = model
    this.onRefresh()
  }
  onRefresh() {
    // 下拉刷新
    this.state.pageIndex = 1
    this.ask()
  }
  pullOnLoading() {
    // 上拉加载
    this.state.pageIndex++
    this.ask()
  }

  ask() {
    let py_name = this.state.isclassfy.py_name
      ? this.state.isclassfy.py_name
      : this.state.datasource.py_name
    let pagindex = this.state.pageIndex < 1 ? 1 : this.state.pageIndex

    healthAskApi
      .getListofask(pagindex, this.state.pageSize, py_name)
      .then(res => {
        Taro.hideLoading()
        let replyQuey = YFWHealthAskCategoryQuestionModel.getQuestionArray(
          res.dataList
        )
        this.setState({
          replyQuey:
            this.state.pageIndex === 1
              ? replyQuey
              : this.state.replyQuey.concat(replyQuey),
          isPageCount: res.pageCount
        })
        if (res.dataList.length < 10) {
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
        // 这个方法不管请求成功失败，都会回调，所以必须要加判断
        if (err != undefined) {
          // 这是请求错误
          this.state.pageIndex--
        } else {
          // 这是请求成功
        }
      })
  }
  //获取某科室下的子分类 departmentNamePy 比如 内科==nk
  requrClass() {
    let py_name = this.state.isclassfy.parent_py_name
      ? this.state.isclassfy.parent_py_name
      : this.state.datasource
    healthAskApi.getClassdpart(py_name).then(res => {
      console.log(res, 'Bigdatasource')
      this.setState({
        classCont: res
      })
    })
  }
  onChangeShowState() {
    this.setState({
      showView: !this.state.showView,
      isOpenMore:!this.state.isOpenMore,
    })
  }
  // 某个问题详情
  replyQuey(e) {
    let dell = e.currentTarget.dataset.item
    let params = {
      dell: dell
    }
    pushNavigation('get_ask_detail', params)
  }
  toAskQuestion() {
    pushNavigation('get_submit_ASK')
  }
  btnMyQA() {
    pushNavigation('get_myASK')
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
    const {
      classCont,
      showView,
      isclassfy,
      replyQuey,
      loadhidden,
      hidden,
      isOpenMore
    } = this.state
    return (
      <Block>
        <View className="outSkip">
            <HealthAskCategory
              isOpened={isOpenMore}
              data={classCont.items}
              onItemClick={this.itemClick.bind(this)}
              onClose={() => this.setState({ isOpenMore: false })}
            ></HealthAskCategory>
          <View className="top-view">
            <View className="officeTop">
              <View
                className={'hide' + (showView ? '' : 'show') + ' btnCol'}
                onClick={this.onChangeShowState}
                id="category_view"
              >
                <Text className="inlMidle">{isclassfy.department_name}</Text>
                <Image
                  src={require('../../../../images/arrow_up.png')}
                  className="mrOn inlMidle"
                  mode="widthFix"
                ></Image>
              </View>
              <View
                className={'hide' + (showView ? 'show' : '') + ' btnCol'}
                onClick={this.onChangeShowState}
              >
                <Text className="inlMidle">{isclassfy.department_name}</Text>
                <Image
                  src={require('../../../../images/arrow_down.png')}
                  className="mrOn inlMidle"
                  mode="widthFix"
                ></Image>
              </View>
            </View>
            <View className="right-ask" onClick={this.toAskQuestion}>
              提问
            </View>
          </View>
        </View>
        <View>
          <View className="newQAll newMargin">
            <HealthAskQuestionItemView
              data={replyQuey}
            ></HealthAskQuestionItemView>
          </View>
          {loadhidden && <View className="no-more">加载中...</View>}
          {hidden && <View className="no-more">没有更多了</View>}
          <View className="bottom-button">
            <View className="bottom-button-line"></View>
            <View className="bottom-button-context">
              <View className="bottom-button-view" onClick={this.toAskQuestion}>
                <Image src={require('../../../../images/yfwsk/wenda.png')}></Image>
                <Text>问答</Text>
              </View>
              <View className="bottom-button-view" onClick={this.btnMyQA}>
                <Image
                  src={require('../../../../images/yfwsk/health_mine.png')}
                ></Image>
                <Text>我的</Text>
              </View>
            </View>
          </View>
        </View>
      </Block>
    )
  }
}

export default YFWHealthAskCategoryQuestion
