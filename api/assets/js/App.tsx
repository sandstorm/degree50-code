/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (Base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import '../scss/App.scss';
import ReactDOM from 'react-dom';
import React from 'react';
// Need jQuery? Install it with "yarn add jquery", then uncomment to import it.
// import $ from 'jquery';

console.log('Hello Webpack Encore! Edit me in assets/js/app.js');

import widgets from './Widgets/Index';

// TODO get rid of this block; because that will be loaded through Stimulus.
Object.entries(widgets).forEach(([widgetName, ReactWidget]) => {
    [].forEach.call(document.querySelectorAll(`[data-react-widget=${widgetName}]`), (el: any) => {
        const propsAsString = el.getAttribute('data-react-props');
        const props = propsAsString ? JSON.parse(propsAsString) : {};
        ReactDOM.render(<ReactWidget {...props} />, el);
    });
});

// src/application.js
import { Application } from "stimulus";
import FileuploadController from './StimulusControllers/FileUploadController';
import ReactController from './StimulusControllers/ReactController';
const application = Application.start();
application.register("fileupload", FileuploadController);
application.register("react", ReactController);



