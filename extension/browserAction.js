/* eslint-disable */

let intervalHolder      = null
    nextPopupTime           = null,
    timer               = $('.time'),
    progressBar         = $('.progress-container .bar'),
    progressNumbers     = $('.progress-numbers');


const updateTimer = () => {
    let difference  = moment.unix(nextPopupTime).diff(moment());
    let duration    = moment.duration(difference);

    // add leading zero to hours if needed
    let hours = 
        Math.floor(duration.asHours()).toString().length == 1
            ? '0' + Math.floor(duration.asHours()) 
            : Math.floor(duration.asHours());
    
    let result = hours + moment.utc(difference).format(':mm:ss');
    
    // check if less than 0
    if (moment.utc(difference).format('X') < 0) {
       return timer.html('00:00:00');
    }
    return timer.html(result);
};

$(() => {
    // get data from storage
    chrome.storage.local.get('state', result => {
        if (!result.state) return;
        
        // launch timer
        if (result.state.popups.nextPopupTime) {
            nextPopupTime = result.state.popups.nextPopupTime;
            intervalHolder = setInterval(updateTimer, 1000);      
            updateTimer();      
        }
    });

    $('.add-to-bookmarks').on('click', () => {

    });

    $('.open-now').on('click', () => {
        chrome.runtime.sendMessage({ action: 'manualCall' });
        window.close();
    });

    $('.open-settings').on('click', () => {
        chrome.runtime.openOptionsPage();
    });
});

$(window).blur(function() { 
    clearInterval(intervalHolder);
});