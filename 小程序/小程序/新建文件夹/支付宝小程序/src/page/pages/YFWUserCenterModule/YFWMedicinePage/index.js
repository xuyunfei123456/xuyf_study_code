import { Block, View, ScrollView, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
// pages/address/address.js
import { UserCenterApi } from '../../../../apis/index.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import './index.scss'
const userCenterApi = new UserCenterApi()

class _C extends Taro.Component {
  constructor (props) {
    super(props)
    this.state = {
      userDrugList: [],
      selectEnable: false,
      picUrl: {
        '本人': '../../../../images/drugPerson/myself.png',
        '亲戚': '../../../../images/drugPerson/relative.png',
        '家属': '../../../../images/drugPerson/familys.png',
        '朋友': '../../../../images/drugPerson/friend.png'
      },
      pageIndex: 0,
      loading: false,
      showFoot: 0,
      ktxWindowHeight: '',
      result: {}
    }
}
componentWillMount () { 
  Taro.setNavigationBarTitle({
    title: '用药人'
  })

}
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.setState({
      showFoot: 0,
      pageIndex: 0
    })
    this.requestDataFromServer(0)
  }

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.state.showFoot == 1 || this.state.showFoot == 2) {
      return
    }
    let pageIndex = this.state.pageIndex + 1
    this.setState({
      showFoot: 2,
      pageIndex: pageIndex
    })
    this.requestDataFromServer(pageIndex)
  }
/**选中地址列表 */
clickItemAction(event) {
  if (this.state.selectEnable) {
    let pages = Taro.getCurrentPages()
    let prePage = pages[pages.length - 2]
    prePage.setState({
      selectAddress: event.currentTarget.dataset.info
    })
    Taro.navigateBack({})
  }
}
requestDataFromServer(pageIndex) {
  var that = this
  userCenterApi.getUserdrug(pageIndex).then(
    result => {
      Taro.stopPullDownRefresh()
      if (result.length == 0) {
        userCenterApi.getPersonalInfo().then(result => {
          that.setState({
            result
          })
        })
      }
      let userDrugList = pageIndex == 0 ? [] : this.state.userDrugList
      userDrugList = userDrugList.concat(result)
      that.setState({
        userDrugList,
        showFoot: result.length < 10 ? 1 : 0
      })
    },
    error => {
      Taro.showToast({
        title: '获取数据失败',
        icon: 'none'
      })
    }
  )
}
  //新增用药人
  add() {
    pushNavigation('add_drug', { info: this.state.result, type: 1 })
  }

  //编辑地址
  editUser(e) {
    var id = e.currentTarget.dataset.id
    pushNavigation('add_drug', { id, type: 2 })
  }

  //删除用药人
  deleteUser(e) {
    var id = e.currentTarget.dataset.id
    var that = this
    Taro.showModal({
      title: '是否确定删除该用药人信息',
      content: '',
      success: function(res) {
        if (res.confirm) {
          Taro.showLoading()
          userCenterApi.deleteUser(id).then(res => {
            Taro.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1000
            })
            that.requestDataFromServer(0)
            Taro.hideLoading()
          })
        }
      }
    })
  }
componentDidShow () {
  this.requestDataFromServer(0)
}
componentDidMount () {
  var that = this
  Taro.getSystemInfo({
    success(res) {
      // px转换到rpx的比例
      let pxToRpxScale = 750 / res.windowWidth
      // window的高度
      let ktxWindowHeight = res.windowHeight * pxToRpxScale + 'rpx'
      that.setState({
        ktxWindowHeight
      })
    }
  })
}
  config = {
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '用药人',
    enablePullDownRefresh: true
  }

  render() {
    const { userDrugList, picUrl, showFoot, ktxWindowHeight } = this.state
    return (
      <View className="topwrapper">
        {userDrugList.length != 0 ? (
          <View className="hasInfo">
            <ScrollView className="scroll" scrollY="false">
              {userDrugList.map((item, index) => {
                let  _urlimg="";
                if(item.relation_label =='本人' ){
                   _urlimg = require('../../../../images/drugPerson/myself.png')
                }else if(item.relation_label =='亲戚'){
                  _urlimg = require('../../../../images/drugPerson/relative.png')
                }else if(item.relation_label =='家属'){
                  _urlimg = require('../../../../images/drugPerson/familys.png')
                }else if(item.relation_label =='朋友'){
                  _urlimg = require('../../../../images/drugPerson/friend.png')
                }

                return (
                  <View key={index}>
                    <View
                      onClick={this.clickItemAction}
                      data-info={item}
                      className="container"
                    >
                      <View className="flex">
                        <View className="flex_left">
                          <View className="name">
                            <Text>{item.real_name}</Text>
                          </View>
                          <View className="tags">
                            <View>
                              <Image
                               src={_urlimg}
                                className="tagimg"
                              ></Image>
                            </View>
                            {item.dict_bool_default == 1 && (
                              <View>
                                <Image
                                  src={require('../../../../images/drugPerson/current.png')}
                                  className="tagimg"
                                ></Image>
                              </View>
                            )}
                            {item.dict_bool_certification == 1 ? (
                              <View>
                                <Image
                                  src={require('../../../../images/drugPerson/certify.png')}
                                  className="tagimg"
                                ></Image>
                              </View>
                            ) : (
                              <View>
                                <Image
                                  src={require('../../../../images/drugPerson/uncertify.png')}
                                  className="tagimg"
                                ></Image>
                              </View>
                            )}
                          </View>
                        </View>
                        <View className="flex_right">
                          <View className="operation">
                            <View
                              className="delete"
                              onClick={this.deleteUser}
                              data-id={item.id}
                            >
                              删除
                            </View>
                            <View
                              className="edit"
                              onClick={this.editUser}
                              data-id={item.id}
                            >
                              编辑
                            </View>
                          </View>
                          <View className="faleAndAge">
                            <Image
                              src={require('../../../../images/drugPerson/icon_user.png')}
                              className="seximg"
                            ></Image>
                            <Text className="sex">
                              {item.dict_sex == 1 ? '男' : '女'}
                            </Text>
                            <Text className="age">{item.age + '岁'}</Text>
                          </View>
                          <View className="mobile">
                            <Image
                              src={require('../../../../images/drugPerson/icon_phone.png')}
                              className="mobileimg"
                            ></Image>
                            <Text className="phone">{item.mobile}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                )
              })}
              <View className="foot">
                {showFoot == 1 ? (
                  <Text className="text">没有更多了</Text>
                ) : showFoot == 2 ? (
                  <Text className="text">加载更多...</Text>
                ) : (
                  <Text className="text"></Text>
                )}
              </View>
            </ScrollView>
          </View>
        ) : (
          <View className="noinfo" style={'height:' + ktxWindowHeight}>
            <Image
              className="nodata"
              src={
                'https://c1.yaofangwang.net/common/images/yb-minmap-icons/nouseDrug.png'
              }
            ></Image>
            <View className="imgtext">{'无用药人信息，请添加'}</View>
          </View>
        )}
        <View className="bottom_container">
          <View onClick={this.add} className="btnBtom">
            <View className="address-add">添加用药人</View>
          </View>
          <View className="bottom_empty"></View>
        </View>
      </View>
    )
  }
}

export default _C