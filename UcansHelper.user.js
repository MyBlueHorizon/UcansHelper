// ==UserScript==
// @name         友看课堂小助手
// @namespace    UcansHelper
// @version      1.1.1
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
            console.info("签到已成功，于"+ mytime)
            notifyMe("操作成功","签到已成功，于"+ mytime)
        }
    } catch(err) {
        console.error(`脚本错误:${err}`)
        notifyMe("操作失败","脚本出错了，于"+ mytime)
    }
}

//function answerBtn() {
//    'use strict';
//    let st_elements = document.getElementsByClassName("st_answer");
//    var yesbtn_elements = document.getElementsById("s_submit");
//    var nobtn_elements = document.getElementsById("s_submit_no");
//    var roll_elements = document.getElementsById("s_submit_no");
//    var time_value = document.getElementsById("s_submit_no");
//    var myDate = new Date();
//    var mytime = myDate.toLocaleTimeString();
//    try {
//        if (st_elements.style.display =="block") {
//            if (time_value<=3){
//                if (l!=l){
//                    yesbtn_elements.click()
//                    console.info("已自动提交，于"+ mytime)
//                }
//                    else
//                    {
//                        nobtn_elements.click()
//                        console.info("已自动提交，于"+ mytime)
//                    }
//              }
//        }
//    }
//     catch(err) {
//        console.error(`脚本错误:${err}`)
//    }
//}

function notifyMe(title,massgae) {
    if (Notification.permission === "granted") {
        var notification = new Notification(title, {
            body: massgae,
            icon: "https://www.ucans.net/chatRoom/favicon.ico"
        });
    }
    // 否则我们需要向用户获取权限
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            // 如果用户同意，就可以向他们发送通知
            if (permission === "granted") {
                var notification = new Notification(title, {
                    body: massgae,
                    icon: "https://www.ucans.net/chatRoom/favicon.ico"
                });
            }
        });
    }
}
