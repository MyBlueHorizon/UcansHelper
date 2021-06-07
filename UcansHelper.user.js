// ==UserScript==
// @name         友看课堂小助手
// @namespace    UcansHelper
// @version      1.4.1
// @description  [非官方] 云课堂自动签到等辅助功能及优化。
// @author       MyBlueHorizon
// @supportURL   https://github.com/MyBlueHorizon/UcansHelper/issues
// @match        *://www.ucans.net/chatRoom/*
// @require      https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/toastr@2.1.4/toastr.min.js
// @resource     toastrCSS https://cdn.jsdelivr.net/npm/toastr@2.1.4/build/toastr.min.css
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getResourceText
// @icon         https://www.ucans.net/chatRoom/favicon.ico
// @license      MIT License
// ==/UserScript==

var danmakuInitInterval

(function() {

    'use strict';

    //添加 toastr 通知样式表
    GM_addStyle(GM_getResourceText("toastrCSS"))

    //判断浏览器是否支持通知 API
    if (!("Notification" in window)) {

        toastr.warning("浏览器不支持桌面通知，部分功能无法使用，请更新浏览器")

    }

    //判断当前页面
    var nowUrl = window.location.pathname;

    //直播页面
    if (nowUrl == "/chatRoom/video_live.html"){

        //判断是否开启签到
        if(GM_getValue("isAutoCheckRoll", true)==true){
            setInterval(ClickBtn, 3000)
        }

        //判断消息是否弹幕化
        if(GM_getValue("isDanmakuDiscuss", true)==true){
            danmakuInitInterval=setInterval(readyDanmakuInit,1000)
        }

        console.info("UcansHelper 载入成功")
        toastr.info("脚本已启用")
        toastr.warning("请合理使用，脚本造成的一切后果概不负责!","免责声明")

    }

    //课程页面
    if (nowUrl == "/chatRoom/Course_page.html"){

        console.info("UcansHelper 载入成功")

        //显示听课时间
        if(GM_getValue("isShowClassTime", true)==true){

            toastr.info(localStorage.getItem("localStudyingTimeLive"),"听课时间")

        }

        //修改课程页面
        changeCoursePage()

        //绑定设置按钮实践
        let settingButton = document.getElementById('settingButton');
        settingButton.onclick = showSettingBox;

        //载入设置状态

        //自动签到
        document.getElementById("autoCheckRoll").checked=GM_getValue("isAutoCheckRoll", true)
        let autoCheckRoll = document.getElementById('autoCheckRoll');
        autoCheckRoll.onclick = setAutoCheckRoll;

        //显示上课时间
        document.getElementById("showClassTime").checked=GM_getValue("isShowClassTime", true)
        let showClassTime = document.getElementById('showClassTime');
        showClassTime.onclick = setShowClassTime;

        //重写课程页面
        let reWriteClassPage = document.getElementById('reWriteClassPage');
        reWriteClassPage.disabled=true
        reWriteClassPage.checked=true

        //弹幕化讨论区
        document.getElementById("danmakuDiscuss").checked=GM_getValue("isDanmakuDiscuss", true)
        let danmakuDiscuss = document.getElementById('danmakuDiscuss');
        danmakuDiscuss.onclick = setDanmakuDiscuss;

        //设定页脚动画
        document.getElementsByClassName("svg-box")[0].style.fontSize="medium"
        document.getElementsByClassName("svg-box")[0].style.marginBottom="0"

        //页脚置底（未完成）
        //document.getElementsByClassName("svg-box")[0].style.marginTop=document.documentElement.clientHeight-document.getElementById("svgbox").offsetTop+"px"
        //document.getElementsByClassName("svg-box")[0].style.marginTop=
        //document.getElementsByClassName("svg-box2")[0].style.fontSize="medium"

    }

})();

//显示设置页面
function showSettingBox(e) {

    if (document.getElementById("setting-box").style.display=="block"){
        document.getElementById("setting-box").style.display="none"
    }
    else {
        document.getElementById("setting-box").style.display="block"
    }

}

//设置更改

//自动签到
function setAutoCheckRoll(e) {

    if (document.getElementById("autoCheckRoll").checked==true){
        GM_setValue("isAutoCheckRoll", true)
    }
    else {
        GM_setValue("isAutoCheckRoll", false)
    }

}

//显示听课时间
function setShowClassTime(e) {

    if (document.getElementById("showClassTime").checked==true){
        GM_setValue("isShowClassTime", true)
    }
    else {
        GM_setValue("isShowClassTime", false)
    }

}

//弹幕化讨论区
function setDanmakuDiscuss(e) {

    if (document.getElementById("danmakuDiscuss").checked==true){
        GM_setValue("isDanmakuDiscuss", true)
    }
    else {
        GM_setValue("isDanmakuDiscuss", false)
    }

}

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

//修改课程页面
function changeCoursePage(){

    //修改元素样式
    document.getElementsByClassName("c-top-con clearfix")[0].style.width ="auto"
    document.getElementsByClassName("c-main")[0].style.width ="auto"
    document.getElementsByClassName("c-top")[0].style.background ="#1677b3"
    document.getElementById("Today_course").style.color ="#1677b3"
    document.getElementById("Today_course").style.borderBottomColor ="#1677b3"
    document.getElementById("course_set").style.color ="#1677b3"
    document.getElementById("course_set").style.borderBottomColor ="#1677b3"
    document.getElementById("old_course").style.color ="#1677b3"
    document.getElementById("old_course").style.borderBottomColor ="#1677b3"
    document.getElementById("demand_list").style.color ="#1677b3"
    document.getElementById("demand_list").style.borderBottomColor ="#1677b3"
    document.getElementById("file_list").style.color ="#1677b3"
    document.getElementById("file_list").style.borderBottomColor ="#1677b3"

    //添加页面样式
    var setstyle = document.createElement("style");
    setstyle.innerHTML=".checke{float:right;position:relative;-webkit-appearance:none;width:40px;height:20px;line-height:20px;background:#eee;border-radius:10px;outline:none;border:2px solid #999}.checke:before{position:absolute;left:0;content:'';width:12px;height:12px;border-radius:50%;background:#eee;box-shadow:0 0 5px #ddd;transition:all .2s linear;border:2px solid #999}.checke:checked{background:#01a1d6}.checke:checked:before{left:20px;transition:all .2s linear };svg:not(:root) {overflow: hidden;}svg {width: 100%}.svg-box{height: 146px;margin-top: 100px;}.editorial {height: 150px;margin-top: -150px;}.editorial {display: block;width: 100%;height: 10em;max-height: 100vh;margin-top: -101px;}.parallax>use {animation: move-forever 12s linear infinite;}.parallax>use:nth-child(1) {animation-delay: -2s;}.parallax>use:nth-child(2) {animation-delay: -2s;animation-duration: 5s;}.parallax>use:nth-child(3) {animation-delay: -4s;animation-duration: 3s;}@keyframes move-forever {0% {transform: translate(-90px,0);}100% {transform: translate(85px,0);}"
    document.getElementsByTagName('head')[0].appendChild(setstyle);

    //添加设置按钮和内容
    var settingButton=document.createElement("li");
    var topBar=document.getElementsByClassName("c-main-btn clearfix")
    settingButton.id="settingButton"
    settingButton.style="color: rgb(22, 97, 171);float: right;margin-right: 47px;"
    settingButton.innerHTML="脚本设置";
    topBar[0].appendChild(settingButton);

    var settingbox=document.createElement("div");
    settingbox.id="setting-box"
    settingbox.style="display: none;margin-left: 47px;margin-right: 47px;font-size: 24px;margin-bottom: 47px;background: #f8f8f8;height: 214px;"
    settingbox.innerHTML='<li style="margin-left: 24px;padding-top: 8px;">友看课堂小助手 设置</li><div style="padding : 8px 48px 0px 48px;clear : both;background: #f8f8f8; height: 24px;"><span style="float : left;display : inline-block;color : rgb(0,0,0);font-size: 18px;">自动签到</span><input type="checkbox" class="checke" id="autoCheckRoll"></div><div style="padding : 8px 48px 0px 48px;clear : both;background: #f8f8f8; height: 24px;"><span style="float : left;display : inline-block;color : rgb(0,0,0);font-size: 18px;">显示上课时间</span><input id="showClassTime" type="checkbox" class="checke"></div><div style="padding : 8px 48px 0px 48px;clear : both;background: #f8f8f8; height: 24px;"><span style="float : left;display : inline-block;color : rgb(0,0,0);font-size: 18px;">优化课程页面 [锁定]</span><input id="reWriteClassPage" type="checkbox" class="checke"></div><div style="padding : 8px 48px 0px 48px;clear : both;background: #f8f8f8; height: 24px;"><span style="float : left;display : inline-block;color : rgb(0,0,0);font-size: 18px;">评论区消息弹幕显示</span><input id="danmakuDiscuss" type="checkbox" class="checke"></div>'
    document.getElementsByClassName("c-main")[0].insertBefore(settingbox,document.getElementById("c-main-box1"));

    //添加页脚
    var donghua=document.createElement("footer");
    donghua.className="svg-box"
    donghua.id="svgbox"
    document.getElementsByTagName('body')[0].appendChild(donghua)
    document.getElementsByClassName("svg-box")[0].innerHTML="<svg class='editorial'xmlns='http://www.w3.org/2000/svg'xmlns:xlink='http://www.w3.org/1999/xlink'viewBox='0 24 150 28'preserveAspectRatio='none'><defs><path id='gentle-wave'd='M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z'></path></defs><g class='parallax'><use xlink:href='#gentle-wave'x='50'y='0'fill='rgba(128,215,175,.5)'></use><use xlink:href='#gentle-wave'x='50'y='3'fill='rgba(128,215,175,.5)'></use><use xlink:href='#gentle-wave'x='50'y='6'fill='rgba(128,215,175,.5)'></use></g></svg>"

    //未完成
    //var donghua2=document.createElement("footer");
    //donghua2.className="svg-box2"
    //donghua2.id="svgbox2"
    //document.getElementsByTagName('body')[0].appendChild(donghua2)
    //document.getElementsByClassName("svg-box2")[0].innerHTML="<svg class='editorial'xmlns='http://www.w3.org/2000/svg'xmlns:xlink='http://www.w3.org/1999/xlink'viewBox='0 24 150 28'preserveAspectRatio='none'><defs><path id='gentle-wave'd='M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z'></path></defs><g class='parallax'><use xlink:href='#gentle-wave'x='50'y='0'fill='rgba(128,215,175,.5)'></use><use xlink:href='#gentle-wave'x='50'y='3'fill='rgba(128,215,175,.5)'></use><use xlink:href='#gentle-wave'x='50'y='6'fill='rgba(128,215,175,.5)'></use></g></svg>"
    //document.getElementsByClassName("svg-box2")[0].style.transform="rotate(180deg)"

}

function ClickBtn() {
    var st_elements = document.getElementsByClassName("st_Roll");
    var btn_elements = document.getElementsByClassName("st_Roll").rollDiv.children;
    var myDate = new Date();
    var mytime = myDate.toLocaleTimeString();
    try {
        if (st_elements.rollDiv.style.display == "" || st_elements.rollDiv.style.display =="block") {
            btn_elements[1].click()
            console.info("已执行签到操作，于"+ mytime)
            NotifyMe("操作成功","已执行签到操作，于"+ mytime)
        }
    } catch(err) {
        console.error(`脚本错误:${err}`)
        NotifyMe("操作失败","脚本出错了，于"+ mytime)
    }
}

function NotifyMe(title,massgae) {
    if (Notification.permission === "granted") {
        var notification = new Notification(title, {
            body: massgae,
            icon: "https://www.ucans.net/chatRoom/favicon.ico"
        });
    }
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            if (permission === "granted") {
                var notification = new Notification(title, {
                    body: massgae,
                    icon: "https://www.ucans.net/chatRoom/favicon.ico"
                });
            }
        });
    }
}
