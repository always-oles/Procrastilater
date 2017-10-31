/* eslint-disable */

import React from 'react';
import API from '../api';
import PropTypes from 'prop-types';

export default class Timer extends React.Component {
    componentWillMount() {    
        this.interval = setInterval(this.tick.bind(this), 1000); 
        this.state = {
            output: this.getOutput(this.props.nextPopup)
        }
    }

    getOutput(ends) {
        // difference between next bookmark time expiration and now
        let difference = moment(ends).diff(moment());
        let duration = moment.duration(difference);

        // add leading zero to hours if needed
        let hours = 
            Math.floor(duration.asHours()).toString().length == 1
                ? '0' + Math.floor(duration.asHours()) 
                : Math.floor(duration.asHours());
        
        return hours + moment.utc(difference).format(":mm:ss");
    }

    tick() {
        this.setState({ output: this.getOutput(this.props.nextPopup) });
    }

    render() {  
        return ( 
            <div class='timer'>{ this.state.output }</div>
        )
    }
}

Timer.propTypes = {
    nextPopup: PropTypes.number.isRequired
}