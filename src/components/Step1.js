import React from 'react';
import PropTypes from 'prop-types';
import Check from '../assets/images/check.svg';

export default class Steps extends React.Component {
    constructor() {
        super();
        this.prepareName = this.prepareName.bind(this);
        this.nameChanged = this.nameChanged.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidMount() {
        this.stepId = 1;        
        this.container = this.refs.step1;
        this.nextStep = this.props.nextStep.bind(this);
        this.handleStepChange = this.props.handleStepChange.bind(this);
        this.refs.nameInput.focus();
    }
    
    /**
     * Keypress handler to assume Enter button as Next click
     * @param event
     */
    handleKeyPress(e) {
        if (e.key === 'Enter') {
          this.prepareName();
        }
    }

    /**
     * Input onchange event
     */
    nameChanged() {
        if (this.refs.nameInput.value && this.refs.nameInput.value.length >= 2  ) {
            this.refs.setNameButton.classList.remove('locked');
        } else {
            this.refs.setNameButton.classList.add('locked');
        }
    }

    /**
     * Check everything and proceed to finish function of step 1
     * @param {*} e event from button sumbit or string with name (prob incognito)
     */
    prepareName(e) {
        if (typeof e == 'string') {
            this.finishStep1(e);
        } else {
            if (this.refs.nameInput.value) {
                this.finishStep1(this.refs.nameInput.value);
            }
        }
    }

    /**
     * Step 1 finals: save name, add animations, proceed to step 2
     * @param {String} name 
     */
    finishStep1(name) {
        // save name
        this.props.setUsername(name);
        this.nextStep();
    }

    componentWillReceiveProps(nextProps) {
        this.handleStepChange(nextProps);
    }

    render() {  
        return ( 
            <div class='step step-1' ref='step1' style={{display: this.props.step == 1 ? 'block' : 'none' }}>
                <div class='header'>{chrome.i18n.getMessage('steps_title_1')}</div>

                <div class='name-container'>
                    {chrome.i18n.getMessage('step1_type_your_name')}: <input type='text' class='name-input' ref='nameInput' onChange = { this.nameChanged } onKeyPress = {this.handleKeyPress} maxLength='15' />
                    <div class='br'></div>
                    {chrome.i18n.getMessage('step1_or_click')} <a href='#' onClick = { () => this.prepareName('Incognito') } class='incognito'>{chrome.i18n.getMessage('global_here')}</a> {chrome.i18n.getMessage('step1_to_stay')}
                </div>
                <button class='button-save locked' ref='setNameButton' onClick = { this.prepareName }>
                    {chrome.i18n.getMessage('global_next')}
                </button>

                <div class='check'><img src={ Check }/></div>
            </div>
        )
    }
}

Steps.propTypes = {
    step: PropTypes.number.isRequired,
    stepPhase: PropTypes.string.isRequired,
    setUsername: PropTypes.func.isRequired,

    nextStep: PropTypes.func.isRequired,
    previousStep: PropTypes.func.isRequired,
    handleStepChange: PropTypes.func.isRequired
}