import React from 'react'
import { Controller } from 'stimulus'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import SubtitleEditorApp from './SubtitleEditorApp/SubtitleEditorApp'
import { store } from './SubtitleEditorApp/Store/Store'
import { actions as subtitleAppActions } from './SubtitleEditorApp/SubtitlesAppSlice'
import { SubtitlesSlice } from 'Components/SubtitleEditor/SubtitlesSlice'
import { prepareSubtitlesFromSolution } from './normalizeData'

export default class extends Controller {
    connect() {
        const propsAsString = this.data.get('props')
        const props = propsAsString ? JSON.parse(propsAsString) : {}

        const normalizedSubtitles = prepareSubtitlesFromSolution({ subtitles: props.video.subtitles })
        store.dispatch(SubtitlesSlice.actions.init(normalizedSubtitles))

        store.dispatch(subtitleAppActions.setVideo(props.video))
        store.dispatch(subtitleAppActions.setUpdateUrl(props.updateUrl))

        ReactDOM.render(
            <React.StrictMode>
                <Provider store={store}>
                    <SubtitleEditorApp />
                </Provider>
            </React.StrictMode>,
            this.element
        )
    }
}
