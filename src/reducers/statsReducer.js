import { 
    UPDATE_BOOKMARKS_STATS,
    SHARED_IN_SOCIAL,
    UPDATE_TOTAL_STATS
} from '../constants';

export default function stats(state = {}, action) {
    switch (action.type) {
        case SHARED_IN_SOCIAL:
            return { ...state, shared: state.shared+1 }
        case UPDATE_BOOKMARKS_STATS:
            return { 
                ...state, 
                bookmarksCount: action.payload.bookmarksCount
            }
        case UPDATE_TOTAL_STATS:
            return {
                ...state,
                totalBookmarks: action.payload.totalBookmarks,
                totalUsers:     action.payload.count,
                totalVisited:   action.payload.totalVisited + action.payload.totalVisitedManually
            }
        default:
            return state;
    }
}