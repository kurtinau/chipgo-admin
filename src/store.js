import {createStore, applyMiddleware, compose} from 'redux';
import createRootReducer from './reducers';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';

import {createBrowserHistory} from 'history';
import {routerMiddleware} from 'connected-react-router'

export const history = createBrowserHistory();

const sagaMiddleware = createSagaMiddleware();
const routerMW = routerMiddleware(history);
const middleware = [routerMW, thunk, sagaMiddleware];

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


export const store = createStore(
    createRootReducer(history),
    composeEnhancer(applyMiddleware(...middleware))
);

sagaMiddleware.run(rootSaga);