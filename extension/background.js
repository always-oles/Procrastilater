/*global chrome, sharedAPI, moment, getRandomToken*/

/**
 * Global variables
 */
const API = 'http://95.85.45.32/pl/';
var token = null,
	intervalHolder = null,
	nextPopup = null,
	updateTimer,
	injectedPopup = false,
	injectedRemoval = false,
	injectedRemovalList = [];

chrome.storage.local.get(null, result => {
	console.log('all storage now is:', result);

	// discovered some popup in storage
	if (result.popupData) {
		console.log('there is a popup in storage! call it');
		addListeners();
	}
});

/**
 * Listener for messages from inject/browserAction/Options page
 */
chrome.runtime.onMessage.addListener(
	(request, sender, sendResponse) => {
		console.log('background received message: ', request);
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
		console.log('timer is expired');

		// stop timer
		clearInterval(intervalHolder);

		// create popup and open it
		chrome.storage.local.get(['state', 'popupData'], result => {

			// if manual call is set in settings - dont call popup at all
			if (result.state && result.state.global.scheduleFrequency == 'MANUAL' && manualCall !== true) {
				console.log('but manual call set in settings, so return');
				return removePopupFromStorage();
			}

			// if user went through all bookmarks
			if (result.state && result.state.global.visitedIds.length == result.state.stats.bookmarksCount) {
				console.log('all bookmarks visited!');
				return removePopupFromStorage();
			}

			// if this popup is the one in shuffle
			let lastPopup 		= (result.state.stats.bookmarksCount - result.state.global.visitedIds.length) <= 1;
			let foldersIds      = result.state.global.foldersIds.slice();
			let allVisitedIds   = result.state.global.allVisitedIds.slice();

			console.warn('yo', result.state);

			console.log('generating new popup');
			sharedAPI.createPopup(allVisitedIds, foldersIds, bookmark => {
				openPopup(bookmark, manualCall, lastPopup);
			});
		});
	} else {
		console.log(now-nextPopup, 'left');
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
		if (isServiceURL(URL)) {
			return;
		}

		// check if user has this bookmark already
		chrome.bookmarks.search({
			url: URL
		}, result => {
			// already in bookmarks
			if (result.length) {
				// find parent folder
				chrome.bookmarks.get(result[0].parentId, parentFolder => {
					if (parentFolder.length) {
						// notify user where this bookmark located at
						chrome.notifications.create('2', {
							type: 'basic',
							title: chrome.i18n.getMessage('background_error'),
							iconUrl: '/icons/icon48.png',
							message: chrome.i18n.getMessage('background_page_already_in') + ' ' + parentFolder[0].title
						}, id => {
							setTimeout(() => chrome.notifications.clear(id), 5000);
						});
					}
				});
			} 
			else {
				// get selected folders from state
				chrome.storage.local.get('state', result => {
					if (result.state) {
						let currentState = result.state;

						// check if user had all bookmarks visited
						if (currentState.global.visitedIds.length == currentState.stats.bookmarksCount) {
							console.log('User had all bookmarks visited, generating new timer');
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
			if (bookmark === null) {
				removeListeners();
				return oops();
			}

			bookmark.manualCall = data.manualCall;
			console.log('setting bookmark in storage to', bookmark);
			chrome.storage.local.set({'popupData': bookmark});
		});
	});
}

/**
 * When something goes wrong
 */
function oops() {
	chrome.notifications.create('4', {
		type: 'basic',
		title: chrome.i18n.getMessage('oops'),
		iconUrl: '/icons/icon48.png',
		message: chrome.i18n.getMessage('smth_went_wrong')
	}, id => {
		setTimeout(() => chrome.notifications.clear(id), 3000);
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
	bookmark.soundEnabled = true; //////////////////////////// TODO: add turning off feature in future
	chrome.storage.local.set({'popupData': bookmark});

	console.log('data for popup: ', bookmark);
	console.log('clearing interval');
	clearInterval(intervalHolder);

	// check active tab if it's not a service url
	chrome.tabs.query({
		active: true
	}, function(tabs) {
		if (isServiceURL(tabs[0].url)) {
			console.log('service tab is active');

			let lastNormalTab = null;

			// get last focused window
			chrome.windows.getLastFocused({
				populate: true,
				windowTypes: ['normal']
			}, window => {
				// if it has tabs
				if (window && window.tabs && window.tabs.length) {
					for (let i in window.tabs) {
						// save normal, non-service tabs
						if ( !isServiceURL(window.tabs[i].url) ) {
							lastNormalTab = window.tabs[i];
						}
					}

					if (lastNormalTab) {
						//switch to last non-service tab
						chrome.tabs.update(lastNormalTab.id, {selected: true});
						// inject popup
						injectScript(lastNormalTab.id);
						return addListeners();
					} else {
						notifyFailure();
					}
				} else {
					notifyFailure();
				}
			});
		} else {
			injectScript(tabs[0].id);
			return addListeners();
		}

		// if not returned and at this point
		addListeners();
	});

	/**
	 * Notify user that we're not able to open popup now
	 */
	function notifyFailure() {
		chrome.notifications.create('3', {
			type: 'basic',
			title: chrome.i18n.getMessage('background_error'),
			iconUrl: '/icons/icon48.png',
			message: chrome.i18n.getMessage('background_cant_open_popup')
		}, id => {
			setTimeout(() => chrome.notifications.clear(id), 5000);
		});
	}
}

function addListeners() {
	if (injectedPopup) {
		console.log('already injected popup');
		return;
	}

	console.log('[adding listeners]');
	chrome.tabs.onActivated.addListener(injectScript);
	chrome.tabs.onUpdated.addListener(injectScript);
	injectedPopup = true;

	chrome.tabs.onActivated.removeListener(removePopupsScript);
	chrome.tabs.onUpdated.removeListener(removePopupsScript);
	injectedRemoval = false;
}
function removeListeners() {
	if (injectedRemoval) {
		console.log('already injected removal');
		return;
	}

	chrome.tabs.onActivated.addListener(removePopupsScript);
	chrome.tabs.onUpdated.addListener(removePopupsScript);
	injectedRemoval = true;
	injectedRemovalList = [];

	console.log('[removing listeners]');
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

	console.log('injecting popup!');
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
			console.log('injected removal already, returning');
			return;
		} else {
			injectedRemovalList.push(tabId);
		}
	} else {
		tabId = null;
	}

	console.log('injecting removal of popup!');
	chrome.tabs.executeScript(tabId, {
		code: `
			if (document.getElementById("pl-popup-container")) {
				document.getElementById("pl-popup-container").outerHTML="";
			}
		`
	});
}

/**
 * Checks if URL is a servie page or normal
 * @param {String} url 
 */
function isServiceURL(url) {
	if (url.includes('chrome-extension://') || url.includes('chrome://') || url.includes('chrome.google.com/webstore'))
		return true;
	return false;
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
		// generate and save token
		token = getRandomToken();
		chrome.storage.local.set({ 'token' : token});
		saveTokenInCookies(token);

		// try to open the options page
		chrome.runtime.openOptionsPage();
    } else {
		chrome.storage.local.get( 'token', (result) => {
			if ( !result.token ) {
				token = getRandomToken();
				chrome.storage.local.set({ 'token' : token});
				saveTokenInCookies(token);
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