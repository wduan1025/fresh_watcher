console.log("hey");
var maxNumClicks = 100000;
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
    var sleepTime = 2000 * (1 + Math.random());
    await sleep(sleepTime);
    var checkoutPageText = "Checkout Amazon Fresh Cart";
    var checkoutPageText1 = "Proceed to checkout";
    var continuePageText = "Before you checkout";
    var noSlotPageText = "No delivery windows available";
    var noSlotPageText1 = "No doorstep delivery windows";
    var noSlotPageText2 = "No attended delivery windows";
    var scheduleDeliveryText = "Schedule your order";
    var placeOrderText = "Place your order";
    var availabilityText = "Limited availability";
    var paymentText = "Select a payment method";
    var htmlText = document.documentElement.innerHTML;
    if (numClicks > maxNumClicks) {
        console.log("Mocking slot found message");
        var stopMessage = {
            type : "action",
            data : "stop success"
          }
          alert("Delivery window found!");
          chrome.runtime.sendMessage(stopMessage, function(response) {
            console.log(`Response from background: ${JSON.stringify(response)}`);
        });
        return;
    }
    if (htmlText.includes(checkoutPageText) || htmlText.includes(checkoutPageText1)) {
        console.log("checking out");
        clickAmazonCheckout();
    } else if (htmlText.includes(continuePageText)) {
        console.log("Continuing");
        clickAmazonContinue();
    } else if (htmlText.includes(scheduleDeliveryText) || htmlText.includes(paymentText) || htmlText.includes(placeOrderText) || htmlText.includes(availabilityText)){
        // Since "No delivery window" text is not matched, this page 
        // Should definitely be a page where slot is available
        // Or if you are asked to select payment method, should have slot
        console.log("slot found");
        var stopMessage = {
            type : "action",
            data : "stop success"
          }
          chrome.runtime.sendMessage(stopMessage, function(response) {
            console.log(`Response from background: ${JSON.stringify(response)}`);
        });
    } else if (htmlText.includes(noSlotPageText) || htmlText.includes(noSlotPageText1) || htmlText.includes(noSlotPageText2)) {
        //TODO(weiduan): The first text will always appear even if there is available slot. It works for now by being put under the
        //logic of slot found, but this wouldn't last for long.
        console.log(htmlText.includes(noSlotPageText));
        console.log(htmlText.includes(noSlotPageText1));
        console.log(htmlText.includes(noSlotPageText2));
        console.log("No slot");
        await sleep(2000);
        window.history.back();
    } else {
        console.log("Nothing found on this page");
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