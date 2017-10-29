import React from 'react';
import PropTypes from 'prop-types';
import { SCHEDULE } from '../constants';
import Check from '../assets/images/check.svg';

export default class Steps extends React.Component {
    constructor() {
        super();
        this.onNextClick = this.onNextClick.bind(this);
        this.onPreviousClick = this.onPreviousClick.bind(this);
        this.onFrequencyChange = this.onFrequencyChange.bind(this);
        this.onPeriodChange = this.onPeriodChange.bind(this);
        this.onTimesChange = this.onTimesChange.bind(this);

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
        // check if user checked few times and didnt enter amount
        if ( this.state.frequency === SCHEDULE.FREQUENCY.FEW_TIMES && this.state.times === null ) {
            return toastr.error('Please enter how many times a day you want PL to remind you about bookmarks');
        }

        // save schedule
        this.props.setSchedule(this.state);

        // add completed animation
        this.nextStep();
    }

    componentWillReceiveProps(nextProps) {
        this.handleStepChange(nextProps);
    }

    onFrequencyChange(e) {
        this.setState({ frequency : e.target.id });
    }

    onPeriodChange(e) {
        this.setState({ period : e.target.id });
    }

    onTimesChange(e) {
        this.setState({ times : e.target.value });
    }

    render() {
        return (
            <div class='step step-3 schedule' ref='step3' style={{display: this.props.step == 3 ? 'block' : 'none' }}>
                <form>
                    <div class='header'>Schedule</div>
                
                    <div class='list'>
                        <div class='title'>Reminder will appear:</div>
    
                        <input type='radio' checked={ this.state.frequency == SCHEDULE.FREQUENCY.MANUAL } onChange={this.onFrequencyChange} name='schedule' id={ SCHEDULE.FREQUENCY.MANUAL }/>
                        <label for={ SCHEDULE.FREQUENCY.MANUAL } >I will open bookmarks manually</label><br/>
    
                        <input type='radio' checked={ this.state.frequency == SCHEDULE.FREQUENCY.FEW_TIMES } onChange={this.onFrequencyChange} name='schedule' id={ SCHEDULE.FREQUENCY.FEW_TIMES } /> 
                        <input type='text' onChange={ this.onTimesChange } class='blue-input' placeholder='N' name='times' maxLength='2' /> 
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

                <div class='buttons-container'>
                    <button class='button-back' onClick = { this.onPreviousClick }>Back</button>
                    <button class='button-save' onClick = { this.onNextClick }>Done</button>
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
    setSchedule: PropTypes.func.isRequired
}