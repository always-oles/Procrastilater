import { 
    SET_NEXT_POPUP
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
        default:
            return state;
    }
}