import { Block, View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { pushNavigation } from '../apis/YFWRouting'
import './YFWCellItemTmpl.scss'
import { set as setGlobalData, get as getGlobalData } from '../global_data'
export default class CellItemTmpl extends Taro.Component {
  render() {
    const { data: info } = this.props
    return (
        <View className="item_view" onClick={this.clickItem} data-item={info}>
          <Text className="title">{info.title}</Text>
          {info.subtitle && <Text className="right_text">{info.subtitle}</Text>}
          <Image className="img_next" src={require('../images/uc_next.png')}></Image>
        </View>
    )
  }
  logout(){
    Taro.clearStorageSync()
    Taro.reLaunch({
      url: '/page/tabBar/YFWHomePage/YFWHome'
    })
  }
  clickItem = e => {
    let item = e.currentTarget.dataset.item
    switch (item.key) {
      case 'info':
        pushNavigation('get_account_management')
        break
      case 'feedBack':
        pushNavigation('get_feed_back')
        break
      case 'callWe':
        pushNavigation('get_contact_us')
        break
      case 'about':
        pushNavigation('get_about_us')
        break
      case 'safe':
        pushNavigation('get_safe')
        break
      case 'serviceRules':
        pushNavigation('get_h5', {
          value: 'https://m.yaofangwang.com/app/agreement.html?os=miniapp'
        })
        break
      case 'checkRules':
        pushNavigation('get_h5', {
          value: 'https://m.yaofangwang.com/app/check.html?os=miniapp'
        })
        break
      case 'returnRules':
        pushNavigation('get_h5', {
          value: 'https://m.yaofangwang.com/app/exchange.html?os=miniapp'
        })
        break
        case 'privacy':
          pushNavigation('get_h5', {
            value: "https://reg.yaofangwang.com/secrecy.html?os=miniapp"
          })
          break
          case 'returnLogin':
            this.logout();
            break;
    }
  }
}
