console.log("hey");
var maxNumClicks = 3;
// Listers
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log("Message received by content js is ", message);
    if (message.type === "action") {
        if (message.data === "click") {
            var clickResponse = {
                data : "Click message received"
            };
            sendResponse(clickResponse);
            var numClicks = message.times;
            clickOnPage(numClicks);
        }
    }
});


function sleep(ms) {
    console.log("Sleeping");
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Utils
async function clickOnPage(numClicks) {
    var sleepTime = 500 * (1 + Math.random());
    await sleep(sleepTime);
    var checkoutPageText = "Checkout Amazon Fresh Cart";
    var continuePageText = "Before you checkout";
    var noSlotPageText = "No delivery windows available";
    var scheduleDeliveryText = "Schedule your order";
    var htmlText = document.documentElement.innerHTML;
    if (numClicks > maxNumClicks) {
        console.log("Mocking slot found message");
        var stopMessage = {
            type : "action",
            data : "stop success"
          }
          chrome.runtime.sendMessage(stopMessage, function(response) {
            console.log(`Response from background: ${JSON.stringify(response)}`);
        });
        return;
    }
    if (htmlText.includes(checkoutPageText)) {
        clickAmazonCheckout();
    } else if (htmlText.includes(continuePageText)) {
        clickAmazonContinue();
    } else if (htmlText.includes(noSlotPageText)) {
        window.history.back();
    } else if (htmlText.includes(scheduleDeliveryText)){
        // Since "No delivery window" text is not matched, this page 
        // Should definitely be a page where slot is available
        var stopMessage = {
            type : "action",
            data : "stop success"
          }
          chrome.runtime.sendMessage(stopMessage, function(response) {
            console.log(`Response from background: ${JSON.stringify(response)}`);
        });
    } else {
        var stopMessage = {
            type : "action",
            data : "stop error"
          }
          chrome.runtime.sendMessage(stopMessage, function(response) {
            console.log(`Response from background: ${JSON.stringify(response)}`);
        });
    }
}
function clickAmazonCheckout() {
    var buttons = document.getElementsByClassName("a-button-input");
    var button = buttons[0];
    button.click();
}

function clickAmazonContinue() {
    var continue_buttons = document.getElementsByClassName("a-button-text a-text-center")
    var continue_button = continue_buttons[0]
    continue_button.click();
}