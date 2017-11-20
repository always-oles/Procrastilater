import { setHourFormat } from '../actions/GlobalActions';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as globalActions from '../actions/GlobalActions';

// Widgets
import Timer from './Timer';
import ConversationComponent from './ConversationComponent';
import FolderSelectionComponent from './FolderSelectionComponent';
import ScheduleComponent from './ScheduleComponent';
import AchievementsComponent from './AchievementsComponent';
import StatsComponent from './StatsComponent';
import ProgressComponent from './ProgressComponent';
import ShareComponent from './ShareComponent';
import HelpComponent from './HelpComponent';

// SVG images
import Logo from '../assets/images/logo.svg';

class MainPage extends React.Component {
    constructor() {
        super();
        this.animate = this.animate.bind(this);
    }

    componentDidMount() {
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
                        <div class='col-sm-4 greeting'>{chrome.i18n.getMessage('main_hello')}, {this.props.global.userName} <HelpComponent/> </div>
                        <div class='col-sm-4 timer-container'>
                            <div class='title'>{chrome.i18n.getMessage('main_next_bookmark_appear')}:</div>
                            <Timer 
                                nextPopup           = {this.props.popups.nextPopupTime}
                                generateTimer       = {this.props.globalActions.generateTimer}
                                scheduleFrequency   = {this.props.global.scheduleFrequency}
                                createPopup         = {this.props.globalActions.createPopup}
                            ></Timer>
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
                                foldersIds   = { this.props.global.foldersIds }
                                saveFolders  = { this.props.globalActions.saveFolders }
                                emptyFolders = { this.props.stats.bookmarksCount == 0 }
                            />
                        </div>

                        <div class='col-sm-4'>
                            <ScheduleComponent 
                                ref                 = 'scheduleComponent'
                                scheduleFrequency   = { this.props.global.scheduleFrequency }
                                schedulePeriod      = { this.props.global.schedulePeriod }
                                scheduleTimes       = { this.props.global.scheduleTimes }
                                setSchedule         = { this.props.globalActions.setSchedule }
                                hourFormat          = { this.props.global.hourFormat}
                            />
                        </div>

                        <div class='col-sm-4'>
                            <StatsComponent 
                                visitedIds   = { this.props.global.visitedIds }
                                stats        = { this.props.stats }
                                global       = { this.props.global }
                                achievements = { this.props.achievements }
                            />
                            <AchievementsComponent 
                                achievements             = { this.props.achievements }
                                resetReceivedAchievement = { this.props.globalActions.resetReceivedAchievement }
                                justReceived             = { this.props.global.justReceived }
                                checkAchievementsCaller  = { this.props.globalActions.checkAchievementsCaller }
                            />
                        </div>
                    </div>

                    <footer>
                        <div class='text'>{chrome.i18n.getMessage('main_if_u_like')}</div>
                        <div class='note'>
                            {chrome.i18n.getMessage('main_you_will_get')}<br/>
                            {chrome.i18n.getMessage('main_itsa')} <a href='https://github.com/always-oles/Procrastilater' target='_blank'>{chrome.i18n.getMessage('main_free_open_source')}</a>.
                        </div>
                        <ShareComponent
                            sharedInSocial = { this.props.globalActions.sharedInSocial }
                        />
                    </footer>
                </div>

                <ConversationComponent 
                    userName    = {this.props.global.userName}
                    sendMessage = {this.props.globalActions.sendMessage}
                />
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
        globalActions: bindActionCreators(globalActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainPage);