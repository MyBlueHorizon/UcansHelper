// ==UserScript==
// @name         友看课堂小助手
// @namespace    UcansHelper
// @version      1.3.4
// @description  [非官方] 云课堂自动签到等辅助功能及优化。
// @author       MyBlueHorizon
// @supportURL   https://github.com/MyBlueHorizon/UcansHelper/issues
// @match        *://www.ucans.net/chatRoom/*
// @grant        GM_getValue
// @grant        GM_setValue
// @icon         https://www.ucans.net/chatRoom/favicon.ico
// @license      MIT License
// ==/UserScript==

var InitInterval

(function() {
    'use strict';
    var NowUrl = window.location.pathname;
    if (!("Notification" in window)) {
        alert("浏览器不支持桌面通知，部分功能无法使用，请更新浏览器");
    }
    if (NowUrl == "/chatRoom/video_live.html"){
        if(GM_getValue("AutoCheckRoll", true)==true){
            setInterval(ClickBtn, 3000)
        }
        if(GM_getValue("DanmakuDiscuss", true)==true){
        InitInterval=setInterval(readyinit,1000)
        }
        console.info("脚本已启用")
        console.warn("请合理使用，脚本造成的一切后果概不负责")
        NotifyMe("脚本已启用","请合理使用，脚本造成的一切后果概不负责")
    }
    if (NowUrl == "/chatRoom/Course_page.html"){
        console.info("脚本已启用")
        if(GM_getValue("ShowClassTime", true)==true){
        NotifyMe("听课时间",localStorage.getItem("localStudyingTimeLive"))
        }
        ChangeCoursePage()
        let settingButton = document.getElementById('settingButton');
        settingButton.onclick = showSettingBox;
        document.getElementById("autoCheckRoll").checked=GM_getValue("AutoCheckRoll", true)
        let autoCheckRoll = document.getElementById('autoCheckRoll');
        autoCheckRoll.onclick = setAutoCheckRoll;
        document.getElementById("showClassTime").checked=GM_getValue("ShowClassTime", true)
        let showClassTime = document.getElementById('showClassTime');
        showClassTime.onclick = setShowClassTime;
        let reWriteClassPage = document.getElementById('reWriteClassPage');
        reWriteClassPage.disabled=true
        reWriteClassPage.checked=true
        document.getElementById("danmakuDiscuss").checked=GM_getValue("DanmakuDiscuss", true)
        let danmakuDiscuss = document.getElementById('danmakuDiscuss');
        danmakuDiscuss.onclick = setDanmakuDiscuss;
    }
})();
function setAutoCheckRoll(e) {
    if (document.getElementById("autoCheckRoll").checked==true){
        GM_setValue("AutoCheckRoll", true)
    }
    else {
        GM_setValue("AutoCheckRoll", false)
    }
  }
function setShowClassTime(e) {
    if (document.getElementById("showClassTime").checked==true){
        GM_setValue("ShowClassTime", true)
    }
    else {
        GM_setValue("ShowClassTime", false)
    }
  }
function setDanmakuDiscuss(e) {
    if (document.getElementById("danmakuDiscuss").checked==true){
        GM_setValue("DanmakuDiscuss", true)
    }
    else {
        GM_setValue("DanmakuDiscuss", false)
    }
  }
function showSettingBox(e) {
    if (document.getElementById("setting-box").style.display=="block"){
        document.getElementById("setting-box").style.display="none"
    }
    else {
        document.getElementById("setting-box").style.display="block"
    }
}

function readyinit(){
    if (document.getElementsByClassName("vcp-player vcp-playing").length>0) {
        var playerel=document.getElementsByClassName("vcp-player vcp-playing")
        var damakuwrapper=document.createElement("div");
        var damakustyle=document.createElement("style");
        damakustyle.type="text/css"
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
        setInterval(AddNewMsg, 1000)
        clearInterval(InitInterval)
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

var LeastTimeMsgCount=0
function AddNewMsg(){
    var MsgList=document.getElementsByClassName("video-sms-list")
    var MsgCount=MsgList[0].children.length-1
    var AlreadyMsgCount
    for (AlreadyMsgCount=LeastTimeMsgCount;AlreadyMsgCount< MsgCount; AlreadyMsgCount=AlreadyMsgCount+1) {
        var DanmakuText=MsgList[0].children[AlreadyMsgCount+1].children[0].children[0].children[1].innerText
        LeastTimeMsgCount=LeastTimeMsgCount+1
        danmuPool.push(DanmakuText)
    }
}

function ChangeCoursePage(){
    document.getElementsByClassName("c-top-con clearfix")[0].style.width ="auto"
    document.getElementsByClassName("c-main")[0].style.width ="auto"
    document.getElementsByClassName("c-top")[0].style.background ="#1BA784"
    document.getElementById("Today_course").style.color ="#1661ab"
    document.getElementById("Today_course").style.borderBottomColor ="#1BA784"
    document.getElementById("course_set").style.color ="#1661ab"
    document.getElementById("course_set").style.borderBottomColor ="#1BA784"
    document.getElementById("old_course").style.color ="#1661ab"
    document.getElementById("old_course").style.borderBottomColor ="#1BA784"
    var settingButton=document.createElement("li");
    var topBar=document.getElementsByClassName("c-main-btn clearfix")
    settingButton.id="settingButton"
    settingButton.style="color: rgb(22, 97, 171);float: right;margin-right: 47px;"
    settingButton.innerHTML="脚本设置";
    topBar[0].appendChild(settingButton);
    var setstyle=document.createElement("style");
    setstyle.type="text/css"
    setstyle.innerHTML=".checke{float:right;position:relative;-webkit-appearance:none;width:40px;height:20px;line-height:20px;background:#eee;border-radius:10px;outline:none;border:2px solid #999}.checke:before{position:absolute;left:0;content:'';width:12px;height:12px;border-radius:50%;background:#eee;box-shadow:0 0 5px #ddd;transition:all .2s linear;border:2px solid #999}.checke:checked{background:#01a1d6}.checke:checked:before{left:20px;transition:all .2s linear}"
    document.getElementsByTagName('head')[0].appendChild(setstyle);
    var settingbox=document.createElement("div");
    settingbox.id="setting-box"
    settingbox.style="display: none;margin-left: 47px;margin-right: 47px;font-size: 24px;margin-bottom: 47px;background: #f8f8f8;height: 214px;"
    settingbox.innerHTML='<li style="margin-left: 24px;padding-top: 8px;">友看课堂小助手 设置</li><div style="padding : 8px 48px 0px 48px;clear : both;background: #f8f8f8; height: 24px;"><span style="float : left;display : inline-block;color : rgb(0,0,0);font-size: 18px;">自动签到</span><input type="checkbox" class="checke" id="autoCheckRoll"></div><div style="padding : 8px 48px 0px 48px;clear : both;background: #f8f8f8; height: 24px;"><span style="float : left;display : inline-block;color : rgb(0,0,0);font-size: 18px;">显示上课时间</span><input id="showClassTime" type="checkbox" class="checke"></div><div style="padding : 8px 48px 0px 48px;clear : both;background: #f8f8f8; height: 24px;"><span style="float : left;display : inline-block;color : rgb(0,0,0);font-size: 18px;">优化课程页面 [锁定]</span><input id="reWriteClassPage" type="checkbox" class="checke"></div><div style="padding : 8px 48px 0px 48px;clear : both;background: #f8f8f8; height: 24px;"><span style="float : left;display : inline-block;color : rgb(0,0,0);font-size: 18px;">评论区消息弹幕显示</span><input id="danmakuDiscuss" type="checkbox" class="checke"></div>'
    document.getElementsByClassName("c-main")[0].insertBefore(settingbox,document.getElementById("c-main-box1"));
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