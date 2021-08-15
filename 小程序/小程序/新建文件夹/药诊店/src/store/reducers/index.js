import { combineReducers } from 'redux'
import { CHANGESTATE } from '../constants/index'

// 定义初始状态
const INITIAL_STATE = {
    name:'视塔',
    latitude:'',
    longitude:'',
    region_id:'95',
    address:'上海市',
    city:'上海市',
    shippingInfo:{
      name:"",
      phone:"",
      area:"",
      houseNum:"",
      currentTab:"",
      defaultVal:""
    },
    inquiryInfo:{
    },
    hasSickInfo:false,
}

function globalData (state = INITIAL_STATE, action) {
    switch (action.type) {  
    case CHANGESTATE:      
      return {
        ...state,
        ...action.data,
      }
    default:
      return state
  }
}

export default combineReducers({
  globalData
})