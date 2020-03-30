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
    console.log('begin play', MusicObj.title)
    audio.src = MusicObj.src
    $('.music-name').innerText = MusicObj.title
    $('.music-author').innerText = MusicObj.author
}

// music 自动播放
var currentIndex = 0
var audio = new Audio()
audio.autoplay = true
audio.loop = true

getMusicList(function(List){
    console.log(List)
    MusicPlay(List[currentIndex])
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

    // progress-ball 跟随音乐播放移动
    $('.progress-now').style.width = (this.currentTime/this.duration) * 100 + '%'

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

// 点击 music 进度条
$('.time-bar').addEventListener('click', function(e){
    var NowProgress = e.offsetX / parseInt(getComputedStyle($('.time-bar')).width)
    audio.currentTime = audio.duration * NowProgress
})

// 拖拽 music 进度条
    var dragging = false
    var progress_ball = $('.progress-ball')

    // 鼠标按下的动作
    progress_ball.addEventListener('mousedown', down)

    // 鼠标移动的动作
    document.addEventListener('mousemove', move)

    // 释放鼠标的动作
    document.addEventListener('mouseup', up)

    // 鼠标按下后的函数,e为事件对象
    function down(e) {
        dragging = true

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
        dragging = false;
        // 获取当前元素位置
        var x = getMouseXY(e).x - offsetX
        var width = $('.time-bar').clientWidth - progress_ball.offsetWidth
        x = Math.min(Math.max(0, x), width)
        progress_ball.style.left = x + 'px'
        var ballProgress = x / width
        console.log('ballProgress' + ballProgress)
        // 修改不了 audio.currentTime
        audio.currentTime = audio.duration * ballProgress    
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