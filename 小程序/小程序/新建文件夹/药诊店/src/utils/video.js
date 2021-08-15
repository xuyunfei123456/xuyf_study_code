//音频播放

const init = (initData,that)=>{
    const innerAudioContext = wx.createInnerAudioContext();
    const {autoplay=false,src} = initData;
    innerAudioContext.autoplay = autoplay;
    if(!src){
        throw new Error('not get src');
    }
    innerAudioContext.src = src;
    return {
        play:()=>{
            innerAudioContext.play()
        },
        pause:()=>{
            innerAudioContext.pause()
        },
    }
}







const videoPlayerInit = (initData,that)=>{  //创建实例的方法
    const instance = init(initData,that);
    return instance
} 

export default videoPlayerInit


