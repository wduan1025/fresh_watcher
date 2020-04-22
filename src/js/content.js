console.log("hey");
// Listers
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(message);
    if (message.type === "action") {
        if (message.data === "click") {
            clickOnPage();
        }
    }
});


function sleep(ms) {
    console.log("Sleeping");
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Utils
async function clickOnPage() {
    var sleepTime = 2000 * (1 + Math.random());
    await sleep(sleepTime);
    var checkoutPageText = "Checkout Amazon Fresh Cart";
    var continuePageText = "Before you checkout";
    var noSlotPageText = "No delivery windows available";
    var htmlText = document.documentElement.innerHTML;
    if (htmlText.includes(checkoutPageText)) {
        clickAmazonCheckout();
    } else if (htmlText.includes(continuePageText)) {
        clickAmazonContinue();
    } else if (htmlText.includes(noSlotPageText)) {
        window.history.back();
    } else if (false){
        //TODO(weiduan): check if slot found
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