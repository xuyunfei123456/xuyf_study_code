import { Block, Image, ScrollView, View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { UserCenterApi } from '../../../../apis/index.js'
import './YFWAddressList.scss'
const userCenterApi = new UserCenterApi()

export default class YFWAddressList extends Taro.Component {
  constructor(props) {
    super(props)
    this.state = {
      addressList: [],
      selectEnable: false,
      isEdit: false
    }
  }

  /**结算选择地址 */
  clickItemAction = event => {
    if (!this.state.isEdit) {
      if (this.state.selectEnable) {
        let pages = Taro.getCurrentPages()
        let prePage = pages[pages.length - 2]
        prePage.$component.setState({
          selectAddress: event.currentTarget.dataset.info
        })
        Taro.navigateBack({})
      }
    }
    this.state.isEdit = !this.state.isEdit
  }

  componentWillMount() {
    let options = this.$router.params
    let params = options.params
    if (params) {
      let info = JSON.parse(params)
      this.state.selectEnable = info.selectEnable
    }
    Taro.setNavigationBarTitle({
      title: '收货地址'
    })
    this.requestDataFromServer()
  }

  componentDidShow() {
    this.requestDataFromServer()
  }

  //获取地址列表信息
  requestDataFromServer = () => {
    userCenterApi.getAddress().then(addressLists => {
      this.setState({
        addressList: addressLists
      })
    })
  }

  /**新增地址 */
  add = () => {
    Taro.navigateTo({
      url: '../YFWAddressPage/YFWAddress'
    })
  }

  /**编辑地址 */
  edit = e => {
    e.stopPropagation() //防止冒泡
    this.setState({
      isEdit: true
    })
    let address_id = e.currentTarget.dataset.address_id
    Taro.navigateTo({
      url: '../YFWAddressPage/YFWAddress?address_id=' + address_id
    })
  }

  /**删除地址 */
  delete = e => {
    e.stopPropagation() //防止冒泡
    this.setState({
      isEdit: true
    })
    let addressID = e.currentTarget.dataset.address_id
    let that = this
    Taro.showModal({
      title: '确认删除地址',
      cancelText: '取消',
      confirmText: '确定',
      content: '',
      success: function (res) {
        if (res.confirm) {
          Taro.showLoading()
          userCenterApi.delectAddress(addressID).then(res => {
            Taro.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1000
            })
            that.requestDataFromServer()
            Taro.hideLoading()
          })
        }
      }
    })
  }

  config = {
    disableScroll: false,
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '收货地址'
  }

  render() {
    const { addressList } = this.state
    return (
      <View className='top_bgs'>
        <Image
          className="top_bg"
          src="https://c1.yaofangwang.net/common/images/miniapp/dingdan_bj.png"
        ></Image>
        <ScrollView className="scroll" scrollY="true">
          {addressList.map((item, index) => {
            return (
              <View
                onClick={this.clickItemAction}
                data-info={item}
                style={index == 0 ? 'margin-top:50px;' : ''}
                className="container">
                <View className="container-top">
                  <View className="container-name">{item.name}</View>
                  <View className="container-phone">{item.mobile}</View>
                </View>
                <View className="container-detail">
                  {item.dict_bool_default == 1 && (
                    <Text className={process.env.TARO_ENV == 'alipay' ? "container-default-alipay" : "container-default"}>默认</Text>
                  )}
                  <View className={process.env.TARO_ENV == 'alipay' ? "container-address-alipay" : "container-address"}>
                    {(item.dict_bool_default == 1 ? ' ' : '') +
                      item.address_name}
                  </View>
                </View>
                <View className="button_parent">
                  <Text
                    className="action edite"
                    onClick={this.edit}
                    data-address_id={item.id}
                  >
                    编辑
                    </Text>
                  <Text
                    className="action delete"
                    onClick={this.delete.bind(this)}
                    data-address_id={item.id}
                  >
                    删除
                    </Text>
                </View>
              </View>
            )
          })}
        </ScrollView>
        <View className="bottom_container">
          <View onClick={this.add} className="btnBtom">
            <View className="address-add">+新建地址</View>
          </View>
          <View className="bottom_empty"></View>
        </View>
      </View>
    )
  }
}