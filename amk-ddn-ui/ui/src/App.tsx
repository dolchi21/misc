import React from 'react'
import { Provider } from 'react-redux'
import * as A from './actions'
import './App.css'
import ProcessList from './components/ProcessList'
import { makeStore } from './makeStore'

class App extends React.Component {
    componentDidMount() {
        //@ts-ignore
        this.stop = A.autoLoadProcesses(this.props.store.dispatch, this.props.store.getState)
    }
    componentWillUnmount(){
        //@ts-ignore
        this.stop()
    }
    render() {
        return (
            <div className="container">
                <ProcessList />
            </div>
        )
    }
}

const CApp = (props: any) => {
    const store = makeStore()
    //A.loadProcesses(store.dispatch)
    return (
        <Provider store={store}>
            <App {...props} store={store} />
        </Provider>
    )
}

export default CApp