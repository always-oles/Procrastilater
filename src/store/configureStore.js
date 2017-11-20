import { createStore, applyMiddleware, combineReducers } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import API from '../api';

// reducers
import global from '../reducers/globalReducer';
import stats from '../reducers/statsReducer';
import achievements from '../reducers/achievementsReducer';
import popups from '../reducers/popupsReducer';

const defaultInitialState = {
    global: {
        step: 1,
        stepPhase: 'active',
        userName: 'Incognito',
    
        foldersIds: [],
        visitedIds: [],
        allVisitedIds: [],
        customFolder: null,
        hourFormat: 24,
    
        scheduleFrequency: 'EVERY_DAY',
        schedulePeriod: 'RANDOM',
        scheduleTimes: null,
        tempo: null,
        justReceived: false
    },

    achievements: {       
        manualOpener:   false,
        visitor:        false,
        postponer:      false,
        addedLots:      false,
        social:         false,
        reviewer:       false
    },

    popups: {
        nextPopupTime: null,
        popupsToday: 0
    },

    stats: {
        bookmarksCount: 0, 
        bookmarksVisited: 0, 
        bookmarksVisitedManually: 0,
        bookmarksPostponed: 0,
        shared: 0,
        totalBookmarks: 0, 
        totalUsers: 1,
        totalVisited: 0
    }
}

/**
 * Configure store and try to get values from storage if they exist, otherwise take defaults
 * @param {func} callback 
 */
export default function configureStore(callback) {

    // dev redux logger
    const logger = createLogger();

    let store = null;
    
    // get state from storage
    API.getState( state => {

        // if its empty or undefined - set default
        if ( !state ) {
            state = defaultInitialState;
        }

        // create actual store
        store = createStore(
            combineReducers({
                global,
                stats,
                achievements,
                popups
            }), 
            state,
            applyMiddleware(thunk, logger)
        );

        // we are ready, return store
        callback(store);
    });
    
    return store;
}

