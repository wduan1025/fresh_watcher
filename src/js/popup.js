'use strict';
import {amazon, amazonUrlPrefix,amazonCartUrl,amazonFreshCartUrl} from "./utils/resources.js";
let invalidBackgroundColor = "#C8C8C8";
let validBackgroundColor = "#4CAF50";
var watching = false;
// Init
let startWatcher = document.getElementById('startWatcher');
updatePageValidInfoWithBackground();
var currentTabId = -1;
// Get current page url
function updatePageValidInfoWithBackground(){
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    console.log(tabs);
    if (tabs.length === 0) {
      alert("Please refresh current tab");
    }
    // Get current tab url
    let url = tabs[0].url;
    console.log("current tab id is ", currentTabId);
    var isPageValid = (url === amazonCartUrl || url === amazonFreshCartUrl);
    console.log("Page valid: ", isPageValid);
    setPageValidAppearance(isPageValid);
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
      currentTabId = response.tabId;
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
      updatePageValidInfoWithBackground();
    }
  }
);

// Util function
function setPageValidAppearance(pageValid){
// Change popup window appearance according to 
// page validity information
  var element = document.getElementById("startWatcher");
  if (pageValid){
    // Set button green
    element.style.borderColor = validBackgroundColor;
    // Reset onclick
    startWatcher.onclick = onStartClickedOnValidPage;
    
  } else {
    // Set button gray
    element.style.borderColor = invalidBackgroundColor;
    // reset onclick
    startWatcher.onclick = onStartClickedOnInvalidPage;
  }
}
function onStartClickedOnValidPage() {
  console.log("Start watching!");
  watching = true;
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


// .HoverClass1:hover {color: blue !important; background-color: green !important;}
// .HoverClass2:hover {color: red !important; background-color: yellow !important;}
// JavaScript:

// var Button=document.getElementById('Button');
// /* Clear all previous hover classes */
// Button.classList.remove('HoverClass1','HoverClass2');
// /* Set the desired hover class */
// Button.classList.add('HoverClass1');