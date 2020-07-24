import { Controller } from 'stimulus'
import ReactDOM from 'react-dom'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from './ExercisePhaseApp/Store/Store'
import { Config, hydrateConfig } from './ExercisePhaseApp/Components/Config/ConfigSlice'
import { SolutionsApp } from './Solutions/SolutionsApp'

export default class extends Controller {
    connect() {
        const propsAsString = this.data.get('props')
        const props = propsAsString ? JSON.parse(propsAsString) : {}

        const { solutions } = props
        const config = props.config as Config

        // set initial Redux state
        store.dispatch(hydrateConfig(config))

        ReactDOM.render(
            <React.StrictMode>
                <Provider store={store}>
                    <SolutionsApp type={config.type} solutions={solutions} />
                </Provider>
            </React.StrictMode>,
            this.element
        )
    }
}
