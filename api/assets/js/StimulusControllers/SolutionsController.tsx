import { Controller } from 'stimulus'
import ReactDOM from 'react-dom'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from './ExercisePhaseApp/Store/Store'
import { ConfigState, hydrateConfig } from './ExercisePhaseApp/Components/Config/ConfigSlice'
import SolutionsApp, { SolutionByTeam } from './SolutionsApp/SolutionsApp'
import { setTranslations, setLocale } from 'react-i18nify'
import i18n from 'Components/VideoEditor/Editors/i18n'
import { updateIn } from 'immutable'
import { VideoCodePrototype } from 'Components/VideoEditor/VideoListsSlice'

setTranslations(i18n)
setLocale('de')

export default class extends Controller {
    connect() {
        const propsAsString = this.data.get('props')
        const props = propsAsString ? JSON.parse(propsAsString) : {}

        const solutions = props.solutions as Array<SolutionByTeam>
        const config = props.config as ConfigState

        // set initial Redux state
        store.dispatch(hydrateConfig(config))

        const predefinedVideoCodesPool = config.videoCodesPool as Array<VideoCodePrototype>

        // WHY: If customVideoCodesPool exists and has items: it also contains the predefined codes
        // Therefore we only need one of the two
        const solutionsWithPredefinedVideoCodePool: Array<SolutionByTeam> = solutions.map((solution) =>
            updateIn(solution, ['solution', 'customVideoCodesPool'], (customVideoCodesPool) =>
                customVideoCodesPool && customVideoCodesPool.length > 0
                    ? customVideoCodesPool
                    : predefinedVideoCodesPool
            )
        )

        ReactDOM.render(
            <React.StrictMode>
                <Provider store={store}>
                    <SolutionsApp
                        solutions={solutionsWithPredefinedVideoCodePool}
                        videos={config.videos}
                        availableComponents={config.components}
                    />
                </Provider>
            </React.StrictMode>,
            this.element
        )
    }
}
