import React from 'react';
import PropTypes from 'prop-types';
import { SHARE_LINK } from '../constants';

export default class ShareComponent extends React.Component {
    constructor() {
        super();

        this.state = {
            canShare: true
        };

        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        if (!this.state.canShare) return;

        // prevent multiple clicking
        setTimeout(() => this.props.sharedInSocial(), 1000);
        this.setState({ canShare: false });

        // can share after 5 seconds passed
        setTimeout(() => {
            this.setState({
                canShare: true
            });
        }, 5000);
    }

    render() {
        return (
            <div class='socials'>
                <a  onClick = {this.onClick} 
                    href={'https://www.addtoany.com/add_to/facebook?linkurl=' + SHARE_LINK} 
                    target='_blank'>
                    <img 
                        src='https://static.addtoany.com/buttons/facebook.svg' 
                        width='32' 
                        height='32'
                    />
                </a>
                <a  onClick = {this.onClick} 
                    href={'https://www.addtoany.com/add_to/twitter?linkurl=' + SHARE_LINK} 
                    target='_blank'>
                    <img src='https://static.addtoany.com/buttons/twitter.svg' width='32' height='32'/>
                </a>
                <a  onClick = {this.onClick} 
                    href={'https://www.addtoany.com/add_to/google_plus?linkurl=' + SHARE_LINK} 
                    target='_blank'>
                    <img src='https://static.addtoany.com/buttons/google_plus.svg' width='32' height='32'/>
                </a>
                <a  onClick = {this.onClick} 
                    href={'https://www.addtoany.com/add_to/telegram?linkurl=' + SHARE_LINK} 
                    target='_blank'>
                    <img src='https://static.addtoany.com/buttons/telegram.svg' width='32' height='32'/>
                </a>
                <a  onClick = {this.onClick} 
                    href={'https://www.addtoany.com/add_to/vk?linkurl=' + SHARE_LINK} 
                    target='_blank'>
                    <img src='https://static.addtoany.com/buttons/vk.svg' width='32' height='32'/>
                </a>
                <a  onClick = {this.onClick} 
                    href={'https://www.addtoany.com/add_to/email?linkurl=' + SHARE_LINK} 
                    target='_blank'>
                    <img src='https://static.addtoany.com/buttons/email.svg' width='32' height='32'/>
                </a>
                <a  href={'https://www.addtoany.com/add_to/copy_link?linkurl=' + SHARE_LINK} 
                    target='_blank'>
                    <img src='https://static.addtoany.com/buttons/link.svg' width='32' height='32'/>
                </a>
            </div>
        );
    }
}

ShareComponent.propTypes = {
    sharedInSocial: PropTypes.func.isRequired
}