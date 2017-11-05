/*global $:jQuery */

import React from 'react';
import PropTypes from 'prop-types';
import ConversationIcon from '../assets/images/conversation-icon.svg';

export default class ConversationComponent extends React.Component {
    constructor() {
        super();       
        this.header = this.header.bind(this);
        this.body = this.body.bind(this);
        this.onIconClick = this.onIconClick.bind(this);
        this.close = this.close.bind(this);
    }

    onIconClick() {
        // icon
        this.refs.icon.classList.add('activated');

        // container
        this.refs.container.classList.remove('hidden');

        // form
        this.refs.conversation.classList.add('appear');

        $('.body, header').addClass('blurred');
    }

    close() {
        $('.body, header').removeClass('blurred').addClass('deblurred');

        // icon
        this.refs.icon.classList.add('deactivated');

        // form
        this.refs.conversation.classList.remove('appear');
        this.refs.conversation.classList.add('disappear');

        setTimeout(() => {
            $('.body, header').removeClass('deblurred');

            // icon
            this.refs.icon.classList.remove('activated');
            this.refs.icon.classList.remove('deactivated');

            // container
            this.refs.container.classList.add('hidden');

            // form
            this.refs.conversation.classList.remove('disappear');
        }, 1000);
    }

    header() {
        return <div class='header'> Let's talk <span class='close' onClick = {this.close}>✕</span></div>;
    }

    prevent(e) {
        e.stopPropagation();
    }

    body() {
        return (
            <div class = 'slidable' id = 'slidable-review-container'>
                <div class='title'>We would like to hear how can we improve your experience. Feel free to send us your thoughts!</div>
                <form>
                    <label>Letter from:</label>
                    <input type='text' value={this.props.userName} disabled/>

                    <label>How can we answer you?</label>
                    <input type='email' name='email' placeholder='Email' />

                    <label>What do you think, what you suggest?</label>
                    <textarea name='letter'></textarea>

                    <button class='button-send'>Send</button>
                </form>
            </div>
        );
    }

    render() {
        return(
            <div>
                <div class = 'conversation-icon' ref='icon' onClick = {this.onIconClick}> <img src={ConversationIcon} /> </div>
                <div class = 'conversation-container hidden' ref='container' onClick = {this.close} >
                    <div class = 'panel review' ref='conversation' onClick = {this.prevent}>
                        < this.header />
                        < this.body />
                    </div>
                </div>
            </div>
        );
    }
}

ConversationComponent.propTypes = {
    userName: PropTypes.string.isRequired
}