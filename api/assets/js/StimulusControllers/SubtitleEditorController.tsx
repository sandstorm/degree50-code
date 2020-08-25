import React from 'react'
import { Controller } from 'stimulus'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import SubtitleEditorApp from './SubtitleEditorApp/SubtitleEditorApp'
import { store } from './SubtitleEditorApp/Store/Store'

export default class extends Controller {
    connect() {
        const propsAsString = this.data.get('props')
        const props = propsAsString ? JSON.parse(propsAsString) : {}

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
