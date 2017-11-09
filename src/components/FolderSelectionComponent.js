import { saveFolders } from '../actions/GlobalActions';
import React from 'react';
import PropTypes from 'prop-types';
import BookmarksList from './BookmarksList';
import Check from '../assets/images/check.svg';

export default class FolderSelectionComponent extends React.Component {
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