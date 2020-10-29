import { Controller } from 'stimulus'
import ReactDOM from 'react-dom'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from './ExercisePhaseApp/Store/Store'
import { ConfigState, hydrateConfig } from './ExercisePhaseApp/Components/Config/ConfigSlice'
import SolutionsApp from './SolutionsApp/SolutionsApp'
import { setTranslations, setLocale } from 'react-i18nify'
import i18n from 'Components/VideoEditor/Editors/i18n'

setTranslations(i18n)
setLocale('de')

export default class extends Controller {
    connect() {
        const propsAsString = this.data.get('props')
        const props = propsAsString ? JSON.parse(propsAsString) : {}

        const { solutions } = props
        const config = props.config as ConfigState

        // set initial Redux state
        store.dispatch(hydrateConfig(config))

        ReactDOM.render(
            <React.StrictMode>
                <Provider store={store}>
                    <SolutionsApp
                        solutions={solutions}
                        videos={config.videos}
                        availableComponents={config.components}
                    />
                </Provider>
            </React.StrictMode>,
            this.element
        )
    }
}
