// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {amazon, amazonUrlPrefix} from "./utils/resources.js";
console.log(amazon);
'use strict';
var watchingTabId = -1;
var watching = false;
console.log("watching on tab: ", watchingTabId);
var amazonPageActivated = undefined;
// message senders
function sendMessageToActiveContent(message){
  console.log("Sending message to active content");
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(activeTab.id, message, function(response) {
      console.log(`message from content: ${JSON.stringify(response)}`);
    });
  });
}

function sendMessageToContent(message){
  console.log("Sending message to content");
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var activeTab = tabs[0];
    var url = activeTab.url;
    var website = getCurrentWebsite(url);
    if (website === undefined) {
      alert("You are not on the desired webpage");
      return;
    }
    chrome.tabs.sendMessage(activeTab.id, message, function(response) {
      console.log(`message from content: ${JSON.stringify(response)}`);
    });
  });
}

// Message listeners
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {          
  console.log("updated tabId: ", tabId, "Current tab id: ", watchingTabId);
  if (watchingTabId === -1) updateWatchingTabId(tabId);
  if (tabId === watchingTabId){
    if (changeInfo.status == 'complete') {  
      if (watching) {
        var clickMessage = {
          type : "action",
          data : "click"
        }
        console.log("Message from background to content: ", clickMessage);
        chrome.tabs.sendMessage(tabId, clickMessage, function(response) {
          console.log(`message from content: ${JSON.stringify(response)}`);
        });
      } else {
        // Tell popup to update
        var updateMessage = {
          type : "page update"
        };
        console.log("Message from background to popup: ", updateMessage);
        chrome.runtime.sendMessage(updateMessage);
      }
   }
  }
});

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
      console.log("Message received by background: ", message);
      if (message.type === "page validity") {
        if (message.isPageValid) {
          updateWatchingTabId(message.tabId);
          watching = message.watching;
          console.log("Tab updated to ", message.tabId, " watching? ", watching);
          // TODO(weiduan): Send response to popup.js
          var response = {
            type : "ack",
            tabId : message.tabId
          };
          sendResponse(response);
        }
      } else if (message.type === "page action") {
        sendResponse({type: "ack"});
      }
  }
);

chrome.runtime.onInstalled.addListener(function() {
  console.log("Extension installed")
});

// Utils
function updateWatchingTabId(tabId) {
  watchingTabId = tabId;
  console.log("watching tab updated to ", watchingTabId);
}