/* global $:jQuery, chrome */
import API from '../api';
import sharedAPI from '../../extension/sharedAPI';
let debounceTimeout = null;

import { 
    SET_STEP,
    SET_STEP_PHASE,
    SET_USERNAME,
    SAVE_FOLDERS,
    CREATE_CUSTOM_FOLDER,
    SET_SCHEDULE,
    SET_TEMPO,
    UPDATE_BOOKMARKS_STATS,
    GIVE_ACHIEVEMENT,
    SHARED_IN_SOCIAL,
    RESET_RECEIVED_ACHIEVEMENT,
    SEND_MESSAGE_SUCCESS,
    SEND_MESSAGE_ERROR,
    ADDED_LOTS_ACHIEVEMENT_NUMBER,
    UPDATE_TOTAL_STATS,
    VISITOR_LIMIT,
    POSTPONER_LIMIT,
    MANUAL_OPENER_LIMIT,
    UPDATE_ENTIRE_STATE,
    SET_NEXT_POPUP
} from '../constants';


export function setStep(step) {
    return {
        type: SET_STEP,
        payload: step
    }
}

export function setStepPhase(phase) {
    return {
        type: SET_STEP_PHASE,
        payload: phase
    }
}

export function setUsername(name) {
    return {
        type: SET_USERNAME,
        payload: name
    }
}

/**
 * When user updates selected folders - we have to process 
 * all bookmarks in these folders and update stats
 */
// we need few global variables to pass data between functions and recursion
var bookmarks = [];
var hasFoldersAchievement = false;

export function saveFolders(folders) {
    return (dispatch, getState) => {

        let state = getState();

        // update global var if user has this achievement
        // to prevent giving it to him twice later
        if ( state.achievements.addedLots == true ) {
            hasFoldersAchievement = true;
        }

        // save selected folders
        dispatch({
            type: SAVE_FOLDERS,
            payload: folders
        });

        // count/calculate selected folders bookmarks
        prepareStats(dispatch, folders, state.global.allVisitedIds, () => {

            // when everything is finished - update backend and get new total stats from it
            getStatsFromBackend(dispatch, getState);
        });
    }
}

function prepareStats(dispatch, folders, allVisitedIds, saveFoldersCallback) {

    // get all user bookmarks as a tree object
    chrome.bookmarks.getTree((results) => {
        if (results[0] && results[0].children) {
            // reset our array
            bookmarks = [];

            // find bookmarks in foldrs
            findObjects(results[0].children, folders, dispatch, allVisitedIds, saveFoldersCallback);
        }
    });
}

/**
 * Non-blocking recursive function for gathering all bookmarks from folders
 */
var foldersCount = 0, foldersDone = 0;
function findObjects(items, ids, dispatch, allVisitedIds, saveFoldersCallback) {

    // go through object
    for (let i in items) {

        // if it's a folder - go deeper
        if ( items[i].children ) {
            if ( items[i].children.length ) {
                foldersCount++;
                //console.log('going deeper into a folder ', items[i].title);
                setTimeout(() => {
                    findObjects(items[i].children, ids, dispatch, allVisitedIds, saveFoldersCallback);
                });
            }
        } 
        // it's a bookmark
        else {

            // in our array
            if ( ids.indexOf(items[i].parentId) >= 0 ) {
                bookmarks.push(items[i]);
            }
        }
    }

    if (foldersDone >= foldersCount) {
        foldersCount = 0;
        foldersDone = 0;
        updateStats(dispatch, allVisitedIds, saveFoldersCallback);
    } else {
        foldersDone++;
    }
}

function updateStats(dispatch, allVisitedIds, saveFoldersCallback) {
    let visitedIds = [];

    // check for duplicates between visitedIds/allVisitedIds
    if (allVisitedIds.length) {
        for (let i in bookmarks) {
            if ( allVisitedIds.indexOf(bookmarks[i].id) !== -1 ) {
                visitedIds.push(bookmarks[i].id);
            }
        }
    }

    dispatch({
        type: UPDATE_BOOKMARKS_STATS,
        payload: {
            visitedIds,
            bookmarksCount: bookmarks.length
        }
    });

    // check for achievements after new folders selection
    checkAchievements(dispatch, bookmarks.length, 'foldersChanged');

    saveFoldersCallback();
}

/**
 * User clicked on "create custom PL folder during Step 2"
 * @param {function} callback
 */
export function createCustomFolder(callback) {
    return dispatch => {
        API.createCustomFolder((folder) => {
            dispatch({
                type: CREATE_CUSTOM_FOLDER,
                payload: folder
            });

            // rebuild tree when folder is created
            callback(folder.id);
        });
    }
}

/**
 * Update schedule from widget
 * @param {object} schedule 
 */
export function setSchedule(schedule) {
    return (dispatch, getState) => {
        // max
        if (schedule.times > 10) {
            schedule.times = 10;
        } 
        // min
        else if (isNaN(schedule.times) || schedule.times <= 0) {
            schedule.times = 1;
        }
        
        dispatch({
            type: SET_SCHEDULE,
            payload: schedule
        });

        // update tempo
        calculateTempo(dispatch, getState());
    }
}

function calculateTempo(dispatch, state) {
    switch (state.global.scheduleFrequency) {
        case 'EVERY_DAY': 
            // 1 every day
            dispatch({
                type: SET_TEMPO,
                payload: 1
            });
        break;

        case 'EVERY_2_DAYS':
            // 1 every 2 days means 0.5
            dispatch({
                type: SET_TEMPO,
                payload: 0.5
            });
        break;

        case 'FEW_TIMES':
            // how user entered
            dispatch({
                type: SET_TEMPO,
                payload: state.global.scheduleTimes || 1
            });
        break;

        // for manual or etc
        default: 
            dispatch({
                type: SET_TEMPO,
                payload: 0
            });
    }
}

/**
 * User clicked on any social
 */
export function sharedInSocial() {
    return (dispatch, getState) => {
        dispatch({
            type: SHARED_IN_SOCIAL
        });

        checkAchievements(dispatch, getState());
    }
}

/**
 * Check if any action leads to an achievement
 */
function checkAchievements(dispatch, state, action) {
    // Check shares (social) achievement
    if ( state.stats && state.stats.shared >= 2 && state.achievements.social == false ) {
        dispatch({
            type: GIVE_ACHIEVEMENT,
            payload: { 'social' : true }
        });
    }

    // if user just sent a review and has no reviewer achievement yet
    if ( state.achievements && state.achievements.reviewer == false && action == 'review' ) {
        dispatch({
            type: GIVE_ACHIEVEMENT,
            payload: { 'reviewer' : true }
        });
    }

    // check for achievement if user added >=ADDED_LOTS_ACHIEVEMENT_NUMBER(40) bookmarks to shuffle
    if ( action == 'foldersChanged' && state >= ADDED_LOTS_ACHIEVEMENT_NUMBER && hasFoldersAchievement == false ) {
        dispatch({
            type: GIVE_ACHIEVEMENT,
            payload: { 'addedLots' : true }
        });
    }

    // check for visited achievement
    if ( state.stats && 
         state.achievements.visitor == false && 
        (state.stats.bookmarksVisited + state.stats.bookmarksVisitedManually) >= VISITOR_LIMIT
    ) {
        dispatch({
            type: GIVE_ACHIEVEMENT,
            payload: { 'visitor' : true }
        });
    }

    // check for postponer achievement
    if ( state.stats && 
         state.achievements.postponer == false && 
         state.stats.bookmarksPostponed >= POSTPONER_LIMIT
    ) {
        dispatch({
            type: GIVE_ACHIEVEMENT,
            payload: { 'postponer' : true }
        });
    }

    // check for manual opener achievement
    if ( state.stats && 
        state.achievements.manualOpener == false && 
        state.stats.bookmarksVisitedManually >= MANUAL_OPENER_LIMIT
    ) {
        dispatch({
            type: GIVE_ACHIEVEMENT,
            payload: { 'manualOpener' : true }
        });
    }
}

/**
 * Helper-action-creator
 */
export function checkAchievementsCaller() {
    return (dispatch, getState) => {
        checkAchievements(dispatch, getState());
    }
}

/**
 * After user saw a congratz popup - reset the field to false to stop showing it
 */
export function resetReceivedAchievement() {
    return {
        type: RESET_RECEIVED_ACHIEVEMENT
    }
}

/**
 * Send message to developer
 * @param {object} contains message fields
 */
export function sendMessage(data, callback) {
    return (dispatch, getState) => {

        // append token to the message object
        API.sendMessage(Object.assign({}, data))
        .then(() => {
            dispatch({ type: SEND_MESSAGE_SUCCESS });
            if (callback) callback();

            // check if we have to give user an achievement right after
            setTimeout(() => {
                checkAchievements(dispatch, getState(), 'review');
            }, 2000);
        })
        .catch(() => {
            dispatch({ type: SEND_MESSAGE_ERROR });
            if (callback) callback();
        });
    }
}

/**
 * Get backend stats upon initial load
 */
export function getStatsFromBackend(dispatch, getState) {
    // prevent multiple backend calls
    clearTimeout(debounceTimeout);

    // if called manually from another function
    if (dispatch && getState) {
        debounceTimeout = setTimeout(() => {
            API.getStatsFromBackend(getState())
            .then(data => {
                dispatch({
                    type: UPDATE_TOTAL_STATS,
                    payload: data
                });
            });
        }, 2000);
    } 
    // if called as a redux function
    else {
        return (dispatch, getState) => {
            let state = getState();

            // do not send data until user has some bookmarks selected
            if (state.global.foldersIds.length) {
                debounceTimeout = setTimeout(() => {
                    API.getStatsFromBackend(getState())
                    .then(data => {
                        dispatch({
                            type: UPDATE_TOTAL_STATS,
                            payload: data
                        });
                    });
                }, 2000);
            }
        }
    }
}

/**
 * Listen for focus receiving. (when user has opened PL tab, switches to another tab and back)
 * thanks https://stackoverflow.com/questions/1060008/is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active
 */
export function listenForVisibilityChange() {
    return (dispatch, getState) => {

        var hidden = 'hidden';
    
        if (hidden in document)
            document.addEventListener('visibilitychange', onchange);
        else if ((hidden = 'webkitHidden') in document)
            document.addEventListener('webkitvisibilitychange', onchange);
        else
            window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
        
        function onchange (evt) {
            var v = 'visible', h = 'hidden',
                evtMap = {
                focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h
                };
        
            evt = evt || window.event;
            if (evt.type in evtMap) {
                if (evtMap[evt.type] == 'visible') {
                    // usually page received focus here if refreshed
                    checkForFoldersUpdates();
                }
            }
            else {
                if (!this[hidden]) {                    
                    // when user switches to PL tab
                    // compare current state with storage
                    checkForFoldersUpdates();
                    checkForSmallUpdates();
                }
            }
        }

        function checkForFoldersUpdates() {
            API.checkForFoldersUpdates(getState(), () => {

            });
        }

        /**
         * Small updates like user called a bookmark manually / new timer / postponed bookmark
         * while PL settings (options) page was inactive
         */
        function checkForSmallUpdates() {
            API.checkForUpdates(getState(), mutatedState => {
                
                // do not dispatch an event if nothing changed and empty object received
                if (JSON.stringify(mutatedState) === JSON.stringify({})) {
                    return;
                }
                
                console.warn('Something changed...');

                // dispatch difference
                dispatch({
                    type: UPDATE_ENTIRE_STATE,
                    payload: mutatedState
                });

                // check if user deserves an
                checkAchievements(dispatch, getState());
            });
        }
        
        // set the initial state (but only if browser supports the Page Visibility API)
        if( document[hidden] !== undefined )
            onchange({type: document[hidden] ? 'blur' : 'focus'});
    }
}

/**
 * Generate timer and dispatch new time
 * @param {bool} manualInvoke - if true then generate despite need to generate or not
 */
export function generateTimer(manualInvoke) {
    return (dispatch, getState) => {

        // notify background script ************

        sharedAPI.generateTimer(manualInvoke, getState(), (nextPopupTime, resetPopupsToday) => {
            // notify background script 
            chrome.runtime.sendMessage({ action: 'updateTimer', data: nextPopupTime });            

            // insert next popup unixtime for payload for sure
            let payload = {
                nextPopupTime
            };

            // if we need to reset popups today counter
            if (resetPopupsToday == true) {
                payload.popupsToday = 0;
            }

            dispatch({
                type: SET_NEXT_POPUP,
                payload
            });
        });
    }
}

/**
 * Time is out, lets create a popup
 */
export function createPopup() {
    return (dispatch, getState) => {
        let state = getState();

        // create copy and prevent bugs/modifying the actual state 
        // (actually catched a bug with this feature during development)
        let foldersIds      = state.global.foldersIds.slice();
        let allVisitedIds   = state.global.allVisitedIds.slice();
        
        sharedAPI.createPopup(allVisitedIds, foldersIds);
    }
}