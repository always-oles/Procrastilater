import { 
    UPDATE_BOOKMARKS_STATS,
    SHARED_IN_SOCIAL
} from '../constants';

export default function stats(state = {}, action) {
    switch (action.type) {
        case SHARED_IN_SOCIAL:
            return { ...state, shared: state.shared+1 }
        case UPDATE_BOOKMARKS_STATS:
            return { 
                ...state, 
                bookmarksCount: action.payload.bookmarksCount, 
                visitedIds: action.payload.visitedIds,
                totalBookmarks: action.payload.totalBookmarks
            }    
        default:
            return state;
    }
}