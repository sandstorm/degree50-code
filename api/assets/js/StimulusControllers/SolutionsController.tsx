import { Controller } from 'stimulus'
import ReactDOM from 'react-dom'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from './ExercisePhaseApp/Store/Store'
import { ConfigState, actions as configActions } from './ExercisePhaseApp/Components/Config/ConfigSlice'
import { setTranslations, setLocale } from 'react-i18nify'
import i18n from 'StimulusControllers/i18n'
import {
    normalizeAPIResponseForSolutionsApp,
    initializeComponentFilter,
    initializePreviousSolutionsFilter,
} from './normalizeData'
import { Solution } from 'Components/VideoEditor/types'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import { actions as videoEditorActions } from 'Components/VideoEditor/VideoEditorSlice'
import SolutionsApp from './SolutionsApp'
import { initData } from 'Components/VideoEditor/initData'

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

        const solutions = props.solutions as Array<SolutionByTeam>
        const config = props.config as ConfigState

        // set initial Redux state
        store.dispatch(configActions.hydrateConfig(config))
        store.dispatch(configActions.setIsSolutionView())

        const normalizedAPIResponse = normalizeAPIResponseForSolutionsApp(solutions)

        store.dispatch(
            initData({
                solutions: {
                    byId: normalizedAPIResponse.entities.solutions,
                    current: normalizedAPIResponse.result.currentSolution,
                    previous: normalizedAPIResponse.result.previousSolutions,
                },
                annotations: { byId: normalizedAPIResponse.entities.annotations },
                videoCodes: { byId: normalizedAPIResponse.entities.videoCodes },
                videoCodePrototypes: { byId: normalizedAPIResponse.entities.customVideoCodesPool },
                cuts: { byId: normalizedAPIResponse.entities.cutList },
            })
        )

        store.dispatch(
            videoEditorActions.filter.init({
                ...initializeComponentFilter(config),
                ...initializePreviousSolutionsFilter(solutions),
            })
        )

        ReactDOM.render(
            <React.StrictMode>
                <Provider store={store}>
                    <SolutionsApp />
                </Provider>
            </React.StrictMode>,
            this.element
        )
    }
}
