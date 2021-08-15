import Taro, { Component, Config } from "@tarojs/taro";
import { Block, Video, View } from "@tarojs/components";
import { pushNavigation } from "../../../../apis/YFWRouting";
import {isEmpty} from "../../../../utils/YFWPublicFunction.js"
import "./YFWVideoPage.scss"
export default class YFWVideo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            play_path:"",
            _initialTime:0,
            _autoplay:true,
            _loop:true,
            _showCenterPlayBtn:true,
            videoHeadline:""
        }
    }
    componentWillMount(){
        let options=this.$router.params;
        console.log(options)
        if(isEmpty(options)){
            return
        }
        let obj=JSON.parse(options.params);
        let _value=obj.value;
        // this.state.play_path=_value;
        let _valueArr=_value.split("/");
        let _allHead=_valueArr.pop();
        let headArr=_allHead.split(".");
        let delHead=headArr.pop();
        let _videoHeadline=headArr.join(".");
        // this.state.videoHeadline=_videoHeadline
        this.setState({
            play_path:_value,
            _videoHeadline:_videoHeadline
        })
        // console.log(this.state.play_path,_videoHeadline)
    }
    render() {
        const {play_path,_initialTime,_autoplay,_loop,_showCenterPlayBtn,_controls,_videoHeadline}=this.state;
        return (
            <View>
                <Video className="video_dom" src={play_path} initialTime={_initialTime} autoplay={_autoplay} loop={_loop} showCenterPlayBtn={_showCenterPlayBtn} controls={_controls} title={_videoHeadline}></Video>
            </View>

        )
    }
}