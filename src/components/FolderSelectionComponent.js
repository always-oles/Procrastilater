import React from 'react';
import PropTypes from 'prop-types';
import BookmarksList from './BookmarksList';

export default class FolderSelectionComponent extends React.Component {
    render() {
        return (
            <div class='panel np'>
                <div class='header'>{chrome.i18n.getMessage('global_folders')} 
                    <span 
                        title={chrome.i18n.getMessage('folders_0_bookmarks')} 
                        class={'alert ' + (this.props.emptyFolders && this.props.foldersIds.length ? '' : 'hidden')} 
                    >!</span>
                    <span 
                        title={chrome.i18n.getMessage('folders_no_folders')} 
                        class={'alert ' + (this.props.foldersIds.length ? 'hidden' : '')} 
                    >!</span>
                </div>
                <div class='content'>
                    {chrome.i18n.getMessage('folders_where_from')}
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
    saveFolders: PropTypes.func.isRequired,
    emptyFolders: PropTypes.bool.isRequired
}