import { getFirstLetterPinYin, safeObj, isNotEmpty } from "../../../../utils/YFWPublicFunction";
import {
  OrderApi
} from '../../../../apis/index.js'
const orderApi = new OrderApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataArray: [],
    selectData: {},
    groupArray: [],
    largeListArray: [],
    scrollIntoViewID:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let screenData = options.params&& typeof(options.params) == 'string' && JSON.parse(options.params) || {}
    this.setData({
      selectData: screenData.selectData
    })
    orderApi.getShippingUnitList().then(res => {
      if (isNotEmpty(res)) {
        this.data.dataArray = res
        this.groupDataMethod()
      }
    }, error => {
  
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  itemClickAction: function (e) {
    let item = e.currentTarget.dataset.info
    this.data.selectData = item
    this.setData({
        selectData: this.data.selectData,
    });
    var pages = getCurrentPages()
    pages[pages.length - 2].setData({
      selectLogistics:item
    })
    wx.navigateBack({
      complete: (res) => {},
    })

  },
  /**索引点击 */
  indexesSelectAction: function (e) {
    let item = e.currentTarget.dataset.info
    this.setData({
      scrollIntoViewID: item
    })
  },


groupDataMethod:function() {
    let groupBaseArray = [];
    for (let i = 0; i < this.data.dataArray.length; i++) {
        let item = this.data.dataArray[i];
        let value, id;
        value = item.name
        if (isNotEmpty(item.id)) {
            id = item.id;
        }
        let key = getFirstLetterPinYin(value).charAt(0);
        let groupArray = [];
        if (groupBaseArray.some(function (x) {
            return x.key == key
        })) {

            groupBaseArray.forEach((value, index, array) => {
                if (value.key == key) {
                    groupArray = value.data;
                }
            });
            if (isNotEmpty(id)) {
                groupArray.push({ name: value, id: id });
            } else {
                groupArray.push({ name: value });
            }
        } else {
            if (isNotEmpty(id)) {
                groupArray.push({ name: value, id: id });
            } else {
                groupArray.push({ name: value, });
            }
            let groupMap = { key: key, data: groupArray, };
            groupBaseArray.push(groupMap);
        }

    }

    groupBaseArray = this.sortKeyword(groupBaseArray)
    const data = [];
    for (let section = 0; section < groupBaseArray.length; ++section) {
        const sContent = { items: [] };
        for (let row = 0; row < groupBaseArray[section].data.length; ++row) {
            sContent.items.push(groupBaseArray[section].data[row]);
        }
        data.push(sContent);
    }
    this.setData({
        groupArray: groupBaseArray,
        largeListArray: data,
    });
},
/**
 * 排序
 * @param array
 * @returns {*}
 */
sortKeyword:function(array) {
    array.sort((a, b) => {
        return a.key.localeCompare(b.key)
    })

    let index = -1
    for (let i = 0; i < array.length; i++) {
        if (safeObj(safeObj(array[i]).key) > '9') {
            index = i
            break
        }
    }

    let end = array.slice(0, index)
    let start = array.slice(index, array.length)
    start.push(...end)
    return start
},
})