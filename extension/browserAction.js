/* eslint-disable */

let intervalHolder  = null
    nextPopupTime   = null,
    timer           = $('.time'),
    timerContainer  = $('.timer'),
    disabledAdding  = false;

/**
 * Update timer in popup
 */
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

const calculateProgress = (visited, total) => {
    return Math.round(visited * 100 / total) || 0;
};

/**
 * On document ready listener
 */
$(() => {
    // get data from storage when page is loaded
    chrome.storage.local.get('state', result => {
        if (!result.state || result.state.global.step !== -1) {
            return chrome.runtime.openOptionsPage();
        };
        
        // launch timer
        if (result.state.popups.nextPopupTime) {
            nextPopupTime = result.state.popups.nextPopupTime;
            intervalHolder = setInterval(updateTimer, 1000);      
            updateTimer();      
        }

        // check if there are bookmarks to go
        if (result.state.global.visitedIds.length == result.state.stats.bookmarksCount) {
            $('.open-now').hide();
            timerContainer.hide();
            $('.visited-all').show();
        }

        // hide timer if user chosen a manual calls
        if (result.state.global.scheduleFrequency == 'MANUAL') {
            timerContainer.hide();
        }
    });

    // get this tab info
    chrome.tabs.query({
		active: true
	}, function(tabs) {
        let tab = tabs[0];

        // if it's a service url - disable add to bookmarks button
        if ( tab.url.includes('chrome://') || tab.url.includes('chrome-extension://') ) {
            disabledAdding = true;
            $('.add-to-bookmarks').addClass('locked');
        }

        // check if this page is in bookmarks already
        chrome.bookmarks.search({
            url: tab.url
        }, result => {
            // exists in bookmarks - hide add to bkmrks button
            if (result.length) {
                $('.add-to-bookmarks').hide();
            }
        })
	});

    $('.add-to-bookmarks').on('click', () => {
        if (disabledAdding) return;
        
        // send the same data format as the context menu does
        chrome.runtime.sendMessage({ action: 'addNewBookmark' });
        
        // lets assume we added - lock button
        disabledAdding = true;
        $('.add-to-bookmarks').addClass('locked');
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