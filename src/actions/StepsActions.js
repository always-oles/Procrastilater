/* global chrome: {} */

import API from '../api';
import { 
    SET_STEP,
    SET_STEP_PHASE,
    SET_USERNAME,
    SAVE_FOLDERS,
    CREATE_CUSTOM_FOLDER,
    SET_SCHEDULE,
    SET_TEMPO,
    UPDATE_BOOKMARKS_STATS
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

var oldTotalBookmarks = 0;
export function saveFolders(folders) {
    return (dispatch, getState) => {

        let state = getState();

        // decrement how many bookmarks user had to increment laters
        if (state.stats.totalBookmarks > 0 ){
            oldTotalBookmarks = state.stats.totalBookmarks - state.stats.bookmarksCount
        }

        dispatch({
            type: SAVE_FOLDERS,
            payload: folders
        });

        // count/calculate selected folders bookmarks
        prepareStats(dispatch, folders, state.global.allVisitedIds);
    }
}

var bookmarks;
function prepareStats(dispatch, folders, allVisitedIds) {
    // get all user bookmarks
    chrome.bookmarks.getTree((results) => {
        if (results[0] && results[0].children) {
            // reset our array
            bookmarks = [];

            // find bookmarks in foldrs
            findObjects(results[0].children, folders, dispatch, allVisitedIds);
        }
    });
}

/**
 * Non-blocking recursive function for gathering all bookmarks from folders
 */
var foldersCount = 0, foldersDone = 0;
function findObjects(items, ids, dispatch, allVisitedIds) {

    // go through object
    for (let i in items) {

        // if it's a folder - go deeper
        if ( items[i].children ) {
            if ( items[i].children.length ) {
                foldersCount++;
                //console.log('going deeper into a folder ', items[i].title);
                setTimeout(() => {
                    findObjects(items[i].children, ids, dispatch, allVisitedIds);
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
        updateStats(dispatch, allVisitedIds);
    } else {
        foldersDone++;
    }
}

function updateStats(dispatch, allVisitedIds) {
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
            bookmarksCount: bookmarks.length,
            totalBookmarks: oldTotalBookmarks + bookmarks.length
        }
    });
}

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

export function setSchedule(schedule) {
    return (dispatch, getState) => {

        // min
        if (schedule.scheduleTimes < 1 ) {
            schedule.scheduleTimes = 1;
        } 
        // max
        else if (schedule.scheduleTimes > 10) {
            schedule.scheduleTimes = 10;
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