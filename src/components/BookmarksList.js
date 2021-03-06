/* global Set:{}, toastr: {}, chrome: {} */

import React from 'react';
import { sortBy } from 'Lodash';

export default class FoldersList extends React.Component {
  constructor(props){
    super(props);

    this.state = {  
      list: [],
      noBookmarks: false
    };

    this.list = [];
    this.notifyTimeout = null;
    
    // if folders ids passed - use them as already in set
    this.selectedFoldersSet = new Set(props.foldersIds || []);
    
    // bind funcs
    this.handleClick = this.handleClick.bind(this);

    // get started
    this.getBookmarkTree();
  }

  handleClick(e) {
    // if it's selected already
    if (e.target.classList.contains('selected')) {

      // show error if user deselected all bookmarks
      if ( this.props.notify === true && Array.from(this.selectedFoldersSet).length == 1 ) {
        toastr.remove();
        toastr.error(chrome.i18n.getMessage('folders_at_least_one'), null, {
          positionClass: 'toast-bottom-left'
        });
        return;
      }

      // remove it from set
      this.selectedFoldersSet.delete( e.target.getAttribute('id') );
    } else {
      this.selectedFoldersSet.add( e.target.getAttribute('id') );
    }

    // update
    this.props.saveFolders( Array.from(this.selectedFoldersSet) );

    // if need to notify user with a toast
    if ( this.props.notify === true ) {

      toastr.remove();

      clearTimeout(this.notifyTimeout);

      // debounce notification
      this.notifyTimeout = setTimeout(() => {
        toastr.success(chrome.i18n.getMessage('folders_saved'), null, {
          positionClass: 'toast-bottom-left'
        });
      }, 500);
    }

    // toggle blue background class
    e.target.classList.toggle('selected');
  }

  /**
   * Called when user clicked on "create extension folder"
   */
  rebuildTree(id) {

    // reset state
    this.setState({
      list: [],
      noBookmarks: false
    });

    // add new folder to selected SET
    if (id) {
        this.selectedFoldersSet.add(id);
      
        // save folder because its selected
        this.props.saveFolders( Array.from(this.selectedFoldersSet) );
    }

    this.list = [];
    this.getBookmarkTree();
  }

  /**
   * Gets all user bookmarks
   */
  getBookmarkTree() {
      chrome.bookmarks.getTree( (results) => {
        if ( !results[0] || !results[0].children ) {
          this.setState({ noBookmarks: true });
        } else {
          this.buildTree(results[0].children);
        }
      });
  }

  buildTree(tree, level = 0) {
    // sort tree as pages first, folders last
    tree = sortBy(tree, [ 'title', 'index' ]).reverse();

    // incrementing padding-left for each new level
    const levelPadding = 10;

    tree.forEach( item => {

      // skip bookmarks but not folders
      if ( !item.children ) {
        return;
      }

      // skip bin folder
      if (item.parentId == 0 && item.id == '25') {
        return;
      }

      let divStyle = {
        paddingLeft: level * levelPadding // will skip 0,1 levels
      };

      let folderIcon    = '',
          type          = '',
          selected      = '',
          completedText = '',
          allVisited    = true,
          hasBookmarks  = false;

      // if we have selected folder already - check if it's it
      if ( this.selectedFoldersSet.has(item.id) ) {
        selected = 'selected';
      }

      // if item has children - it's probably a FOLDER
      if ( item.children || level == 0 ) {
        type = 'folder';
        folderIcon = <div class='folder-icon'/>;
      }

      // check if folder contains all visited ids
      if (item.children && item.children.length && this.props.allVisitedIds && this.props.allVisitedIds.length) {

        for (let i=0; i<item.children.length; i++) {
          // if its a folder - continue
          if (item.children[i].children) 
            continue;

          // if current item id in all visited ids folder - exit
          if ( this.props.allVisitedIds.indexOf(item.children[i].id) == -1 ) {
            allVisited = false;
            break;
          }

          // if at least one of children is a bookmark
          if (!item.children[i].children) {
            hasBookmarks = true;
          }
        }

        if (allVisited == true && hasBookmarks == true) {
          completedText = chrome.i18n.getMessage('folders_completed') + ' ✓';
        }
      }

      this.list.push(
        <li style={divStyle} id={item.id} data-id={item.id} data-type={type} className={ 'parent-'+item.parentId + ' ' + selected } key={item.id} onClick={ this.handleClick }>
          { folderIcon }
          {item.title}
          <span class='completed' style={{ display: completedText.length ? 'inline-block':'none' }}>
            {completedText}
          </span>
        </li>
      );

      if (item.children && item.children.length) {
        return this.buildTree( item.children, level+1 );
      }
    });

    this.setState({list: this.list});
  }

  render() {
    return (
      <div class='folders-list'>
        <ul class='bookmarks-list' style = {{ display: this.state.noBookmarks ? 'none' : 'block' }}>
          { this.state.list }
        </ul>

        <div class='no-bookmarks' style = {{ display: this.state.noBookmarks ? 'block' : 'none' }}>
          You have no bookmarks yet
        </div>
      </div>
    )
  }
}
