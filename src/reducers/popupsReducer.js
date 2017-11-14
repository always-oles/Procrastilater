import { 
    SET_NEXT_POPUP,
    UPDATE_ENTIRE_STATE
} from '../constants';

export default function popups(state = {}, action) {
    switch (action.type) {
        case SET_NEXT_POPUP:
            return { 
                ...state, 
                nextPopupTime: action.payload.nextPopupTime,
                popupsToday: 
                    !isNaN(action.payload.popupsToday) 
                        ? action.payload.popupsToday 
                        : state.popupsToday 
            }
        case UPDATE_ENTIRE_STATE:
            return {
                ...state,
                popupsToday: (action.payload.popupsToday && (action.payload.popupsToday > state.popupsToday )) 
                            ? action.payload.popupsToday
                            : state.popupsToday,
                nextPopupTime: (action.payload.nextPopupTime && (action.payload.nextPopupTime > state.nextPopupTime )) 
                            ? action.payload.nextPopupTime
                            : state.nextPopupTime
            }
        default:
            return state;
    }
}