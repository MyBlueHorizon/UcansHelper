// ==UserScript==
// @name         空中课堂 辅助脚本
// @namespace    UcansHelper
// @version      1.0.2
// @description  自动签到
// @author       MyBlueHorizon
// @match        *://www.ucans.net/chatRoom/*
// @grant        none
// @icon         http://www.ucans.net/chatRoom/favicon.ico
// @license      MIT License
// ==/UserScript==

(function() {
    'use strict';
    setInterval(clickBtn, 3000)
    console.info("脚本已启用")
})();

function clickBtn() {
    'use strict';
    let btn_elements = document.getElementsByClassName("st_Roll");
    var getcheck = document.getElementsByClassName("st_Roll").rollDiv.children;
    var myDate = new Date();
    var mytime = myDate.toLocaleTimeString();
    try {
        if (btn_elements.rollDiv.style.display == "" || btn_elements.rollDiv.style.display =="block") {
            getcheck[1].click()
            console.info("签到已成功，于"+ mytime)
        }
    } catch(err) {
        console.error(`脚本错误:${err}`)
    }
}
