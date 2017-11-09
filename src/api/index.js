import { getStatsFromBackend } from '../actions/GlobalActions';
import {
    SERVER_API,
    API_SEND_MESSAGE,
    API_STATS
} from '../constants';
/* global chrome, $: jQuery, Promise, moment */

/**
 * TODO: remove consoles
 */

export default {
    saveFolders: (folders) => {
        chrome.storage.local.set({'folders': folders});
    },

    getFolders: (callback) => {
        chrome.storage.local.get('folders', (result) => {
            callback(result.folders);
        })
    },
    
    createCustomFolder: (callback) => {
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

    clearData: (callback) => {
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

    getState: (callback) => {
        chrome.storage.local.get('state', (result) => {
            callback(result.state);
        });
    },

    setState: (state, callback) => {
        chrome.storage.local.set({'state': state}, () => {
            if (callback) callback();
        });
    },

    getToken: (callback) => {
        chrome.storage.local.get('token', (token) => {
            callback(token);
        });
    },

    sendMessage: (message) => {
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

    getStatsFromBackend: (state) => {
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

    generateTimer: () => {
        chrome.storage.local.get('state', (result) => {

            result.state.nextPopup = moment().add('60', 'seconds').valueOf();

            chrome.storage.local.set({'popupData': {
                name: 'Тестовая закладка епте',
                id: 1,
                url: 'http://google.com.ua?q=beps'
            }});

            chrome.storage.local.set({'state': result.state}, () => {
                console.log('setting state to', result.state);
                window.location.reload();
            });
        });
    }
}