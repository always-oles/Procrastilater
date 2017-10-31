import React from 'react';
import Steps from '../components/Steps';
import MainPage from '../components/MainPage';


import API from '../api';

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

export default class App extends React.Component {
    render() {
        // add if user is signed = open main screen, else steps
        return (
            <div>
                <Steps></Steps>
                <MainPage></MainPage>
                <ClearButton></ClearButton>
                <LogButton></LogButton>
                <MiscButton></MiscButton>
            </div>
        );
    }
}