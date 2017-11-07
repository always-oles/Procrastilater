/* global chrome, $: jQuery, Promise, moment */

/**
 * TODO: remove consoles
 */

const SERVER_API = 'http://localhost:3000/api/';

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
        chrome.storage.local.clear( () => {
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
            $.post(SERVER_API + 'sendMessage', message, data => {
                if (data.status == true) {
                    resolve();
                } else {
                    console.warn(data);
                    reject(data);
                }
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