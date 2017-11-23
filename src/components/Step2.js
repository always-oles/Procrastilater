/* global toastr: {} */

import React from 'react';
import PropTypes from 'prop-types';
import BookmarksList from './BookmarksList';
import Check from '../assets/images/check.svg';

export default class Steps extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            createdCustom: false,
            nextLocked: props.foldersIds.length ? false : true
        };

        this.onNextClick = this.onNextClick.bind(this);
        this.onPreviousClick = this.onPreviousClick.bind(this);
        this.onCreateFolderClick = this.onCreateFolderClick.bind(this);
        this.container = this.refs.step2;
    }

    componentDidMount() {
        this.stepId = 2;          
        this.container = this.refs.step2;
        this.nextStep = this.props.nextStep.bind(this);
        this.previousStep = this.props.previousStep.bind(this);
        this.handleStepChange = this.props.handleStepChange.bind(this);
    }

    onNextClick() {
        if ( !this.props.foldersIds.length ) {
            toastr.error(chrome.i18n.getMessage('step2_nofolders'));
        } else {
            this.nextStep();
        }
    }

    onPreviousClick() {
        this.previousStep();
    }

    componentWillReceiveProps(nextProps) {
        this.handleStepChange(nextProps);

        // lock / unlock next button if any folder is selected
        if ( nextProps.foldersIds.length ) {
            this.setState({ nextLocked: false });
        } else {
            this.setState({ nextLocked: true });
        }
    }

    onCreateFolderClick(e) {
        e.preventDefault();

        // let component know that user clicked on create custom button
        this.setState({ createdCustom: true});

        // create folder
        this.props.createCustomFolder((newFolder, parentFolder)  => {

            // rebuild folders tree
            this.refs.bookmarksListComponent.rebuildTree(newFolder.id);

            // notify user about success
            toastr.success(chrome.i18n.getMessage('step2_created_folder') + parentFolder.title);
        });
    }

    render() {  
        return ( 
            <div class='step step-2' ref='step2' style={{display: this.props.step == 2 ? 'block' : 'none' }}>
                <div class='header'>{chrome.i18n.getMessage('steps_title_2')}</div>

                <div class='description'>
                    {chrome.i18n.getMessage('step2_description')}
                </div>

                <div class='create-folder' style = {{display: this.state.createdCustom ? 'none' : 'block' }}>
                    {chrome.i18n.getMessage('step2_I')} <strong>{chrome.i18n.getMessage('step2_recommend')}</strong> {chrome.i18n.getMessage('step2_you_to')} <a href='#' onClick = { this.onCreateFolderClick } class='create-folder__button'>{chrome.i18n.getMessage('step2_click_here')}</a><br/>
                    {chrome.i18n.getMessage('step2_it_will')}
                </div> 
                
                <BookmarksList 
                    ref = 'bookmarksListComponent' 
                    saveFolders = { this.props.saveFolders }
                    foldersIds = { this.props.foldersIds }  
                ></BookmarksList>

                <div class='buttons-container'>
                    <button class='button-back' onClick = { this.onPreviousClick }>
                        {chrome.i18n.getMessage('global_back')}
                    </button>

                    <button class={'button-save ' + (this.state.nextLocked ? 'locked': '') } onClick = { this.onNextClick }>
                        {chrome.i18n.getMessage('global_next')}
                    </button>
                </div>

                <div class='check'><img src={ Check }/></div>                
            </div>
        )
    }
}

Steps.propTypes = {
    step: PropTypes.number.isRequired,
    stepPhase: PropTypes.string.isRequired,
    saveFolders: PropTypes.func.isRequired,
    foldersIds: PropTypes.array.isRequired,
    createCustomFolder: PropTypes.func.isRequired,

    nextStep: PropTypes.func.isRequired,
    previousStep: PropTypes.func.isRequired,
    handleStepChange: PropTypes.func.isRequired
}