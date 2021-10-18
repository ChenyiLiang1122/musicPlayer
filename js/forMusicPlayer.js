
//格式化时间，将00:00.000的格式转化为秒
function formatTime(string){
    return parseInt(string.split(':')[0])*60+
        parseInt(string.split(':')[1].split('.')[0])+
        parseInt(string.split(':')[1].split('.')[1])*0.001
}

//排序歌词，修正某些时间轴有误的歌词
function sortLyric(lyricArr){
    var times=lyricArr.length-1
    for(let i=0;i<lyricArr.length-1;i++){
        for(let j=0;j<times;j++){
            if(lyricArr[j].time>lyricArr[j+1].time){
                let tmp=lyricArr[j+1]
                lyricArr[j+1]=lyricArr[j]
                lyricArr[j]=tmp
            }
        }
        times-=1
    }
}

new Vue(
    {
        el:"#all",
        data:function(){
            return {
                showMainPage: false,
                keyWord: "",
                musicAddress: "",
                musicList: [],
                haveMv: true,
                musicImg: null,
                videoAddress: null,
                isShowVideo: false,
                currentMusicComments: [],
                selectedMusicId: null,
                showDetail: false,
                musicInfo: {
                    musicName: null,
                    artists: [],
                    album: null
                },
                currentPage: 1,
                songCount: 0,
                currentLyricIndex: 0,
                lyricArr: [],
                moveY: 0
            }
        },
        methods:{
            //搜索（基础内容）
            search:function (offset){
                var tmp = this
                $.get("https://autumnfish.cn/search?keywords=" + this.keyWord + "&offset=" + offset, function (result) {
                    tmp.musicList = result.result.songs
                    tmp.songCount = result.result.songCount
                })
            },
            //搜索（输入框和搜索按钮调用）
            searchMusic:function (){
                this.showMainPage=true
                this.currentPage=1
                this.search(0)
            },
            //前一页
            prePage:function (){
                if(this.currentPage==1){
                    return
                }
                this.currentPage-=1
                this.search((this.currentPage-1)*30)
            },
            //下一页
            nextPage:function (){
                if(this.currentPage*30>this.songCount-1){
                    return
                }
                this.search(this.currentPage*30)
                this.currentPage+=1
            },

            //播放音乐并获取详细信息
            playMusic:function (id){
                //重置歌词滚动区和评论区
                this.currentMusicComments=[]
                this.musicImg=null
                this.lyricArr=[]
                this.moveY=0
                this.currentLyricIndex=0

                this.selectedMusicId=id
                var tmp = this

                //获取歌曲详细信息
                // $.get("https://autumnfish.cn/song/detail?ids="+id,function (result){
                //     tmp.musicImg=result.songs[0].al.picUrl
                //     tmp.musicInfo.musicName=result.songs[0].name
                //     tmp.musicInfo.album=result.songs[0].al.name
                //     tmp.musicInfo.artists=[]
                //     for(let i=0;i<result.songs[0].ar.length;i++){
                //         tmp.musicInfo.artists.push(result.songs[0].ar[i].name)
                //     }
                // })
                for(let i=0;i<tmp.musicList.length;i++){
                    if(tmp.selectedMusicId==tmp.musicList[i].id){
                        tmp.musicInfo.musicName=tmp.musicList[i].name
                        tmp.musicInfo.album=tmp.musicList[i].album.name
                        tmp.musicInfo.artists=[]
                        for (let j=0;j<tmp.musicList[i].artists.length;j++){
                            tmp.musicInfo.artists.push(tmp.musicList[i].artists[j].name)
                        }
                        $.get("https://autumnfish.cn/album?id="+tmp.musicList[i].album.id,function (result){
                            tmp.musicImg=result.songs[0].al.picUrl
                        })
                    }
                }

                //获取评论
                $.get("https://autumnfish.cn/comment/music?id="+id,function (result){
                    tmp.currentMusicComments=result.hotComments
                    for(let i=0;i<result.hotComments.length;i++){
                        let time=new Date(tmp.currentMusicComments[i].time).toLocaleString()
                        tmp.currentMusicComments[i].time=time
                    }
                })
                //获取歌词
                $.get("https://autumnfish.cn/lyric?id="+id,function (result){
                    try {
                        var liricArr_origin = result.lrc.lyric.split('\n')
                        var liricArr_tmp = []
                        for (let i = 0; i < liricArr_origin.length; i++) {
                            if (liricArr_origin[i] != null && liricArr_origin[i] != "") {
                                liricArr_tmp.push({
                                    time: formatTime(liricArr_origin[i].split(']')[0].substring(1)),
                                    lyric: liricArr_origin[i].split(']')[1]
                                })
                            }
                        }
                        sortLyric(liricArr_tmp)
                        tmp.lyricArr=liricArr_tmp
                    }catch (e){
                        tmp.lyricArr=[]
                    }
                })

                //获取歌曲url
                // $.get("https://autumnfish.cn/song/url?id="+id,function (result){
                //     tmp.musicAddress=result.data[0].url
                // })

                tmp.musicAddress="https://music.163.com/song/media/outer/url?id="+id+".mp3"

                //获取到所有信息后，刷新显示区
                this.showDetail=true
            },

            //播放MV
            playVideo:function (mvid){
                //暂停正在播放的音乐
                document.getElementById("audio").pause()
                //显示遮罩层
                this.isShowVideo=true
                var tmp = this
                $.get("https://autumnfish.cn/mv/url?id="+mvid,function (result){
                    tmp.videoAddress=result.data.url
                })
            },

            //隐藏遮罩层
            hide:function (){
                this.isShowVideo=false
            },

            //回到欢迎页面，重置所有参数
            welcome:function (){
                Object.assign(this.$data, this.$options.data())
            },

            //更新歌词
            updateLyric:function (){
                var time=document.getElementById("audio").currentTime
                var index=this.lyricArr.length-1//遍历索引，从歌词数组尾部开始搜索
                var lytic_old_index=this.currentLyricIndex
                while(index >= 0){
                    //从尾部开始往前搜索，找到的第一句开始时间小于或等于当前时间的歌词就是当前歌词
                    if(this.lyricArr[index].time<=time){
                        //如果找到的当前歌词是空行，则再往前定位一句
                        if(this.lyricArr[index].lyric!=""){
                            this.currentLyricIndex=index
                        }
                        else{
                            this.currentLyricIndex=index-1
                        }
                        break
                    }
                    else{
                        index-=1
                    }
                }
                if(lytic_old_index!=this.currentLyricIndex){
                    this.moveY-=this.currentLyricIndex-lytic_old_index
                }
            },
            //获取热门新歌
            getHotMusics:function (){
                $.ajaxSettings.async = false
                var tmp=this
                $.get("https://autumnfish.cn/personalized/newsong",function (result){
                    tmp.musicList=[]
                    for(let i=0;i<result.result.length;i++){
                        tmp.musicList.push(result.result[i].song)
                    }
                })
                this.playMusic(tmp.musicList[0].id)
                this.showMainPage=true
                $.ajaxSettings.async = true
            }
        }
    }
);
