import {Controller} from "stimulus"
import {Provider} from 'react-redux'
import ReactDOM from 'react-dom'
import React from 'react'
import widgets from '../Widgets/Index'
import {store} from "./ExerciseAndSolutionStore/Store"

export default class extends Controller {
    connect() {
        const widgetName = this.data.get('widget')
        const propsAsString = this.data.get('props')

        const ReactWidget = widgets[widgetName]
        const props = propsAsString ? JSON.parse(propsAsString) : {}

        ReactDOM.render(
            <Provider store={store}>
                <ReactWidget {...props} />
            </Provider>
            , this.element)
    }
}
