// 封装 document.querySelector()
function $(selector){
    return document.querySelector(selector)
}

// 封装获取 getMusicList
function getMusicList(callback){
    var xhr = new XMLHttpRequest()
    xhr.open('GET', 'music.json', true)
    xhr.addEventListener('load', function(){
        if((xhr.status >= 200 && xhr.status <= 300)|| (xhr.status = 304)){
            callback(JSON.parse(this.responseText))
        }else{
            console.log('获得数据失败')
        }
    })
    xhr.send()
}

// 封装 Music 播放
function MusicPlay(MusicObj){
    console.log(MusicObj.title)
    audio.src = MusicObj.src
    $('.music-name').innerText = MusicObj.title
    $('.music-author').innerText = MusicObj.author
}

// music 自动播放
var currentIndex = 0;
var audio = new Audio();
var MusicList = [];
audio.autoplay = true;
audio.loop = true;

// music 播放
getMusicList(function(List){
    console.log(List)
    MusicList = List;
    MusicPlay(List[currentIndex])
})

// music last & next
// last
$('.music-last').addEventListener('click', function(){
    var num = --currentIndex;
    target = num % getMusicList.length
    MusicPlay(MusicList[target])
})
// next
$('.music-next').addEventListener('click', function(){
    var num = ++currentIndex;
    target = num % getMusicList.length
    MusicPlay(MusicList[target])
})

// music 循环播放设置
if(audio.loop === true){
    $('.music-loop svg').style.fill = "rgba(255, 255, 255, 1)";
}else{
    $('.music-loop svg').style.fill = "rgba(255, 255, 255, 0.4)";
}

$('.music-loop').addEventListener('click', function(){
    if(audio.loop === false){
        audio.loop = true;
        $('.music-loop svg').style.fill = "rgba(255, 255, 255, 1)";
        console.log('audio.loop = true;')
    }else{
        audio.loop = false;
        $('.music-loop svg').style.fill = "rgba(255, 255, 255, 0.4)";
        console.log('audio.loop = false;')
    }
})

//处理当 time 仅为有一位时，适当作出补充。例如：04
function SingleSecond(str){
    if(str.length == 2){
        return str
    }else{
        return '0' + str
    }
}

// 如下代码设置 每1秒左右执行一次
// 就是设置一个“数据更新的”开关，不断开启-关闭，间隔为 1s。
audio.shouldUpdate = true
// 当currentTime更新时会触发timeupdate事件
audio.ontimeupdate = function(){
  var _this = this
  if(_this.shouldUpdate) {
    // music 进度条变化
    $('.progress-now').style.width = (this.currentTime/this.duration) * 100 + '%';

    // // progress-ball 跟随音乐播放移动
    $('.progress-ball').style.left = (this.currentTime/this.duration) * ($('.time-bar').clientWidth) + 'px'

    // 获取 music 总时长
    $('.time-sum').innerText =  Math.floor((this.duration)/60) + ':' + Math.floor((this.duration)%60);

    // 获取当前 music 时长
    $('.time-start').innerText = Math.floor((this.currentTime/60)) + ':' + SingleSecond(Math.floor((this.currentTime%60))+'')

    console.log('update')
    //关闭数据更新
    _this.shouldUpdate = false
    // 1s后，开启数据更新 
    setTimeout(function(){
      _this.shouldUpdate = true
    }, 1000)
  }
}

// 播放器交互设置
// 设置 play & pause
$('.music-control .play').addEventListener('click', function(){
    audio.play()
    console.log('music' + ' ' +  'play')
    $('.pause').classList.remove('hidden')
    $('.play').classList.add('hidden')
})

$('.music-control .pause').addEventListener('click', function(){
    audio.pause()
    console.log('music' + ' ' + 'pause')
    $('.pause').classList.add('hidden')
    $('.play').classList.remove('hidden')
})

// 拖拽 music 进度条
    var num = 0;
    var timer = null;
    var dragging = false
    var progress_ball = $('.progress-ball');
    var offsetX = null;
    var width = null;

    // 鼠标按下的动作
    progress_ball.addEventListener('mousedown', down)

    // 鼠标移动的动作
    document.addEventListener('mousemove', move)

    // 释放鼠标的动作
    $('.time-bar').addEventListener('mouseup', up)

    // 鼠标按下后的函数,e为事件对象
    function down(e) {
        // 开始计时事件，单位为 50ms
        timer = setInterval(()=>{
            num++;
        },10);
        dragging = true
        downOffsetX = e.offsetX;
        // 获取元素所在的坐标
        ballX = progress_ball.offsetLeft
        ballY = progress_ball.offsetTop

        // 获取鼠标所在的坐标
        mouseX = parseInt(getMouseXY(e).x)
        mouseY = parseInt(getMouseXY(e).y)
 
        // 鼠标相对元素左和上边缘的坐标
        offsetX = mouseX - ballX
        offsetY = mouseY - ballY
    }

    // 鼠标移动调用的函数
    function move(e){
        if (dragging) {
            // 获取移动后的元素的坐标
            var x = getMouseXY(e).x - offsetX
            var y = getMouseXY(e).y - offsetY

            // 计算可移动位置的大小， 保证元素不会超过可移动范围
            // 此处就是父元素的宽度减去子元素宽度
            var width = $('.time-bar').clientWidth - progress_ball.offsetWidth + 5
            var height = $('.time-bar').clientHeight - progress_ball.offsetHeight - 4

            // min方法保证不会超过右边界，max保证不会超过左边界
            x = Math.min(Math.max(0, x), width)
            y = Math.min(Math.max(0, y), height)

            // 给元素及时定位
            progress_ball.style.left = x + 'px'
            progress_ball.style.top = y + 'px'

            var NowProgress = x / width
            var NowTime = NowProgress * audio.duration;
            $('.time-start').innerText = Math.floor((NowTime/60)) + ':' + SingleSecond(Math.floor((NowTime%60))+'')
            $('.progress-now').style.width = NowProgress * 100 + '%'
        }
    }

    // 释放鼠标的函数
    function up(e){
        // 清除当前计时，如果 > 5 (50ms) 就拖拽
        clearInterval(timer);
        if (num > 5) {
            dragging = false;
            // 获取当前元素位置
            var x = getMouseXY(e).x - offsetX
            var width = $('.time-bar').clientWidth - progress_ball.offsetWidth
            x = Math.min(Math.max(0, x), width)
            progress_ball.style.left = x + 'px'
            var ballProgress = x / width
            audio.currentTime = audio.duration * ballProgress
        }else {
            // 否则进行点击事件
            dragging = false;
            var NowProgress = e.offsetX / parseInt(getComputedStyle($('.time-bar')).width)
            audio.currentTime = audio.duration * NowProgress
        }
        
    }

    // 函数用于获取鼠标的位置
    function getMouseXY(e){
        var x = 0, y = 0
        e = e || window.event

        if (e.pageX) {
            x = e.pageX
            y = e.pageY
        } else {
            x = e.clientX + document.body.scrollLeft - document.body.clientLeft
            y = e.clientY + document.body.scrollTop - document.body.clientTop
        }
        return {
            x: x,
            y: y
        }
    }

// music-volume 控制
// icon-volume
if( audio.volume !== 0){
    $('.icon-volume svg').style.fill = "rgba(255, 255, 255, 1)"
}else{
    $('.icon-volume svg').style.fill = "rgba(255, 255, 255, 0.4)"
}
// 当前 volume 控制器
audio.volume = 0.5
$('.music-volume .progress-now').style.width = $('.music-volume .progress-sum').clientWidth * audio.volume + 'px'
$('.music-volume .volume-ball').style.left = $('.music-volume .progress-sum').clientWidth * audio.volume  + 'px' 
