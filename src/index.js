import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './containers/App';
import configureStore from './store/configureStore';
import API from './api';
import './assets/styles/style.sass';

/**
 * Configure store and render the page when it's configured
 */
configureStore( store => {

    /**
     * Subscribe to store state change to update state in chrome storage
     */
    store.subscribe( () => {
        API.setState(store.getState());
    });

    render(
        <Provider store = {store}>
            < App/>
        </Provider>,
        document.getElementById('root')
    );
});