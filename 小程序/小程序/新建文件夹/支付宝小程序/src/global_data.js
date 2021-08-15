const globalData = {
  certificationFlag: false,
  certification: '_unCertification',
  userInfo: null,
  latitude:'31.236276',
  longitude:'121.480248',
  region_id:'95',
  address:'上海市',
  city:'上海市',
  isIphoneX: false,
  inquiryInfo: {
    isSave: false,
    rx_mode: 1,
    drug_items: [],
    selectPatient: null,
    medicine_disease_items: [],
    disease_xz_add: 1,
    diseaseDesc: '',
    medicine_disease_xz_count: 2,
    is_certificate_upload: 0,
    certificationImages: [],
    rx_images: [],
    cartids: '',
    packageids: '',
    isPrescrption: false,
    isEditPatient: false,
    editPatientId: 0
  },
  yqfkInfo:{
    drugname:"",
    drugidcardno:"",
    drugmobile:'',
    temperature:"",
    fs:"",
    ks:"",
    xm:"",
    desc_sym:"",
    qt:"",
    isarrivals:"",
    iscontact:"",
    isSave:false,
    medicate_purpose:"",
    work_trade:"",
    from_where:"",
    last_come_time:"",
    is_fl:"",
    agreeFlag:"",
  },
  appSystemConfig:{
  }
}

export function set (key, val) {
  globalData[key] = val
}

export function get (key) {
  return globalData[key]
}