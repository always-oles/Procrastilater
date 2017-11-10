/* global moment */

import React from 'react';
import API from '../api';
import PropTypes from 'prop-types';
import { SCHEDULE } from '../constants';

export default class Timer extends React.Component {
    constructor(props) {
        super(props);

        this.onClick    = this.onClick.bind(this);
        this.tick       = this.tick.bind(this);
        this.getOutput  = this.getOutput.bind(this);
        this.interval   = setInterval(this.tick, 1000);

        this.animationTimeout = null;
        this.state = {
            output: this.getOutput(this.props.nextPopup, this.props.scheduleFrequency == SCHEDULE.FREQUENCY.MANUAL),
            manual: this.props.scheduleFrequency == SCHEDULE.FREQUENCY.MANUAL
        }
    }

    onClick() {
        if ( !this.state.manual ) {
            // animate
            this.refs.timerContainer.classList.add('animate');

            // generate new timer
            this.props.generateTimer(true);

            // remove animation class
            clearTimeout(this.animationTimeout);
            this.animationTimeout = setTimeout(() => {
                this.refs.timerContainer.classList.remove('animate');            
            }, 1000);
        }
    }

    componentWillReceiveProps(nextProps) {
        // if user chosen manual
        if ( nextProps.scheduleFrequency == SCHEDULE.FREQUENCY.MANUAL ) {
            clearInterval(this.interval);
        } else {
            this.interval = setInterval(this.tick, 1000); 
        }

        this.tick();        
        this.setState({ manual: nextProps.scheduleFrequency == SCHEDULE.FREQUENCY.MANUAL });
    }


    getOutput(ends, manual) {

        if  ((this.state && this.state.manual) || manual ) {
            return 'timer is disabled if you\'ve chosen a manual reminder appearance';
        }

        // // difference between next bookmark time expiration and now
        let difference = moment.unix(ends).diff(moment());
        let duration = moment.duration(difference);

        // add leading zero to hours if needed
        let hours = 
            Math.floor(duration.asHours()).toString().length == 1
                ? '0' + Math.floor(duration.asHours()) 
                : Math.floor(duration.asHours());
        
        return hours + moment.utc(difference).format(':mm:ss');
        //return moment.unix(ends).format('HH:mm:ss');
    }

    tick() {
        this.setState({ output: this.getOutput(this.props.nextPopup) });
    }

    render() {  
        return ( 
            <div 
                class = { 'timer ' + (this.state.manual ? 'text' : '')} 
                title = { this.state.manual ? '' : 'Click to generate new timer'}
                onClick = { this.onClick }
                ref = 'timerContainer'
            >{ this.state.output }</div>
        )
    }
}

Timer.propTypes = {
    nextPopupTime: PropTypes.number,
    generateTimer: PropTypes.func.isRequired,
    scheduleFrequency: PropTypes.string.isRequired
}