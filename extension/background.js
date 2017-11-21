/*global chrome, sharedAPI, moment, getRandomToken*/

/**
 * Global variables
 */
const API = 'http://95.85.45.32/pl/';
var TOKEN = null,
	intervalHolder = null,
	nextPopup = null,
	updateTimer,
	injectedPopup = false,
	injectedRemoval = false,
	injectedRemovalList = [],
	injectedPopupList = [];

chrome.storage.local.get(null, result => {
	console.warn('all storage now is:', result);

	// discovered some popup in storage
	if (result.popupData) {
		console.warn('there is a popup in storage! call it');
		addListeners();
	}
});

/**
 * Listener for messages from inject/browserAction/Options page
 */
chrome.runtime.onMessage.addListener(
	(request, sender, sendResponse) => {
		console.warn('background received message: ', request);
		switch (request.action) {
			case 'accept':
				accept(request.data);
			break;

			case 'openPopup':
				openPopup(request.data);
			break;

			case 'updateTimer':
				updateTimer(request.data || null);
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

			case 'stopTimer':
				clearInterval(intervalHolder);
			break;
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
			if (result.state)
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

			// if manual call is set in settings - dont call popup at all
			if (result.state && result.state.global.scheduleFrequency == 'MANUAL' && manualCall !== true) {
				console.warn('but manual call set in settings, so return');
				return removePopupFromStorage();
			}

			// if user went through all bookmarks
			if (result.state && result.state.global.visitedIds.length == result.state.stats.bookmarksCount) {
				console.warn('all bookmarks visited!');
				return removePopupFromStorage();
			}

			// if this popup is the one in shuffle
			let lastPopup = (result.state.stats.bookmarksCount - result.state.global.visitedIds.length) <= 1;
			let foldersIds      = result.state.global.foldersIds.slice();
			let allVisitedIds   = result.state.global.allVisitedIds.slice();

			console.warn('generating new popup');
			sharedAPI.createPopup(allVisitedIds, foldersIds, bookmark => {
				openPopup(bookmark, manualCall, lastPopup);
			});
		});
	} else {
		console.warn(now-nextPopup, 'left');
	}

	function removePopupFromStorage() {
		chrome.storage.local.remove('popupData');
	}
}

/**
 * User clicked on add new bookmark in context menu / browseraction
 */
function addNewBookmark() {
	let URL, title, targetFolder, custom = false;

	// get active page
    chrome.tabs.query({
		active: true
	}, function(tabs) {
		URL 	= tabs[0].url;
		title 	= tabs[0].title;

		// nope
		if (URL.includes('chrome-extension://') || URL.includes('chrome://')) {
			return;
		}

		// get selected folders from state
		chrome.storage.local.get('state', result => {
			if (result.state) {
				let currentState = result.state;

				// check if user had all bookmarks visited
				if (currentState.global.visitedIds.length == currentState.stats.bookmarksCount) {
					console.warn('User had all bookmarks visited, generating new timer');
					generateNewTimer(currentState);
				}

				// if user has custom PL folder lets try to get it first
				if (currentState.global.customFolder !== null && 
					currentState.global.foldersIds.indexOf(currentState.global.customFolder.id) !== -1 ) {
					targetFolder = currentState.global.customFolder.id;
					custom = true
				} else {
					targetFolder = currentState.global.foldersIds;
				}
				
				// get actual bookmarks by id/ids to make sure they exist
				chrome.bookmarks.get(targetFolder, folders => {
					if (folders.length) {
						// add bookmark
						chrome.bookmarks.create({
							parentId: folders[0].id,
							url: URL,
							title: title
						}, () => {
							notifyUser(title, folders[0].title);
							incrementBookmarksCount(currentState);
						});
					} else {
						chrome.bookmarks.create({
							url: URL,
							title: title
						}, () => {
							notifyUser(title, 'Others');
							incrementBookmarksCount(currentState);
						});
					}
				});
			}
		});
	});

	/**
	 * Increment total bookmarks-to-go number after adding this one
	 */
	function incrementBookmarksCount(currentState) {
		currentState.stats.bookmarksCount += 1;
		chrome.storage.local.set({ state: currentState });
	}

	function notifyUser(pageTitle, folderTitle) {
		// PL needs update
		chrome.storage.local.set({ needsFoldersUpdate: moment().format('X')	});

		// notification message
		let message = `${pageTitle} ${chrome.i18n.getMessage('background_is_added_to')} ${folderTitle}${chrome.i18n.getMessage('background_folder')}`;

		// add explanation
		if (!custom) {
			message += ', ' + chrome.i18n.getMessage('background_because');
		}

		chrome.notifications.create('1', {
			type: 'basic',
			title: chrome.i18n.getMessage('background_success'),
			iconUrl: '/icons/icon48.png',
			message: message
		}, id => {
			setTimeout(() => chrome.notifications.clear(id), 5000);
		});
	}
}

/**
 * User clicked on accept inside popup
 * @param {Object} data contains id and url of currently opening bookmark
 */
function accept(data) {
	//chrome.bookmarks.remove(string id, function callback)
	removeListeners();

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

			// if user dealth with all bookmarks
			if (newState.global.visitedIds.length == newState.stats.bookmarksCount) {
				newTime = moment().format('X');
			}

			// save new timer
			if (newTime) {
				newState.popups.nextPopupTime = newTime;

				// update background timer
				updateTimer(newTime);
			}
			
			// set new storage
			chrome.storage.local.set({
				state: newState,
				needUpdate: moment().format('X')
			});
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
	// remove old popup data
	chrome.storage.local.remove('popupData');

	// get current storage state
	chrome.storage.local.get('state', result => {
		let newState = result.state;
		
		// make some changes before generating new timer
		newState.stats.bookmarksPostponed 	+= 1;		
		newState.popups.popupsToday 		+= 1;
		
		generateNewTimer(newState);
	});

	// remove all listeners to prevent annoying showing
	removeListeners();
}

/**
 * Helper function that receives a current state, 
 * generates new timer and saves it to the storage
 * @param {Object} currentState 
 */
function generateNewTimer(currentState) {
	// generate new timer
	sharedAPI.generateTimer(false, currentState, newTime => {
		
		// save new timer
		if (newTime) {
			currentState.popups.nextPopupTime = newTime;
		}
		
		// set new storage
		chrome.storage.local.set({
			state: currentState,
			needUpdate: moment().format('X')
		});

		// update background timer
		updateTimer(newTime);
	});
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

function openPopup(bookmark, manualCall, lastPopup) {
	if (!bookmark) return;

	// bookmark was called manually
	bookmark.manualCall = manualCall;
	bookmark.lastPopup  = lastPopup;

	// put data to storage to share with injected script
	bookmark.soundEnabled = true; /////////////////////////////////////////////// remove after debug
	chrome.storage.local.set({'popupData': bookmark});

	console.warn('data for popup: ', bookmark);
	addListeners();

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
	if (injectedPopup) return console.warn('already injected popup');

	console.warn('[adding listeners]');
	chrome.tabs.onActivated.addListener(injectScript);
	chrome.tabs.onUpdated.addListener(injectScript);
	injectedPopup = true;

	chrome.tabs.onActivated.removeListener(removePopupsScript);
	chrome.tabs.onUpdated.removeListener(removePopupsScript);
	injectedRemoval = false;
}
function removeListeners() {
	if (injectedRemoval) return console.warn('already injected removal');

	chrome.tabs.onActivated.addListener(removePopupsScript);
	chrome.tabs.onUpdated.addListener(removePopupsScript);
	injectedRemoval = true;
	injectedRemovalList = [];

	console.warn('[removing listeners]');
	chrome.tabs.onActivated.removeListener(injectScript);
	chrome.tabs.onUpdated.removeListener(injectScript);
	injectedPopup = false;

	chrome.tabs.executeScript(null, {
		code: `
			if (document.getElementById("pl-popup-container")) {
				document.getElementById("pl-popup-container").outerHTML="";
			}
		`
	});
}

function injectScript(tabId) {
	if (!tabId) { tabId = null }
	if (tabId.tabId) { tabId = tabId.tabId }

	console.warn('injecting popup!');
	chrome.tabs.executeScript(tabId, {
		file: 'inject.js'
	});
}
function removePopupsScript(tabId) {
	// check if tabid is passed
	if (tabId) {
		// if object is passed
		if (tabId.tabId) { 
			tabId = tabId.tabId 
		}

		// check if already injected into this page
		if (injectedRemovalList.indexOf(tabId) !== -1) {
			console.warn('injected removal already, returning');
			return;
		} else {
			injectedRemovalList.push(tabId);
		}
	} else {
		tabId = null;
	}

	console.warn('injecting removal of popup!');
	chrome.tabs.executeScript(tabId, {
		code: `
			if (document.getElementById("pl-popup-container")) {
				document.getElementById("pl-popup-container").outerHTML="";
			}
		`
	});
}





/**
 * Generate new token for user
 * it's used for backend calls + uninstall tracking
 */
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
 * Once extension is installed/updated
 * Generate unique token for user if not exists
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

/**
 * Update folders structure and recount bookmarks 
 * when user changes bookmarks manually
 */
chrome.bookmarks.onRemoved.addListener(() => {
	chrome.storage.local.set({ needsFoldersUpdate: true });
});
chrome.bookmarks.onMoved.addListener(() => {
	chrome.storage.local.set({ needsFoldersUpdate: true });
});