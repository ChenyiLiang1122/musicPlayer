var app = new Vue(
    {
        el:"#app",
        data:{
            text1:"123",
            text2:["123","456"],
            content:"<a href='http://www.baidu.com'>这是一个链接</a>",
            num:1,
            isShow:true,
            imArray:[
                "https://imgcdn.91pic.org/img/poster/c2afbd1443dc5f12.jpg",
                "https://www.70cn.com/wp-content/uploads/2019/09/70cn5588132335361.jpg",
                "https://www.btsj5.com/uploads/2019/11/p2570398360.jpg",
                "https://pic.meijutt.tv/pic/uploadimg/2020-11/p2624336463.jpg"
            ],
            imIndex:0,
            ImgButtonText:"隐藏图片",
            inputContent:"",
            noteList:[],
            num_joke:null,
            jokeList:[]
        },
        methods:{
            fun1:function (){
                this.text1+="123"
            },
            fun2:function (){
                this.text1="123"
            },
            add:function (){
                if(this.num<10){
                    this.num+=1
                }
                else {
                    alert("最多选10个！")
                }
            },
            sub:function (){
                if(this.num>1){
                    this.num-=1
                }
                else {
                    alert("至少选1个！")
                }
            },
            show:function (){
                if(this.isShow==true){
                    this.isShow=false
                    this.ImgButtonText="显示图片"
                }
                else{
                    this.isShow=true
                    this.ImgButtonText="隐藏图片"
                }
            },
            preImg:function (){
                this.imIndex-=1
            },
            nextImg:function (){
                this.imIndex+=1
            },
            commit:function (){
                this.noteList.push(this.inputContent)
                this.inputContent=""
            },
            del:function (p){
                this.noteList.splice(p,1)
            },
            clearAll:function (){
                this.noteList=[]
            },
            getJoke:function (){
                var tmp = this
                axios.get("https://autumnfish.cn/api/joke/list?num="+this.num_joke).then(
                    function (response){
                        tmp.jokeList=response.data.jokes
                    },
                    function (err){
                        console.log(err)
                    }
                )
                this.num_joke=null
            }
        }
    }
)