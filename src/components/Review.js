/*global $:jQuery */

import React from 'react';
import PropTypes from 'prop-types';

export default class Review extends React.Component {
    constructor() {
        super();

        this.state = {
            collapsed: true
        }
        
        this.header = this.header.bind(this);
        this.body = this.body.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    // Show / hide review component body and Yes I'm using jQuery here, ama sinner boi
    toggle() {
        if ( this.state.collapsed ) {
            $('html, body').stop().animate({ scrollTop: $('.panel.review').offset().top - 20 }, 800);
        }

        $('#slidable-review-container').slideToggle();
        this.setState({ collapsed : !this.state.collapsed });
    }

    header() {
        return <div class='header' onClick = {this.toggle}> { this.state.collapsed ? 'Click here to send a review' : 'My review' } </div>;
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
            <div class = {'panel review clickable ' + (this.state.collapsed ? 'collapsed' : '') }>
                < this.header />
                < this.body />
            </div>
        );
    }
}

Review.propTypes = {
    userName: PropTypes.string.isRequired
}