import React from 'react';
import PropTypes from 'prop-types';
import Alarm from '../assets/images/alarm.svg';

export default class Popup extends React.Component {
    constructor(props) {
        super(props);
        this.showPopup = this.showPopup.bind(this);
    }

    showPopup() {
        this.refs.popupContainer.classList.add('fadeIn');
        this.refs.popup.classList.add('flyIn');
    }

    render() {  
        return ( 
            <div class='popup-container' ref='popupContainer'>
                <div class='popup' ref='popup'>
                    <div class='main-content'>
                        <div class='icon'><img src={Alarm} class='alarm'/></div>
                        <div class='title'>Time has come!</div>
                        <div class='text'>The magic shuffle suggests you opening the "Как приготовить бепса в духовке" bookmark. Do you agree? </div>
                    </div>

                    <div class='buttons'>
                        <button class='accept left'>Yes, open it</button>
                        <button class='reshuffle'>No, reshuffle</button>
                        <button class='postpone right'>No, postpone</button>
                    </div>
                </div>
            </div>
        )
    }
}