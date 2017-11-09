/* global $:jQuery, chrome */
import API from '../api';
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
    UPDATE_TOTAL_STATS
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
            if ( allVisitedIds.indexOf(bookmarks[i].id) ) {
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

    // if called manually from another function
    if (dispatch && getState) {
        API.getStatsFromBackend(getState())
        .then(data => {
            dispatch({
                type: UPDATE_TOTAL_STATS,
                payload: data
            });
        });
    } 
    // if called as a redux function
    else {
        return (dispatch, getState) => {
            let state = getState();

            // do not send data until user has some bookmarks selected
            if (state.global.foldersIds.length) {
                API.getStatsFromBackend(getState())
                .then(data => {
                    dispatch({
                        type: UPDATE_TOTAL_STATS,
                        payload: data
                    });
                });
            }
        }
    }
}