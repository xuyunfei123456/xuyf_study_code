import { View, Image, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./YFWMedicineNameView.less";
import { safe } from '../../utils/YFWPublicFunction'
export const MedicineNameView = (props) => {
  const { name, medicineType = -1, medicienTypedesc = "", medicineDosageForm = "", medicineStandard = "", color = '#333333', exColor = '#999999', fontSize = 16, exFontSize = 12, fontWeight = "normal", marginLeft = 8, marginTop=3.667,iconWidth = 27.333, lines = 2 } = props;
  let medicien_icon = require('../../images/otc.png')
  if (medicineType === 0) {
    medicien_icon = require('../../images/otc.png')
  } else if (medicineType === 1 || medicineType === 3) {
    medicien_icon = require('../../images/rx.png')
  } else if (medicineType === 2) {
    medicien_icon = require('../../images/rx.png')
  }
  const iconStyle = 'width: ' + iconWidth + 'px;height: 12px;margin-right: 3px;'
  const nameStyle = 'color: ' + color + ';font-size: ' + fontSize + 'px;font-weight: ' + fontWeight + ';'
  const explainStyle = 'color:' + exColor + ';font-size: ' + exFontSize + 'px;'
  const seMarginLeft = 'margin-left:' + marginLeft + 'px;'
  const seMarginTop = 'margin-top:' + marginTop + 'px;'
  return (
    <View className='medicine-name-view'>
      <View style={nameStyle} >{safe(name)}</View>

      <View>
        {medicineType > -1 && <Image
          src={medicien_icon}
          style={iconStyle}
          mode='widthFix'
        />}
        <Text style={explainStyle}>{safe(medicienTypedesc)}</Text>
      </View>
      <View style={explainStyle+seMarginTop}>
        <Text>{medicineDosageForm}</Text>
        <Text style={seMarginLeft}>{medicineStandard}</Text>
      </View>
    </View>
  )
}