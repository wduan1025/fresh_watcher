function autoClick(){
    $("#btn").click();
}

setInterval(autoClick,1000);

$(function(){
    
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clickAmazonCheckout() {
    var buttons = document.getElementsByClassName("a-button-input");
    var button = buttons[0];
    button.click();
}

function noSlot(){
    var noSlotMessages = ["No delivery windows available"]
    var htmlStr = document.documentElement.innerHTML;
    for (i = 0; i < noSlotMessages.length; i++) {
        if (htmlStr.includes(noSlotMessages[i])) return true
    }
    return false
}