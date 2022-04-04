import { Controller } from 'stimulus'
import ReactDOM from 'react-dom'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from './ExerciseAndSolutionStore/Store'
import { ConfigState, actions as configActions } from './ExercisePhaseApp/Components/Config/ConfigSlice'
import { setTranslations, setLocale } from 'react-i18nify'
import i18n from 'StimulusControllers/i18n'
import { normalizeFilterData } from './normalizeData'
import { Solution } from 'Components/VideoEditor/types'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import { actions as videoEditorActions } from 'Components/VideoEditor/VideoEditorSlice'
import SolutionsApp from './SolutionsApp'
import { initData } from 'Components/VideoEditor/initData'
import { DataState } from 'Components/VideoEditor/DataSlice'

export type SolutionByTeam = Solution & {
    teamCreator: string
    teamMembers: Array<string>
    visible: boolean
    cutVideo?: Video
}

setTranslations(i18n)
setLocale('de')

export default class extends Controller {
    connect() {
        const propsAsString = this.data.get('props')
        const props = propsAsString ? JSON.parse(propsAsString) : {}

        const data = props.data as DataState
        const config = props.config as ConfigState

        console.log({ config })

        // set initial Redux state
        store.dispatch(configActions.hydrateConfig(config))
        store.dispatch(configActions.setIsSolutionView())

        store.dispatch(initData(data))

        store.dispatch(videoEditorActions.filter.init(normalizeFilterData(config, data)))

        ReactDOM.render(
            <Provider store={store}>
                <SolutionsApp />
            </Provider>,
            this.element
        )
    }
}
