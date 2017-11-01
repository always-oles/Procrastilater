/*global $:jQuery */

import React from 'react';
import PropTypes from 'prop-types';
import ConversationIcon from '../assets/images/conversation-icon.svg';

export default class Conversation extends React.Component {
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
        this.refs.container.classList.add('fadeIn');

        // form
        this.refs.conversation.classList.add('appear');
    }

    close() {
        // icon
        this.refs.icon.classList.add('deactivated');

        // container (half visible white)
        this.refs.container.classList.remove('fadeIn');
        this.refs.container.classList.add('fadeOut');

        // form
        this.refs.conversation.classList.remove('appear');
        this.refs.conversation.classList.add('disappear');

        setTimeout(() => {
            // icon
            this.refs.icon.classList.remove('activated');
            this.refs.icon.classList.remove('deactivated');

            // container
            this.refs.container.classList.add('hidden');
            this.refs.container.classList.remove('fadeOut');

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
                <div class='title'>Send us your thoughts about this app and how can we improve it</div>
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

Conversation.propTypes = {
    userName: PropTypes.string.isRequired
}