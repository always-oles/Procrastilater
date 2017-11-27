import { createStore, applyMiddleware, combineReducers } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import API from '../api';
import {
    SCHEDULE
} from '../constants';

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
    
        scheduleFrequency: SCHEDULE.FREQUENCY.EVERY_DAY,
        schedulePeriod: SCHEDULE.PERIOD.RANDOM,
        scheduleTimes: null,
        tempo: null,
        justReceived: false,
        shownManualTutorial: false
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
        bookmarksCount:           0, 
        bookmarksVisited:         0, 
        bookmarksVisitedManually: 0,
        bookmarksPostponed:       0,
        shared:                   0,
        totalBookmarks:           0, 
        totalUsers:               1,
        totalVisited:             0,
        totalPostponed:           0
    }
}

/**
 * Configure store and try to get values from storage if they exist, otherwise take defaults
 * @param {Function} callback 
 */
export default function configureStore(callback) {
    let middlewares = [thunk];

    // dev redux logger
    if (process.env.NODE_ENV === 'development') {
        middlewares.push(createLogger());        
    }

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
            applyMiddleware(...middlewares)
        );

        // we are ready, return store
        callback(store);
    });
    
    return store;
}

