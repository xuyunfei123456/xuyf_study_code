// pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn.js
var util = require('../../../../utils/util.js')

import {
  UserCenterApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()

var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab:[
      {
        name:'全部',
        value:'0',
        type:''
      },      {
        name:'收入',
        value:'1',
        type:'1'
      },      {
        name:'支出',
        value:'2',
        type:'0'
      },      {
        name:'冻结',
        value:'3',
        type:'2'
      },
    ],
    activeindex:0,
    data:[],
    point_type:'',
    pageIndex:1,
    lock_point:'',
    valid_point:0,
    scrollHieght:null,
    getMore:2,
    noMore:2,
    nodata:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _height = wx.getSystemInfoSync().windowHeight;
    this.setData({
      scrollHieght:(_height-235)*2+'rpx'
    })
    this.getData();
  },
  tabClick(e){
    const { value,type } = e.currentTarget.dataset.item;
    if(type == this.data.point_type){
      return;
    }
    this.data.pageIndex = 1;
    this.data.data = [];
    this.data.point_type = type;
    this.setData({
      activeindex:value,
      point_type:type,
      data:[],
      noMore:2,
      nodata:1,
      getMore:2
    })
    this.getData()
  },
  getData(){
    let _type={}
    if(this.data.point_type !== ''){
      _type.point_type = this.data.point_type
    }
    userCenterApi.rankDetail({
      pageIndex:this.data.pageIndex,   
      pageSize:20,
      conditions:_type
    }).then(res=>{
      if(res){
        if(res.dataList == null && this.data.pageIndex == 1){
          this.setData({
            nodata:2
          })
          return;
        }
        let  _data=[],getMore = 2,noMore=1;
        if(res.dataList && res.dataList!= null){
          _data = res.dataList.map(item=>{
            item.time = item.create_time.substring(0,10);
            item._color = item.point_num>0 ? 'green':'red';
            item._rank = item.point_num>0 ? '+'+item.point_num:item.point_num
            return item;
          })
          if(res.dataList.length>=20){
            getMore = 1;
            noMore = 2;
          }
        }
        this.setData({
          lock_point:res.lock_point || 0,
          valid_point :res.valid_point  || 0,
          data:this.data.data.concat(_data),
          getMore,
          noMore,
        })
      }
    },err=>{})
  },
  requestNextPage(){
    this.data.pageIndex++;
    this.getData();
  }
})