import React from 'react'
import { Controller } from 'stimulus'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import SubtitleEditorApp from './SubtitleEditorApp/SubtitleEditorApp'
import { store } from './SubtitleEditorApp/Store/Store'
import { actions as subtitleActions } from './SubtitleEditorApp/SubtitlesSlice'
import { actions as videoEditorActions } from 'Components/VideoEditor/VideoEditorSlice'

export default class extends Controller {
    connect() {
        const propsAsString = this.data.get('props')
        const props = propsAsString ? JSON.parse(propsAsString) : {}

        store.dispatch(videoEditorActions.lists.setSubtitles(props.video.subtitles))
        store.dispatch(subtitleActions.setVideo(props.video))
        store.dispatch(subtitleActions.setUpdateUrl(props.updateUrl))

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
