// ==UserScript==
// @name         友看课堂小助手
// @namespace    UcansHelper
// @version      1.0.4
// @description  [非官方] 云课堂自动签到等辅助功能及优化。
// @author       MyBlueHorizon
// @supportURL   https://github.com/MyBlueHorizon/UcansHelper/issues
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
    let st_elements = document.getElementsByClassName("st_Roll");
    var btn_elements = document.getElementsByClassName("st_Roll").rollDiv.children;
    var myDate = new Date();
    var mytime = myDate.toLocaleTimeString();
    try {
        if (st_elements.rollDiv.style.display == "" || st_elements.rollDiv.style.display =="block") {
            btn_elements[1].click()
            console.info("签到已成功，于"+ mytime)
        }
    } catch(err) {
        console.error(`脚本错误:${err}`)
    }
}