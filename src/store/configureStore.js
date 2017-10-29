import { createStore, applyMiddleware, combineReducers } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import global from '../reducers/globalReducer';
import API from '../api';

const defaultInitialState = {
    step: 1,
    stepPhase: 'active',
    userName: '',
    foldersIds: [],
    scheduleFrequency: null,
    schedulePeriod: null,
    scheduleTimes: null,

    popupShown: false,
    popupsToday: 0,
    popupShownTime: null,
    nextPopup: null
}

/**
 * We are configuring our store and trying to get default values from chrome storage, 
 * then call a callback
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
                global
            }), 
            {
                global: state
            },
            applyMiddleware(thunk, logger)
        );

        // we are ready, return store
        callback(store);
    });

    if (module.hot) {
        module.hot.accept('../reducers', () => {
            const nextRootReducer = require('../reducers')
            store.replaceReducer(nextRootReducer)
        })
    }

    return store;
}

