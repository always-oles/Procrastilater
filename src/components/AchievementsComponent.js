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
            }, 2000);
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
            <div class='panel achievements panel--gray'>
                <div class='header'>{chrome.i18n.getMessage('global_achievements')}</div>
                <div class='list'>
                    <img 
                        class = {'item ' + (this.props.achievements.addedLots ? '' : 'locked')} 
                        src = {AchievementFolder}
                        title = { this.props.achievements.addedLots
                            ? chrome.i18n.getMessage('achievements_addedLots_unlocked')
                            : chrome.i18n.getMessage('achievements_addedLots_locked')
                        }
                    />
                    <img 
                        class = {'item opacity-06 ' + (this.props.achievements.social ? '' : 'locked')} 
                        src = {AchievementSocial} 
                        title = { this.props.achievements.social 
                                ? chrome.i18n.getMessage('achievements_social_unlocked')
                                : chrome.i18n.getMessage('achievements_social_locked')
                            }
                    />
                    <img 
                        class = {'item opacity-05 ' + (this.props.achievements.reviewer ? '' : 'locked')} 
                        src = {AchievementReviewer} 
                        title = { this.props.achievements.reviewer 
                                ? chrome.i18n.getMessage('achievements_reviewer_unlocked')
                                : chrome.i18n.getMessage('achievements_reviewer_locked')
                            }
                    />
                    <img 
                        class = {'item ' + (this.props.achievements.visitor ? '' : 'locked')} 
                        src =  {AchievementMedal}
                        title = { this.props.achievements.visitor
                                ? chrome.i18n.getMessage('achievements_visitor_unlocked')
                                : chrome.i18n.getMessage('achievements_visitor_locked')
                            }
                    />
                    <img 
                        class = {'item opacity-06 ' + (this.props.achievements.postponer ? '' : 'locked')} 
                        src = {AchievementLazy}   
                        title = { this.props.achievements.postponer
                                ? chrome.i18n.getMessage('achievements_postponer_unlocked')
                                : chrome.i18n.getMessage('achievements_postponer_locked')
                            }
                    />
                    <img 
                        class = {'item ' + (this.props.achievements.manualOpener ? '' : 'locked')} 
                        src = {AchievementFinger} 
                        title = { this.props.achievements.manualOpener 
                                ? chrome.i18n.getMessage('achievements_manualOpener_unlocked')
                                : chrome.i18n.getMessage('achievements_manualOpener_locked')
                            }
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

                        <div 
                            class = 'close' 
                            onClick = { this.onCloseClick }
                            title = {chrome.i18n.getMessage('global_close')}
                        >✕</div>

                        <div class='text'>
                            {chrome.i18n.getMessage('achievements_grats')}
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