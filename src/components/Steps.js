import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as globalActions from '../actions/GlobalActions';

import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import StepsBoxes from './StepsBoxes';

class Steps extends React.Component {
    constructor(props) {
        super(props);
        
        parent.setStep = this.props.globalActions.setStep;
        parent.setStepPhase = this.props.globalActions.setStepPhase;
    }

    // every step inherits this
    nextStep() {
        // add completed animation
        this.container.classList.add('completed');

        parent.setStepPhase('beforeEnd');        
        
        // when animation is done
        setTimeout(() => {

            // current PHASE - done with this step
            parent.setStepPhase('done');

            // remove animation class
            this.container.classList.remove('completed');
        }, 2000);
    }

    // every step inherits this also
    previousStep() {
        this.container.classList.add('exitToRight');
        
        setTimeout( () => {
            parent.setStepPhase('back');  
            this.container.classList.remove('exitToRight');          
        }, 1000);
    }

    handleStepChange(props) {

        // if user pressed back
        if (props.stepPhase == 'back') {

            // we check if this is a previous step component (because every step component uses this function)
            if (this.stepId == this.props.step - 1) {

                // decrementing step
                parent.setStep(this.props.step - 1);

                // making phase stable (active)
                parent.setStepPhase('active');

                // animating
                this.container.classList.add('enterFromLeft');

                // remove animation
                setTimeout( () => {
                    this.container.classList.remove('enterFromLeft');
                }, 1000);
            }
        }

        // if we are done with current step
        if (props.stepPhase == 'done') {
            
            // check if THIS is a next step component
            if (this.stepId && this.stepId == this.props.step + 1) {

                // incrementing step
                parent.setStep(this.props.step + 1);

                // current phase is active step
                parent.setStepPhase('active');

                // animate
                this.container.classList.add('enterFromRight');

                setTimeout( () => {
                    this.container.classList.remove('enterFromRight');
                }, 1000);
            }
        }
    }

    componentWillReceiveProps(nextProps) {

        // if step 3 is almost done - slide up the steps boxes
        if (nextProps.global.step == 3 && nextProps.global.stepPhase == 'beforeEnd') {
            this.refs.stepsBoxes.slideUp();
        }
    }

    render() {
        const { step, foldersIds, stepPhase } = this.props.global;
        const { setUsername, saveFolders, createCustomFolder, setSchedule } = this.props.globalActions;
            
        return (
            <div class= { step == -1 ? 'hidden' :'steps' } >
                <StepsBoxes
                    ref='stepsBoxes'
                    step={step}             
                ></StepsBoxes>

                <Step1
                    step = {step} 
                    stepPhase = {stepPhase}
                    setUsername = {setUsername}

                    nextStep = {this.nextStep}
                    previousStep = {this.previousStep}
                    handleStepChange = {this.handleStepChange}
                ></Step1>

                <Step2 
                    step = {step} 
                    stepPhase = {stepPhase}                  
                    createCustomFolder = {createCustomFolder} 
                    saveFolders = {saveFolders} 
                    foldersIds = {foldersIds}

                    nextStep = {this.nextStep}
                    previousStep = {this.previousStep}
                    handleStepChange = {this.handleStepChange}                    
                ></Step2>

                <Step3
                    step = {step} 
                    stepPhase = {stepPhase}
                    setSchedule = {setSchedule}
                    
                    nextStep = {this.nextStep}
                    previousStep = {this.previousStep}
                    handleStepChange = {this.handleStepChange}            
                ></Step3>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        global: state.global
    }
}

function mapDispatchToProps(dispatch) {
    return {
        globalActions: bindActionCreators(globalActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Steps);