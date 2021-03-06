const SCHEDULE = {
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

var self;
var sharedAPI = {
    generateTimer: function(manualInvoke = false, state, callback) {
        if (!state) return;

        var self = this;
    
        //// debugging
        //return callback(moment().add(10,'seconds').format('X'), false);
        ////////////////////////////
    
        let 
            now                 = moment(),
            todayStart          = moment().startOf('day'),
            todayEnd            = moment().endOf('day'),
        
            yesterdayStart      = moment().subtract(1, 'day').startOf('day'),
            yesterdayEnd        = moment().subtract(1, 'day').endOf('day'),
            
            tomorrowStart       = moment().add(1, 'day').startOf('day'),
            tomorrowEnd         = moment().add(1, 'day').endOf('day'),
            afterTomorrowEnd    = moment().add(2, 'day').endOf('day'),
        
            nextPopupTime       = moment.unix(state.popups.nextPopupTime),
            scheduleTimes       = state.global.scheduleTimes,
            popupsToday         = state.popups.popupsToday,
            period              = state.global.schedulePeriod,
            resetPopupsToday    = false;

        //console.log('nextPopupTime:', moment(nextPopupTime).format('ddd MMMM Do YYYY, HH:mm:ss'));
    
        // if there is no timer yet
        if ( state.popups.nextPopupTime == null && state.global.scheduleFrequency != SCHEDULE.FREQUENCY.MANUAL ) {
            resetPopupsToday = true;                    
            prepareTimer('today', period, scheduleTimes, popupsToday);
        } else {
            switch ( state.global.scheduleFrequency ) {
                // every day
                case SCHEDULE.FREQUENCY.EVERY_DAY: 
                    // if timer was shown today earlier
                    if ( nextPopupTime.isBetween(todayStart, now) ) {
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
                        // but if invoked manually - force generate new anyway
                        if (manualInvoke)
                            prepareTimer('today', period);
                    }
                break;
    
                // every 2 days 
                case SCHEDULE.FREQUENCY.EVERY_2_DAYS:
                    // if timer was shown today already
                    if ( nextPopupTime.diff(now) <=0 && nextPopupTime.diff(todayStart) >=0 ) {
                        console.log('was shown today, go after tomorrow');
                        prepareTimer('afterTomorrow', period);
                    }
                    // was shown yesterday
                    else if ( nextPopupTime.diff(todayStart) <= 0 && nextPopupTime.diff(moment().subtract(1,'d').startOf('day')) >=0 ) {
                        // generate for tomorrow
                        console.log('was shown yesterday, go tomorrow');
                        resetPopupsToday = true;
                        prepareTimer('tomorrow', period);
                    }
                    // was shown before yesterday
                    else if ( nextPopupTime.diff(moment().subtract(1,'d').startOf('day')) <= 0) {
                        console.log('was shown long time ago');
                        resetPopupsToday = true;
                        prepareTimer('today', period);
                    } else {
                        // everything is ok and we have next timer
                        // but if invoked manually - generate new anyway
                        console.log('ok next timer is in future, regenerate if called manually');
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
                    // if timer was yesterday or earlier
                    if ( nextPopupTime.diff(todayStart) <= 0 ) {
                        console.log('was shown yesterday or earlier');
                        resetPopupsToday = true;                    
                        prepareTimer('today', period, scheduleTimes, popupsToday);
                    }
                    // if timer was shown today
                    else if ( nextPopupTime.isBetween(todayStart, todayEnd) ) {
                        console.log('was shown today');
    
                        // if shown enough
                        if ( popupsToday >= scheduleTimes ) {
                            console.log('had enough');
                            prepareTimer('tomorrow', period, scheduleTimes, popupsToday);
                        }
                        // if still can show more
                        else {
                            console.log('can show more');              
                            prepareTimer('today', period, scheduleTimes, popupsToday);
                        }
                    } else {
                        prepareTimer('today', period, scheduleTimes, popupsToday);
                    }
                break;
    
                default: 
                    console.log('manual');
            }
        }
    
        /**
         * Prepare, check everything and generate a random date in needed interval for timer
         * @param {String} when today/tomorrow/afterTomorrow 
         * @param {String} period from SCHEDULE.PERIOD const
         * @param {Int} timesPerDay show timer per day (how user set)
         * @param {Int} popupsToday shown already today
         */
        function prepareTimer(when, period, timesPerDay = 1, popupsToday = 0) {
            console.log('going to generate timer:', when, period);
    
            let periodStart, periodEnd;
        
            // add 5 minutes from now to prevent popping up immediately
            let now = moment().add(5, 'minutes');
    
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
    
            let result = +periodStart.format('X') + self.getRandomInt(0, diff);
            console.log('now:', now.format('ddd MMMM Do YYYY, HH:mm:ss'));
            console.log('generated time between\n', periodStart.format('ddd MMMM Do YYYY, HH:mm:ss'), '\n', periodEnd.format('ddd MMMM Do YYYY, HH:mm:ss'));
            console.log('random between in normal time: ', moment.unix(result).format('ddd MMMM Do YYYY, HH:mm:ss'));
    
            // call the main callback to action creator
            return callback(result, resetPopupsToday);
    
            /**
             * Helper function to call self with other first 
             * (WHEN) argument just because this is an ez solution
             * @param {Array} args 
             */
            function callSelfTomorrow(args) {
                console.log('calling self with tomorrow date');
    
                // lets say that we should generate timer for tomorrow
                let newArguments = args;
                newArguments[0] = 'tomorrow';
                
                // just call self with new arguments
                return prepareTimer(...newArguments);
            }
        }

        // if no condition was met - just call a callback
        if (callback) {
            console.log('no condition was met');
            return callback();
        }
    },
    
        /**
         * When timer ran out of time
         * Let's create a popup it's not a crime
         * yo
         * p.s. proud of this function
         * @param {Array} allVisitedIds 
         * @param {Array} foldersIds 
         * @param {Function} callback 
         */
    createPopup: function(allVisitedIds, foldersIds, callback) {
        if (!foldersIds.length) return;
        let allBookmarks = [];
        
        // open each of passed folders ids and get bookmarks
        (function fetchFolder(id) {
            chrome.bookmarks.getChildren(id, items => {
                
                // add items to main array
                if (items) {
                    allBookmarks.push(...items);
                }
    
                if (foldersIds.length) {
                    // prevent freeze
                    setTimeout(() => {
                        fetchFolder(foldersIds.shift());
                    });
                } else {
                    checkVisited();
                }
            });
        })(foldersIds.shift());
    
        function checkVisited() {
            if (!allBookmarks.length) return;
    
            let safeItems = [];

            for (let i in allBookmarks) {
                // check if it's not visited AND not a folder
                if ( allVisitedIds.indexOf( allBookmarks[i].id ) === -1 && !allBookmarks[i].dateGroupModified ) {
                    safeItems.push(allBookmarks[i]);
                } 
            }

            // if something went wrong
            if (safeItems.length == 0) {
                chrome.storage.local.remove('popupData');
                return callback(null);
            }

            console.log('safe items', safeItems);
            
            let randomBookmark = safeItems[Math.floor(Math.random() * safeItems.length)];

            // callback is defined in background script
            if (callback) {
                return callback(randomBookmark);
            }

            // otherwise just send message to runtime
            else {
                // send message with random bookmark to background script
                chrome.runtime.sendMessage({ action: 'openPopup', data: randomBookmark });
            }
        }
    },
    
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}