/* global toastr */

import React from 'react';
import PropTypes from 'prop-types';
import { SCHEDULE } from '../constants';

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

            toastr.success('Saved new schedule', null, {
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
                <div class='header'>Schedule</div>
                <form>
                    <div class='list'>
                        <div class='title'>Reminder will appear:</div>

                        <input type='radio' checked={ this.state.frequency == SCHEDULE.FREQUENCY.MANUAL } onChange={this.onFrequencyChange} name='schedule' id={ SCHEDULE.FREQUENCY.MANUAL }/>
                        <label for={ SCHEDULE.FREQUENCY.MANUAL } >I will open bookmarks manually</label><br/>

                        <input type='radio' checked={ this.state.frequency == SCHEDULE.FREQUENCY.FEW_TIMES } onChange={this.onFrequencyChange} name='schedule' id={ SCHEDULE.FREQUENCY.FEW_TIMES } /> 
                        <input type='text' onChange={ this.onTimesChange } class='blue-input' title='Max value is 10' placeholder='N' value={this.state.times || ''} name='times' maxLength='2' /> 
                        <label for={ SCHEDULE.FREQUENCY.FEW_TIMES } >times a day</label><br/>

                        <input type='radio' checked={ this.state.frequency == SCHEDULE.FREQUENCY.EVERY_DAY } onChange={this.onFrequencyChange} name='schedule' id={ SCHEDULE.FREQUENCY.EVERY_DAY }/> 
                        <label for={ SCHEDULE.FREQUENCY.EVERY_DAY } >every day</label><br/>

                        <input type='radio' checked={ this.state.frequency == SCHEDULE.FREQUENCY.EVERY_2_DAYS } onChange={this.onFrequencyChange} name='schedule' id={ SCHEDULE.FREQUENCY.EVERY_2_DAYS }/> 
                        <label for={ SCHEDULE.FREQUENCY.EVERY_2_DAYS } >every 2 days</label>
                    </div>

                    <div class='list'>
                        <div class='title'>Period:</div>
                        <input type='radio' checked={ this.state.period == SCHEDULE.PERIOD.RANDOM } onChange={this.onPeriodChange} name='period' id={ SCHEDULE.PERIOD.RANDOM } /> 
                        <label for={ SCHEDULE.PERIOD.RANDOM } >totally random</label><br/>

                        <input type='radio' checked={ this.state.period == SCHEDULE.PERIOD.MORNING } onChange={this.onPeriodChange} name='period' id={ SCHEDULE.PERIOD.MORNING } /> 
                        <label for={ SCHEDULE.PERIOD.MORNING } >6:00 - 12:00</label><br/>

                        <input type='radio' checked={ this.state.period == SCHEDULE.PERIOD.NOON } onChange={this.onPeriodChange} name='period' id={ SCHEDULE.PERIOD.NOON } />  
                        <label for={ SCHEDULE.PERIOD.NOON } >12:00 - 18:00</label><br/>

                        <input type='radio' checked={ this.state.period == SCHEDULE.PERIOD.EVENING } onChange={this.onPeriodChange} name='period' id={ SCHEDULE.PERIOD.EVENING } />
                        <label for={ SCHEDULE.PERIOD.EVENING } >18:00 - 0:00</label>
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
    setSchedule: PropTypes.func.isRequired
}

/**
 *                 <div class='buttons-container'>
                    <button class={'button-save ' + (this.state.changed ? '' : 'locked')} onClick = { this.onSaveClick }>Save</button>
                </div>

                <div class='check'><img src={ Check }/></div>   
 */