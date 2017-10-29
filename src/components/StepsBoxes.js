import React from 'react';
import PropTypes from 'prop-types';

export default class StepsBoxes extends React.Component {
    slideUp() {
        this.refs.stepsBoxes.classList.add('slideUp');
    }

    render() {  
        return ( 
            <div class = 'steps-boxes' ref = 'stepsBoxes'>
                <div class='item'>
                    <div class = { 'box ' + (this.props.step == 1 ? 'active' : ( this.props.step > 1 ) ? 'done ' : '') }>
                        <div class='text'>1</div>
                        <div class='separator'></div>
                    </div>
                    <div class='note'>Basic info</div>
                </div>

                <div class='item'>
                    <div class = { 'box ' + (this.props.step == 2 ? 'active' : ( this.props.step > 2 ) ? 'done ' : '') }>
                        <div class='text'>2</div>
                        <div class='separator'></div>
                    </div>
                    <div class='note'>Workspace</div>
                </div>

                <div class='item'>
                    <div class = { 'box ' + (this.props.step == 3 ? 'active' : '') }>
                        <div class='text'>3</div>
                    </div>
                    <div class='note'>Schedule</div>
                </div>
            </div>
        )
    }
}

StepsBoxes.propTypes = {
    step: PropTypes.number.isRequired
}