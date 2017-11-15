import React from 'react';
import PropTypes from 'prop-types';


export default class ProgressComponent extends React.Component {
    constructor() {
        super();
        this.calculate  = this.calculate.bind(this);
        this.getNote    = this.getNote.bind(this);
    }

    calculate() {
        return Math.round(this.props.global.visitedIds.length * 100 / this.props.stats.bookmarksCount) || 0;
    }

    getNote() {
        if (this.props.stats.bookmarksCount > 0) {
            return (
                <div class='note'>
                    You’ve dealt with { this.props.global.visitedIds.length }/{ this.props.stats.bookmarksCount } postponed bookmarks!
                </div>
            );
        } else {
            return (
                <div class='note'>You have no bookmarks in selected folders yet</div>
            );
        }
    }

    render() {
        return (
            <div class='progress-container'>
                <div class='title'>Your overall progress:</div>
                <div class= {'progress-bar-full ' + (this.calculate() == 1 ? 'onepercent' : '')} title='Your progress bar'>
                    <div class='bar' style={{ width: this.calculate() + '%' }}></div>
                    <div class='text'>{ this.calculate() }%</div>
                </div>
                { this.getNote() }
            </div>
        );
    }
}

ProgressComponent.propTypes = {
    global: PropTypes.object.isRequired,
    stats: PropTypes.object.isRequired
}