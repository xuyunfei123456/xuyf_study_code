import { Block, View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn.js
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import TitleView from '../../../../components/YFWTitleView/YFWTitleView'
import CellItemTmpl from '../../../../imports/CellItemTmpl.js'
import {config} from '../../../../config'
import '../YFWSetPage/YFWSet.scss'

export default class YFWSet extends Taro.Component {
 
  constructor (props){
    super(props)
    this.state = {
      dataInfo: [
        {
          id: 1,
          isShowHeader: false,
          data: [
            {
              id: 1,
              key: 'info',
              title: '账户管理'
            }
          ]
        },
        {
          id: 2,
          title: '关于我们',
          isShowHeader: true,
          data: [
            {
              id: 1,
              key: 'feedBack',
              title: '意见反馈'
            },
            {
              id: 3,
              key: 'callWe',
              title: '联系我们'
            },
            {
              id: 4,
              key: 'about',
              title: '关于我们',
              subtitle: 'v1'+config.app_version
            },
            {
              id: 5,
              key: 'safe',
              title: '安全管理'
            }
          ]
        },
        {
          id: 3,
          title: '协议条款',
          isShowHeader: true,
          data: [
            {
              id: 1,
              key: 'serviceRules',
              title: '服务条款'
            },
            {
              id: 5,
              key: 'privacy',
              title: '隐私政策'
            },
            {
              id: 2,
              key: 'checkRules',
              title: '商品验收标准'
            },
            {
              id: 3,
              key: 'returnRules',
              title: '商品退换货政策'
            },
            // {
            //   id: 4,
            //   key: 'returnLogin',
            //   title: '退出登录',
            // },
          ]
        }
      ]
    }
  }

  config = {
    navigationBarTitleText: '设置',
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white'
  }

  render() {
    const { dataInfo } = this.state
    return (
      <View className="containers">
        {dataInfo.map((info, index) => {
          return (
            <View>
              {info.isShowHeader && (
                <View className="itemview">
                  <TitleView title={info.title} fontWeight="700"></TitleView>
                </View>
              )}
              {info.data.map((secondinfo, secondindex) => {
                return (
                  <View >
                    <CellItemTmpl  data={secondinfo}></CellItemTmpl>
                  </View>
                )
              })}
            </View>
          )
        })}
      </View>
    )
  }
}