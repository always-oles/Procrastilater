import { 
    UPDATE_BOOKMARKS_STATS
} from '../constants';

export default function stats(state = {}, action) {
    switch (action.type) {
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