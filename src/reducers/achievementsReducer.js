import { 
    GIVE_ACHIEVEMENT
} from '../constants';

export default function global(state = {}, action) {
    switch (action.type) {
        case GIVE_ACHIEVEMENT:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}