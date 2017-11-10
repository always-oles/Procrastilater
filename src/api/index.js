import popups from '../reducers/popupsReducer';
/* global chrome, $: jQuery, Promise, moment */

import { getStatsFromBackend } from '../actions/GlobalActions';
import {
    SERVER_API,
    API_STATS,
    SCHEDULE
} from '../constants';

/**
 * TODO: remove consoles
 */

export default {
    saveFolders: (folders) => {
        chrome.storage.local.set({'folders': folders});
    },

    getFolders: (callback) => {
        chrome.storage.local.get('folders', (result) => {
            callback(result.folders);
        })
    },
    
    createCustomFolder: (callback) => {
        chrome.bookmarks.create(
            {
                'parentId': '1', 
                'title': 'ProcrastiLater'
            },
            (newFolder) => {
                callback(newFolder);
            }
        );
    },

    clearData: (callback) => {
        // chrome.storage.local.clear( () => {
        //     console.warn('storage is clear');
        //     if (callback) callback();
        // });
        chrome.storage.local.remove('state', () => {
            console.warn('storage is clear');
            if (callback) callback();
        });
    },

    logData: () => {
        chrome.storage.local.get(null, (result) => {
            console.log(result);
        });
    },

    getState: (callback) => {
        chrome.storage.local.get('state', (result) => {
            callback(result.state);
        });
    },

    setState: (state, callback) => {
        chrome.storage.local.set({'state': state}, () => {
            if (callback) callback();
        });
    },

    getToken: (callback) => {
        chrome.storage.local.get('token', (token) => {
            callback(token);
        });
    },

    sendMessage: (message) => {
        return new Promise( (resolve, reject) => {
            chrome.storage.local.get('token', (token) => {
                $.post(SERVER_API + 'sendMessage', Object.assign({}, message, token), data => {
                    if (data.status == true) {
                        resolve();
                    } else {
                        console.warn(data);
                        reject(data);
                    }
                });
            });
        });
    },

    getStatsFromBackend: (state) => {
        return new Promise( (resolve, reject) => {
            // get token
            chrome.storage.local.get('token', (storage) => {

                // send data
                $.post(
                    SERVER_API + API_STATS, 
                    Object.assign(
                        {},
                        {
                            token: storage.token,
                            name: state.global.userName,
                            achievements: state.achievements,
                            stats: {
                                bookmarksCount:             state.stats.bookmarksCount,
                                bookmarksPostponed:         state.stats.bookmarksPostponed,
                                bookmarksVisited:           state.stats.bookmarksVisited,
                                bookmarksVisitedManually:   state.stats.bookmarksVisitedManually,
                                shared:                     state.stats.shared
                            }        
                        }
                ), data => {
                    if (data.status == 'Error') {
                        reject(data);
                    }

                    resolve(data);
                });
            });
        });
    },

    generateTimer: (manualInvoke = false, state, callback) => {
        if (!state) return;

        let now                 = moment();

        let todayStart          = moment().startOf('day');
        let todayEnd            = moment().endOf('day');

        let yesterdayStart      = moment().subtract(1, 'day').startOf('day');
        let yesterdayEnd        = moment().subtract(1, 'day').endOf('day');
        
        let tomorrowStart       = moment().add(1, 'day').startOf('day');
        let tomorrowEnd         = moment().add(1, 'day').endOf('day');

        let afterTomorrowEnd    = moment().add(2, 'day').endOf('day');

        let nextPopupTime     = moment.unix(state.popups.nextPopupTime);
        //let nextPopupTime       = moment().add(1,'d');

        let scheduleTimes   = state.global.scheduleTimes;

        let popupsToday     = state.popups.popupsToday;
        //let popupsToday     = 1;

        let period          = state.global.schedulePeriod;

        let resetPopupsToday = false;
        console.log('nextPopupTime:',moment(nextPopupTime).format('ddd MMMM Do YYYY, HH:mm:ss'));

        switch ( state.global.scheduleFrequency ) {
            // every day
            case SCHEDULE.FREQUENCY.EVERY_DAY: 
                // if there is no timer yet
                if ( state.popups.nextPopupTime == null ) {
                    resetPopupsToday = true;                    
                    prepareTimer('today', period);
                } 
                // if timer was shown today earlier
                else if ( nextPopupTime.isBetween(todayStart, now) ) {
                    prepareTimer('tomorrow', period);
                } 
                // if timer was shown yesterday
                else if ( nextPopupTime.isBetween(yesterdayStart, yesterdayEnd) ) {
                    resetPopupsToday = true;
                    prepareTimer('today', period);
                }
                // more than 1 days ago
                else if ( nextPopupTime.diff(yesterdayStart) <= 0 ) {
                    resetPopupsToday = true;
                    prepareTimer('today', period);
                } else {
                    // everything is ok and we have next timer
                    // but if invoked manually - generate new anyway
                    if (manualInvoke) 
                        prepareTimer('today', period);
                }
            break;

            // every 2 days 
            case SCHEDULE.FREQUENCY.EVERY_2_DAYS:
                // if there is no timer yet
                if ( state.popups.nextPopupTime == null ) {
                    resetPopupsToday = true;                    
                    prepareTimer('today', period);
                } 
                // if timer was shown today already
                else if ( nextPopupTime.diff(now) <=0 && nextPopupTime.diff(todayStart) >=0 ) {
                    console.warn('was shown today, go after tomorrow');
                    prepareTimer('afterTomorrow', period);
                }
                // was shown yesterday
                else if ( nextPopupTime.diff(todayStart) <= 0 && nextPopupTime.diff(moment().subtract(1,'d').startOf('day')) >=0 ) {
                    // generate for tomorrow
                    console.warn('was shown yesterday, go tomorrow');
                    resetPopupsToday = true;
                    prepareTimer('tomorrow', period);
                }
                // was shown before yesterday
                else if ( nextPopupTime.diff(moment().subtract(1,'d').startOf('day')) <= 0) {
                    console.warn('was shown long time ago');
                    resetPopupsToday = true;
                    prepareTimer('today', period);
                } else {
                    // everything is ok and we have next timer
                    // but if invoked manually - generate new anyway
                    console.warn('ok next timer is in future, regenerate if called manually');
                    if (manualInvoke) {
                        // if it had to show today
                        if (nextPopupTime.isBetween(todayStart, todayEnd)) {
                            prepareTimer('today', period);
                        }
                        else if (nextPopupTime.isBetween(tomorrowStart, tomorrowEnd)) {
                            prepareTimer('tomorrow', period);
                        }
                        else if ( nextPopupTime.diff(afterTomorrowEnd) >=0 ) {
                            prepareTimer('afterTomorrow', period);
                        }
                    }
                }
            break;

            // few times per day
            case SCHEDULE.FREQUENCY.FEW_TIMES:
                // if there is no timer yet
                if ( state.popups.nextPopupTime == null ) {
                    resetPopupsToday = true;                    
                    prepareTimer('today', period, scheduleTimes, popupsToday);
                } 
                // if timer was yesterday or earlier
                else if ( nextPopupTime.diff(todayStart) <= 0 ) {
                    console.warn('was shown yesterday or earlier');
                    resetPopupsToday = true;                    
                    prepareTimer('today', period, scheduleTimes, popupsToday);
                }
                // if timer was shown today
                else if ( nextPopupTime.isBetween(todayStart, todayEnd) ) {
                    console.warn('was shown today');

                    // if shown enough
                    if ( popupsToday >= scheduleTimes ) {
                        console.warn('had enough');
                        prepareTimer('tomorrow', period, scheduleTimes, popupsToday);
                    }
                    // if still can show more
                    else {
                        console.warn('can show more');              
                        prepareTimer('today', period, scheduleTimes, popupsToday);
                    }
                } else {
                    prepareTimer('today', period, scheduleTimes, popupsToday);
                }
            break;

            default: 
                console.warn('manual');
        }


        /**
         * Prepare, check everything and generate a random date in needed interval for timer
         * @param {String} when today/tomorrow/afterTomorrow 
         * @param {String} period from SCHEDULE.PERIOD const
         * @param {Int} timesPerDay show timer per day (how user set)
         * @param {Int} popupsToday shown already today
         */
        function prepareTimer(when, period, timesPerDay = 1, popupsToday = 0) {
            console.warn('going to generate timer:', when, period);

            let periodStart, periodEnd;    
            let now = moment().add(5, 'minutes');
            //let now = moment().startOf('day').add(23,'h');

            // generate for today
            if ( when === 'today' ) {

                // shown today enough times
                if ( popupsToday >= timesPerDay ) {
                    return callSelfTomorrow(arguments);
                }

                // switch time period that user chose
                switch ( period ) {
                    
                    // today between 6:00 and 23:59
                    case SCHEDULE.PERIOD.RANDOM:
                        // 6:00
                        periodStart = moment().startOf('day').add(6,'hours');
                        // 23:59
                        periodEnd   = moment().endOf('day');
                    break;

                    // today between 6:00 and 12:00
                    case SCHEDULE.PERIOD.MORNING:
                        
                        // if today is too late and time >= 12:00
                        if ( now.diff(moment().startOf('day').add(12,'hours')) >= 0) {
                            return callSelfTomorrow(arguments);
                        }

                        // 6:00
                        periodStart = moment().startOf('day').add(6,'hours');
                        // 12:00
                        periodEnd   = moment().startOf('day').add(12,'hours');
                    break;

                    // today between 12:00 and 18:00
                    case SCHEDULE.PERIOD.NOON: 

                        // if today is too late and time >= 18:00
                        if ( now.diff(moment().startOf('day').add(18,'hours')) >= 0) {
                            return callSelfTomorrow(arguments);
                        }

                        // 12:00
                        periodStart = moment().startOf('day').add(12,'hours');
                        // 18:00
                        periodEnd   = moment().startOf('day').add(18,'hours');
                    break;

                    // today between 18:00 and 23:59
                    case SCHEDULE.PERIOD.EVENING: 
                        // 18:00
                        periodStart = moment().startOf('day').add(18,'hours');
                        // 23:59
                        periodEnd   = moment().endOf('day');
                    break;
                }
            } 

            // generate for tomorrow and after tomorrow
            else if ( when === 'tomorrow' || when === 'afterTomorrow') {

                // how many days we should add to todays date
                let howManyDays = 1;

                // simple af
                if ( when === 'afterTomorrow' ) {
                    howManyDays = 2;
                }

                switch ( period ) {
                    
                    // tomorrow between 6:00 and 23:59
                    case SCHEDULE.PERIOD.RANDOM:
                        // 6:00
                        periodStart = moment().add(howManyDays,'day').startOf('day').add(6,'hours');
                        // 23:59
                        periodEnd   = moment().add(howManyDays,'day').endOf('day');
                    break;

                    // tomorrow between 6:00 and 12:00
                    case SCHEDULE.PERIOD.MORNING:
                        // 6:00
                        periodStart = moment().add(howManyDays,'day').startOf('day').add(6,'hours');
                        // 12:00
                        periodEnd   = moment().add(howManyDays,'day').startOf('day').add(12,'hours');
                    break;

                    // tomorrow between 12:00 and 18:00
                    case SCHEDULE.PERIOD.NOON: 
                        // 12:00
                        periodStart = moment().add(howManyDays,'day').startOf('day').add(12,'hours');
                        // 18:00
                        periodEnd   = moment().add(howManyDays,'day').startOf('day').add(18,'hours');
                    break;

                    // tomorrow between 18:00 and 23:59
                    case SCHEDULE.PERIOD.EVENING: 
                        // 18:00
                        periodStart = moment().add(howManyDays,'day').startOf('day').add(18,'hours');
                        // 23:59
                        periodEnd   = moment().add(howManyDays,'day').endOf('day');
                    break;
                }
            }

            // if now time is inside interval and bigger than it's start - set start to now
            if ( now.diff(periodStart) >= 0 ) 
                periodStart = now;

            // get difference in UNIX seconds
            let diff = periodEnd.format('X') - periodStart.format('X');

            // if need to split into few times
            if ( timesPerDay > popupsToday ) {
                diff = Math.round(diff / (timesPerDay-popupsToday));
            }

            let result = +periodStart.format('X') + getRandomInt(0, diff);
            console.warn('now:', now.format('ddd MMMM Do YYYY, HH:mm:ss'));
            console.warn('generated time between\n', periodStart.format('ddd MMMM Do YYYY, HH:mm:ss'), '\n', periodEnd.format('ddd MMMM Do YYYY, HH:mm:ss'));
            console.warn('random between in normal time: ', moment.unix(result).format('ddd MMMM Do YYYY, HH:mm:ss'));

            // call the main callback to action creator
            callback(result, resetPopupsToday);

            /**
             * Helper function to call self with other first 
             * (WHEN) argument just because this is an ez solution
             * @param {Array} args 
             */
            function callSelfTomorrow(args) {
                console.warn('calling self with tomorrow date');

                // lets say that we should generate timer for tomorrow
                let newArguments = args;
                newArguments[0] = 'tomorrow';
                
                // just call self with new arguments
                return prepareTimer(...newArguments);
            }
        }
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

    //     chrome.storage.local.get('state', (result) => {

    //         result.global.nextPopup = moment().add('60', 'seconds').valueOf();

    //         chrome.storage.local.set({'popupData': {
    //             name: 'Тестовая закладка епте',
    //             id: 1,
    //             url: 'http://google.com.ua?q=beps'
    //         }});

    //         chrome.storage.local.set({'state': result.state}, () => {
    //             console.log('setting state to', result.state);
    //             window.location.reload();
    //         });
    //     });