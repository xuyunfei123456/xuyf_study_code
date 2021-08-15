import { Block, View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
var app = Taro.getApp()
import { config } from '../../../../config.js'
import { UserCenterApi, UploadImageApi } from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
const uploadImageApi = new UploadImageApi()
import { isLogin, isNotEmpty } from '../../../../utils/YFWPublicFunction.js'
import { pushNavigation } from '../../../../apis/YFWRouting'
import './YFWAccountManagement.scss'

export default class YFWAccountManagement extends Taro.Component {
  constructor(props) {
    super(props)
    this.state = {
      userInfoModel: {},
      text_sex: '',
      intro_image: '',
      evn_type: process.env.TARO_ENV
    }
  }

  componentWillMount() {
    this.getData()
  }

  componentDidShow() {
    if (isLogin()) {
      this.getData()
    }
  }

  /**更换头像 */
  clickPortrait = () => {
    let that = this
    if (process.env.TARO_ENV === 'alipay') {
      Taro.showActionSheet({
        itemList: ['拍照', '手机相册'],
        itemColor: '#167EFB',
        success: function (res) {
          if (res.index != -1) {
            if (res.index === 0) {
              Taro.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['camera'],
                success(res) {
                  uploadImageApi.upload(res.tempFilePaths[0]).then(res => {
                    var introImage = res
                    userCenterApi.updateUserIcon(res).then(res => {
                      Taro.showLoading({
                        title: '修改成功',
                        duration: 2000
                      })
                      if (res) {
                        that.setState({
                          intro_image: config.cdn_url + introImage
                        })
                      }
                    })
                  })
                }
              })
            } else if (res.index == 1) {
              Taro.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album'],
                success(res) {
                  uploadImageApi.upload(res.tempFilePaths[0]).then(res => {
                    var introImage = res
                    userCenterApi.updateUserIcon(res).then(res => {
                      Taro.showToast({
                        title: '修改成功',
                        duration: 2000
                      })
                      if (res) {
                        that.setState({
                          intro_image: config.cdn_url + introImage
                        })
                      }
                    })
                  })
                }
              })
            }
          }
        }
      })
    } else {
      Taro.showActionSheet({
        itemList: ['拍照', '手机相册'],
        itemColor: '#167EFB',
        success: function (res) {
          if (res.tapIndex != -1) {
            if (res.tapIndex === 0) {
              Taro.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['camera'],
                success(res) {
                  uploadImageApi.upload(res.tempFilePaths[0]).then(res => {
                    var introImage = res
                    userCenterApi.updateUserIcon(res).then(res => {
                      Taro.showToast({
                        title: '修改成功',
                        duration: 2000
                      })
                      if (res) {
                        that.setState({
                          intro_image: config.cdn_url + introImage
                        })
                      }
                    })
                  })
                }
              })
            } else if (res.tapIndex == 1) {
              Taro.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album'],
                success(res) {
                  uploadImageApi.upload(res.tempFilePaths[0]).then(res => {
                    var introImage = res
                    userCenterApi.updateUserIcon(res).then(res => {
                      Taro.showToast({
                        title: '修改成功',
                        duration: 2000
                      })
                      if (res) {
                        that.setState({
                          intro_image: config.cdn_url + introImage
                        })
                      }
                    })
                  })
                }
              })
            }
          }
        }
      })
    }
  }

  clickName = () => {
    Taro.navigateTo({
      url: '../YFWModifyTheNamePage/YFWModifyTheName'
    })
  }

  /**更改性别 */
  clickSex = () => {
    let that = this
    Taro.showActionSheet({
      itemList: ['男', '女'],
      itemColor: '#167EFB',
      success: function (res) {
        console.log(res)
        let sex = ''
        if (process.env.TARO_ENV == 'alipay') {
          if (res.index == 1) {
            sex = 0
            that.setState({
              text_sex: '女'
            })

          } else if(res.index == 0) {
            sex = 1
            that.setState({
              text_sex: '男'
            })
          }
        } else {
          if (res.tapIndex == 1) {
            sex = 0
            that.setState({
              text_sex: '女'
            })
          } else if(res.tapIndex == 0) {
            sex = 1
            that.setState({
              text_sex: '男'
            })
          }
        }
       if(isNotEmpty(sex)){
        userCenterApi.updateUserSexInfo(sex).then(
          res => {
            Taro.showToast({
              title: '修改成功',
              duration: 2000,
            })
          },
          err => {
            Taro.showToast({
              title: '修改失败',
              duration: 2000
            })
            Taro.hideLoading()
          }
        )
       }
      }
    })
  }

  /**修改电话号码 */
  clickPhone = () => {
    let userInfoModel = this.state.userInfoModel
    let mobile = userInfoModel.mobile
    let default_mobile = userInfoModel.default_mobile
    Taro.navigateTo({
      url:
        '../YFWModifyThePhonePage/YFWModifyThePhone?mobile=' +
        mobile +
        '&default_mobile=' +
        default_mobile
    })
  }
  /**
   * 实名认证
   */
  certification() {
    let userInfoModel = this.state.userInfoModel
    pushNavigation('get_my_modify_the_name', {
      certification: userInfoModel.dict_bool_certification,
      name: userInfoModel.real_name,
      idcard: userInfoModel.idcard_no
    })
  }
  /**修改qq号 */
  clickQQ = () => {
    Taro.navigateTo({
      url: '../YFWModifyTheQQPage/YFWModifyTheQQ'
    })
  }

  /**获取用户信息 */
  getData = () => {
    userCenterApi.getUserAccountInfo().then(response => {
      if (response.dict_sex == 1) {
        this.setState({
          text_sex: '男'
        })
      } else {
        this.setState({
          text_sex: '女'
        })
      }

      this.setState({
        intro_image: response.intro_image
      })

      this.setState({
        userInfoModel: response
      })
    })
  }
    /**
   * 修改密码
   */
  clickPassword() {
    Taro.navigateTo({
      url: '../YFWChangeThePasswordPage/YFWChangeThePassword'
    })
  }

  config = {
    navigationBarTitleText: '账户信息',
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white'
  }

  render() {
    const { intro_image, userInfoModel, text_sex, evn_type } = this.state
    return (
      <View className="containers">
        <View className="item_view_header" onClick={this.clickPortrait}>
          <Text className="title title_header">头像</Text>
          <Image className="header_img" src={intro_image}></Image>
          <Image
            className="img_next img_next_header"
            src={require('../../../../images/uc_next.png')}
          ></Image>
        </View>
        {/* <View className="item_view" onClick={this.clickName}>
          <Text className="title">真实姓名</Text>
          <Text className={evn_type == 'tt' ? "right_text_tt" : "right_text"}>{userInfoModel.real_name}</Text>
          <Image
            className={process.env.TARO_ENV == 'swan' ? "img_next_swan" : "img_next"}
            src={require('../../../../images/uc_next.png')}
          ></Image>
        </View> */}
        <View className="item_view" onClick={this.clickSex}>
          <Text className="title">性别</Text>
          <Text className={evn_type == 'tt' ? "right_text_tt" : "right_text"}>{text_sex}</Text>
          <Image
            className={process.env.TARO_ENV == 'swan' ? "img_next_swan" : "img_next"}
            src={require('../../../../images/uc_next.png')}
          ></Image>
        </View>
        <View className="separateView"></View>
        <View
          className="item_view"
          onClick={this.certification}
          style="display:flex"
        >
          <Text className="title">实名认证</Text>
          <View className="flexview">
            {userInfoModel.dict_bool_certification == 1 && (<Image
              className="img_prv"
              src={require('../../../../images/certification.png')}
            ></Image>)}
            <Text style="color:#A0A0A0;font-size:25rpx">
              {userInfoModel.dict_bool_certification == 1 ? '已实名' : '未实名'}
            </Text>
            <Image
              className="img_flex_arrow"
              src={require('../../../../images/uc_next.png')}
            ></Image>
          </View>
        </View>
        <View className="separateView"></View>
        <View className="item_view" onClick={this.clickPhone}>
          <Text className="title">手机</Text>
          <Text className={evn_type == 'tt' ? "right_text_tt" : "right_text"}>{userInfoModel.mobile}</Text>
          <Image
            className={process.env.TARO_ENV == 'swan' ? "img_next_swan" : "img_next"}
            src={require('../../../../images/uc_next.png')}
          ></Image>
        </View>
        <View className="item_view" onClick={this.clickQQ}>
          <Text className="title">QQ</Text>
          <Text className={evn_type == 'tt' ? "right_text_tt" : "right_text"}>{userInfoModel.qq}</Text>
          <Image
            className={process.env.TARO_ENV == 'swan' ? "img_next_swan" : "img_next"}
            src={require('../../../../images/uc_next.png')}
          ></Image>
        </View>
        <View className="separateView"></View>
        <View className="item_view" onClick={this.clickPassword}>
          <Text className="title">密码</Text>
          <Text className="right_text">修改密码</Text>
          <Image
            className="img_next"
            src={require('../../../../images/uc_next.png')}
          ></Image>
        </View>
      </View>
    )
  }
}