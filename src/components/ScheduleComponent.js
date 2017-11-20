/* global toastr */

import React from 'react';
import PropTypes from 'prop-types';
import { 
    SCHEDULE,
    MAX_BOOKMARKS_DAILY
} from '../constants';

export default class ScheduleComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            frequency: this.props.scheduleFrequency,
            period: this.props.schedulePeriod,
            times: this.props.scheduleTimes,
            changed: false
        }

        this.onFrequencyChange = this.onFrequencyChange.bind(this);
        this.onPeriodChange = this.onPeriodChange.bind(this);
        this.onTimesChange = this.onTimesChange.bind(this);
        this.save = this.save.bind(this);
        this.notifyTimeout = null;
    }

    save() {
        toastr.remove();
        clearTimeout(this.notifyTimeout);
        
        // debounce notification
        this.notifyTimeout = setTimeout(() => {
            this.props.setSchedule(this.state);

            toastr.success(chrome.i18n.getMessage('schedule_saved'), null, {
                positionClass: 'toast-bottom-left'
            });
        }, 500);
    }

    onFrequencyChange(e) {
        // if user selected few times a day and didnt enter how many times
        // set to 1 by default
        if (e.target.id == SCHEDULE.FREQUENCY.FEW_TIMES && !this.state.times) {
            this.setState({ 
                frequency : e.target.id,
                times: 1
             }, () => this.save());
        } else {
            this.setState({ 
                frequency : e.target.id
             }, () => this.save());
        }
    }

    onPeriodChange(e) {
        this.setState({
            period : e.target.id
        }, () => this.save());
    }

    onTimesChange(e) {
        this.setState({ 
            times : +e.target.value
        }, () => this.save());
    }

    render() {
        return (
            <div class='panel schedule' ref='container'>
                <div class='header'>{chrome.i18n.getMessage('steps_title_3')}</div>
                <form>
                    <div class='list'>
                        <div class='title'>{chrome.i18n.getMessage('schedule_reminder_will_appear')}:</div>

                        <input type='radio' checked={ this.state.frequency == SCHEDULE.FREQUENCY.MANUAL } onChange={this.onFrequencyChange} name='schedule' id={ SCHEDULE.FREQUENCY.MANUAL }/>
                        <label for={ SCHEDULE.FREQUENCY.MANUAL } >{chrome.i18n.getMessage('schedule_manually')}</label><br/>

                        <input type='radio' checked={ this.state.frequency == SCHEDULE.FREQUENCY.FEW_TIMES } onChange={this.onFrequencyChange} name='schedule' id={ SCHEDULE.FREQUENCY.FEW_TIMES } /> 
                        <input type='text'  onChange={ this.onTimesChange } class='blue-input' title={chrome.i18n.getMessage('schedule_max_value') + ' ' + MAX_BOOKMARKS_DAILY} placeholder='N' value={this.state.times || ''} name='times' maxLength='2' /> 
                        <label for={ SCHEDULE.FREQUENCY.FEW_TIMES } >{chrome.i18n.getMessage('schedule_times')}</label><br/>

                        <input type='radio' checked={ this.state.frequency == SCHEDULE.FREQUENCY.EVERY_DAY } onChange={this.onFrequencyChange} name='schedule' id={ SCHEDULE.FREQUENCY.EVERY_DAY }/> 
                        <label for={ SCHEDULE.FREQUENCY.EVERY_DAY } >{chrome.i18n.getMessage('schedule_every_day')}</label><br/>

                        <input type='radio' checked={ this.state.frequency == SCHEDULE.FREQUENCY.EVERY_2_DAYS } onChange={this.onFrequencyChange} name='schedule' id={ SCHEDULE.FREQUENCY.EVERY_2_DAYS }/> 
                        <label for={ SCHEDULE.FREQUENCY.EVERY_2_DAYS } >{chrome.i18n.getMessage('schedule_every_2_days')}</label>
                    </div>

                    <div class='list'>
                        <div class='title'>{chrome.i18n.getMessage('schedule_period')}:</div>
                        <input type='radio' checked={ this.state.period == SCHEDULE.PERIOD.RANDOM } onChange={this.onPeriodChange} name='period' id={ SCHEDULE.PERIOD.RANDOM } /> 
                        <label for={ SCHEDULE.PERIOD.RANDOM } >{chrome.i18n.getMessage('schedule_random')}</label><br/>

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
            </div>
        )
    }
}

ScheduleComponent.propTypes = {
    scheduleFrequency: PropTypes.string,
    schedulePeriod: PropTypes.string,
    scheduleTimes: PropTypes.number,
    setSchedule: PropTypes.func.isRequired,
    hourFormat: PropTypes.number.isRequired
}