import { 
    UPDATE_BOOKMARKS_STATS,
    SHARED_IN_SOCIAL,
    UPDATE_TOTAL_STATS,
    UPDATE_ENTIRE_STATE
} from '../constants';

export default function stats(state = {}, action) {
    let totalVisited;

    switch (action.type) {
        case SHARED_IN_SOCIAL:
            return { 
                ...state, 
                shared: state.shared + 1 
            }
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
                totalVisited:   action.payload.totalVisited + action.payload.totalVisitedManually,
                totalPostponed: action.payload.totalPostponed
            }
        case UPDATE_ENTIRE_STATE:
            totalVisited = state.totalVisited;

            // update total visited temporary, before its fetched from backend
            if (action.payload.bookmarksVisited && (action.payload.bookmarksVisited > state.bookmarksVisited )) {
                totalVisited = state.totalVisited + (action.payload.bookmarksVisited - state.bookmarksVisited);
            }
            if (action.payload.bookmarksVisitedManually && (action.payload.bookmarksVisitedManually > state.bookmarksVisitedManually )) {
                totalVisited = state.totalVisited + (action.payload.bookmarksVisitedManually - state.bookmarksVisitedManually);
            }

            return {
                ...state,
                bookmarksVisited: (action.payload.bookmarksVisited && (action.payload.bookmarksVisited > state.bookmarksVisited )) 
                                ? action.payload.bookmarksVisited
                                : state.bookmarksVisited,
                bookmarksVisitedManually: (action.payload.bookmarksVisitedManually && (action.payload.bookmarksVisitedManually > state.bookmarksVisitedManually )) 
                                ? action.payload.bookmarksVisitedManually
                                : state.bookmarksVisitedManually,
                bookmarksPostponed: (action.payload.bookmarksPostponed && (action.payload.bookmarksPostponed > state.bookmarksPostponed )) 
                                ? action.payload.bookmarksPostponed
                                : state.bookmarksPostponed,
                totalVisited: totalVisited,
                totalPostponed: (action.payload.bookmarksPostponed && (action.payload.bookmarksPostponed > state.bookmarksPostponed )) 
                                ? state.totalPostponed + (action.payload.bookmarksPostponed - state.bookmarksPostponed)
                                : state.totalPostponed
            }
        default:
            return state;
    }
}