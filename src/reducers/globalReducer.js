import { 
    SET_STEP,
    SET_STEP_PHASE,
    SET_USERNAME,
    SAVE_FOLDERS,
    CREATE_CUSTOM_FOLDER,
    SET_SCHEDULE,
    SET_TEMPO,
    GIVE_ACHIEVEMENT,
    RESET_RECEIVED_ACHIEVEMENT,
    UPDATE_BOOKMARKS_STATS,
    UPDATE_ENTIRE_STATE
} from '../constants';

export default function global(state = {}, action) {
    switch (action.type) {
        case SET_STEP:
            return { ...state, step: action.payload }      
        case SET_TEMPO:
            return { ...state, tempo: action.payload }      
        case SET_STEP_PHASE:
            return { ...state, stepPhase: action.payload }
        case SET_USERNAME:
            return { ...state, userName: action.payload }
        case SAVE_FOLDERS:
            return { ...state, foldersIds: action.payload }
        case CREATE_CUSTOM_FOLDER:
            return { ...state, customFolder: action.payload }
        case SET_SCHEDULE:
            return { ...state, scheduleFrequency: action.payload.frequency, schedulePeriod: action.payload.period, scheduleTimes: action.payload.times }
        case GIVE_ACHIEVEMENT:
            return { ...state, justReceived: true }
        case RESET_RECEIVED_ACHIEVEMENT:
            return { ...state, justReceived: false}
        case UPDATE_BOOKMARKS_STATS:
            return { ...state, visitedIds: action.payload.visitedIds }
        case UPDATE_ENTIRE_STATE:
            return { 
                ...state, 
                allVisitedIds: (action.payload.allVisitedIds && (action.payload.allVisitedIds > state.allVisitedIds )) 
                                ? action.payload.allVisitedIds
                                : state.allVisitedIds,
                visitedIds: (action.payload.visitedIds && (action.payload.visitedIds > state.visitedIds )) 
                            ? action.payload.visitedIds
                            : state.visitedIds
            }
        default:
            return state;
    }
}