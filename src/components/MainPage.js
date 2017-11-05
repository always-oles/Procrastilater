import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as stepsActions from '../actions/StepsActions';

// Widgets
import Timer from './Timer';
import ConversationComponent from './ConversationComponent';
import FolderSelectionComponent from './FolderSelectionComponent';
import ScheduleComponent from './ScheduleComponent';
import AchievementsComponent from './AchievementsComponent';
import StatsComponent from './StatsComponent';
import ProgressComponent from './ProgressComponent';

// SVG images
import Logo from '../assets/images/logo.svg';
import HelpButton from '../assets/images/help-button.svg';

class MainPage extends React.Component {
    constructor() {
        super();
        this.animate = this.animate.bind(this);
    }

    componentDidMount(){
        // scenario: if user switched to main page from steps - need to animate is true
        if (this.props.needToAnimate) {
            this.animate();
        }

        console.log(this.props);
    }

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
                            <Timer nextPopup = {this.props.stats.nextPopup}></Timer>
                        </div>
                        <div class='col-sm-4'>
                            <ProgressComponent
                                global = { this.props.global }
                                stats  = { this.props.stats }
                            />
                        </div>
                    </div>
                </header>

                <div class='body'>
                    <div class='col-sm-12'>
                        <div class='col-sm-4'>
                            <FolderSelectionComponent
                                foldersIds  = { this.props.global.foldersIds }
                                saveFolders = { this.props.stepsActions.saveFolders }
                            />
                        </div>

                        <div class='col-sm-4'>
                            <ScheduleComponent 
                                ref                 = 'scheduleComponent'
                                scheduleFrequency   = { this.props.global.scheduleFrequency }
                                schedulePeriod      = { this.props.global.schedulePeriod }
                                scheduleTimes       = { this.props.global.scheduleTimes }
                                setSchedule         = { this.props.stepsActions.setSchedule }
                            />
                        </div>

                        <div class='col-sm-4'>
                            <AchievementsComponent achievements = { this.props.achievements } />
                            <StatsComponent 
                                stats = { this.props.stats }
                                global = { this.props.global }
                                achievements = { this.props.achievements }
                            />
                        </div>
                    </div>

                    <footer>
                        <div class='text'>If you like Procrastilater - share it with friends! </div>
                        <div class='note'>You will get an achievement if you'll share it at least in 2 social networks!<br/>
                            It is a <a href='https://github.com/always-oles/Procrastilater' target='_blank'>free open source</a> project.
                        </div>
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

                <ConversationComponent userName = {this.props.global.userName} />
            </div>
        )
    }   
}

function mapStateToProps(state) {
    return {
        global:         state.global,
        stats:          state.stats,
        achievements:   state.achievements,
        popups:         state.popups
    }
}

function mapDispatchToProps(dispatch) {
    return {
        stepsActions: bindActionCreators(stepsActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainPage);