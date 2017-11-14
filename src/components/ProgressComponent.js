import React from 'react';
import PropTypes from 'prop-types';


export default class ProgressComponent extends React.Component {
    constructor() {
        super();
        this.calculate = this.calculate.bind(this);
    }

    calculate() {
        return Math.round(this.props.global.visitedIds.length * 100 / this.props.stats.bookmarksCount) || 0;
    }

    render() {
        return (
            <div class='progress-container'>
                <div class='title'>Your overall progress:</div>
                <div class= {'progress-bar-full ' + (this.calculate() == 1 ? 'onepercent' : '')} title='Your progress bar'>
                    <div class='bar' style={{ width: this.calculate() + '%' }}></div>
                    <div class='text'>{ this.calculate() }%</div>
                </div>
                <div class='note'>You’ve dealt with { this.props.global.visitedIds.length }/{ this.props.stats.bookmarksCount } postponed bookmarks!</div>
            </div>
        );
    }
}

ProgressComponent.propTypes = {
    global: PropTypes.object.isRequired,
    stats: PropTypes.object.isRequired
}