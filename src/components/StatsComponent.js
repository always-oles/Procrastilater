import React from 'react';
import PropTypes from 'prop-types';
import API from '../api';

export default class StatsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.countAchievements  = this.countAchievements.bind(this);
        this.calculateDays      = this.calculateDays.bind(this);
        this.getPercentage      = this.getPercentage.bind(this);
        this.pluralize          = this.pluralize.bind(this);
    }

    componentWillReceiveProps() {
        this.countAchievements();
    }

    countAchievements() {
        let count = 0, unlocked = 0;

        for(let i in this.props.achievements) {
            if ( this.props.achievements[i] == true ) {
                unlocked++;
            }
            count++;
        }

        return unlocked + '/' + count;
    }

    calculateDays() {
        if (this.props.global.tempo == 0) 
            return null;
        return Math.ceil((this.props.stats.bookmarksCount-this.props.visitedIds.length) / this.props.global.tempo);
    }

    getPercentage() {
        if (this.props.stats.totalBookmarks == 0) 
            return null;

        // return result, Max is 100%
        return Math.min(Math.round(this.props.stats.bookmarksCount * 100 / this.props.stats.totalBookmarks), 100);
    }

    // thanks https://gist.github.com/tomfun/830fa6d8030d16007bbab50a5b21ef97
    pluralize() {
        let number = this.calculateDays();

        let one  = chrome.i18n.getMessage('stats_day'),
            two  = chrome.i18n.getMessage('stats_days_sm'),
            five = chrome.i18n.getMessage('stats_days');

        return API.pluralize(number, one, two, five);
    }

    render() {
        return (
            <div class='panel stats'>
                <div class='header'>{chrome.i18n.getMessage('stats_header')}</div>
                <div class='content'>
                    
                    <div class='important' style={{ display: (this.calculateDays() ? 'block' : 'none') }}>
                        {chrome.i18n.getMessage('stats_such_tempo')} <span class='value'>{ this.calculateDays() } {this.pluralize()}</span>
                    </div>

                    <div class='important' style={{ display: (this.getPercentage() ? 'block' : 'none') }} >
                        {chrome.i18n.getMessage('stats_you_have')} <span class='value'>{ this.getPercentage() }%</span> {chrome.i18n.getMessage('stats_of_all_users')}
                    </div>
                    
                    <div class='group'>
                        <div class='item'>
                            <div class='name'>{chrome.i18n.getMessage('stats_bookmarks')}:</div> 
                            <div class='value'>{ this.props.stats.bookmarksCount }</div>
                        </div>

                        <div class='item'>
                            <div class='name'>{chrome.i18n.getMessage('stats_visited_of_them')}:</div>
                            <div class='value'>{ this.props.visitedIds.length }</div>
                        </div>

                        <div class='item'>
                            <div class='name'>{chrome.i18n.getMessage('stats_visited_all_time')}:</div>
                            <div class='value'>{ this.props.stats.bookmarksVisited + this.props.stats.bookmarksVisitedManually }</div>
                        </div>

                        <div class='item'>
                            <div class='name'>{chrome.i18n.getMessage('stats_postponed')}:</div>
                            <div class='value'>{ this.props.stats.bookmarksPostponed }</div>
                        </div>

                        <div class='item'>
                            <div class='name'>{chrome.i18n.getMessage('stats_achievements')}:</div>
                            <div class='value'>{ this.countAchievements() }</div>
                        </div>
                    </div>

                
                    <div class='group'>
                        <div class='item'>
                            <div class='name' title={chrome.i18n.getMessage('stats_all_users')}>
                                {chrome.i18n.getMessage('stats_total_visited')}:
                            </div>
                            <div class='value'>{ this.props.stats.totalVisited }</div>
                        </div>

                        <div class='item'>
                            <div class='name' title={chrome.i18n.getMessage('stats_all_users')}>
                                {chrome.i18n.getMessage('stats_total_bookmarks')}:
                            </div>
                            <div class='value'>{ this.props.stats.totalBookmarks }</div>
                        </div>

                        <div class='item'>
                            <div class='name' title={chrome.i18n.getMessage('stats_all_users')}>
                                {chrome.i18n.getMessage('stats_total_users')}:
                            </div>
                            <div class='value'>{ this.props.stats.totalUsers }</div>
                        </div>

                        <div class='item'>
                            <div class='name'>{chrome.i18n.getMessage('stats_average')}:</div>
                            <div class='value'>
                                { Math.round(this.props.stats.totalBookmarks / this.props.stats.totalUsers) || 0 }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

StatsComponent.propTypes = {
    visitedIds : PropTypes.array.isRequired,
    stats: PropTypes.object.isRequired,
    achievements: PropTypes.object.isRequired
}