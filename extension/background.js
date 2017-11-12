/*global chrome, getRandomToken: function*/

/**
 * Global variables
 */
let TOKEN = null,
	nextPopup = null,
	intervalHolder = null;
const API = 'http://localhost:3000/';

chrome.storage.local.get('state', (result) => {

	// get next popup time or make it now
	nextPopup = (result.state && result.state.nextPopup) || +new Date();

	// launch time checker
	//intervalHolder = setInterval(checkTime, 1000);
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

			case 'createPopup':
				createPopup(sender, request.data);
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

function createPopup(sender, data) {
	// set data to storage
	chrome.storage.local.set({'popupData': data});

	//if currently open page is not a service page or extension page
	if ( !sender.url.includes('chrome://') && !sender.url.includes('chrome-extension://') ) {
		console.warn('can execute script on current tab');
		chrome.tabs.executeScript({
			file: 'inject.js'
		});
	} 
	// otherwise inject upon an event
	else {
		chrome.tabs.query({
			active: true
		}, function(tabs) {
			console.warn('injecting into tab', tabs[0]);

			chrome.tabs.executeScript(tabs[0].id, {
				file: 'inject.js'
			}, (result) => {
				// error callback, add listeners for simple pages
				if (typeof result == 'undefined') {
					addListeners();
				} else {
					console.warn('okay');
				}
			});
		});
	}
}

function addListeners() {
	console.warn('adding listeners for chrome tabs');
	chrome.tabs.onActivated.addListener(injectListener);
	chrome.tabs.onUpdated.addListener(injectListener);
}

function injectListener() {
	console.warn('injecting?');
	chrome.tabs.executeScript({
		file: 'inject.js'
	});
	removeListeners();
}

function removeListeners() {
	chrome.tabs.onActivated.removeListener(injectListener);
	chrome.tabs.onUpdated.removeListener(injectListener);
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