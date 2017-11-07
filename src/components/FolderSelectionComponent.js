import { saveFolders } from '../actions/GlobalActions';
import React from 'react';
import PropTypes from 'prop-types';
import BookmarksList from './BookmarksList';
import Check from '../assets/images/check.svg';

export default class FolderSelectionComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            changed: false
        }

        this.onSaveClick = this.onSaveClick.bind(this);
    }

    onSaveClick() {
        if (!this.state.changed) return;

        // add completed animation
        this.refs.container.classList.add('completed');
        
        // reset
        this.setState({ changed: false });
        
        // when animation is done
        setTimeout(() => {
            // remove animation class
            this.refs.container.classList.remove('completed');
        }, 2000);
    }

    render() {
        return (
            <div class='panel np'>
                <div class='header'>Folders</div>
                <div class='content'>
                    Change folders where I should take bookmarks from
                    <BookmarksList 
                        foldersIds  = { this.props.foldersIds }
                        saveFolders = { this.props.saveFolders }
                        notify      = { true }
                    ></BookmarksList>
                </div>                 
            </div>
        );
    }
}

FolderSelectionComponent.propTypes = {
    foldersIds: PropTypes.array,
    saveFolders: PropTypes.func.isRequired
}