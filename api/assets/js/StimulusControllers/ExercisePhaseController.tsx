import { Controller } from "stimulus"
import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import {store} from "./ExercisePhaseApp/Store/Store";
import {ExercisePhaseApp} from "./ExercisePhaseApp/ExercisePhaseApp";

export default class extends Controller {
    connect() {
        const propsAsString = this.data.get('props');
        const props = propsAsString ? JSON.parse(propsAsString) : {};

        ReactDOM.render(
            <React.StrictMode>
                <Provider store={store}>
                    <ExercisePhaseApp {...props} />
                </Provider>
            </React.StrictMode>
            , this.element);
    }
}
