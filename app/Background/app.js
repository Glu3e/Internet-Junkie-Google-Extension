var bgModule = require('../../app/Background/background.js');
chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.query({active: true, currentWindow: true},function(tabs){
        if(typeof bgModule.prevTab == "undefined"){
            bgModule.prevTab = bgModule.extractDomain(tabs[0].url);
        }else{
            bgModule.updateDeactivationTime(bgModule.prevTab);
            bgModule.prevTab = bgModule.extractDomain(tabs[0].url);
        }
    });
    chrome.tabs.get(activeInfo.tabId, function(tab){
        if(chrome.runtime.lastError){
            var errorMsg = chrome.runtime.lastError.message;
            console.error(errorMsg);
        }else{
            if(tab.active && tab.url != "chrome://newtab/"){
                bgModule.tabUpdatedAndActive(tab.url, tab.favIconUrl);
                bgModule.globalURL = tab.url;
            }
        }
    });
});

//Check if the tab is Updated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if(tab.url != "chrome://newtab/"){
      //check for anactive tab reloading
      if (tab.active) {
          //comapre if the domain is the same
          if (!tab.url.includes(bgModule.extractDomain(bgModule.globalURL))) {
              if (changeInfo.status == "complete" && tab.status == "complete" && tab.url != undefined) {
                  if (tab.active && tab.url != "chrome://newtab/") {
                      bgModule.tabUpdatedAndActive(tab.url, tab.favIconUrl);
                      bgModule.updateDeactivationTime(bgModule.prevTab);
                      bgModule.prevTab = bgModule.extractDomain(tab.url);
                      bgModule.globalURL = tab.url;
                  }
              }
          }
      }
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "popup") {
        //get websites
        chrome.storage.local.get('websiteList', function (data) {});
        //get blacklist
        chrome.storage.local.get('blackList', function (data) {});
    }
    if (request.action == "remove") {
        bgModule.websiteList = request.list;
        chrome.storage.local.set({'websiteList': bgModule.websiteList}, function() {});
    }
    if(request.action == "addBlacklist"){
        bgModule.blackList = request.blackList;
        chrome.storage.local.set({'blackList': bgModule.blackList}, function() {
        });
    }
    if(request.action == "removeBlacklist"){
      bgModule.blackList = request.blackList;
      chrome.storage.local.set({'blackList': bgModule.blackList}, function() {
      });
    }
});

//reset for arrays on app reload
//bgModule.resetBlackList();
bgModule.blackListInit();
bgModule.resetWesiteList();

// Check if chome is out of focus or pc in sleep mode
chrome.windows.onFocusChanged.addListener(function(window) {
    if (window === chrome.windows.WINDOW_ID_NONE) {
        bgModule.inFocus = false;
        if(bgModule.prevTab !== ""){
          bgModule.updateDeactivationTime(bgModule.prevTab);
        }
        bgModule.globalURL = bgModule.prevTab;
        console.log("chrome is not active");
    } else {
        bgModule.inFocus = true;
        chrome.tabs.query({active: true, currentWindow: true},function(tabs){
          if(bgModule.prevTab !== ""){
              bgModule.tabUpdatedAndActive(bgModule.extractDomain(tabs[0].url));
              bgModule.prevTab = bgModule.extractDomain(tabs[0].url);
              bgModule.globalURL = bgModule.extractDomain(tabs[0].url);
          }
        });
        console.log("chrome is active");
    }
});
