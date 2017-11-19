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
            // user is done with all bookmarks
            if (this.props.global.visitedIds.length == this.props.stats.bookmarksCount) {
                return (
                    <div class='note'>
                        {chrome.i18n.getMessage('progress_done')}
                    </div>
                );
            } 
            // user has work to do
            else {
                return (
                    <div class='note'>
                        {chrome.i18n.getMessage('progress_youve_dealt')} { this.props.global.visitedIds.length }/{ this.props.stats.bookmarksCount } {chrome.i18n.getMessage('progress_postponed_bookmarks')}!
                    </div>
                );
            }
        } else {
            return (
                <div class='note'>
                    {chrome.i18n.getMessage('progress_no_bookmarks')}
                </div>
            );
        }
    }

    render() {
        return (
            <div class='progress-container'>
                <div class='title'>{chrome.i18n.getMessage('progress_overall_progress')}:</div>
                <div 
                    class={'progress-bar-full ' + (this.calculate() == 1 ? 'onepercent' : '')} 
                    title={chrome.i18n.getMessage('progress_your_progressbar')}
                >
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