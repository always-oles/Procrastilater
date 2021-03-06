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
        RANDOM: 'RANDOM'
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
export const SET_NEXT_POPUP = 'SET_NEXT_POPUP';
export const UPDATE_ENTIRE_STATE = 'UPDATE_ENTIRE_STATE';
export const SET_HOUR_FORMAT = 'SET_HOUR_FORMAT';
export const SHOWN_MANUAL_TUTORIAL = 'SHOWN_MANUAL_TUTORIAL';

// achievements data
export const ADDED_LOTS_ACHIEVEMENT_NUMBER = 40;
export const VISITOR_LIMIT = 20;
export const POSTPONER_LIMIT = 10;
export const MANUAL_OPENER_LIMIT = 15;
export const MAX_BOOKMARKS_DAILY = 20;

// backend consts
export const SERVER_API = 'http://95.85.45.32/pl/api/';
export const API_SEND_MESSAGE = 'sendMessage';
export const API_STATS = 'stats'; 

export const YT_EN_LINK = 'https://www.youtube.com/embed/VmlTbb5m8WA?rel=0&amp;start=69&enablejsapi=1';
export const YT_RU_LINK = 'https://www.youtube.com/embed/Xak1m8qhSSY?rel=0&amp;start=65&enablejsapi=1';

export const SHARE_LINK = 'https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fbmoajoielkomndjlojhcnibkehhkkaao%2F&linkname=' + chrome.i18n.getMessage('share_link_name');