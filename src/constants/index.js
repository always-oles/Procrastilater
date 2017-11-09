export const SET_STEP = 'SET_STEP';
export const SET_USERNAME = 'SET_USERNAME';
export const SAVE_FOLDERS = 'SAVE_FOLDERS';
export const CREATE_CUSTOM_FOLDER = 'CREATE_CUSTOM_FOLDER';
export const SET_STEP_PHASE = 'SET_STEP_PHASE';

export const SCHEDULE = {
    FREQUENCY: {
        FEW_TIMES : 'FEW_TIMES',
        EVERY_DAY : 'EVERY_DAY',
        EVERY_2_DAYS : 'EVERY_2_DAYS',
        MANUAL: 'MANUAL'
    },
    PERIOD: {
        MORNING: '6:00-12:00',
        NOON: '12:00-18:00',
        EVENING: '18:00-0:00',
        RANDOM: 'ANY'
    }
}

export const SET_SCHEDULE = 'SET_SCHEDULE';
export const SET_TEMPO = 'SET_TEMPO';
export const UPDATE_BOOKMARKS_STATS = 'UPDATE_BOOKMARKS_STATS';
export const SHARED_IN_SOCIAL = 'SHARED_IN_SOCIAL';
export const GIVE_ACHIEVEMENT = 'GIVE_ACHIEVEMENT';
export const RESET_RECEIVED_ACHIEVEMENT = 'RESET_RECEIVED_ACHIEVEMENT';
export const SEND_MESSAGE_SUCCESS = 'SEND_MESSAGE_SUCCESS';
export const SEND_MESSAGE_ERROR = 'SEND_MESSAGE_ERROR';
export const UPDATE_TOTAL_STATS = 'UPDATE_TOTAL_STATS';

// achievements data
export const ADDED_LOTS_ACHIEVEMENT_NUMBER = 40;

// backend consts
const API_VERSION = '1';
export const SERVER_API = 'http://localhost:3000/api_v'+API_VERSION+'/';
export const API_SEND_MESSAGE = 'sendMessage';
export const API_STATS = 'stats';