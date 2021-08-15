// pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn.js
var util = require('../../../../utils/util.js')

import {
  UserCenterApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
import TitleView from '../../../../components/YFWTitleView/YFWTitleView'
import './YFWMyPointsDetail.scss'
export default class YFWMyPointsDetail extends Taro.Component {
  constructor(props) {
    super(props)
    this.state = {
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
      valid_point:'',
      scrollHieght:null,
      getMore:2,
      noMore:2,
      nodata:1,
    }
  }

  componentWillMount() {
    let _height = Taro.getSystemInfoSync().screenHeight;
    this.setState({
      scrollHieght:_height-372+'px',
    })
    this.getData();
  }

  config = {
    navigationBarBackgroundColor: '#23D397',
    navigationBarTitleText: '积分明细',
    navigationBarTextStyle: 'white'
  }
  rankDetail(){
    pushNavigation('rankDetail')
  }
  tabClick(e){
    const { value,type } = e.currentTarget.dataset.item;
    if(type == this.state.point_type){
      return;
    }
    this.state.pageIndex = 1;
    this.state.data = [];
    this.state.point_type = type;
    this.setState({
      activeindex:value,
      point_type:type,
      data:[],
      noMore:2,
      nodata:1,
      getMore:2
    })
    this.getData()
  }
  getData(){
    let _type={}
    if(this.state.point_type !== ''){
      _type.point_type = this.state.point_type
    }
    userCenterApi.rankDetail({
      pageIndex:this.state.pageIndex,   
      pageSize:20,
      conditions:JSON.stringify(_type)
    }).then(res=>{
      if(res){
        if(res.dataList == null && this.state.pageIndex == 1){
          this.setState({
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

        this.setState({
          lock_point:res.lock_point || 0,
          valid_point :res.valid_point  || 0,
          data:this.state.data.concat(_data),
          getMore,
          noMore,
        })
      }
    },err=>{})
  }
  requestNextPage(){
    this.state.pageIndex++;
    this.getData();
  }
  render() {
    const { valid_point,lock_point,tab ,nodata,activeindex,data,getMore,noMore,totalhieght} = this.state;
    return (
      <View className="top">
        <Image src={require('../../../../images/rankbanner.png')} className='bgc'></Image>
        <View className="rank">
          <View className="rank_title">可用积分</View>
          <View className="rank_val">{valid_point}</View>
          <View className="rank_frooze">冻结积分：{lock_point}分</View>
        </View>
        <View className="rank_section">
          {
            tab.map((item,index)=>{
              return (
                <View onClick={this.tabClick} data-item={item}>
                <TitleView title={item.name} fontWeight={index == activeindex ? 'bolder':''}
                  showLine={index == activeindex} largeStyle={index == activeindex} />
                </View>
              )
            })
          }
        </View>
        <View className="rank_list">
          <View className="rank_list_title">
            <View className="rank_list_title_name">类型</View>
            <View className="rank_list_title_name">积分</View>
            <View className="rank_list_title_name">时间</View>
          </View>
          {nodata == 2 && (
          <View className="noMore">暂无积分明细</View>
          )}

          <ScrollView className="scroll" scrollY  style={'height:'+scrollHieght}>
            {data.map(item=>{
              let _rankColor = 'color:' + (item._color == 'red' ? '#ff0000':'#1fdb9b') +';font-weight:bolder'
              return (
                <View className='rank_list_value'>
                <View className="rank_list_title_name">{item.rule_cname}</View>
                <View className="rank_list_title_name"
                  style={_rankColor}>{item._rank}</View>
                <View className="rank_list_title_name">{item.time}</View>
              </View>
              )
            })}
            {getMore == 1 && <View className="getMore" onClick={this.requestNextPage}>查看更多</View>}
            {noMore == 1 &&  <View className="noMore">没有更多了</View>}

          </ScrollView>
        </View>
      </View>
    )
  }
}