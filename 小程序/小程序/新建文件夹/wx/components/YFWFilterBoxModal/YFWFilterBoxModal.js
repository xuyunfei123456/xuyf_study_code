import {
  SearchApi, GoodsCategaryApi
} from '../../apis/index.js'
const searchApi = new SearchApi()
const goodsCategaryApi = new GoodsCategaryApi()
import { getModelArray } from './YFWFilterModel.js'
import {
  isNotEmpty, deepCopyObj, safeObj, getFirstLetterPinYin
} from '../../utils/YFWPublicFunction.js'
var event = require('../../utils/event')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    category_id: {
      type: String,
      value: ''
    },
    keywords: {
      type: String,
      value: ''
    },
    paramJson: {
      type: Object,
      value: {}
    },
    froms: {
      type: String,
      value: ''
    },
    showSpecification:{
      type:Boolean,
      value:false,
    }

  },

  lifetimes: {
    attached: function () {
      event.on('refresh', this, function (data) {
        this.refresh(data)
      })
      var that = this;
      wx.getSystemInfo({
        success(res) {
          // px转换到rpx的比例
          let pxToRpxScale = 750 / res.windowWidth;
          // window的高度
          let ktxWindowHeight = res.windowHeight * pxToRpxScale -120+ 'rpx';
          that.setData({
            ktxWindowHeight,
          })
        }
      })
    },
    detached: function () {
      event.remove('refresh', this);
    },
  },
  pageLifetimes: {
    show: function () {
      // 页面被展示
    },
    hide: function () {
      // 页面被隐藏
    },
    resize: function (size) {
      // 页面尺寸变化
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    ktxWindowHeight:null,
    isShow: false,
    showIndex: false,
    animationData: {},
    drugNameDataArray: [],
    topDrugArray: [],
    sectionDrugNameArray: [],
    manufacturerDataArray: [],
    topManufacturerDataArray: [],
    sectionManufacturerArray: [],
    specificationsDataArray: [],
    topspecificationArray: [],
    sectionspecificationArray: [],
    selectIndex: 0,
    showAll: false,
    brandsName: '商品名/品牌',
    manufacturersName: '厂家',
    specificationsName: '规格',
    scrollIntoViewID: '',
    fakeObj:{},
  },
  /**
   * 组件的方法列表
   */
  methods: {

    refresh: function (data) {
      let topDataArray = []
      if (data.length > 9) {
        topDataArray = data.slice(0, 5)
        topDataArray.push({ name: '查看全部...', isShowAll: true })
      } else {
        topDataArray = data;
      }
      this.setData({
        specificationsDataArray: data,
        topspecificationArray: topDataArray,
        sectionspecificationArray: this.groupDataMethod(data)
      })
      this.confirmAction('',true);

    },
    getsxData: function () {
      if (this.data.froms == 'YFWSearchDetailListView') {
        searchApi.getAllBrands(this.data.keywords).then((res) => {
          res = getModelArray(res)
          let topDataArray = []
          if (res.length > 9) {
            topDataArray = res.slice(0, 8)
            topDataArray.push({ name: '查看全部...', isShowAll: true })
          } else {
            topDataArray = res
          }
          this.setData({
            drugNameDataArray: res,
            topDrugArray: topDataArray,
            sectionDrugNameArray: this.groupDataMethod(res),
          })

        })
        searchApi.getAllSpecifications(this.data.keywords).then((res) => {
          res = getModelArray(res)
          let topDataArray = []
          if (res.length > 6) {
            topDataArray = res.slice(0, 5)
            topDataArray.push({ name: '查看全部...', isShowAll: true ,title:'查看全部...'})
          } else {
            topDataArray = res
          }
          this.setData({
            specificationsDataArray: res,
            topspecificationArray: topDataArray,
            sectionspecificationArray: this.groupDataMethod(res),
          })
          console.log('=======获取到后台反悔的规格列表')
          setTimeout(() => {
            event.emit('speciData', res);
          }, 1000)

        })
        searchApi.getAllManufacturers(this.data.keywords).then((res) => {
          res = getModelArray(res)
          let topDataArray = []
          if (res.length > 6) {
            topDataArray = res.slice(0, 5)
            topDataArray.push({ name: '查看全部...', isShowAll: true })
          } else {
            topDataArray = res
          }
          this.setData({
            manufacturerDataArray: res,
            topManufacturerDataArray: topDataArray,
            sectionManufacturerArray: this.groupDataMethod(res)
          })
        })
      }
      if (this.data.froms == 'YFWSubCategoryController') {
        goodsCategaryApi.getAllBrands(this.data.category_id).then((res) => {
          console.log(res)
          res = getModelArray(res)
          let topDataArray = []
          if (res.length > 9) {
            topDataArray = res.slice(0, 8)
            topDataArray.push({ name: '查看全部...', isShowAll: true })
          } else {
            topDataArray = res
          }
          this.setData({
            drugNameDataArray: res,
            topDrugArray: topDataArray,
            sectionDrugNameArray: this.groupDataMethod(res),
          })
          this.groupDataMethod(res)
        })
        goodsCategaryApi.getAllManufacturers(this.data.category_id).then((res) => {
          console.log(res)
          res = getModelArray(res)
          let topDataArray = []
          if (res.length > 9) {
            topDataArray = res.slice(0, 5)
            topDataArray.push({ name: '查看全部...', isShowAll: true })
          } else {
            topDataArray = res
          }
          this.setData({
            manufacturerDataArray: res,
            topManufacturerDataArray: topDataArray,
            sectionManufacturerArray: this.groupDataMethod(res)
          })
          this.groupDataMethod(res)
        })
      }
    },
    /**
 * 隐藏弹窗
 */
    hideModal: function () {
      let animation = wx.createAnimation({
        duration: 200,
        timingFunction: "linear",
        delay: 0
      })
      this.animation = animation
      animation.translateX(300).step()
      this.setData({
        animationData: animation.export()
      })
      let that = this
      if (this.data.isShow) {
        setTimeout(function () {
          animation.translateX(0).step()
          that.setData({
            animationData: animation.export(),
            isShow: false
          })
          //wx.showTabBar({});
        }.bind(this), 200)

      }
    },

    /**
     * 显示弹窗
     */
    showModal: function () {
      //wx.hideTabBar({});
      if(JSON.stringify(this.data.fakeObj) !='{}'){
        let _obj = this.data.fakeObj,_query={};
        _query = {
          'drugNameDataArray': _obj.drugNameDataArray || this.data.drugNameDataArray,
          'topDrugArray': _obj.topDrugArray || this.data.topDrugArray,
          'sectionDrugNameArray': _obj.sectionDrugNameArray || this.data.sectionDrugNameArray,
          'manufacturerDataArray': _obj.manufacturerDataArray || this.data.manufacturerDataArray,
          'topManufacturerDataArray': _obj.topManufacturerDataArray || this.data.topManufacturerDataArray,
          'sectionManufacturerArray': _obj.sectionManufacturerArray || this.data.sectionManufacturerArray,
          'specificationsDataArray': _obj.specificationsDataArray || this.data.specificationsDataArray,
          'topspecificationArray': _obj.topspecificationArray || this.data.topspecificationArray,
          'sectionspecificationArray': _obj.sectionspecificationArray || this.data.sectionspecificationArray,
        }
        this.setData(_query)
      }
      let animation = wx.createAnimation({
        duration: 200,
        timingFunction: "linear",
        delay: 0
      })
      this.animation = animation

      if (!this.data.isShow) {

        animation.translateX(300).step()
        this.setData({
          animationData: animation.export(),
          isShow: true
        })
      }
      let that = this
      setTimeout(function () {
        animation.translateX(0).step()
        that.setData({
          animationData: animation.export()
        })
      }.bind(this), 0)
    },
    groupDataMethod: function (dataArray) {
      let groupBaseArray = [];
      for (let i = 0; i < dataArray.length; i++) {
        let item = dataArray[i]
        item.index = i
        let value, id;
        if (isNotEmpty(item.id)) {
          id = item.id
        }
        if (isNotEmpty(item.title)) {
          value = item.title
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
          groupArray.push(item)
          // if (isNotEmpty(id)) {
          //   groupArray.push({ title: value, select: this.isIncludeItem(item), id: id });
          // } else {
          //   groupArray.push({ title: value, select: this.isIncludeItem(item) });
          // }
        } else {
          groupArray.push(item)

          // if (isNotEmpty(id)) {
          //   groupArray.push({ title: value, select: this.isIncludeItem(item), id: id });
          // } else {
          //   groupArray.push({ title: value, select: this.isIncludeItem(item) });
          // }
          let groupMap = { key: key, data: groupArray };
          groupBaseArray.push(groupMap);
        }

      }

      groupBaseArray = this.sortKeyword(groupBaseArray)
      // const data = [];
      // for (let section = 0; section < groupBaseArray.length; ++section) {
      //   const sContent = { items: [] };
      //   for (let row = 0; row < groupBaseArray[section].data.length; ++row) {
      //     sContent.items.push(groupBaseArray[section].data[row]);
      //   }
      //   data.push(sContent);
      // }
      console.log(groupBaseArray)
      // console.log(data)
      // this.setState({
      //   groupArray: groupBaseArray,
      //   largeListArray: data,
      // });

      return groupBaseArray
    },

    isIncludeItem: function (item) {
      return false
    },

    /**
     * 排序
     * @param array
     * @returns {*}
     */
    sortKeyword: function (array) {
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

    /**筛选事件传递 */
    changeFilter: function (info) {
      this.triggerEvent('changeFilter', info.detail)
    },

    /**
     * 解决底部滑动穿透问题
     */
    preventD: function () {
      return;
    },
    resetAction: function () {
      if (this.data.showAll) {
        if (this.data.showType == 'Aliascn') {
          this.emptyBrand();
        } else if (this.data.showType == 'ss') {
          this.emptymanufactor();
        } else {
          this.emptyspecifacitions();
        }
      } else {
        this.emptyBrand();
        this.emptymanufactor();
        this.emptyspecifacitions();
      }
    },
    //清空商品名的选择
    emptyBrand: function () {
      let _drugNameDataArray = JSON.parse(JSON.stringify(this.data.drugNameDataArray));
      _drugNameDataArray =_drugNameDataArray.map(item => {
        item.select = 'no';
        return item;
      })
      let _topDrugArray = JSON.parse(JSON.stringify(this.data.topDrugArray));
      _topDrugArray =_topDrugArray.map(item => {
        item.select = 'no';
        return item;
      })
      let _sectionDrugNameArray = JSON.parse(JSON.stringify(this.data.sectionDrugNameArray));
      _sectionDrugNameArray =_sectionDrugNameArray.map(item => {
        let _item = item.data.map(param=>{
          param.select = 'no';
          return param;
        })
        item.data = _item;
        return item;
      })
      this.setData({
        drugNameDataArray:_drugNameDataArray,
        topDrugArray:_topDrugArray,
        sectionDrugNameArray:_sectionDrugNameArray,
      })
    },
    //清空厂家的选择
    emptymanufactor: function () {
      let _topManufacturerDataArray = JSON.parse(JSON.stringify(this.data.topManufacturerDataArray));
      _topManufacturerDataArray = _topManufacturerDataArray.map(item => {
        item.select = 'no';
        return item;
      })
      let _manufacturerDataArray = JSON.parse(JSON.stringify(this.data.manufacturerDataArray));
      _manufacturerDataArray =_manufacturerDataArray.map(item => {
        item.select = 'no';
        return item;
      })
      let _sectionManufacturerArray = JSON.parse(JSON.stringify(this.data.sectionManufacturerArray));
      _sectionManufacturerArray =_sectionManufacturerArray.map(item => {
        let _item = item.data.map(param=>{
          param.select = 'no';
          return param;
        })
        item.data = _item;
        return item;
      })
      this.setData({
        topManufacturerDataArray:_topManufacturerDataArray,
        manufacturerDataArray:_manufacturerDataArray,
        sectionManufacturerArray:_sectionManufacturerArray,
      })
    },
    //清空规格的选择
    emptyspecifacitions: function () {
      let _topspecificationArray = JSON.parse(JSON.stringify(this.data.topspecificationArray));
      _topspecificationArray =_topspecificationArray.map(item => {
        item.select = 'no';
        return item;
      })
      let _specificationsDataArray = JSON.parse(JSON.stringify(this.data.specificationsDataArray));
      _specificationsDataArray =_specificationsDataArray.map(item => {
        item.select = 'no';
        return item;
      })
      let _sectionspecificationArray = JSON.parse(JSON.stringify(this.data.sectionspecificationArray));
      _sectionspecificationArray =_sectionspecificationArray.map(item => {
        let _item = item.data.map(param=>{
          param.select = 'no';
          return param;
        })
        item.data = _item;
        return item;
      })
      this.setData({
        topspecificationArray:_topspecificationArray,
        specificationsDataArray:_specificationsDataArray,
        sectionspecificationArray:_sectionspecificationArray,
      })
    },
    confirmAction: function (e,flag) {
      let selectManArray = [], selectDrugArray = [], selectspecificationsArray = [];
      this.data.manufacturerDataArray.map((item) => {
        if (item.select == 'select') {
          let info = item.id ? item.id : item.title
          selectManArray.push(info)
        }
      })
      this.data.drugNameDataArray.map((item) => {
        if (item.select == 'select') {
          let info = item.id ? item.id : item.title
          selectDrugArray.push(info)
        }
      })
      this.data.specificationsDataArray.map((item) => {
        if (item.select == 'select') {
          let info = item.id ? item.id : item.title
          selectspecificationsArray.push(info)
        }
      })
      let result = {
        brands: selectDrugArray,
        manufacturers: selectManArray,
        selectspecificationsArray,
      }
      this.setData({
        'fakeObj.drugNameDataArray': this.data.drugNameDataArray,
        'fakeObj.topDrugArray': this.data.topDrugArray,
        'fakeObj.sectionDrugNameArray': this.data.sectionDrugNameArray,
        'fakeObj.manufacturerDataArray': this.data.manufacturerDataArray,
        'fakeObj.topManufacturerDataArray': this.data.topManufacturerDataArray,
        'fakeObj.sectionManufacturerArray': this.data.sectionManufacturerArray,
        'fakeObj.specificationsDataArray': this.data.specificationsDataArray,
        'fakeObj.topspecificationArray': this.data.topspecificationArray,
        'fakeObj.sectionspecificationArray': this.data.sectionspecificationArray,
      })
      // this.triggerEvent('changeFilter', result)
      console.log(result)
      this.changeFilter({ detail: result })

      if (!flag) {
        event.emit('speciData', this.data.specificationsDataArray);
        this.hideModal() //flag表示是左边选择规格之后传过来 要求刷新列表
      }

    },
    backAction: function () {
      this.setData({
        showAll: false,
        showIndex: false,
      })
    },
    itemClickAction: function (e) {
      let item = e.currentTarget.dataset.info
      let index = e.currentTarget.dataset.index
      let type = e.currentTarget.dataset.type
      if (item.isShowAll) {
        this.setData({
          showAll: true,
          showType: type,
          showIndex: type == 'specification' ? false : true
        })
      } else {
        if (type == 'Aliascn') {
          let copyDrugNameArray = deepCopyObj(this.data.drugNameDataArray)
          let selectItem = this.data.drugNameDataArray[index]
          copyDrugNameArray[index].select = selectItem.select == 'select' ? 'no' : 'select'
          let copyTopDrugArray = deepCopyObj(this.data.topDrugArray)
          if (index < this.data.topDrugArray.length) {
            copyTopDrugArray[index].select = copyTopDrugArray[index].select == 'select' ? 'no' : 'select'
          }
          this.setData({
            drugNameDataArray: copyDrugNameArray,
            topDrugArray: copyTopDrugArray,
            sectionDrugNameArray: this.groupDataMethod(copyDrugNameArray)
          })
        } else if (type == 'ss') {
          let copyManuDataArray = deepCopyObj(this.data.manufacturerDataArray)
          let selectItem = this.data.manufacturerDataArray[index]
          copyManuDataArray[index].select = selectItem.select == 'select' ? 'no' : 'select'
          let copyTopManuDataArray = deepCopyObj(this.data.topManufacturerDataArray)
          if (index < this.data.topManufacturerDataArray.length) {
            copyTopManuDataArray[index].select = copyTopManuDataArray[index].select == 'select' ? 'no' : 'select'
          }
          this.setData({
            manufacturerDataArray: copyManuDataArray,
            topManufacturerDataArray: copyTopManuDataArray,
            sectionManufacturerArray: this.groupDataMethod(copyManuDataArray)
          })
        } else {
          let copysprciDataArray = deepCopyObj(this.data.specificationsDataArray) //copy所有返回的规格
          let selectItem = this.data.specificationsDataArray[index]  //获取点击的规格
          copysprciDataArray[index].select = selectItem.select == 'select' ? 'no' : 'select' //copy的所有规格更改点机的select属性
          let copyTopspeciDataArray = deepCopyObj(this.data.topspecificationArray) //copy展示的规格
          if (index < this.data.topspecificationArray.length) { //点机的规格在展示的规格里面
            copyTopspeciDataArray[index].select = copyTopspeciDataArray[index].select == 'select' ? 'no' : 'select' //更改展示的规格的select属性
          }
          this.setData({
            specificationsDataArray: copysprciDataArray,
            topspecificationArray: copyTopspeciDataArray,
            sectionspecificationArray: this.groupDataMethod(copysprciDataArray)
          })
        }

      }
    },
    /**索引点击 */
    indexesSelectAction: function (e) {
      let item = e.currentTarget.dataset.info
      this.setData({
        scrollIntoViewID: item
      })
      let index = e.currentTarget.dataset.index
    }
  }
})
