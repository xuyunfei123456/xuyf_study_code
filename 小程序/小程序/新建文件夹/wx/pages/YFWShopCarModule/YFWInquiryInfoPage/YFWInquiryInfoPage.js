import { UploadImageApi, OrderPaymentApi, UseDrug } from "../../../apis/index"
import { isNotEmpty, safeArray, isEmpty, secretPhone, calculateAge } from "../../../utils/YFWPublicFunction"
import { EMOJIS, NAME, NEWNAME, IDENTITY_CODE, IDENTITY_VERIFY } from "../../../utils/YFWRegular"
import { config } from "../../../config"
import { pushNavigation } from "../../../apis/YFWRouting"
const uploadImageApi = new UploadImageApi()
const orderPaymentApi = new OrderPaymentApi()
const useDrug = new UseDrug()
var app = getApp()

// pages/YFWShopCarModule/YFWInquiryInfoPage/YFWInquiryInfoPage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    firstConfirmClick:true,
    confirmAreaFlag:false,
    selectPatient: null,
    patientItems: [],
    medicineDiseaseItems: [],
    diseaseDescShow: false,
    vorcheShow: false,
    vorcheUploadShow: false,
    medicineDiseaseMaxCount: 2,
    diseaseDesc: '',
    vorcheImages: [],
    vorcheNotice: false,
    searchKey: '',
    searcheDiseaseResult: [],
    searcheModalShow: false,
    rx_mode: 1,
    cartids: '',
    packageids: '',
    isPrescrption: false,
    isCertificateUpload: false,
    prescrptionImages: [],
    certModalShow: false,
    authModalShow: false,
    authItem: { id: 0, name: '', idcard: '' },
    cerExampleAll: 'http://c1.yaofangwang.net/common/images/yb-minmap-icons/img_proof_example_all.png',
    certExamples: [
      'http://c1.yaofangwang.net/common/images/yb-minmap-icons/img_proof_example_0.jpg',
      'http://c1.yaofangwang.net/common/images/yb-minmap-icons/img_proof_example_1.jpg',
      'http://c1.yaofangwang.net/common/images/yb-minmap-icons/img_proof_example_2.jpg',
      'http://c1.yaofangwang.net/common/images/yb-minmap-icons/img_proof_example_3.jpg',
    ],
    scrollTop: 0,
  },

  /** 点击选择在线问诊、或是上传处方 */
  handleTabItem: function (event) {
    const dataset = event.currentTarget.dataset
    const index = Number.parseInt(dataset.index)
    const { isPrescrption } = this.data
    if (index==1 && isPrescrption) {

      this.setData({ isPrescrption: false })
    } else if (index==2 && !isPrescrption) {
      
      this.setData({ isPrescrption: true })
      this.showPrescNotice()
    } 
  },
  confirmClick(){
    if(this.data.firstConfirmClick && !app.globalData.inquiryInfo.isSave){
      const that = this;
      wx.showModal({
        title:"提示",
        content: "是否已在实体医院就诊，且服用过订单中药品，无不良反应",
        cancelText: "否",
        confirmColor: "#1fdb9b",
        confirmText: "是",
        success(res) {
          if (res.confirm) {
            that.data.firstConfirmClick = false;
            that.setData({
              confirmAreaFlag:true,
            })
          }
        }
      })
    }else{
      this.setData({
        confirmAreaFlag:!this.data.confirmAreaFlag
      })
    }
  },
  showPrescNotice: function (event) {
    wx.showModal({
      showCancel: false,
      confirmColor: '#1fdb9b',
      confirmText: '我知道了',
      title: '提示',
      content: '处方药需上传正规有效的处方'
    })
  },

  /** 查看处方药规定 */
  handleLookPrescRules: function (event) {
    let item = {
      name: "单双轨说明页",
      type: "receive_h5",
      value: config.rx_url
    }
    pushNavigation(item.type, item)
  },

  /** 选择用药人 */
  handleSelectPatient: function (event) {
    const dataset = event.currentTarget.dataset
    if (dataset.item.dict_bool_certification == 0) {
      this.showAuthModal(dataset.item)
    }
    if (dataset.item.id == this.data.selectPatient.id) {
      return
    }
    this.setData({ selectPatient: dataset.item })
  },

  /** 添加用药人 */
  handleAddPatient: function (event) {
    pushNavigation('add_drug', { type: 1 })
  },

  /** 编辑用药人 */
  handleEditPatient: function (event) {
    const dataset = event.currentTarget.dataset
    pushNavigation('add_drug', { type: 2, id: dataset.item.id })
  },

  /** 是否显示疾病描述 */
  handleShowDiseaseInput: function (event) {
    const { diseaseDescShow } = this.data
    this.setData({ diseaseDescShow: !diseaseDescShow })
  },

  /** 是否显示上传凭证 */
  handleShowVorche: function (event) {
    const { vorcheShow } = this.data
    this.setData({ vorcheShow: !vorcheShow })
  },


  /** 疾病标签点击 */
  handleDiseaseTagClick: function (event) {
    const dataset = event.currentTarget.dataset
    const section = dataset['section']
    const row = dataset['row']
    let { medicineDiseaseMaxCount } = this.data
    let { medicineDiseaseItems } = this.data
    let medicineItem = medicineDiseaseItems[section]
    let diseaseItem = medicineItem.diseases[row]
    if (!diseaseItem.active && medicineItem.quantity == medicineDiseaseMaxCount) {
      wx.showToast({ title: '确诊疾病最多选择'+medicineDiseaseMaxCount+'个', icon: 'none', duration: 2000 })
      return
    }
    diseaseItem.active = !diseaseItem.active
    medicineItem.quantity = diseaseItem.active ? medicineItem.quantity+1 : medicineItem.quantity-1
    medicineItem.active = medicineItem.quantity>0
    medicineItem.quantity = medicineItem.quantity<0 ? 0 : medicineItem.quantity
    medicineItem.quantity = medicineItem.quantity>medicineDiseaseMaxCount ? medicineDiseaseMaxCount : medicineItem.quantity
    medicineDiseaseItems.map((mItem, mIndex) => {
      if (mIndex != section) {
        mItem.diseases.some(dItem => {
          if (dItem.name == diseaseItem.name && dItem.active != diseaseItem.active) {
            dItem.active = diseaseItem.active ? (mItem.quantity<medicineDiseaseMaxCount ? diseaseItem.active : dItem.active): false
            mItem.quantity = diseaseItem.active ? (mItem.quantity<medicineDiseaseMaxCount ? mItem.quantity+1 : medicineDiseaseMaxCount) : mItem.quantity-1
            mItem.quantity = mItem.quantity<0 ? 0 : mItem.quantity
            mItem.quantity = mItem.quantity>medicineDiseaseMaxCount ? medicineDiseaseMaxCount : mItem.quantity
            mItem.active = mItem.quantity>0
          }
          return dItem.name == diseaseItem.name
        })
      }
    })
    this.setData({ medicineDiseaseItems: medicineDiseaseItems })
  },

  /** 添加疾病标签 */
  handleDiseaseTagAddClick: function (event) {
    const dataset = event.currentTarget.dataset
    const section = dataset['section']
    this.addSection = section
    this.setData({ searcheModalShow: true },()=>{
      this.animate("#inquiry-modal", [{opacity: 0}, {opacity: 1}], 300)
      this.animate("#inquiry-modal-content", [{top: '100vh'}, {top: '10vh'}], 300)
    });
  },

  /** 隐藏搜索疾病modal */
  handleHiddenSearchDiseaseModal: function (event) {
    const that = this
    // this.animate("#inquiry-modal-content", [{bottom: '10vh'}, {bottom: '100vh'}], 300)
    // this.animate("#inquiry-modal", [{opacity: 1}, {opacity: 0}], 300);
    that.setData({ searcheModalShow: false })
  },

  /** 搜索疾病 */
  handleSearchInputChange: function (event) {
    let value = event.detail.value
    value = value.replace(EMOJIS, '')
    this.setData({ searchKey: value })

    this.fetchDiseaseResult(value)
  },

  /** 搜索疾病 */
  fetchDiseaseResult: function (keyword) {
    orderPaymentApi.searchDisease(keyword).then(res => {
      this.setData({ searcheDiseaseResult: safeArray(res) })
    }, error => {
      console.log('搜索疾病失败', error)
    })
  },

  /** 清空搜索输入框 */
  handleClearSearchInput: function (event) {
    this.setData({ searchKey: '' })
  },

  /** 点击搜索结果 */
  handleSearchItemClick: function (event) {
    this.handleHiddenSearchDiseaseModal()

    const dataset = event.currentTarget.dataset
    const disease = dataset['item']
    const { medicineDiseaseMaxCount } = this.data
    let { medicineDiseaseItems } = this.data
    let medicineItem = medicineDiseaseItems[this.addSection]
    let repeat = false
    repeat = medicineItem.diseases.some(item => {
      return item.name == disease.disease_name
    })
    if (repeat) {
      return
    }
    let diseaseItem = {
      id: disease.id,
      name: disease.disease_name,
      active: medicineItem.quantity < medicineDiseaseMaxCount
    }
    medicineItem.active = true
    medicineItem.quantity = medicineItem.quantity<medicineDiseaseMaxCount ? medicineItem.quantity+1 : medicineDiseaseMaxCount
    medicineItem.diseases.push(diseaseItem)
    if (diseaseItem.active) {
      medicineDiseaseItems.map((mItem, mIndex) => {
        if (mIndex != this.addSection && mItem.quantity < medicineDiseaseMaxCount) {
          mItem.diseases.some(dItem => {
            if (dItem.name == diseaseItem.name && !dItem.active) {
              dItem.active = diseaseItem.active
              mItem.active = true
              mItem.quantity++
            }
            return dItem.name == diseaseItem.name
          })
        }
      })
    }
    this.setData({ medicineDiseaseItems: medicineDiseaseItems, searchKey: '', searcheDiseaseResult: [] })
  },

  /** 疾病描述输入事件 */
  handleDiseaseDescInputChange: function (event) {
    let value = event.detail.value
    value = value.replace(EMOJIS, '')
    this.setData({ diseaseDesc: value })
  },

  /** 上传凭证 */
  handleUploadVorche: function (event) {
    let { vorcheImages } = this.data,that = this;
    if (vorcheImages.length == 0) {
      this.setData({ certModalShow: true })
      wx.nextTick(()=>{
        that.animate("#cert-modal", [{opacity: 0}, {opacity: 1}], 300)
      })
      return
    }
    this.uploadCert()
  },

  /** 上传凭证 */
  uploadCert: function (event) {
    
    wx.chooseImage({
      count: 1,
      success: (res) => {
        const path = res.tempFilePaths[0]
        let { vorcheImages } = this.data
        wx.showLoading({ title: '上传中...', })
        uploadImageApi.upload(path).then(res => {
          wx.hideLoading()
          if (isNotEmpty(res)) {
            vorcheImages.push({
              localPath: path,
              fileId: res
            })
            this.setData({ vorcheImages: vorcheImages })
          }
        }, error => {
          wx.hideLoading()
          wx.showToast({ title: error&&error.msg || '', icon: 'none', duration: 2000})
        })
      }
    })
  },

  /** 关闭上传凭证提示 */
  handleCertModalClose: function (event) {
    const that = this
    this.animate("#cert-modal", [{opacity: 1}, {opacity: 0}], 300, function () {
      that.setData({ certModalShow: false })
    }.bind(this))
  },

  /** 上传凭证提示点击 */
  handleCertModalClick: function (event) {
    this.handleCertModalClose()
    this.uploadCert()
  },

  /** 删除凭证 */
  handleDeleteVorche: function (event) {
    let { vorcheImages } = this.data
    const dataset = event.currentTarget.dataset
    const index = vorcheImages.indexOf(dataset.item)
    vorcheImages.splice(index, 1)
    this.setData({ vorcheImages: vorcheImages })
  },

  /** 查看凭证大图 */
  handleLookVorcheBigPic: function (event) {
    let { vorcheImages } = this.data
    const dataset = event.currentTarget.dataset
    let urls = vorcheImages.map(item => { return item.localPath })
    wx.previewImage({
      current: dataset.item.localPath,
      urls: urls,
    })
  },

  /** 查看凭证示例 */
  handleLookCertExample: function (event) {
    const { certExamples } = this.data
    wx.previewImage({
      current: certExamples[0],
      urls: certExamples,
    })
  },

  /** 上传处方 */
  handleUploadPrescription: function (event) {
    let { prescrptionImages } = this.data
    wx.chooseImage({
      count: 1,
      success: (res) => {
        const path = res.tempFilePaths[0]
        this.setData({ prescrptionImages: prescrptionImages })
        wx.showLoading({ title: '上传中...', })
        uploadImageApi.upload(path).then(res => {
          wx.hideLoading()
          if (isNotEmpty(res)) {
            prescrptionImages.push({
              localPath: path,
              fileId: res
            })
            this.setData({ prescrptionImages: prescrptionImages })
          }
        }, error => {
          wx.hideLoading()
          wx.showToast({ title: error.msg || '', icon: 'none', duration: 2000})
        })
      }
    })
  },

  /** 提交保存 */
  handleConfirm: function (event) {
    const { selectPatient,confirmAreaFlag } = this.data;
    if(!confirmAreaFlag){
      wx.showToast({ title: '请先在实体医院完成就诊', icon: 'none', duration: 2000 });
      return false;
    }
    if (isEmpty(selectPatient)) {
      wx.showToast({ title: '请添加用药人', icon: 'none', duration: 2000 })
      this.setData({ scrollTop: 0 })
      return
    }

    const { medicineDiseaseItems } = this.data
    let noMedicine = false
    let medicineItem = medicineDiseaseItems[0]
    noMedicine = medicineDiseaseItems.some(mItem => {
      if (!mItem.active) {
        medicineItem = mItem
      }
      return !mItem.active
    })
    if (noMedicine) {
      wx.showToast({ title: '【'+medicineItem.medicine_name+'】未选择确诊疾病', icon: 'none', duration: 2000 })
      return
    }

    const { isCertificateUpload,vorcheImages } = this.data
    if (isCertificateUpload && vorcheImages.length==0) {
      wx.showToast({ title: '请上传复诊凭证', icon: 'none', duration: 2000 })
      return
    }

    let diseases = []
    medicineDiseaseItems.forEach(mItem => {
      mItem.diseases.forEach(dItem => {
        if (dItem.active) {
          diseases.push({ id: dItem.id, name: dItem.name, namecn: mItem.medicine_name })
        }
      })
    })

    let caseurl = ''
    if (this.data.vorcheUploadShow) {
      let urls = this.data.vorcheImages.map(item => { return item.fileId })
      caseurl = urls.length>0 ? urls.join('|') : ''
    }

    wx.showLoading({ title: '提交中...' })
    orderPaymentApi.commitPrecriptionInfo(this.data.cartids, this.data.packageids, 2, this.data.selectPatient.id, '', JSON.stringify(diseases), caseurl).then(res => {
      wx.hideLoading()
      let result = Boolean(res)
      if (result) {
        let inquiryInfo = app.globalData.inquiryInfo
        inquiryInfo.isSave = true
        inquiryInfo.drug_items = this.data.patientItems
        inquiryInfo.selectPatient = this.data.selectPatient
        inquiryInfo.medicine_disease_items = this.data.medicineDiseaseItems
        inquiryInfo.certificationImages = this.data.vorcheImages
        inquiryInfo.rx_images = this.data.prescrptionImages
        inquiryInfo.diseaseDesc = this.data.diseaseDesc
        app.globalData.inquiryInfo = inquiryInfo
        wx.navigateBack()
      }
    }, error => {
      wx.hideLoading()
      if (error.code == -3) {
        wx.showModal({
          showCancel: false,
          confirmColor: '#1fdb9b',
          confirmText: '我知道了',
          title: '提示',
          content: error.msg
        })
      } else {

        wx.showToast({ title: error.msg || '', icon: 'none', duration: 2000 })
      }
    })
  },

  /** 编辑或者新增用药人后，获取用药人信息 */
  fetchPatient: function (event) {
    let inquiryInfo = app.globalData.inquiryInfo
    
    if (inquiryInfo.editPatientId != 0) {
      useDrug.getUserDetail(inquiryInfo.editPatientId).then(res => {
        inquiryInfo.editPatientId = 0

        if (isNotEmpty(res)) {
          let editItem = res
          editItem['secret_mobile'] = secretPhone(editItem.mobile)
          editItem['age'] = calculateAge(editItem.idcard_no)
          let { patientItems } = this.data
          if (patientItems.length == 0) {
            patientItems.push(editItem);
            this.setData({
              selectPatient:editItem
            })
          } else {
            let repeatIndex = -1
            const editDefault = Number.parseInt(editItem.dict_bool_default)
            patientItems = patientItems.map((pItem, pIndex) => {
              if (pItem.id == editItem.id) {
                repeatIndex = pIndex
              }
              if (editDefault == 1) {
                pItem.dict_bool_default = 0
              }
              return pItem
            })

            if (repeatIndex != -1) {
              patientItems.splice(repeatIndex, 1)
            }

            if (editDefault == 1) {
              patientItems.unshift(editItem)
            } else {
              patientItems.push(editItem)
            }
            inquiryInfo.drug_items = patientItems
            app.globalData.inquiryInfo = inquiryInfo

          }
          this.setData({ patientItems: patientItems })
        }
      }, error => {

        console.log(error)
      })
    }
  },

  /** 实名认证弹窗 */
  showAuthModal: function (event) {
    let { authItem } = this.data
    authItem.name = event.real_name
    authItem.idcard = event.idcard_no
    authItem.id = event.id
    this.setData({ authModalShow: true, authItem: authItem })
    this.animate("#auth-modal", [{opacity: 0}, {opacity: 1}], 300)
  },

  /** 关闭实名认证弹窗 */
  handleAuthModalClose: function (event) {
    const that = this
    this.animate("#auth-modal", [{opacity: 1}, {opacity: 0}], 300, function () {
      that.setData({ authModalShow: false })
    }.bind(this))
  },

  /** 实名认证 */
  handleAuthClick: function (event) {
    
    const { authItem } = this.data
    if (authItem.name.length == 0) {
      wx.showToast({ title: '请输入用药人姓名', icon: 'none', duration: 2000 })
      return
    } else if (authItem.idcard.length == 0)  {
      wx.showToast({ title: '请输入身份证号码', icon: 'none', duration: 2000 })
      return
    } else if (!IDENTITY_VERIFY.test(authItem.idcard))  {
      wx.showToast({ title: '身份证号码格式不正确', icon: 'none', duration: 2000 })
      return
    }
    useDrug.verfiedUser(authItem.id, authItem.name, authItem.idcard).then(res => {
      const result = Boolean(res)
      if (result) {
        
        this.handleAuthModalClose()
        wx.showToast({ title: '认证成功', icon: 'none', duration: 2000 })

        let { patientItems } = this.data
        let repeat = -1
        patientItems.some((item, index) => {
          if (item.id == authItem.id) {
            repeat = index
          }
          return item.id == authItem.id
        })
        if (repeat != -1) {
          patientItems[repeat].real_name = authItem.name
          patientItems[repeat].idcard_no = authItem.idcard
          patientItems[repeat].dict_bool_certification = 1
          this.setData({ patientItems: patientItems })

          app.globalData.inquiryInfo.drug_items = patientItems
          app.globalData.inquiryInfo.isEditPatient = true
        }
      }
    }, error => {
      wx.showToast({ title: error.msg || '', icon: 'none', duration: 2000 })
    })
  },

  /** 清空身份证号码 */
  handleClearAuthIdCard: function (event) {
    let { authItem } = this.data
    authItem.idcard = ''
    this.setData({ authItem: authItem })
  },

  /** 姓名输入框 */
  handleRealNameInput: function (event) {
    let value = event.detail.value
    value = value.replace(NEWNAME, '')
    let { authItem } = this.data
    authItem.name = value
    this.setData({ authItem: authItem })
  },

  /** 姓名输入框 */
  handleRealNameInputEnd: function (event) {
    let value = event.detail.value
    value = value.replace(NAME, '')
    let { authItem } = this.data
    authItem.name = value
    this.setData({ authItem: authItem })
  },

  /** 身份证号码输入框 */
  handleIdCardNumInput: function (event) {
    let value = event.detail.value
    value = value.replace(IDENTITY_CODE, '')
    let { authItem } = this.data
    authItem.idcard = value
    this.setData({ authItem: authItem })
  },

  /** 点击、滚动穿透 */
  handleCatchTap: function (event) {
    return true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const inquiryInfo = JSON.parse(JSON.stringify(app.globalData.inquiryInfo))
    if (inquiryInfo.isPrescrption) {
      
      this.showPrescNotice()
    }
    const patientItems = inquiryInfo.drug_items;
    this.setData({
      patientItems,
      confirmAreaFlag:inquiryInfo.isSave ? true:false,
      diseaseDescShow:inquiryInfo.diseaseDesc ? true:false,
      vorcheShow:inquiryInfo.certificationImages.length !=0 ? true:false,
      selectPatient: inquiryInfo.selectPatient,
      medicineDiseaseItems: inquiryInfo.medicine_disease_items,
      medicineDiseaseMaxCount: inquiryInfo.medicine_disease_xz_count,
      vorcheImages: inquiryInfo.certificationImages,
      vorcheUploadShow: inquiryInfo.certificationImages.length>0,
      prescrptionImages: inquiryInfo.rx_images,
      packageids: inquiryInfo.packageids,
      cartids: inquiryInfo.cartids,
      diseaseDesc: inquiryInfo.diseaseDesc,
      rx_mode: inquiryInfo.rx_mode,
      isPrescrption: inquiryInfo.isPrescrption,
      isCertificateUpload: inquiryInfo.is_certificate_upload
    })
    if(!inquiryInfo.isSave){
      if(!patientItems || patientItems == null || patientItems.length == 0 )return;
      let flag = false,_data = {};
      for(let item of patientItems){
        if(item.dict_bool_default == 1){
          flag = true;
          _data = item;
          break;
        }
      }
      this.setData({
        selectPatient:flag?_data:patientItems[0]
      })
    }

    
    patientItems.some(item => {
      if (item.dict_bool_certification == 0) {
        this.showAuthModal(item)
      }
      return item.dict_bool_certification == 0
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
    this.fetchPatient()
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

  }
})