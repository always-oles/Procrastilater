/*global chrome:{}*/

let nextPopup = null,
	intervalHolder = null;

chrome.storage.local.get('state', (result) => {

	// get next popup time or make it now
	nextPopup = result.state.nextPopup || +new Date();

	// launch time checker
	//intervalHolder = setInterval(checkTime, 1000);
});

function checkTime() {
	if ( +new Date() > nextPopup ) {
		chrome.tabs.executeScript({
			file: 'inject.js'
		});
	}
}

chrome.tabs.onActivated.addListener(() => {
	//checkTime();
})

chrome.tabs.onUpdated.addListener(function() {
	//checkTime();
});

chrome.browserAction.onClicked.addListener(function (tab) {
	// for the current tab, inject the "inject.js" file & execute it
	chrome.tabs.executeScript(tab.ib, {
		file: 'inject.js'
	});
});

chrome.runtime.onMessage.addListener(
	(request, sender, sendResponse) => {
		switch (request.action) {
			case 'openTab':
				chrome.tabs.create({ url : request.url });
			break;
		}
	}
);

// chrome.tabs.create({
//     url: chrome.extension.getURL('dialog.html'),
//     active: false
// }, function(tab) {
//     // After the tab has been created, open a window to inject the tab
//     chrome.windows.create({
//         tabId: tab.id,
//         type: 'popup',
//         focused: true
//         // incognito, top, left, ...
//     });
// });