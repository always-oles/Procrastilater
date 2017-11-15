import React from 'react';
import HelpButton from '../assets/images/help-button.svg';

export default class HelpComponent extends React.Component {
    constructor() {
        super();     
        this.onClick     = this.onClick.bind(this);
        this.close       = this.close.bind(this);
        this.videoSource = 'https://www.youtube.com/embed/NLmqqimN_6M?rel=0' + '&enablejsapi=1';
        this.state       = { loaded: false }
    }

    onClick() {
        // load upon demand
        if (!this.state.loaded) {
            $('#yt-iframe').attr('src', this.videoSource);       
            this.setState({ loaded: true });     
        }

        $('.help-container')
            .css('display', 'flex')
            .hide()
            .fadeIn();
    }

    close(e) {
        e.preventDefault();
        $('.help-container').fadeOut();
        $('#yt-iframe').get(0).contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
    }

    render() {
        return(
            <div class='inline-block'>
                <img class='help-button' src={HelpButton} onClick = { this.onClick } />
                <div class='help-container'>
                    <div class='video-container'>
                        <iframe width="560" height="315" id="yt-iframe" src="" frameBorder="0" allowFullScreen></iframe>
                        <a href='#' class='close-button' onClick = { this.close }>✕</a>
                    </div>
                </div>
            </div>
        );
    }
}