/*global $:jQuery */

import React from 'react';
import PropTypes from 'prop-types';
import ConversationIcon from '../assets/images/conversation-icon.svg';
import Check from '../assets/images/check-with-round.svg';

export default class ConversationComponent extends React.Component {
    constructor() {
        super();     
        
        // locked submit button by default
        this.state = {
            locked: true
        };

        this.onIconClick = this.onIconClick.bind(this);
        this.close = this.close.bind(this);
        this.onSendClick = this.onSendClick.bind(this);
        this.onTextChange = this.onTextChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    onSendClick(e) {
        if (e) e.preventDefault();
        this.setState({locked: true});

        this.props.sendMessage({
            'fromName':     this.refs.userName.value,
            'fromEmail':    this.refs.userEmail.value,
            'text':         this.refs.text.value,
        }, () => {
            // unlock send button
            this.setState({locked: false});

            // reset inputs
            this.refs.userEmail.value = '';
            this.refs.text.value = '';

            // show success message
            $('.success-container')
                .css('display', 'flex')
                .hide()
                .fadeIn()
                .delay(1500)
                .fadeOut();
        });
    }

    onTextChange(e) {
        if (e.target.value.length > 2) {
            this.setState({locked: false});
        } else {
            this.setState({locked: true});
        }
    }

    onKeyDown(e) {
        // send message upon ctrl+enter click
        if (e.ctrlKey && e.keyCode == 13 && !this.state.locked) {
            this.onSendClick();
        }
    }

    onIconClick() {
        // icon
        this.refs.icon.classList.add('activated');

        // container
        $(this.refs.container).fadeIn();

        // form
        this.refs.conversation.classList.add('appear');
    }

    close() {
        // icon
        this.refs.icon.classList.add('deactivated');

        // form
        this.refs.conversation.classList.remove('appear');
        this.refs.conversation.classList.add('disappear');

        // container
        $(this.refs.container).fadeOut(1000);

        setTimeout(() => {
            // icon
            this.refs.icon.classList.remove('activated');
            this.refs.icon.classList.remove('deactivated');

            // form
            this.refs.conversation.classList.remove('disappear');
        }, 1000);
    }


    render() {
        return(
            <div>
                <div class = 'conversation-icon' ref='icon' onClick = {this.onIconClick}> <img src={ConversationIcon} /> </div>
                <div class = 'conversation-container' ref='container' onClick = {this.close} >
                    <div class = 'panel conversation' ref='conversation' onClick = { (e) => e.stopPropagation() }>
                        <div class='header'> Let's talk <span class='close' onClick = {this.close}>✕</span></div>
                        
                        <div class = 'slidable'>
                            <div class='title'>We would like to know how can we improve your experience. Feel free to send us your thoughts!</div>
                            <form>
                                <label>Letter from:</label>
                                <input type='text' value={this.props.userName} disabled ref='userName'/>
            
                                <label title='Can be blank'>How can we answer you?</label>
                                <input type='email' name='email' placeholder='Email' ref='userEmail'/>
            
                                <label>What do you think, what do you suggest?</label>
                                <textarea onChange = {this.onTextChange} onKeyDown = {this.onKeyDown} name='letter' ref='text'></textarea>
            
                                <button onClick = { this.onSendClick } class= {'button-send ' + (this.state.locked ? 'locked': '') }>Send</button>
                            </form>
                        </div>

                        <div class='success-container'>
                            <div class='success-message'>
                                <img src={Check} />
                                <div class='text'>Message is sent. <br/>We will read it soon!</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ConversationComponent.propTypes = {
    userName: PropTypes.string.isRequired,
    sendMessage: PropTypes.func.isRequired
}