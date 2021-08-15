import Taro, { Component } from '@tarojs/taro'
import { 
  View, 
  Image,
  Text
} from '@tarojs/components'
import './YFWMedicineNameView.scss'
import { safe } from '../../utils/YFWPublicFunction'

export default  class YFWMedicineNameView extends Component {

  config = {
    component: true
  }

  static defaultProps = {
    name: '',
    medicineType: -1, // 药品类型：0 OTC，1、3 单轨 2 双轨 -1 其他
    color: '#333333',
    fontSize: 30,
    fontWeight: 'normal',
    iconWidth: 55,
    lines: 2
  }

  render () {
    const { name } = this.props
    const { medicineType } = this.props
    const { color } = this.props
    const { fontSize } = this.props
    const { fontWeight } = this.props
    const { iconWidth } = this.props

    let medicien_icon = require('../../images/ic_OTC.png')
    if (medicineType === 0) {
      medicien_icon = require('../../images/ic_OTC.png')
    } else if (medicineType === 1 || medicineType === 3) {
      medicien_icon = require('../../images/ic_drug_track_label.png')
    }else if (medicineType === 2) {
      medicien_icon = require('../../images/ic_drug_track_label.png')
    }

    const iconStyle = 'width: ' + iconWidth + 'rpx;height: 24rpx;margin-right: 7rpx;'
    const nameStyle = 'color: '+color+';font-size: '+fontSize+'rpx;font-weight: '+fontWeight+';'

    return (
      <View className='medicine-name-view'>
        {medicineType > -1 && <Image 
          src={medicien_icon} 
          style={iconStyle} 
          mode='widthFix' 
        />}
        <Text style={nameStyle} >{safe(name)}</Text>
      </View>
    )
  }
}