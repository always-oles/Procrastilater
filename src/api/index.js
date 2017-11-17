/* global chrome, $: jQuery, Promise, moment */

import {
    SERVER_API,
    API_STATS,
    SCHEDULE
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
                'title': 'ProcrastiLater'
            },
            (newFolder) => {
                callback(newFolder);
            }
        );
    },

    clearData: callback => {
        chrome.storage.local.clear( () => {
            console.warn('storage is clear');
            if (callback) callback();
        });
        // chrome.storage.local.remove('state', () => {
        //     console.warn('storage is clear');
        //     if (callback) callback();
        // });
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
        let 
            bookmarks    = [],
            foldersCount = 0, 
            foldersDone  = 0,
            foldersIds   = null;
            
        if (currentState && currentState.global && currentState.global.foldersIds.length) {
            foldersIds = currentState.global.foldersIds;

            // check if need to update flag is in storage
            chrome.storage.local.get(null, result => {
                if (result.needsFoldersUpdate) {
                    // remove the flag
                    chrome.storage.local.remove('needsFoldersUpdate');
                    launchScan();
                }
            });
        }

        /**
         * get all bookmarks and their children
         */
        function launchScan() {
            // get entire tree
            chrome.bookmarks.getTree(results => {
                if (results[0] && results[0].children) {
                    // find bookmarks in foldrs
                    findObjects(results[0].children);
                }
            });
        }

        function findObjects(items) {
            // go through objects
            for (let i in items) {
        
                // if it's a folder - go deeper
                if ( items[i].children && items[i].children.length ) {
                    foldersCount++;

                    setTimeout(() => {
                        findObjects(items[i].children);
                    });
                }
                // it's a bookmark
                else {
                    // in our array
                    if ( foldersIds.indexOf(items[i].parentId) >= 0 ) {
                        bookmarks.push(items[i]);
                    }
                }
            }
        
            if (foldersDone >= foldersCount) {
                callback(bookmarks);
            } else {
                foldersDone++;
            }
        }
    }
}