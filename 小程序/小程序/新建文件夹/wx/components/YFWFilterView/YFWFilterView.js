var event = require('../../utils/event')
// components/YFWFilterView.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    listType: {
      type: Boolean,
      value: false           //true:列表  false:方块
    },
    froms: {
      type: String,
      value: 'search'      //search:搜索商品列表    category:分类商品列表   shop_search:商家搜索商品列表    shop_all_goods:商家全部商品列表
    },
    showSpecification:{
      type:Boolean,
      value:false,
    },
    showSpecification2:{
      type:Boolean,
      value:false
    }
  },
  lifetimes: {
    created: function () {
      event.on('speciData', this, function (data) {
        console.log('接收到规格参数');
        let _name ='选择规格',_flag = false;
        for(let item of data){
          if(item.select == 'select'){
            _name = item.title;
            _flag = true
            break;
          }
        }
        this.setData({
          specificationData: data || [],
          choosedName:_name,
          choosedflag:_flag,
        })
      })
    },
    detached: function () {
      event.remove('speciData', this);
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    sort: '', //
    sorttype: '', //
    selectTab: 0,
    priceIconType: 0,
    sellerIconType: 0,
    priceDerection: true,
    sellerDerection: true,
    categoryID: '',
    categoryArray: [{ id: 1, name: '中西药品' }, { id: 2, name: '医疗器械' }, { id: 3, name: '养生保健' },
    { id: 4, name: '美容护肤' }, { id: 5, name: '计生用品' }, { id: 6, name: '中药饮片' }],
    menuOpen: false,
    gzchoosed: false,
    specificationData: [],
    choosedName:'选择规格',
    choosedflag:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    workspeci:function(data){
      

    },
    resetAction: function () {
      let specificationData = this.data.specificationData.map(item => {
        item.select = 'no';
        item.hide = false;
        return item;
      })
      this.setData({
        specificationData,
        choosedName:'选择规格',
        choosedflag:false,
      })
    },
    confirmAction: function () {
      event.emit('refresh', this.data.specificationData);
      let _name ='选择规格',_flag = false;
      for(let item of this.data.specificationData){
        if(item.select == 'select'){
          _name = item.title;
          _flag = true
          break;
        }
      }
      this.setData({
        gzchoosed: !this.data.gzchoosed,
        choosedName:_name,
        choosedflag:_flag,
      })
    },
    onChangeText: function (e) {
      let { value } = e.detail;
      let specificationData = this.data.specificationData.map(item => {
        item.hide = item.title.indexOf(value) == -1 ? true : false;
        return item;
      })
      this.setData({
        specificationData,
      })
    },
    itemClickAction: function (e) {
      let _index = e.currentTarget.dataset.index;
      let specificationData = this.data.specificationData.map(item => {
        if (item.index == _index) {
          item.select = item.select == 'no' ? 'select' : 'no';
        }
        return item;
      })
      this.setData({
        specificationData,
      })

    },
    clickSpecification: function () {
      this.setData({
        gzchoosed: !this.data.gzchoosed
      })
    },
    changeSortType: function (event) {
      let id = parseInt(event.currentTarget.dataset.id)
      if (id == 0) {
        this.data.sort = '';
        this.data.sorttype = this.get_sorttype(id);
        this.setData({
          selectTab: 0,
          priceIconType: 0,
          sellerIconType: 0,
          menuOpen: false,
          categoryID: ''
        })
      }
      if (id == 1) {
        if (this.data.selectTab != 1) {
          this.data.priceDerection = true
        }
        if (this.data.priceDerection) {
          this.data.sort = (this.data.froms == 'search' || this.data.froms == 'shop_search') ? 'price asc' : 'price';
          this.data.sorttype = this.get_sorttype(id);
          this.data.priceDerection = !this.data.priceDerection;
          this.setData({
            priceIconType: 1,
            sellerIconType: 0,
            selectTab: 1,
            menuOpen: false
          })
        } else {
          this.data.sort = (this.data.froms == 'search' || this.data.froms == 'shop_search') ? 'price desc' : 'price';
          this.data.sorttype = this.get_sorttype(id);
          this.data.priceDerection = !this.data.priceDerection;
          this.setData({
            priceIconType: 2,
            sellerIconType: 0,
            selectTab: 1,
            menuOpen: false
          })
        }
      }
      if (id == 2) {
        //报价数
        if (this.data.selectTab != 2) {
          this.data.sellerDerection = true
        }
        if (this.data.sellerDerection) {
          this.data.sellerDerection = !this.data.sellerDerection;
          // this.data.sort = 'shopCount asc';
          this.data.sort = 'shopCount desc';
          // this.data.sorttype = 'asc';
          this.setData({
            priceIconType: 0,
            sellerIconType: 1,
            selectTab: 2,
            menuOpen: false
          })
        } else {
          this.data.sellerDerection = !this.data.sellerDerection;
          this.data.sort = 'shopCount asc';
          // this.data.sort = 'shopCount desc';
          // this.data.sorttype = 'desc';
          this.setData({
            priceIconType: 0,
            sellerIconType: 2,
            selectTab: 2,
            menuOpen: false
          })
        }
      }
      if (id == 3) {
        if (id == this.data.selectTab) {
          this.data.menuOpen = !this.data.menuOpen;
        } else {
          this.data.menuOpen = true;
        }
        this.setData({ selectTab: 3, priceIconType: 0, sellerIconType: 0, menuOpen: this.data.menuOpen })
        return
      }

      let sortParams = {}
      if (this.data.froms == 'search') {
        sortParams = {
          sort: this.data.sort,
          sorttype: this.data.sorttype
        }
      }
      if (this.data.froms == 'category') {
        sortParams = {
          sort: this.data.sort,
          sorttype: this.data.sorttype
        }
      }
      if (this.data.froms == 'shop_search') {
        sortParams = {
          sort: this.data.sort,
          sorttype: this.data.sorttype
        }
      }
      if (this.data.froms == 'shop_all_goods') {
        sortParams = {
          sorttype: this.data.sorttype,
          categoryID: this.data.categoryID
        }
      }

      this.triggerEvent('changeSortType', sortParams);
    },
    changeListType() {
      this.setData({
        listType: !this.data.listType
      })
      this.triggerEvent('changeListType');
    },
    openControlPanel() {
      this.triggerEvent('openControlPanel');
    },
    closeCategoryView(event) {
      let a = event.currentTarget.id
      if (a == 'father') {
        this.setData({ menuOpen: false })
      }
    },
    categoryClick(event) {
      if (this.data.categoryID == event.currentTarget.id) {
        this.data.categoryID = ''
      } else {
        this.data.categoryID = event.currentTarget.id
      }
      this.setData({ menuOpen: false, categoryID: this.data.categoryID })
      this.triggerEvent('changeSortType', { categoryID: this.data.categoryID, sorttype: this.data.sorttype });
    },
    get_sorttype(selectTab) {
      //search: 搜索商品列表    category: 分类商品列表   shop_search: 商家搜索商品列表    shop_all_goods: 商家全部商品列表
      let sorttype = ''
      if (this.data.froms == 'category') {
        if (selectTab == 0) {
          sorttype = ''
        } else if (selectTab == 1) {
          if (this.data.priceDerection) {
            sorttype = 'asc'
          } else {
            sorttype = 'desc'
          }
        }
      }
      if (this.data.froms == 'shop_all_goods') {
        if (selectTab == 0) {
          sorttype = 'sale_count desc'
        } else if (selectTab == 1) {
          if (this.data.priceDerection) {
            sorttype = 'price asc'
          } else {
            sorttype = 'price desc'
          }
        }
      }
      this.data.sorttype = sorttype
      return sorttype;
    }

  }
})