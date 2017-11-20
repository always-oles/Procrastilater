import React from 'react';
import PropTypes from 'prop-types';
import { SCHEDULE } from '../constants';
import Check from '../assets/images/check.svg';
import API from '../api';

export default class Steps extends React.Component {
    constructor() {
        super();
        this.onNextClick        = this.onNextClick.bind(this);
        this.onPreviousClick    = this.onPreviousClick.bind(this);
        this.onFrequencyChange  = this.onFrequencyChange.bind(this);
        this.onPeriodChange     = this.onPeriodChange.bind(this);
        this.onTimesChange      = this.onTimesChange.bind(this);
        this.onInputClick       = this.onInputClick.bind(this);

        this.state = {
            frequency: SCHEDULE.FREQUENCY.MANUAL,
            period: SCHEDULE.PERIOD.RANDOM,
            times: null
        }
    }

    componentDidMount() {
        this.stepId = 3;        
        this.container = this.refs.step3;
        this.nextStep = this.props.nextStep.bind(this);
        this.previousStep = this.props.previousStep.bind(this);
        this.handleStepChange = this.props.handleStepChange.bind(this);
    }

    onPreviousClick() {
        this.previousStep();
    }

    onNextClick() {
        // save schedule
        this.props.setSchedule(this.state);

        // add completed animation
        this.nextStep();
    }

    componentWillReceiveProps(nextProps) {
        this.handleStepChange(nextProps);
    }

    onFrequencyChange(e) {
        if (e.target.id == SCHEDULE.FREQUENCY.FEW_TIMES && !this.state.times) {
            this.setState({ 
                frequency : e.target.id,
                times: 1
             });
        } else {
            this.setState({ 
                frequency : e.target.id
             });
        }
    }

    onPeriodChange(e) {
        this.setState({ period : e.target.id });
    }

    onTimesChange(e) {
        this.setState({ times : +e.target.value });
    }

    // make radio checked unpon input click
    onInputClick() {
        this.setState({ frequency : SCHEDULE.FREQUENCY.FEW_TIMES });
    }

    onFormatClick(e, format) {
        e.preventDefault();
        this.props.setHourFormat(format);
    }

    pluralizeTimes() {
        let number  = this.state.times || 0,
            one     = chrome.i18n.getMessage('schedule_times_1'),
            two     = chrome.i18n.getMessage('schedule_times_2'),
            five    = chrome.i18n.getMessage('schedule_times_5');
            
        return API.pluralize(number, one, two, five);
    }

    render() {
        return (
            <div class='step step-3 schedule' ref='step3' style={{display: this.props.step == 3 ? 'block' : 'none' }}>
                <form>
                    <div class='header'>{chrome.i18n.getMessage('steps_title_3')}</div>
                
                    <div class='list'>
                        <div class='title'>{chrome.i18n.getMessage('schedule_reminder_will_appear')}:</div>
    
                        <input type='radio' checked={ this.state.frequency == SCHEDULE.FREQUENCY.MANUAL } onChange={this.onFrequencyChange} name='schedule' id={ SCHEDULE.FREQUENCY.MANUAL }/>
                        <label for={ SCHEDULE.FREQUENCY.MANUAL } >{chrome.i18n.getMessage('schedule_manually')}</label><br/>
    
                        <input type='radio' checked={ this.state.frequency == SCHEDULE.FREQUENCY.FEW_TIMES } onChange={this.onFrequencyChange} name='schedule' id={ SCHEDULE.FREQUENCY.FEW_TIMES } /> 
                        <input type='text'  onClick={this.onInputClick} onChange={ this.onTimesChange } class='blue-input' placeholder='N' value={this.state.times || ''} name='times' maxLength='2' /> 
                        <label for={ SCHEDULE.FREQUENCY.FEW_TIMES } > {this.pluralizeTimes()} </label><br/>
    
                        <input type='radio' checked={ this.state.frequency == SCHEDULE.FREQUENCY.EVERY_DAY } onChange={this.onFrequencyChange} name='schedule' id={ SCHEDULE.FREQUENCY.EVERY_DAY }/> 
                        <label for={ SCHEDULE.FREQUENCY.EVERY_DAY } >{chrome.i18n.getMessage('schedule_every_day')}</label><br/>
    
                        <input type='radio' checked={ this.state.frequency == SCHEDULE.FREQUENCY.EVERY_2_DAYS } onChange={this.onFrequencyChange} name='schedule' id={ SCHEDULE.FREQUENCY.EVERY_2_DAYS }/> 
                        <label for={ SCHEDULE.FREQUENCY.EVERY_2_DAYS } >{chrome.i18n.getMessage('schedule_every_2_days')}</label>
                    </div>
    
                    <div class='list'>
                        <div class='title'> {chrome.i18n.getMessage('schedule_period')}: </div>

                        <input type='radio' checked={ this.state.period == SCHEDULE.PERIOD.RANDOM } onChange={this.onPeriodChange} name='period' id={ SCHEDULE.PERIOD.RANDOM } /> 
                        <label for={ SCHEDULE.PERIOD.RANDOM } >{chrome.i18n.getMessage('schedule_random')}</label><br/>
    
                        <div class='format'>
                            <label class='format-label'>{chrome.i18n.getMessage('schedule_format')}:</label>
                            <div class='format-buttons'>
                                <a href='#' class={this.props.hourFormat == 24 ? 'active':''} onClick={(e) => this.onFormatClick(e,24)}>24</a>
                                <a href='#' class={this.props.hourFormat == 12 ? 'active':''} onClick={(e) => this.onFormatClick(e,12)}>12</a>
                            </div>
                        </div><br/>

                        <input type='radio' checked={ this.state.period == SCHEDULE.PERIOD.MORNING } onChange={this.onPeriodChange} name='period' id={ SCHEDULE.PERIOD.MORNING } /> 
                        <label for={ SCHEDULE.PERIOD.MORNING } >
                            {chrome.i18n.getMessage('schedule_morning_'+this.props.hourFormat)}
                        </label><br/>
    
                        <input type='radio' checked={ this.state.period == SCHEDULE.PERIOD.NOON } onChange={this.onPeriodChange} name='period' id={ SCHEDULE.PERIOD.NOON } />  
                        <label for={ SCHEDULE.PERIOD.NOON } >
                            {chrome.i18n.getMessage('schedule_noon_'+this.props.hourFormat)}
                        </label><br/>
    
                        <input type='radio' checked={ this.state.period == SCHEDULE.PERIOD.EVENING } onChange={this.onPeriodChange} name='period' id={ SCHEDULE.PERIOD.EVENING } />
                        <label for={ SCHEDULE.PERIOD.EVENING } >
                            {chrome.i18n.getMessage('schedule_evening_'+this.props.hourFormat)}
                        </label>
                    </div>
                </form>

                <div class='buttons-container'>
                    <button class='button-back' onClick = { this.onPreviousClick }>
                        {chrome.i18n.getMessage('global_back')}
                    </button>
                    <button class='button-save' onClick = { this.onNextClick }>
                        {chrome.i18n.getMessage('global_done')}
                    </button>
                </div>

                <div class='check'><img src={ Check }/></div>                                
            </div>
        )
    }
}

Steps.propTypes = {
    step: PropTypes.number.isRequired,
    stepPhase: PropTypes.string.isRequired,
    nextStep: PropTypes.func.isRequired,
    previousStep: PropTypes.func.isRequired,
    handleStepChange: PropTypes.func.isRequired,
    setSchedule: PropTypes.func.isRequired,
    setHourFormat: PropTypes.func.isRequired,
    hourFormat: PropTypes.number.isRequired
}