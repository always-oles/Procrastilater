/* global $:jQuery */

import React from 'react';
import Steps from '../components/Steps';
import MainPage from '../components/MainPage';
import API from '../api';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as globalActions from '../actions/GlobalActions';

class ClearButton extends React.Component {
    onClick() {
        API.clearData();
    }

    render() {
        return (
            <div class='clear-button' onClick = {this.onClick}>X</div>
        );
    }
}

class LogButton extends React.Component {
    onClick() {
        API.logData();
    }

    render() {
        return (
            <div class='log-button' onClick = {this.onClick}>?</div>
        );
    }
}

class MiscButton extends React.Component {
    onClick() {
        API.generateTimer();
    }

    render() {
        return (
            <div class='misc-button' onClick = {this.onClick}>!</div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);

        // goes true if user switched from step3 to main page to animate it's appearance
        this.needToAnimate = false;

        // get data from backend on initial load
        this.props.globalActions.getStatsFromBackend();

        // as small hack - listen for visibility change. if extension became visible
        // after blur then check if we need to update the store
        this.props.globalActions.listenForVisibilityChange();
    }

    componentWillReceiveProps(nextProps) {
        // if user has finished the last step
        if (nextProps.global.stepPhase == 'done' && nextProps.global.step == '3') {
            this.props.globalActions.setStep(-1);
            this.needToAnimate = true;
        }
    }

    render() {
        let component = null;

        // render steps or main page
        if ( this.props.global.step > 0 ) {
            component = <Steps/>;
        } else {
            component = (<MainPage 
                ref='mainPage'
                needToAnimate = {this.needToAnimate}
            />);
        }
        
        return (
            <div>
                { component }
                <ClearButton></ClearButton>
                <LogButton></LogButton>
                <MiscButton></MiscButton>
            </div>
        );
    }
}

export default connect( 
    (state) => ({global: state.global}),
    (dispatch) => ({ globalActions: bindActionCreators(globalActions, dispatch) })
 )(App);