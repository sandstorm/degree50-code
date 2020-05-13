/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import '../scss/app.scss';
import ReactDOM from 'react-dom';
import React from 'react';
// Need jQuery? Install it with "yarn add jquery", then uncomment to import it.
// import $ from 'jquery';

console.log('Hello Webpack Encore! Edit me in assets/js/app.js');

import Form from "@rjsf/core";

const log = (type: any) => console.log.bind(console, type);

import { JSONSchema7 } from 'json-schema';

import schema from '../api-definitions/ExercisePhaseConfigSchema.json';

const onChange = ({formData}:any, formFieldId:string) => {
  const propsAsString = JSON.stringify(formData);
  const inputField = document.getElementById(formFieldId);
  inputField.setAttribute('value', propsAsString);
};

const JsonSchemaEditor = (props: any) => {
  return <Form schema={schema as JSONSchema7} formData={props.formData}
               onChange={(formData:object) => onChange(formData, props.formFieldId)}
               onSubmit={onChange}
               onError={log("errors")}/>;

};

[].forEach.call(document.querySelectorAll('[data-react-widget=JsonSchemaEditor]'), (el: any) => {
  const propsAsString = el.getAttribute('data-react-props');
  const props = JSON.parse(JSON.parse(propsAsString));
  const formFieldId = el.getAttribute('data-id');
  ReactDOM.render(<JsonSchemaEditor  formData = {props} formFieldId = {formFieldId} />, el);
});

import widgets from './Widgets/index';

Object.entries(widgets).forEach(([widgetName, ReactWidget]) => {
    [].forEach.call(document.querySelectorAll(`[data-react-widget=${widgetName}]`), (el: any) => {
        const propsAsString = el.getAttribute('data-react-props');
        const props = propsAsString ? JSON.parse(propsAsString) : {};
        ReactDOM.render(<ReactWidget {...props} />, el);
    });
});



// src/application.js
import { Application } from "stimulus";
import FileuploadController from './stimulus_controllers/fileupload_controller';
const application = Application.start();
application.register("fileupload", FileuploadController);



