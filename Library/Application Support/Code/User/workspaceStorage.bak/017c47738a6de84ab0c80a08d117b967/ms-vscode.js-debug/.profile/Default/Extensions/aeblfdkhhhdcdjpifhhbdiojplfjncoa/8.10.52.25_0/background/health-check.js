"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="70237079-8bb6-5bb2-909d-36009841eeb0")}catch(e){}}();

(() => {
chrome.runtime.onMessage.addListener((e,a,t)=>{e.name==="health-check-request"&&(console.info("HealthCheck: received request from tab "+a.tab?.id),t({name:"health-check-response",data:"alive"}))});
})();

//# debugId=70237079-8bb6-5bb2-909d-36009841eeb0
