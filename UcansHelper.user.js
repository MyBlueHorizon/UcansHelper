// ==UserScript==
// @name         空中课堂 辅助脚本
// @namespace    UcansHelper
// @version      1.0.1
// @description  自动签到
// @author       Nobody
// @match        *://www.ucans.net/chatRoom/*
// @grant        none
// @icon         http://www.ucans.net/chatRoom/favicon.ico
// @license      MIT License
// ==/UserScript==

(function() {
    'use strict';
    setInterval(clickBtn, 3000)
    // Your code here...
})();
function clickBtn() {
    'use strict';
    let btn_elements = document.getElementsByClassName("st_Roll");
    var getcheck = document.getElementsByClassName("st_Roll").rollDiv.children;
    var myDate = new Date();
    var mytime=myDate.toLocaleTimeString();
    console.log("探测签到中")
    try {
        if (btn_elements.rollDiv.style.display == "" || btn_elements.rollDiv.style.display =="block") {
            console.info("签到已成功"+ mytime)
            getcheck[1].click()
        }
        if (btn_elements.rollDiv.style.display == "none") {
            console.log("当前无签到")
        }
    } catch(err) {
        console.error(`脚本错误:${err}`)
    }
}