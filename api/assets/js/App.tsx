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
import 'bootstrap';

// src/application.js
import { Application } from "stimulus";
import FileuploadController from './StimulusControllers/FileUploadController';
import ReactController from './StimulusControllers/ReactController';
import CollectionHandlingController from './StimulusControllers/CollectionHandlingController';
import ExercisePhaseController from './StimulusControllers/ExercisePhaseController';
const application = Application.start();
application.register("fileupload", FileuploadController);
application.register("react", ReactController);
application.register("collectionHandling", CollectionHandlingController);
application.register("exercisePhase", ExercisePhaseController);

