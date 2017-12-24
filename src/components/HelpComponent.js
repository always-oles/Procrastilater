import React from 'react';
import HelpButton from '../assets/images/help-button.svg';
import { YT_EN_LINK, YT_RU_LINK } from '../constants';
import API from '../api';

export default class HelpComponent extends React.Component {
    constructor() {
        super();     
        this.onClick     = this.onClick.bind(this);
        this.close       = this.close.bind(this);
        this.state       = { loaded: false }
        this.language    = API.getBrowserLanguage();
    }

    getVideoByLang() {
        if (this.language == 'ru' || this.language == 'uk') {
            return YT_RU_LINK;
        } else {
            return YT_EN_LINK;
        }
    }

    onClick() {
        // load upon demand
        if (!this.state.loaded) {
            $('#yt-iframe').attr('src', this.getVideoByLang());       
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
                        <iframe width="560" id="yt-iframe"  height="315" src="" frameBorder="0" allowFullScreen></iframe>
                        <a
                            href='#' 
                            class='close-button' 
                            title={chrome.i18n.getMessage('global_close')} 
                            onClick = { this.close }
                        >✕</a>
                    </div>
                </div>
            </div>
        );
    }
}