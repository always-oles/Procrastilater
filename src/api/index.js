/* global chrome, $: jQuery, Promise, moment */

import {
    SERVER_API,
    API_STATS
} from '../constants';

/**
 * TODO: remove consoles
 */

export default {
    notifyBackground: data => {
        chrome.runtime.sendMessage(data);
    },
    
    createCustomFolder: callback => {
        chrome.bookmarks.create(
            {
                'parentId': '1', 
                'title': 'Procrastilater'
            },
            newFolder => {
                chrome.bookmarks.get('1', parentFolder => {
                    callback(newFolder, parentFolder[0]);
                });
            }
        );
    },

    clearData: callback => {
        // chrome.storage.local.clear( () => {
        //     console.warn('storage is clear');
        //     if (callback) callback();
        // });
        chrome.storage.local.remove('state', () => {
            console.warn('storage is clear');
            if (callback) callback();
        });
    },

    logData: () => {
        chrome.storage.local.get(null, (result) => {
            console.log(result);
        });
    },

    getState: callback => {
        chrome.storage.local.get('state', (result) => {
            callback(result.state);
        });
    },

    setState: (state, callback) => {
        chrome.storage.local.set({'state': state}, () => {
            if (callback) callback();
        });
    },

    getToken: callback => {
        chrome.storage.local.get('token', (token) => {
            callback(token);
        });
    },

    sendMessage: message => {
        return new Promise( (resolve, reject) => {
            chrome.storage.local.get('token', (token) => {
                $.post(SERVER_API + 'sendMessage', Object.assign({}, message, token), data => {
                    if (data.status == true) {
                        resolve();
                    } else {
                        console.warn(data);
                        reject(data);
                    }
                });
            });
        });
    },

    getStatsFromBackend: state => {
        return new Promise( (resolve, reject) => {
            // get token
            chrome.storage.local.get('token', (storage) => {

                // send data
                $.post(
                    SERVER_API + API_STATS, 
                    Object.assign(
                        {},
                        {
                            token: storage.token,
                            name: state.global.userName,
                            achievements: state.achievements,
                            stats: {
                                bookmarksCount:             state.stats.bookmarksCount,
                                bookmarksPostponed:         state.stats.bookmarksPostponed,
                                bookmarksVisited:           state.stats.bookmarksVisited,
                                bookmarksVisitedManually:   state.stats.bookmarksVisitedManually,
                                shared:                     state.stats.shared
                            }        
                        }
                ), data => {
                    if (data.status == 'Error') {
                        reject(data);
                    }

                    resolve(data);
                });
            });
        });
    },

    // compare current PL state with storage if changed
    checkForSmallUpdates: (currentState, callback) => {
        // get entire storage
        chrome.storage.local.get(null, result => {
            // if needs update flag found
            if (result.needUpdate) {
                let summary = {};
                let storage = result.state;

                // length of visited ids changed
                if ( currentState.global.allVisitedIds.length < storage.global.allVisitedIds.length ) {
                    summary.allVisitedIds            = storage.global.allVisitedIds;
                    summary.visitedIds               = storage.global.visitedIds;
                    summary.bookmarksVisited         = storage.stats.bookmarksVisited;
                    summary.bookmarksVisitedManually = storage.stats.bookmarksVisitedManually;
                    summary.popupsToday              = storage.popups.popupsToday;
                }

                // timer renew
                summary.nextPopupTime = storage.popups.nextPopupTime;

                // stats changed
                if ( currentState.stats.bookmarksPostponed < storage.stats.bookmarksPostponed ) {
                    summary.bookmarksPostponed = storage.stats.bookmarksPostponed;
                    summary.popupsToday        = storage.popups.popupsToday;
                }

                //console.warn('RESULT OF CONCATENATION:', summary);

                // remove need for update from storage
                chrome.storage.local.remove('needUpdate');
                
                callback(summary);
            }
		});
    },

    checkForFoldersUpdates: (currentState, callback) => {
        chrome.storage.local.get(null, result => {
            // check if storage has a key that we have to update folders
            if (result.needsFoldersUpdate) {
                chrome.storage.local.remove('needsFoldersUpdate');
                callback(true);
            } else {
                callback(false);
            }
        });
    },

    pluralize: (number, one, two, five) => {
        let n = Math.abs(number);
        n %= 100;
        if (n >= 5 && n <= 20) {
            return five;
        }
        n %= 10;
        if (n === 1) {
            return one;
        }
        if (n >= 2 && n <= 4) {
            return two;
        }
        return five;
    }
}