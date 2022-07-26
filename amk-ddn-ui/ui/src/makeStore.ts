import * as R from 'redux'

import * as Data from './modules/Data'

export function makeStore() {
    const reducer = R.combineReducers({
        data: Data.reducer
    })
    //@ts-ignore
    const store = R.createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
    return store
}