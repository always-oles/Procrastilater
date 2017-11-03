import { saveFolders, setSchedule } from '../actions/StepsActions';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as stepsActions from '../actions/StepsActions';

import BookmarksList from './BookmarksList';
import Timer from './Timer';
import Conversation from './Conversation';

import FolderSelectionComponent from './FolderSelectionComponent';
import ScheduleComponent from './ScheduleComponent';

import Logo from '../assets/images/logo.svg';
import HelpButton from '../assets/images/help-button.svg';
import AchievementFinger from '../assets/images/achievement-finger.svg';
import AchievementFolder from '../assets/images/achievement-folder.svg';
import AchievementLazy   from '../assets/images/achievement-lazy.svg';
import AchievementMedal  from '../assets/images/achievement-medal.svg';
import AchievementSocial from '../assets/images/achievement-social.svg';
import AchievementReviewer from '../assets/images/achievement-reviewer.svg';

class MainPage extends React.Component {
    componentDidMount(){
        this.animate = this.animate.bind(this);

        // if user switched to main page from steps - need to animate goes true
        if (this.props.needToAnimate) {
            this.animate();
        }
    }

    // appear like from top and bottom
    animate() {
        // add animation for main page
        this.refs.mainPage.classList.add('appear');
        
        setTimeout(() => {
            this.refs.mainPage.classList.remove('appear');
        }, 1000);
    }

    render() {
        return ( 
            <div class='main-page' ref='mainPage' style={{display: this.props.global.step == -1 ? 'block' : 'none' }}>
                <header> 
                    <img class='logo' src={Logo}/>
                    <div class='header-panel'>
                        <div class='col-sm-4 greeting'>Hello, {this.props.global.userName} <img class='help-button' src={HelpButton}/> </div>
                        <div class='col-sm-4 timer-container'>
                            <div class='title'>Next bookmark will appear in:</div>
                            <Timer nextPopup = {this.props.global.nextPopup}></Timer>
                        </div>
                        <div class='col-sm-4 progress-container'>
                            <div class='title'>Your overall progress:</div>
                            <div class='progress-bar-full'>
                                <div class='bar'></div>
                                <div class='text'>48%</div>
                            </div>
                            <div class='note'>You’ve dealt with 40/120 postponed bookmarks!</div>
                        </div>
                    </div>
                </header>

                <div class='body'>
                    <div class='col-sm-12'>
                        <div class='col-sm-4'>
                            <FolderSelectionComponent
                                foldersIds  = { this.props.global.foldersIds }
                                saveFolders = { this.props.stepsActions.saveFolders }
                            >
                            </FolderSelectionComponent>
                        </div>

                        <div class='col-sm-4'>
                            <ScheduleComponent 
                                ref                 = 'scheduleComponent'
                                scheduleFrequency   = { this.props.global.scheduleFrequency }
                                schedulePeriod      = { this.props.global.schedulePeriod }
                                scheduleTimes       = { this.props.global.scheduleTimes }
                                setSchedule         = { this.props.stepsActions.setSchedule }
                            ></ScheduleComponent>
                        </div>

                        <div class='col-sm-4'>
                            <div class='panel achievements panel--blue'>
                                <div class='header'>Achievements</div>
                                <div class='list'>
                                    <img class='item locked' src={AchievementFinger} title="You've opened more than 20 bookmarks manually!" alt="You've opened more than 20 bookmarks manually!"/>
                                    <img class='item locked' src={AchievementFolder} title="You've visited more than 20 bookmarks already!" alt="You've visited more than 20 bookmarks already!"/>
                                    <img class='item locked opacity-06' src={AchievementLazy}   title="Ahh... You've postponed more than 10 bookmarks already" alt="Ahh... You've postponed more than 10 bookmarks already"/>
                                    <img class='item locked' src={AchievementMedal}  title="You've added more than 40 bookmarks to shuffle!" alt="You've added more than 40 bookmarks to shuffle!"/>
                                    <img class='item locked opacity-06' src={AchievementSocial} title="You've shared ProcrastiLater in 2 social networks!" alt="You've shared ProcrastiLater in 2 social networks!"/>
                                    <img class='item locked opacity-05' src={AchievementReviewer} title="You've sent your review to developer!" alt="You've sent your review to developer!"/>
                                </div>
                            </div>

                            <div class='panel stats panel--gray'>
                                <div class='header'>Stats</div>
                                <div class='content'>
                                    <div class='important'>if you continue with such tempo - you 
                                    will deal with all bookmarks in <span class='value'>6 days</span></div>
                                    <div class='important'>you have <span class='value'>47%</span> of all users bookmarks</div>
                                    
                                    <div class='group'>
                                        <div class='item'>
                                            <div class='name'>bookmarks:</div>
                                            <div class='value'>120</div>
                                        </div>
                                        
                                        <div class='item'>
                                            <div class='name'>visited:</div>
                                            <div class='value'>40</div>
                                        </div>

                                        <div class='item'>
                                            <div class='name'>postponed:</div>
                                            <div class='value'>5</div>
                                        </div>

                                        <div class='item'>
                                            <div class='name'>achievements:</div>
                                            <div class='value'>1/5</div>
                                        </div>
                                    </div>

                                
                                    <div class='group'>
                                        <div class='item'>
                                            <div class='name'>total users:</div>
                                            <div class='value'>25</div>
                                        </div>

                                        <div class='item'>
                                            <div class='name'>total bookmarks:</div>
                                            <div class='value'>255</div>
                                        </div>

                                        <div class='item'>
                                            <div class='name'>average per user:</div>
                                            <div class='value'>10</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer>
                        <div class='text'>If you like Procrastilater - share it with friends! </div>
                        <div class='note'>You will get an achievement if you'll share it in 2 social networks!</div>
                        <div class='socials'>
                            <a href="https://api.addthis.com/oexchange/0.8/forward/facebook/offer?url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fscroll-it%2Fnlndoolndemidhlomaokpfbicfnjeeed&pubid=ra-42fed1e187bae420&title=&ct=1" target="_blank"><img src="https://cache.addthiscdn.com/icons/v3/thumbs/32x32/facebook.png" alt="Facebook"/></a>
                            <a href="https://api.addthis.com/oexchange/0.8/forward/telegram/offer?url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fscroll-it%2Fnlndoolndemidhlomaokpfbicfnjeeed&pubid=ra-42fed1e187bae420&title=&ct=1" target="_blank"><img src="https://cache.addthiscdn.com/icons/v3/thumbs/32x32/telegram.png" alt="Telegram"/></a>
                            <a href="https://api.addthis.com/oexchange/0.8/forward/twitter/offer?url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fscroll-it%2Fnlndoolndemidhlomaokpfbicfnjeeed&pubid=ra-42fed1e187bae420&title=&ct=1" target="_blank"><img src="https://cache.addthiscdn.com/icons/v3/thumbs/32x32/twitter.png" alt="Twitter"/></a>
                            <a href="https://api.addthis.com/oexchange/0.8/forward/vk/offer?url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fscroll-it%2Fnlndoolndemidhlomaokpfbicfnjeeed&pubid=ra-42fed1e187bae420&title=&ct=1" target="_blank"><img src="https://cache.addthiscdn.com/icons/v3/thumbs/32x32/vk.png" alt="Vkontakte"/></a>
                            <a href="https://api.addthis.com/oexchange/0.8/forward/email/offer?url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fscroll-it%2Fnlndoolndemidhlomaokpfbicfnjeeed&pubid=ra-42fed1e187bae420&title=&ct=1" target="_blank"><img src="https://cache.addthiscdn.com/icons/v3/thumbs/32x32/email.png" alt="Email"/></a>
                            <a href="https://api.addthis.com/oexchange/0.8/forward/google_plusone_share/offer?url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fscroll-it%2Fnlndoolndemidhlomaokpfbicfnjeeed&pubid=ra-42fed1e187bae420&title=&ct=1" target="_blank"><img src="https://cache.addthiscdn.com/icons/v3/thumbs/32x32/google_plusone_share.png" alt="Google+"/></a>                        
                        </div>
                    </footer>
                </div>

                <Conversation userName = {this.props.global.userName} ></Conversation>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        global: state.global
    }
}

function mapDispatchToProps(dispatch) {
    return {
        stepsActions: bindActionCreators(stepsActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainPage);