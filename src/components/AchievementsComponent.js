import { checkAchievementsCaller, resetReceivedAchievement } from '../actions/GlobalActions';
/* global $:jQuery */

import React from 'react';
import PropTypes from 'prop-types';

import AchievementFinger from '../assets/images/achievement-finger.svg';
import AchievementFolder from '../assets/images/achievement-folder.svg';
import AchievementLazy   from '../assets/images/achievement-lazy.svg';
import AchievementMedal  from '../assets/images/achievement-medal.svg';
import AchievementSocial from '../assets/images/achievement-social.svg';
import AchievementReviewer from '../assets/images/achievement-reviewer.svg';
import Trophy from '../assets/images/trophy.svg';

export default class AchievementsComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            justReceived: false
        };

        this.onCloseClick = this.onCloseClick.bind(this);

        // check for achievements upon first load
        // they could have been received while PL page was closed
        props.checkAchievementsCaller();
    }

    componentDidMount() {
        // if user just received an achievement after steps
        if (this.props.justReceived == true) {
            // dispatch that user received it
            this.props.resetReceivedAchievement();

            setTimeout(() => {
                // show gratz popup
                $('.achievement-gained').fadeIn();
            }, 1500);
        }
    }

    componentWillReceiveProps(nextProps) {
        // if user just received an achievement
        if (nextProps.justReceived == true) {
            // show gratz popup
            $('.achievement-gained').fadeIn();

            // dispatch that user received it
            this.props.resetReceivedAchievement();
        }
    }

    onCloseClick() {
        $('.achievement-gained').fadeOut();
    }

    render() {
        return (
            <div class='panel achievements panel--blue'>
                <div class='header'>Achievements</div>
                <div class='list'>
                    <img 
                        class = {'item ' + (this.props.achievements.addedLots ? '' : 'locked')} 
                        src = {AchievementFolder}
                        title = { this.props.achievements.addedLots
                            ? 'You\'ve added more than 40 bookmarks to shuffle!'
                            : 'Locked: add 40+ bookmarks to shuffle to unlock'}
                    />
                    <img 
                        class = {'item opacity-06 ' + (this.props.achievements.social ? '' : 'locked')} 
                        src = {AchievementSocial} 
                        title = { this.props.achievements.social 
                                ? 'You\'ve shared Procrastilater in 2 social networks!'
                                : 'Locked: share Procrastilater in at least 2 social networks to unlock' }
                    />
                    <img 
                        class = {'item opacity-05 ' + (this.props.achievements.reviewer ? '' : 'locked')} 
                        src = {AchievementReviewer} 
                        title = { this.props.achievements.reviewer 
                                ? 'You\'ve sent a message to developer!'
                                : 'Locked: send your review/thoughts to developer to unlock' }
                    />
                    <img 
                        class = {'item ' + (this.props.achievements.visitor ? '' : 'locked')} 
                        src =  {AchievementMedal}
                        title = { this.props.achievements.visitor
                                ? 'Good job! You\'ve visited more than 20 postponed bookmarks already!' 
                                : 'Locked: visit 20+ bookmarks at all time to unlock'}
                    />
                    <img 
                        class = {'item opacity-06 ' + (this.props.achievements.postponer ? '' : 'locked')} 
                        src = {AchievementLazy}   
                        title = { this.props.achievements.postponer
                                ? 'Ahh, come on! You\'ve postponed more than 10 bookmarks already'
                                : 'Locked: postpone 10+ bookmarks to unlock'}
                    />
                    <img 
                        class = {'item ' + (this.props.achievements.manualOpener ? '' : 'locked')} 
                        src = {AchievementFinger} 
                        title = { this.props.achievements.manualOpener 
                                ? 'Wow, what a dedication! You\'ve opened more than 15 bookmarks manually!'
                                : 'Locked: open 15+ bookmarks manually to unlock' }
                    />
                </div>

                <div class='achievement-gained'>
                    <div class='container'>
                        <img class='finger' src={ Trophy }/> 
                        <img class='finger' src={ Trophy }/> 
                        <img class='finger' src={ Trophy }/> 
                        <img class='finger' src={ Trophy }/> 
                        <img class='finger' src={ Trophy }/> 
                        <img class='finger' src={ Trophy }/> 
                        <img class='finger' src={ Trophy }/> 

                        <div class='close' onClick = { this.onCloseClick } >✕</div>

                        <div class='text'>
                            Congratulations! You've just unlocked an achievement! Keep the good work!
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

AchievementsComponent.propTypes = {
    achievements: PropTypes.object.isRequired,
    resetReceivedAchievement: PropTypes.func.isRequired,
    checkAchievementsCaller: PropTypes.func.isRequired,
    justReceived: PropTypes.bool.isRequired
}