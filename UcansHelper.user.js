// ==UserScript==
// @name         友看课堂小助手
// @namespace    UcansHelper
// @version      1.1.2
// @description  [非官方] 云课堂自动签到等辅助功能及优化。
// @author       MyBlueHorizon
// @supportURL   https://github.com/MyBlueHorizon/UcansHelper/issues
// @match        *://www.ucans.net/chatRoom/*
// @grant        none
// @icon         https://www.ucans.net/chatRoom/favicon.ico
// @license      MIT License
// ==/UserScript==

(function() {
    'use strict';
    if (!("Notification" in window)) {
        alert("浏览器不支持桌面通知，部分功能无法使用，请更新浏览器");
    }
    setInterval(clickBtn, 3000)
    console.info("脚本已启用")
    console.warn("请合理使用，脚本造成的一切后果概不负责")
    notifyMe("脚本已启用","请合理使用，脚本造成的一切后果概不负责")
})();

function clickBtn() {
    'use strict';
    let st_elements = document.getElementsByClassName("st_Roll");
    var btn_elements = document.getElementsByClassName("st_Roll").rollDiv.children;
    var myDate = new Date();
    var mytime = myDate.toLocaleTimeString();
    try {
        if (st_elements.rollDiv.style.display == "" || st_elements.rollDiv.style.display =="block") {
            btn_elements[1].click()
            console.info("已执行签到操作，于"+ mytime)
            notifyMe("操作成功","已执行签到操作，于"+ mytime)
        }
    } catch(err) {
        console.error(`脚本错误:${err}`)
        notifyMe("操作失败","脚本出错了，于"+ mytime)
    }
}

function notifyMe(title,massgae) {
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
