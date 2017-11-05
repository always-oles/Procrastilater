import { 
    SET_STEP,
    SET_STEP_PHASE,
    SET_USERNAME,
    SAVE_FOLDERS,
    CREATE_CUSTOM_FOLDER,
    SET_SCHEDULE,
    SET_TEMPO
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
            return { ...state, folder: action.payload }
        case SET_SCHEDULE:
            return { ...state, scheduleFrequency: action.payload.frequency, schedulePeriod: action.payload.period, scheduleTimes: action.payload.times }
        default:
            return state;
    }
}