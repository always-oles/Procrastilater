import React from 'react';
import PropTypes from 'prop-types';


export default class StatsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.countAchievements  = this.countAchievements.bind(this);
        this.calculateDays      = this.calculateDays.bind(this);
        this.getPercentage      = this.getPercentage.bind(this);
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
        return Math.round((this.props.stats.bookmarksCount-this.props.visitedIds.length) / this.props.global.tempo);
    }

    getPercentage() {
        if (this.props.stats.totalBookmarks == 0) 
            return null;

        // return result, Max is 100%
        return Math.min(Math.round(this.props.stats.bookmarksCount * 100 / this.props.stats.totalBookmarks), 100);
    }

    render() {
        return (
            <div class='panel stats panel--gray'>
                <div class='header'>Stats</div>
                <div class='content'>
                    
                    <div class='important' style={{ display: (this.calculateDays() ? 'block' : 'none') }}>if you continue with such tempo - you 
                    will deal with all bookmarks in <span class='value'>{ this.calculateDays() } days</span></div>

                    <div class='important' style={{ display: (this.getPercentage() ? 'block' : 'none') }} >You have <span class='value'>{ this.getPercentage() }%</span> of all users bookmarks</div>
                    
                    <div class='group'>
                        <div class='item'>
                            <div class='name'>bookmarks:</div> 
                            <div class='value'>{ this.props.stats.bookmarksCount }</div>
                        </div>

                        <div class='item'>
                            <div class='name'>visited of them:</div>
                            <div class='value'>{ this.props.visitedIds.length }</div>
                        </div>

                        <div class='item'>
                            <div class='name'>visited (all time):</div>
                            <div class='value'>{ this.props.stats.bookmarksVisited + this.props.stats.bookmarksVisitedManually }</div>
                        </div>

                        <div class='item'>
                            <div class='name'>postponed:</div>
                            <div class='value'>{ this.props.stats.bookmarksPostponed }</div>
                        </div>

                        <div class='item'>
                            <div class='name'>achievements:</div>
                            <div class='value'>{ this.countAchievements() }</div>
                        </div>
                    </div>

                
                    <div class='group'>
                        <div class='item'>
                            <div class='name' title='All users statistics'>total users:</div>
                            <div class='value'>{ this.props.stats.totalUsers }</div>
                        </div>

                        <div class='item'>
                            <div class='name' title='All users statistics'>total visited:</div>
                            <div class='value'>{ this.props.stats.totalVisited }</div>
                        </div>

                        <div class='item'>
                            <div class='name' title='All users statistics'>total bookmarks:</div>
                            <div class='value'>{ this.props.stats.totalBookmarks }</div>
                        </div>

                        <div class='item'>
                            <div class='name'>average per user:</div>
                            <div class='value'>{ Math.round(this.props.stats.totalBookmarks / this.props.stats.totalUsers) || 0 }</div>
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