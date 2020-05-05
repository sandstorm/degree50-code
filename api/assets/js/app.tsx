/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import '../css/app.css';
import ReactDOM from 'react-dom';
import React from 'react';
// Need jQuery? Install it with "yarn add jquery", then uncomment to import it.
// import $ from 'jquery';

console.log('Hello Webpack Encore! Edit me in assets/js/app.js');

import Form from "@rjsf/core";

const log = (type: any) => console.log.bind(console, type);

import { JSONSchema7 } from 'json-schema';

import schema from '../api-definitions/ExercisePhaseConfigSchema.json';
const JsonSchemaEditor = () => {
  return <Form schema={schema as JSONSchema7}
               onChange={log("changed")}
               onSubmit={log("submitted")}
               onError={log("errors")}/>;

};

[].forEach.call(document.querySelectorAll('[data-react-widget=JsonSchemaEditor]'), (el: any) => {
  ReactDOM.render(<JsonSchemaEditor/>, el);
});

const ShowExercisePhase = (props: any) => {
  console.log("PROPS", props);
  return <div>
    Show exercise;
  </div>;

};



[].forEach.call(document.querySelectorAll('[data-react-widget=ShowExercisePhase]'), (el: any) => {
  const propsAsString = el.getAttribute('data-react-props');
  const props = JSON.parse(JSON.parse(propsAsString));
  ReactDOM.render(<ShowExercisePhase {...props} />, el);
});
