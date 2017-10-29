import React from 'react';
import { sortBy } from 'Lodash';

export default class FoldersList extends React.Component {
  constructor(){
    super();

    this.state = {  
      list: [],
      noBookmarks: false
    };

    this.list = [];
    this.keyWords = ['speed dials', 'bin'];
    this.selectedFoldersSet = new Set();
    
    // bind funcs
    this.handleClick = this.handleClick.bind(this);

    // get started
    this.getBookmarkTree();
  }

  handleClick(e) {
    // if it's selected already
    if (e.target.classList.contains('selected')) {
      // remove it from set
      this.selectedFoldersSet.delete( e.target.getAttribute('id') );
    } else {
      this.selectedFoldersSet.add( e.target.getAttribute('id') );
    }
    
      // update
    this.props.saveFolders( Array.from(this.selectedFoldersSet) );    

    // toggle blue background class
    e.target.classList.toggle('selected');
  }

  /**
   * Called when user clicked on "create extension folder"
   * @argument {integer} id of new bookmark to make it selected
   */
  rebuildTree(id) {

    // reset state
    this.setState({
      list: [],
      noBookmarks: false,
      selected: id
    });

    // add new folder to selected SET
    this.selectedFoldersSet.add(id);

    // save folder because its selected
    this.props.saveFolders( Array.from(this.selectedFoldersSet) );

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

    // incrementing margin-left for each new level
    const levelMargin = 10;

    tree.forEach( item => {

      // return if title of bookmark contains any of keywords
      if ( this.keyWords.indexOf(item.title.toLowerCase()) > -1 ) {
        return;
      }

      // skip bookmarks but not folders
      if ( !item.children ) {
        return;
      }

      let divStyle = {
        marginLeft: level * levelMargin // will skip 0,1 levels
      };

      let folderIcon = '',
          type = '',
          selected = '';

      // if we have selected folder already - check if it's it
      if (this.state.selected && this.state.selected == item.id) {
        selected = 'selected';
      }

      // if item has children - it's probably a FOLDER
      if ( item.children || level == 0 ) {
        type = 'folder';
        folderIcon = <div class='folder-icon'/>;
      }

      this.list.push(
        <li style={divStyle} id={item.id} data-type={type} className={ 'parent-'+item.parentId + ' ' + selected } key={item.id} onClick={ this.handleClick }>
          { folderIcon }
          {item.title}
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
