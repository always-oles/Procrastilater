/*global chrome, sharedAPI, getRandomToken*/

/**
 * Global variables
 */
const API = 'http://localhost:3000/';
var TOKEN = null,
	intervalHolder = null,
	nextPopup = null,
	updateTimer;

(updateTimer = function updateTimer(nextPopupTime) {
	// if passed
	if (nextPopupTime) {
		launchTimer(nextPopupTime);
	} 
	// otherwise get from local storage
	else {
		chrome.storage.local.get('state', (result) => {
			launchTimer(result.state.popups.nextPopupTime);
		});
	}

	function launchTimer(time) {
		// get next popup time or make it now
		nextPopup = parseInt(time) || null;

		// launch timer
		if (nextPopup) {
			clearInterval(intervalHolder);
			intervalHolder = setInterval(checkTime, 1000);
		}
	}
})();

/**
 * Checking if timer is expired
 * if expired - open popup
 */
function checkTime() {
	// convert to unix timestamp without miliseconds
	let now = parseInt((+new Date()).toString().slice(0,-3));

	// time is out
	if (now > nextPopup) {
		console.warn('need to update timer,',now-nextPopup);

		// stop timer
		clearInterval(intervalHolder);

		// create popup and open it
		chrome.storage.local.get('state', result => {
			let foldersIds      = result.state.global.foldersIds.slice();
			let allVisitedIds   = result.state.global.allVisitedIds.slice();

			sharedAPI.createPopup(allVisitedIds, foldersIds, bookmark => {
				openPopup(bookmark);
			});
		});
		
		// chrome.storage.local.get('state', (result) => {
		// 	sharedAPI.generateTimer(false, result.state, (newTime) => {
		// 		// update storage timer
		// 		let newState = result.state;
		// 		newState.popups.nextPopupTime = newTime;

		// 		chrome.storage.local.set({'state' : newState}, () => {
		// 			console.warn('new state saved, updating timer');
		// 			updateTimer(newTime);					
		// 		});
		// 	});
		// });

		//createPopup();
	} else {
		console.warn(now-nextPopup, 'left');
	}
}


chrome.browserAction.onClicked.addListener(function (tab) {
	// for the current tab, inject the "inject.js" file & execute it
	chrome.tabs.executeScript(tab.ib, {
		file: 'inject.js'
	});
});

chrome.runtime.onMessage.addListener(
	(request, sender, sendResponse) => {
		console.warn('background received message: ', request);
		switch (request.action) {
			case 'openTab':
				chrome.tabs.create({ url : request.url });
			break;

			case 'openPopup':
				openPopup(request.data);
			break;

			case 'updateTimer':
				updateTimer(request.data);
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


/**
 * Once extension is installed - generate unique token for user
 */
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason == 'install') {
		TOKEN = getRandomToken();
		chrome.storage.local.set({ 'token' : TOKEN});
		saveTokenInCookies(TOKEN);
    } else {
		chrome.storage.local.get( 'token', (result) => {
			if ( !result.token ) {
				TOKEN = getRandomToken();
				chrome.storage.local.set({ 'token' : TOKEN});
				saveTokenInCookies(TOKEN);
			}
		});
	}
});

/**
 * Uninstall
 */
chrome.runtime.setUninstallURL(API + 'uninstall');

function getRandomToken() {
    var randomPool = new Uint8Array(16);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    return hex + (+new Date());
}

function saveTokenInCookies(token) {
	chrome.cookies.set(
		{ 
			url: API + 'uninstall', 
			name: 'token', 
			value: token, 
			expirationDate: (new Date().getTime()/1000) + 9999999 
		}
	);
}

function openPopup(data) {
	if (!data) return;

	// put data to storage to share with injected script
	data.sound = true;
	chrome.storage.local.set({'popupData': data});

	console.warn('data for popup: ', data);

	// check active tab if it's not a service url
	chrome.tabs.query({
		active: true
	}, function(tabs) {
		if ( tabs[0].url.includes('chrome-extension://') || tabs[0].url.includes('chrome://')) {
			console.warn('service tab is active');

			// get all tabs
			chrome.tabs.getAllInWindow(null, (tabs) => {
				// remove service urls from array
				let safeTabs = [];

				for (let i in tabs) {
					if (!tabs[i].url.includes('chrome-extension://') && !tabs[i].url.includes('chrome://')) {
						safeTabs.push(tabs[i]);
					}
				}

				let lastTabId = safeTabs[safeTabs.length-1].id;

				// switch to last non-service tab
				chrome.tabs.update(lastTabId, {selected: true});
				// inject popup into it
				injectScript(lastTabId);
			});

		} else {
			injectScript(tabs[0].id);
		}
	});


	function addListeners() {
		console.warn('adding listeners for chrome tabs');
		chrome.tabs.onActivated.addListener(injectScript);
		chrome.tabs.onUpdated.addListener(injectScript);
	}

	function injectScript(id) {
		if (!id) { id = null; }

		console.warn('injecting!');
		chrome.tabs.executeScript(id, {
			file: 'inject.js'
		});

		// remove listeners upon injection
		removeListeners();
	}

	function removeListeners() {
		console.warn('removing listeners');
		chrome.tabs.onActivated.removeListener(injectScript);
		chrome.tabs.onUpdated.removeListener(injectScript);
	}
}

/////////////////////////////////////////////////////// //chrome.runtime.openOptionsPage();


// chrome.storage.local.get('token', (result) => {
// 	if ( result.token ) {
// 		TOKEN = result.token;
// 	} else {
// 		TOKEN = getRandomToken();
// 		chrome.storage.local.set({ 'token' : TOKEN});
// 	}
// 	saveTokenInCookies(TOKEN);
// });