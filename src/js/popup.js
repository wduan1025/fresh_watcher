'use strict';
import {amazonCartUrl,amazonFreshCartUrl, amazonFreshCartUrlPrefix} from "./utils/resources.js";
let invalidColor = "#C8C8C8";
let startBorderColor = "#4CAF50";
let stopBorderColor = "red";
var watching = false;
// Init
let startWatcher = document.getElementById('startWatcher');
let stopWatcher = document.getElementById('stopWatcher');
updatePageValidInfoWithBackground();
var currentTabId = -1;
// Get current page url
function updatePageValidInfoWithBackground(){
  // Send message to background js to get watching status
  var queryMessage = {
    type : "query"
  }
  console.log("Message from popup to background: ", queryMessage);
  chrome.runtime.sendMessage(queryMessage, function(queryResponse) {
    console.log(`Response from background: ${JSON.stringify(queryResponse)}`);
    if (queryResponse.watching) {
      return;
    }
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      console.log(tabs);
      if (tabs.length === 0) {
        alert("Please refresh cart page and restart Fresh Watcher");
        exit();
      }
      // Get current tab url
      let url = tabs[0].url;
      console.log("current tab id is ", currentTabId);
      var isPageValid = isInCart(url);
      console.log("Page valid: ", isPageValid);
      console.log("Current page tab is ", tabs[0].id);
      // If current page is valid, send message to background js
      // to record this tab
      var backgroundMessage = {
        type : "page validity",
        isPageValid : isPageValid,
        tabId : tabs[0].id,
        watching: watching
      };
      console.log("Message from popup to background ", backgroundMessage);
      chrome.runtime.sendMessage(backgroundMessage, function(response) {
        console.log(`Response from background: ${JSON.stringify(response)}`);
        // if (response === undefined) {
        //   return;
        // }
        setPageValidAppearance(isPageValid);
        currentTabId = response.tabId;
      });
    });
  });
}
// Message senders

// Listeners
chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    console.log("Received message from background: ", message);
    if (message.type === "page update") {
      // Maybe tell background that I'm watching
      console.log("Updating popup...");
      if ('extra' in message) {
        console.log("Maybe stop watching in popup");
        watching = message.watching;
      }
      updatePageValidInfoWithBackground();
    }
  }
);

// Util function
function setPageValidAppearance(pageValid){
  console.log("Setting popup button appearance");
// Change popup window appearance according to 
// page validity information
  if (pageValid){
    // Set button green
    startWatcher.style.borderColor = startBorderColor;
    // Reset onclick
    startWatcher.onclick = onStartClickedOnValidPage;
  } else {
    // Set button gray
    startWatcher.style.borderColor = invalidColor;
    // reset onclick
    startWatcher.onclick = onStartClickedOnInvalidPage;
  }
  if (!watching) {
    stopWatcher.style.borderColor = invalidColor;
    stopWatcher.onclick = onInvalidStopClicked;
  }
}
function onInvalidStopClicked(){
  alert("Fresh Watcher is not running");
}
function onValidStopClicked() {
  console.log("Stop clicked");
  watching = false;
  stopWatcher.style.borderColor = invalidColor;
  stopWatcher.onclick = onInvalidStopClicked;
  var stopMessage = {
    type : "action",
    data : "stop manual"
  };
  chrome.runtime.sendMessage(stopMessage, function(response) {
    console.log(`Response from background: ${JSON.stringify(response)}`);
  });
}
function onStartClickedOnValidPage() {
  console.log("Start watching!");
  watching = true;
  // Change stopWatcher style
  stopWatcher.style.borderColor = stopBorderColor;
  stopWatcher.onclick = onValidStopClicked;
  // Send message to backgrond js to update tab id
  updatePageValidInfoWithBackground();
  console.log("In onClick, currentTabId is ", currentTabId);
  // Send message to content js to click
  var clickMessage = {
    type : "action",
    data : "click"
  }
  chrome.tabs.sendMessage(currentTabId, clickMessage, function(response) {
    console.log(`Response from background: ${JSON.stringify(response)}`);
  });
}

function onStartClickedOnInvalidPage() {
  console.log("Clicked on invalid page");
  alert("Please go to your cart page");
}

var websiteTitleElements = document.getElementsByClassName("websiteTitle");
for (var i = 0; i < websiteTitleElements.length; i++) {
  websiteTitleElements[i].addEventListener("click", onTitleClicked);
}

function onTitleClicked(event) {
  var website = event.target.id + "Instruction"; 
  console.log(website);
  var websiteIntro = document.getElementById(website);
  console.log(websiteIntro);
  toggleElementVisibility(websiteIntro);
  console.log("clicked");
}

function toggleElementVisibility(elem){
  if (elem.style.display === "block") {
    hideElement(elem);
  } else {
    showElement(elem);
  }
}
function showElement(elem) {
  elem.style.display='block';
}
function hideElement(elem) {
  elem.style.display='none';
}

function isInCart(url){
  return url === amazonCartUrl || 
    url === amazonFreshCartUrl ||
    url.startsWith(amazonFreshCartUrlPrefix);
}
// .HoverClass1:hover {color: blue !important; background-color: green !important;}
// .HoverClass2:hover {color: red !important; background-color: yellow !important;}
// JavaScript:

// var Button=document.getElementById('Button');
// /* Clear all previous hover classes */
// Button.classList.remove('HoverClass1','HoverClass2');
// /* Set the desired hover class */
// Button.classList.add('HoverClass1');