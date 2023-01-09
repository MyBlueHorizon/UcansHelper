//弹幕相关

//准备初始化弹幕
function readyDanmakuInit(){

    //判断播放器是否已加载
    if (document.getElementsByClassName("vcp-player vcp-playing").length>0) {

        //注入弹幕相关元素，初始化弹幕
        var playerel=document.getElementsByClassName("vcp-player vcp-playing")
        var damakuwrapper=document.createElement("div");
        var damakustyle=document.createElement("style");
        damakustyle.innerHTML="#wrapper{position:absolute;pointer-events:none;overflow:hidden;color:#FFFFFF;font-size:28px;text-shadow:2px 2px #000;left:0px;top:0px}.right{position:absolute;visibility:hidden;white-space:nowrap;transform:translateX(700px)}.left{position:absolute;white-space:nowrap;user-select:none;transition:transform 7s linear}"
        document.getElementsByTagName('head')[0].appendChild(damakustyle);
        damakuwrapper.setAttribute('id','wrapper')
        var blakeheight=document.documentElement.clientHeight-(document.getElementsByClassName("vcp-bigplay")[0].style.height-48)
        damakuwrapper.style.top=blakeheight
        damakuwrapper.style.width=playerel[0].style.width
        damakuwrapper.style.height=playerel[0].style.height
        playerel[0].appendChild(damakuwrapper)
        init();

        // 每隔1ms从弹幕池里获取弹幕（如果有的话）并发射
        setInterval(() => {
            let channel;
            if (danmuPool.length && (channel = getChannel()) != -1) {
                let dom = domPool[channel].shift();
                let danmu = danmuPool.shift();
                shootDanmu(dom, danmu, channel);
            }
        }, 1);

        //添加消息监听，完成初始化
        setInterval(addNewMsg, 1000)
        clearInterval(danmakuInitInterval)
        toastr.success("弹幕模块初始化成功")
    }

}

/**
 * 设置 弹幕DOM池 每一个通道最多六条弹幕
**/

const MAX_DM_COUNT = 6;
const CHANNEL_COUNT = 10;

let domPool = [];
let danmuPool = [
    '友看课堂小助手 弹幕功能已启用'
];
let hasPosition = [];

/**
 * 做一下初始化工作
 */
function init() {
    let wrapper = document.getElementById('wrapper')
    // 先new一些span 重复利用这些DOM
    for (let j = 0; j < CHANNEL_COUNT; j++) {
        let doms = [];
        for (let i = 0; i < MAX_DM_COUNT; i++) {
            // 要全部放进wrapper
            let dom = document.createElement('span');
            wrapper.appendChild(dom);
            // 初始化dom的位置 通过设置className
            dom.className = 'right';
            // DOM的通道是固定的 所以设置好top就不需要再改变了
            dom.style.top = j * 32 + 'px';
            // 放入改通道的DOM池
            doms.push(dom);
            // 每次到transition结束的时候 就是弹幕划出屏幕了 将DOM位置重置 再放回DOM池
            dom.addEventListener('transitionend', () => {
                dom.className = 'right';
                // dom.style.transition = null;
                // dom.style.left = null;
                dom.style.transform = null;

                domPool[j].push(dom);
            });
        }
        domPool.push(doms);
    }
    // hasPosition 标记每个通道目前是否有位置
    for (let i = 0; i < CHANNEL_COUNT; i++) {
        hasPosition[i] = true;
    }
}

/**
 * 获取一个可以发射弹幕的通道 没有则返回-1
 */
function getChannel() {
    for (let i = 0; i < CHANNEL_COUNT; i++) {
        if (hasPosition[i] && domPool[i].length) return i;
    }
    return -1;
}

/**
 * 根据DOM和弹幕信息 发射弹幕
 */
function shootDanmu(dom, text, channel) {
    console.log('biu~ [' + text + ']');
    dom.innerText = text;
    // 如果为每个弹幕设置 transition 可以保证每个弹幕的速度相同 这里没有保证速度相同
    // dom.style.transition = `transform ${7 + dom.clientWidth / 100}s linear`;
    // dom.style.left = '-' + dom.clientWidth + 'px';
    // 设置弹幕的位置信息 性能优化 left -> transform
    dom.style.transform = `translateX(${-dom.clientWidth}px)`;
    dom.className = 'left';
    hasPosition[channel] = false;
    // 弹幕全部显示之后 才能开始下一条弹幕
    // 大概 dom.clientWidth * 10 的时间 该条弹幕就从右边全部划出到可见区域 再加1秒保证弹幕之间距离
    setTimeout(() => {
        hasPosition[channel] = true;
    }, dom.clientWidth * 10 + 1000);
}

//监听讨论区添加弹幕
var leastTimeMsgCount=0
function addNewMsg(){
    var msgList=document.getElementsByClassName("video-sms-list")
    var msgCount=msgList[0].children.length-1
    var alreadyMsgCount
    for (alreadyMsgCount=leastTimeMsgCount;alreadyMsgCount< msgCount; alreadyMsgCount=alreadyMsgCount+1) {
        var danmakuText=msgList[0].children[alreadyMsgCount+1].children[0].children[0].children[1].innerText
        leastTimeMsgCount=leastTimeMsgCount+1
        danmuPool.push(danmakuText)
    }
}