import API from '../api';
import { 
    SET_STEP,
    SET_STEP_PHASE,
    SET_USERNAME,
    SAVE_FOLDERS,
    CREATE_CUSTOM_FOLDER,
    SET_SCHEDULE
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

export function saveFolders(folders) {
    return dispatch => {
        API.saveFolders(folders);

        dispatch({
            type: SAVE_FOLDERS,
            payload: folders
        });
    }
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
    return {
        type: SET_SCHEDULE,
        payload: schedule
    }
}