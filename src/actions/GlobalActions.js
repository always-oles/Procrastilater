/* global chrome */
import API from '../api';
import sharedAPI from '../../extension/sharedAPI';
import {
    ADDED_LOTS_ACHIEVEMENT_NUMBER,
    CREATE_CUSTOM_FOLDER,
    GIVE_ACHIEVEMENT,
    MANUAL_OPENER_LIMIT,
    POSTPONER_LIMIT,
    RESET_RECEIVED_ACHIEVEMENT,
    SAVE_FOLDERS,
    SCHEDULE,
    SEND_MESSAGE_ERROR,
    SEND_MESSAGE_SUCCESS,
    SET_NEXT_POPUP,
    SET_SCHEDULE,
    SET_STEP,
    SET_STEP_PHASE,
    SET_TEMPO,
    SET_USERNAME,
    SHARED_IN_SOCIAL,
    UPDATE_BOOKMARKS_STATS,
    UPDATE_ENTIRE_STATE,
    UPDATE_TOTAL_STATS,
    VISITOR_LIMIT,
    MAX_BOOKMARKS_DAILY,
    SET_HOUR_FORMAT
} from '../constants';

// variable for debouncing backend calls
var debounceTimeout = null;

/**
 * Simple action creators
 */
export function setStep(step) {
    return {
        type: SET_STEP,
        payload: step
    }
}

export function setHourFormat(format) {
    return {
        type: SET_HOUR_FORMAT,
        payload: format
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
            checkAndGenerateTimer(dispatch, getState);
        });
    }
}

function prepareStats(dispatch, foldersIds, allVisitedIds, saveFoldersCallback) {
    var 
        bookmarks       = [],
        foldersCount    = 0, 
        foldersDone     = 0,
        foldersFound    = false;
    
    // get all user bookmarks as a tree object
    chrome.bookmarks.getTree((results) => {
        if (results[0] && results[0].children) {
            // reset our array
            bookmarks = [];

            // find bookmarks in foldrs
            findObjects(results[0].children);
        }
    });
        
    /**
     * Non-blocking recursive function for gathering all bookmarks from folders
     */
    function findObjects(items) {
        // go through objects
        for (let i in items) {

            // check if at least one folder selected exists
            if ( foldersIds.indexOf(items[i].id)!== -1 ) {
                foldersFound = true;
            }
        
            // if it's a folder - go deeper
            if ( items[i].children ) {
                // if has children
                if ( items[i].children.length ) {
                    foldersCount++;
                    setTimeout(() => {
                        findObjects(items[i].children);
                    });
                }
            } 
            // it's a bookmark
            else {
                // is in our array
                if ( foldersIds.indexOf(items[i].parentId) !== -1 ) {
                    bookmarks.push(items[i]);
                }
            }
        }

        if (foldersDone >= foldersCount) {
            updateStats();
        } else {
            foldersDone++;
        }
    }

    /**
     * When we went through all recursive folders
     */
    function updateStats() {
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

        // rare case: not a single selected folders exist
        if (foldersFound == false) {
            dispatch({
                type: SAVE_FOLDERS,
                payload: []
            });
        }

        checkAchievements(dispatch, bookmarks.length, 'foldersChanged');
        
        if (saveFoldersCallback) {
            saveFoldersCallback();
        }
    }
}


/**
 * User clicked on "create custom PL folder during Step 2"
 * @param {function} callback
 */
export function createCustomFolder(callback) {
    return dispatch => {
        API.createCustomFolder((newFolder, parentFolder) => {
            dispatch({
                type: CREATE_CUSTOM_FOLDER,
                payload: newFolder
            });

            // rebuild tree when folder is created
            callback(newFolder, parentFolder);
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
        if (schedule.times > MAX_BOOKMARKS_DAILY) {
            schedule.times = MAX_BOOKMARKS_DAILY;
        } 
        // min
        else if (isNaN(schedule.times) || schedule.times <= 0) {
            schedule.times = 1;
        }

        // dispatch everything
        dispatch({
            type: SET_SCHEDULE,
            payload: schedule
        });

        // disable background timer if frequency is manual
        if (schedule.frequency === SCHEDULE.FREQUENCY.MANUAL) {
            API.notifyBackground({ action: 'stopTimer' });
        } 
        // generate new timer if needed
        else {
            generateTimer(false)(dispatch, getState);
        }

        // update tempo
        calculateTempo(dispatch, getState());
    }
}

/**
 * Calculate tempo - how fast will user finish all bookmarks
 */
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
    if ( action == 'foldersChanged' && !isNaN(state) && state >= ADDED_LOTS_ACHIEVEMENT_NUMBER && hasFoldersAchievement == false ) {
        dispatch({
            type: GIVE_ACHIEVEMENT,
            payload: { 'addedLots' : true }
        });
    }
    
    // same as previous but if state as object is passed as argument
    if ( state.achievements && state.achievements.addedLots == false && state.stats.bookmarksCount >= ADDED_LOTS_ACHIEVEMENT_NUMBER) {
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
            let currentState = getState();

            API.checkForFoldersUpdates(currentState, needToUpdate => {
                if (needToUpdate) {
                    console.warn('Something changed with folders...');
                    prepareStats(dispatch, currentState.global.foldersIds, currentState.global.allVisitedIds, () => {
                        getStatsFromBackend(dispatch, getState);
                    });
                } 
            });
        }

        /**
         * Small updates like user called a bookmark manually / new timer / postponed bookmark
         * while PL settings (options) page was inactive
         */
        function checkForSmallUpdates() {
            API.checkForSmallUpdates(getState(), mutatedState => {
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
 * Check if timer is expired and generate new if so
 */
function checkAndGenerateTimer(dispatch, getState) {
    let currentState = getState();

    // if timer is expired af
    if (moment().format('X') > currentState.popups.nextPopupTime) {
        generateTimer(false)(dispatch, getState);
    }
}

/**
 * Generate timer and dispatch new time
 * @param {bool} manualInvoke - if true then generate despite need to generate or not
 */
export function generateTimer(manualInvoke) {
    return (dispatch, getState) => {
        let currentState = getState();
        // do not generate timer if user selected manual call 
        // or if visited all bookmarks
        if (currentState.global.scheduleFrequency === SCHEDULE.FREQUENCY.MANUAL)
            return;

        sharedAPI.generateTimer(manualInvoke, currentState, (nextPopupTime, resetPopupsToday) => {
            // happens when no condition was met
            if (!nextPopupTime) return;

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