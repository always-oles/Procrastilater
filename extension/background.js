/*global chrome, sharedAPI, moment, getRandomToken*/

/**
 * Global variables
 */
const API = 'http://localhost:3000/';
var TOKEN = null,
	intervalHolder = null,
	nextPopup = null,
	updateTimer;

chrome.storage.local.get(null, result => {
	console.warn('all storage now is:', result);
});

/**
 * Listener for messages from inject/browserAction/Options page
 */
chrome.runtime.onMessage.addListener(
	request => {
		console.warn('background received message: ', request);
		switch (request.action) {
			case 'accept':
				accept(request.data);
			break;

			case 'openPopup':
				openPopup(request.data);
			break;

			case 'updateTimer':
				updateTimer(request.data);
			break;

			case 'shuffle':
				shuffle(request.data);
			break;

			case 'postpone':
				postpone();
			break;

			case 'manualCall':
				checkTime(true);
			break;

			case 'addNewBookmark':
				addNewBookmark();
			return;
		}
	}
);

/**
 * Update and launch a new timer
 */
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
function checkTime(manualCall) {
	// convert to unix timestamp without miliseconds
	let now = moment().format('X');

	// time is out
	if (now >= nextPopup || manualCall == true) {
		console.warn('timer is expired');

		// stop timer
		clearInterval(intervalHolder);

		// create popup and open it
		chrome.storage.local.get(['state', 'popupData'], result => {

			// if popup is in storage
			if (result.popupData) {
				console.warn('popup is in storage');
				openPopup(result.popupData, manualCall);
			} 
			// else generate a new popup
			else {
				let foldersIds      = result.state.global.foldersIds.slice();
				let allVisitedIds   = result.state.global.allVisitedIds.slice();

				console.warn('generating new popup');
				sharedAPI.createPopup(allVisitedIds, foldersIds, bookmark => {
					openPopup(bookmark, manualCall);
				});
			}
		});
	} else {
		console.warn(now-nextPopup, 'left');
	}
}

/**
 * User clicked on add new bookmark in context menu / browseraction
 */
function addNewBookmark() {
	let URL, title, selectedFolders, targetFolder;

	// get active page
    chrome.tabs.query({
		active: true
	}, function(tabs) {
		URL 	= tabs[0].url;
		title 	= tabs[0].title;

		// get selected folders from state
		chrome.storage.local.get('state', result => {
			if (result.state) {
				// if user has custom PL folder lets try to get it
				if (result.state.global.customFolder !== null) {
					targetFolder = result.state.global.customFolder.id;
				} else {
					targetFolder = result.state.global.foldersIds;
				}
				
				// get actual bookmarks by id/ids to make sure they exist
				chrome.bookmarks.get(targetFolder, folders => {
					if (folders.length) {
						// add bookmark
						chrome.bookmarks.create({
							parentId: folders[0].id,
							url: URL,
							title: title
						}, () => notifyUser(title, folders[0].title));
					} else {
						chrome.bookmarks.create({
							url: URL,
							title: title
						}, () => notifyUser(title, 'Others'));
					}
				});
			}
		});
	});

	function notifyUser(pageTitle, folderTitle) {
		// PL needs update
		chrome.storage.local.set({ needsFoldersUpdate: moment().format('X')	});

		chrome.notifications.create('1', {
			type: 'basic',
			title: 'Success!',
			iconUrl: '/icons/icon48.png',
			message: pageTitle + ' is added to ' + folderTitle + ' folder!'
		}, id => {
			setTimeout(() => chrome.notifications.clear(id), 4000);
		});
	}
}

/**
 * Browser extension icon click listener
 */
chrome.browserAction.onClicked.addListener(() => {
	// check if user have his steps done already 
	chrome.storage.local.get('state', result => {
		// if user has state and completed steps already
		if (result.state && result.state.global.step === -1) {
			// open modal with available actions
		} else {
			console.warn('here');
			chrome.runtime.openOptionsPage();
		}
	});
});

/**
 * User clicked on accept inside popup
 * @param {Object} data contains id and url of currently opening bookmark
 */
function accept(data) {
	// open page
	chrome.tabs.create({ url : data.url });

	// remove old popup data
	chrome.storage.local.remove('popupData');
	
	// get current storage state
	chrome.storage.local.get('state', result => {
		let newState = result.state;
		
		// make some changes before generating new timer
		if (data.manualCall) {
			newState.stats.bookmarksVisitedManually += 1;
		} else {
			newState.stats.bookmarksVisited += 1;
		}

		newState.popups.popupsToday += 1;
		newState.global.visitedIds.push(data.id);
		newState.global.allVisitedIds.push(data.id);
		
		// generate new timer
		sharedAPI.generateTimer(false, newState, newTime => {

			// save new timer
			newState.popups.nextPopupTime = newTime;
			
			// set new storage
			chrome.storage.local.set({
				state: newState,
				needUpdate: moment().format('X')
			}, () => {
				chrome.storage.local.get(null, result => {
					console.warn('all storage now is:', result);
				});
			});

			// update background timer
			updateTimer(newTime);
		});
	});
}

/**
 * User clicked on reshuffle bookmark button inside popup
 * @param {Object} data contains id of old bookmark and manualCall boolean
 */
function shuffle(data) {
	chrome.storage.local.get('state', result => {
		let foldersIds      = result.state.global.foldersIds.slice();
		let allVisitedIds   = result.state.global.allVisitedIds.slice();
		allVisitedIds.push(data.id);

		sharedAPI.createPopup(allVisitedIds, foldersIds, bookmark => {
			bookmark.manualCall = data.manualCall;
			console.warn('setting bookmark in storage to', bookmark);
			chrome.storage.local.set({'popupData': bookmark});
		});
	});
}

/**
 * User clicked on postpone button inside popup
 */
function postpone() {
	// remove all listeners to prevent annoying showing
	removeListeners();

	// remove old popup data
	chrome.storage.local.remove('popupData');

	// get current storage state
	chrome.storage.local.get('state', result => {
		let newState = result.state;
		
		// make some changes before generating new timer
		newState.stats.bookmarksPostponed 	+= 1;		
		newState.popups.popupsToday 		+= 1;
		
		// generate new timer
		sharedAPI.generateTimer(false, newState, newTime => {

			// save new timer
			newState.popups.nextPopupTime = newTime;
			
			// set new storage
			chrome.storage.local.set({
				state: newState,
				needUpdate: moment().format('X')
			}, () => {
				chrome.storage.local.get(null, result => {
					console.warn('all storage now is:', result);
				});
			});

			// update background timer
			updateTimer(newTime);
		});
	});

	// TODO: inject removing popup script
}



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

function openPopup(bookmark, manualCall) {
	if (!bookmark) return;

	// bookmark was called manually
	bookmark.manualCall = manualCall;

	// put data to storage to share with injected script
	bookmark.soundEnabled = true; /////////////////////////////////////////////// remove after debug
	chrome.storage.local.set({'popupData': bookmark});

	console.warn('data for popup: ', bookmark);

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
}

function addListeners() {
	console.warn('adding listeners for chrome tabs');
	chrome.tabs.onActivated.addListener(injectScript);
	chrome.tabs.onUpdated.addListener(injectScript);
}

function injectScript(tabId) {
	if (!tabId) { tabId = null; }

	console.warn('injecting!');
	chrome.tabs.executeScript(tabId, {
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

function getRandomToken() {
    var randomPool = new Uint8Array(16);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    return hex + (+new Date());
}

/**
 * Uninstall url
 */
chrome.runtime.setUninstallURL(API + 'uninstall');

/**
 * Add some options to context menu
 */
chrome.contextMenus.removeAll(() => {
	chrome.contextMenus.create({
		id: '1',
		title: 'Add this page to bookmarks shuffle', 
		onclick: addNewBookmark,
	});
});
