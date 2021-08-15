import Taro, { Component } from '@tarojs/taro'
import { View, Block, Image, Text, ScrollView } from '@tarojs/components'
import { SearchApi, GoodsCategaryApi } from '../../apis/index'
const searchApi = new SearchApi()
const goodsCategaryApi = new GoodsCategaryApi()
import {
    isNotEmpty, deepCopyObj, safeObj, getFirstLetterPinYin
  } from '../../utils/YFWPublicFunction'
import { getModelArray } from './YFWFilterModel'
import './YFWFilterBoxModal.scss'

class YFWFilterBoxModal extends Component {

    config = {
        component: true
    }
    
    static defaultProps = {
        category_id: '',
        keywords: '',
        paramJson: '',
        froms: '',
        onChangeFilter: null,
        isShow2:false,
    }

    constructor (props) {
        super (props)
        this.state = {
          fakeObj:{},
            showIndex:false,
            isShow: false,
            animationData: {},
            drugNameDataArray:[],
            topDrugArray:[],
            manufacturerDataArray:[],
            topManufacturerDataArray:[],
            selectIndex: 0,
            showAll: false,
            brandsName: '商品名/品牌',
            manufacturersName: '厂家',
            specificationsName: '规格',
            scrollIntoViewID:'', 
            specificationsDataArray: [],
            topspecificationArray: [],
            isShow2:false,
            sectionspecificationArray: [],
        }
        this.cellLineScroll=this.cellLineScroll.bind(this)
    }
    /* 隐藏弹框 */
    hideModal () {
      this.setState({
        isShow2: false
      })
  
      setTimeout(() => {
        this.setState({
          isShow: false
        })
      }, 300)
    }

    /* 显示弹框 */
    showModal () {
      if(JSON.stringify(this.state.fakeObj) !='{}'){
        let _obj = this.state.fakeObj,_query={};
        _query = {
          'drugNameDataArray': _obj.drugNameDataArray || this.state.drugNameDataArray,
          'topDrugArray': _obj.topDrugArray || this.state.topDrugArray,
          'sectionDrugNameArray': _obj.sectionDrugNameArray || this.state.sectionDrugNameArray,
          'manufacturerDataArray': _obj.manufacturerDataArray || this.state.manufacturerDataArray,
          'topManufacturerDataArray': _obj.topManufacturerDataArray || this.state.topManufacturerDataArray,
          'sectionManufacturerArray': _obj.sectionManufacturerArray || this.state.sectionManufacturerArray,
          'specificationsDataArray': _obj.specificationsDataArray || this.state.specificationsDataArray,
          'topspecificationArray': _obj.topspecificationArray || this.state.topspecificationArray,
          'sectionspecificationArray': _obj.sectionspecificationArray || this.state.sectionspecificationArray,
        }
        this.setState(_query)
      }
      this.setState({
        isShow: true,
      },()=>{
        setTimeout(()=>{
          this.setState({
            isShow2:true
          })
        },200)

      })
        if (this.state.drugNameDataArray.length > 0 && this.state.manufacturerDataArray.length > 0) {
            return
        }
        if (this.props.froms == 'YFWSearchDetailListView') {
            searchApi.getAllBrands(this.props.keywords).then((res) => {
              res = getModelArray(res)
              let topDataArray = []
              if (res.length > 9) {
                topDataArray = res.slice(0, 8)
                topDataArray.push({ name: '查看全部...', isShowAll: true })
              } else {
                topDataArray = res
              }
              this.setState({
                drugNameDataArray: res,
                topDrugArray: topDataArray,
                sectionDrugNameArray: this.groupDataMethod(res),
              })
    
            })
            searchApi.getAllManufacturers(this.props.keywords).then((res) => {
              res = getModelArray(res)
              let topDataArray = []
              if(res.length > 9){
                topDataArray = res.slice(0, 8)
                topDataArray.push({ name: '查看全部...', isShowAll: true })
              } else {
                topDataArray = res
              }
              this.setState({
                manufacturerDataArray: res,
                topManufacturerDataArray:topDataArray,
                sectionManufacturerArray: this.groupDataMethod(res)
              })
            })
            searchApi.getAllSpecifications(this.props.keywords).then((res) => {
              res = getModelArray(res)
              let topDataArray = []
              if (res.length > 6) {
                topDataArray = res.slice(0, 5)
                topDataArray.push({ name: '查看全部...', isShowAll: true ,title:'查看全部...'})
              } else {
                topDataArray = res
              }
              this.setState({
                specificationsDataArray: res,
                topspecificationArray: topDataArray,
                sectionspecificationArray: this.groupDataMethod(res),
              })
              console.log('=======获取到后台返回的规格列表')
              // setTimeout(() => {
              //   event.emit('speciData', res);
              // }, 1000)
    
            })
        }
        if (this.props.froms == 'YFWSubCategoryController') {
            goodsCategaryApi.getAllBrands(this.props.category_id).then((res) => {
              console.log(res)
              res = getModelArray(res)
              let topDataArray = []
              if (res.length > 9) {
                topDataArray = res.slice(0, 8)
                topDataArray.push({ name: '查看全部...',isShowAll:true })
              } else {
                topDataArray = res
              }
              this.setState({
                drugNameDataArray: res,
                topDrugArray: topDataArray,
                sectionDrugNameArray:this.groupDataMethod(res),
              })
              this.groupDataMethod(res)
            })
            goodsCategaryApi.getAllManufacturers(this.props.category_id).then((res) => {
              console.log(res)
              res = getModelArray(res)
              let topDataArray = []
              if (res.length > 9) {
                topDataArray = res.slice(0, 8)
                topDataArray.push({ name: '查看全部...', isShowAll:true })
              } else {
                topDataArray = res
              }
              this.setState({
                manufacturerDataArray: res,
                topManufacturerDataArray: topDataArray,
                sectionManufacturerArray:this.groupDataMethod(res)
              })
              this.groupDataMethod(res)
            })
        }

    }

    groupDataMethod (dataArray) {
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
          } else {
            groupArray.push(item)
            let groupMap = { key: key, data: groupArray};
            groupBaseArray.push(groupMap);
          }
  
        }
  
        groupBaseArray = this.sortKeyword(groupBaseArray)
        console.log(groupBaseArray)
        return groupBaseArray
    }

    /**
     * 排序
     * @param array
     * @returns {*}
     */
    sortKeyword (array) {
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
    }

    /**筛选事件传递 */
    changeFilter (info) {
        console.log(info.detail)
        if(this.props.onChangeFilter) {
            this.props.onChangeFilter(info.detail)
        }
    }
    resetAction () {
        if (this.state.showAll) {
          if (this.state.showType == 'Aliascn') {
            this.emptyBrand();
          } else if (this.state.showType == 'ss') {
            this.emptymanufactor();
          } else {
            this.emptyspecifacitions();
          }
        } else {
          this.emptyBrand();
          this.emptymanufactor();
          this.emptyspecifacitions();
        }
    }
    //清空商品名的选择
    emptyBrand () {
      let _drugNameDataArray = JSON.parse(JSON.stringify(this.state.drugNameDataArray));
      _drugNameDataArray =_drugNameDataArray.map(item => {
        item.select = 'no';
        return item;
      })
      let _topDrugArray = JSON.parse(JSON.stringify(this.state.topDrugArray));
      _topDrugArray =_topDrugArray.map(item => {
        item.select = 'no';
        return item;
      })
      let _sectionDrugNameArray = JSON.parse(JSON.stringify(this.state.sectionDrugNameArray));
      _sectionDrugNameArray =_sectionDrugNameArray.map(item => {
        let _item = item.data.map(param=>{
          param.select = 'no';
          return param;
        })
        item.data = _item;
        return item;
      })
      this.setState({
        drugNameDataArray:_drugNameDataArray,
        topDrugArray:_topDrugArray,
        sectionDrugNameArray:_sectionDrugNameArray,
      })
    }
    //清空厂家的选择
    emptymanufactor () {
      let _topManufacturerDataArray = JSON.parse(JSON.stringify(this.state.topManufacturerDataArray));
      _topManufacturerDataArray = _topManufacturerDataArray.map(item => {
        item.select = 'no';
        return item;
      })
      let _manufacturerDataArray = JSON.parse(JSON.stringify(this.state.manufacturerDataArray));
      _manufacturerDataArray =_manufacturerDataArray.map(item => {
        item.select = 'no';
        return item;
      })
      let _sectionManufacturerArray = JSON.parse(JSON.stringify(this.state.sectionManufacturerArray));
      _sectionManufacturerArray =_sectionManufacturerArray.map(item => {
        let _item = item.data.map(param=>{
          param.select = 'no';
          return param;
        })
        item.data = _item;
        return item;
      })
      this.setState({
        topManufacturerDataArray:_topManufacturerDataArray,
        manufacturerDataArray:_manufacturerDataArray,
        sectionManufacturerArray:_sectionManufacturerArray,
      })
    }
    //清空规格的选择
    emptyspecifacitions () {
      let _topspecificationArray = JSON.parse(JSON.stringify(this.state.topspecificationArray));
      _topspecificationArray =_topspecificationArray.map(item => {
        item.select = 'no';
        return item;
      })
      let _specificationsDataArray = JSON.parse(JSON.stringify(this.state.specificationsDataArray));
      _specificationsDataArray =_specificationsDataArray.map(item => {
        item.select = 'no';
        return item;
      })
      let _sectionspecificationArray = JSON.parse(JSON.stringify(this.state.sectionspecificationArray));
      _sectionspecificationArray =_sectionspecificationArray.map(item => {
        let _item = item.data.map(param=>{
          param.select = 'no';
          return param;
        })
        item.data = _item;
        return item;
      })
      this.setState({
        topspecificationArray:_topspecificationArray,
        specificationsDataArray:_specificationsDataArray,
        sectionspecificationArray:_sectionspecificationArray,
      })
    }
    confirmAction () {
        console.log(this.state.manufacturerDataArray)
        console.log(this.state.drugNameDataArray)
        let selectManArray = [],selectDrugArray = [],selectspecificationsArray = [];
        this.state.manufacturerDataArray.map((item) => {
          if (item.select == 'select') {
            let info = item.id ? item.id : item.title
            selectManArray.push(info)
          }
        })
        this.state.drugNameDataArray.map((item) => {
          if (item.select == 'select') {
            let info = item.id ? item.id : item.title
            selectDrugArray.push(info)
          }
        })
        this.state.specificationsDataArray.map((item) => {
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
        let _query = this.state.fakeObj;
        _query.drugNameDataArray= this.state.drugNameDataArray;
        _query.topDrugArray= this.state.topDrugArray;
        _query.sectionDrugNameArray= this.state.sectionDrugNameArray;
        _query.manufacturerDataArray= this.state.manufacturerDataArray;
        _query.topManufacturerDataArray= this.state.topManufacturerDataArray;
        _query.sectionManufacturerArray= this.state.sectionManufacturerArray;
        _query.specificationsDataArray= this.state.specificationsDataArray;
        _query.topspecificationArray= this.state.topspecificationArray;
        _query.sectionspecificationArray= this.state.sectionspecificationArray;
        this.setState({
          fakeObj:_query
        })
        // this.triggerEvent('changeFilter', result)
        console.log(result)
        this.changeFilter({detail:result})
        this.hideModal()
    }

    backAction (e) {
        e.stopPropagation()
        this.setState({
          showAll: false,
          showIndex:false,
        })
    }

    itemClickAction (e) {
        e.stopPropagation()
        let item = e.currentTarget.dataset.info
        let index = e.currentTarget.dataset.index
        let type = e.currentTarget.dataset.type
        if (item.isShowAll) {
          this.setState({
            showAll: true,
            showType: type,
            showIndex: type == 'specification' ? false : true
          })
        } else {
          if (type == 'Aliascn') {
            let copyDrugNameArray = deepCopyObj(this.state.drugNameDataArray)
            let selectItem = this.state.drugNameDataArray[index]
            copyDrugNameArray[index].select = selectItem.select == 'select' ? 'no' : 'select'
            let copyTopDrugArray = deepCopyObj(this.state.topDrugArray)
            if (index < this.state.topDrugArray.length) {
              copyTopDrugArray[index].select = copyTopDrugArray[index].select == 'select' ? 'no' : 'select'
            }
            this.setState({
              drugNameDataArray: copyDrugNameArray,
              topDrugArray: copyTopDrugArray,
              sectionDrugNameArray:this.groupDataMethod(copyDrugNameArray)
            })
          } else if(type == 'ss'){
            let copyManuDataArray = deepCopyObj(this.state.manufacturerDataArray)
            let selectItem = this.state.manufacturerDataArray[index]
            copyManuDataArray[index].select = selectItem.select == 'select' ? 'no' : 'select'
            let copyTopManuDataArray = deepCopyObj(this.state.topManufacturerDataArray)
            if (index < this.state.topManufacturerDataArray.length) {
              copyTopManuDataArray[index].select = copyTopManuDataArray[index].select == 'select' ? 'no' : 'select'
            }
            this.setState({
              manufacturerDataArray: copyManuDataArray,
              topManufacturerDataArray: copyTopManuDataArray,
              sectionManufacturerArray: this.groupDataMethod(copyManuDataArray)
            })
          }else{
            let copysprciDataArray = deepCopyObj(this.state.specificationsDataArray) //copy所有返回的规格
            let selectItem = this.state.specificationsDataArray[index]  //获取点击的规格
            copysprciDataArray[index].select = selectItem.select == 'select' ? 'no' : 'select' //copy的所有规格更改点机的select属性
            let copyTopspeciDataArray = deepCopyObj(this.state.topspecificationArray) //copy展示的规格
            if (index < this.state.topspecificationArray.length) { //点机的规格在展示的规格里面
              copyTopspeciDataArray[index].select = copyTopspeciDataArray[index].select == 'select' ? 'no' : 'select' //更改展示的规格的select属性
            }
            this.setState({
              specificationsDataArray: copysprciDataArray,
              topspecificationArray: copyTopspeciDataArray,
              sectionspecificationArray: this.groupDataMethod(copysprciDataArray)
            }) 
          }
  
        }
    }

    /**索引点击 */
    indexesSelectAction (e) {
        let item = e.currentTarget.dataset.info
          this.setState({
            scrollIntoViewID:item
          })
        
        // let index = e.currentTarget.dataset.index
    }
    cellLineScroll(){
      this.state.scrollIntoViewID!==""&&(
        this.setState({
          scrollIntoViewID:""
        })
      )
    
    }
    render () {
        const { isShow,isShow2 } = this.state
        const { animationData } = this.state
        const { showType } = this.state
        const { brandsName } = this.state
        const { manufacturersName } = this.state
        const { showAll } = this.state
        const { scrollIntoViewID } = this.state
        const { topDrugArray } = this.state
        const { topManufacturerDataArray } = this.state
        const { sectionDrugNameArray } = this.state
        const { sectionManufacturerArray,specificationsName,topspecificationArray,sectionspecificationArray,showIndex} = this.state
        const {showSpecification} = this.props
        const arraykey = showType == 'Aliascn' ? sectionDrugNameArray : sectionManufacturerArray
        return (
            <View className='modal-back' hidden={!isShow}>
              <View  className={isShow2 ? 'opac1':'opac3'}>
               <View className="kob_content" style={'right:'+(!isShow2 ? '-1000px' : 0)} onClick={this.hideModal}>
                {showAll && (
                    <View className='top_container' onClick={e => e.stopPropagation()}>
                        <View className='top-back-view' onClick={this.backAction}>
                          <Image className='top_back' src={require('../../images/top_back_green.png')} ></Image>
                        </View>
                        <View className='top_title'>{showType == 'Aliascn' ? brandsName : manufacturersName}</View>
                    </View>
                )}
                <ScrollView style={"overflow-y: scroll;-webkit-overflow-scrolling: touch;top:"+(showAll ? 100 : 0)+"rpx"}
                    scrollY
                    onScroll={this.cellLineScroll}
                    scrollIntoView={scrollIntoViewID}
                    className='modal-content'
                   >
                      <View  onClick={e => e.stopPropagation()} style="height:100%;width:100%">
                    <View className='box-content' style={showAll?'margin-bottom:0px':'margin-bottom:80px'}  onClick={e => e.stopPropagation()}>
                        {!showAll ? (
                            <Block>
                                <Text className='Manufacturers-title'>{brandsName}</Text>
                                <View className='brands-content'>
                                    {topDrugArray.map((info, infoIndex) => {
                                        return (
                                            <Block>
                                                <View onClick={this.itemClickAction} data-type='Aliascn' data-info={info} data-index={infoIndex} 
                                                className={'content '+(info.isShowAll ? 'more' : info.select == 'select' ? 'select' : '')}>
                                                    <View>{info.name}</View>
                                                </View>
                                            </Block>
                                        )
                                    })}
                                </View>
                                <Text className='Manufacturers-title'>{manufacturersName}</Text>
                                <View className='brands-content'>
                                    {topManufacturerDataArray.map((secondInfo, secondIndex) => {
                                        return (
                                        <Block key={secondIndex}>
                                            <View onClick={this.itemClickAction} data-type="ss" data-info={secondInfo} data-index={secondIndex}
                                                className={'content ' + (secondInfo.isShowAll ? 'more' : secondInfo.select == 'select' ? 'select' : '')}
                                            >
                                                <View>{secondInfo.name}</View>
                                            </View>
                                        </Block>
                                        )
                                    })}
                                </View>
                                {showSpecification && (
                                <Text class='Manufacturers-title'>{specificationsName}</Text>
                                )}
                                {showSpecification && (
                                  <View className='brands-content'>
                                    {topspecificationArray.map((item,index)=>{
                                      const concls = 'content' + (item.isShowAll?' more':(item.select == 'select'?' select':''))
                                      return (
                                        <Block key={index}>
                                          <View onClick={this.itemClickAction} style="width:44%" data-type='specification' data-info={item} data-index={index} className={concls}>
                                            <View>{item.title}</View>
                                          </View>
                                      </Block>
                                      )

                                    })}
                                  </View>
                                )}

                            </Block>
                        ) : (
                            <Block>
                                <View className="center_content">
                                {(showType =='Aliascn' ? sectionDrugNameArray : showType =='ss' ?sectionManufacturerArray:sectionspecificationArray).map((info, infoIndex) => {
                                    return (
                                    <Block key={info.key}>
                                        {showType !="specification" &&(
                                        <View className='section_header' id={info.key}>{info.key}</View>
                                        )}
                                        {info.data.map((nextInfo, nextIndex) => {
                                            return (
                                                <Block>
                                                    <View onClick={this.itemClickAction} data-type={showType} data-info={nextInfo} data-index={nextInfo.index} className='cell'>
                                                        <View className={'cell_title ' + (nextInfo.select == 'select' ? 'cell_title_select' : '')}>
                                                        {nextInfo.title}
                                                        </View>
                                                        {nextInfo.select == 'select' && (
                                                            <Image className='cell_select ' src={require('../../images/duihao.png')} ></Image>
                                                        )}
                                                    </View>
                                                    <View className="cell_line"></View>
                                                </Block>
                                            )
                                        })}
                                    </Block>
                                    )
                                })}
                                </View>
                            </Block>
                        )}
                    </View>
                </View>
                </ScrollView>
                {showIndex && (
                    <View className='indexes' onClick={e => e.stopPropagation()}>
                        <View className='indexes_container'>
                        {arraykey.map((infos, infosIndex) => {
                            return (
                                 <View className='indexes_content' onClick={this.indexesSelectAction} data-info={infos.key}>{infos.key}</View>
                            )
                        })}
                        </View>
                    </View>
                )}
                <View className='bottom_container' onClick={e => e.stopPropagation()}>
                    <View onClick={this.resetAction} className='bottom_content bottom_left' >
                        <View>重置</View>
                    </View>
                    <View onClick={this.confirmAction} className='bottom_content bottom_right' >
                        <View>确定</View>
                    </View>
                </View>
              </View>
              </View>
            </View>
        )
    }
}

export default YFWFilterBoxModal