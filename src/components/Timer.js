/* eslint-disable */

import React from 'react';
import API from '../api';

export default class Timer extends React.Component {

    constructor() {
        super();
        this.state = {
            willEnd: moment().add(1, 'minute'),
            output: '00:00:00'
        }

        this.interval = setInterval(this.tick.bind(this), 1000);
    }

    componentWillMount() {
        this.setState({ output: this.getOutput() });        
    }

    getOutput() {
        // difference between next bookmark time expiration and now
        let difference = moment(this.state.willEnd, "DD/MM/YYYY HH:mm:ss").diff(moment());
        let duration = moment.duration(difference);

        // add leading zero to hours if needed
        let hours = 
            Math.floor(duration.asHours()).toString().length == 1
                ? '0' + Math.floor(duration.asHours()) 
                : Math.floor(duration.asHours());
        
        return hours + moment.utc(difference).format(":mm:ss");
    }

    tick() {
        this.setState({ output: this.getOutput() });
    }

    render() {  
        return ( 
            <div class='timer'>{ this.state.output }</div>
        )
    }
}