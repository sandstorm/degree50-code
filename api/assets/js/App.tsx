// @ts-nocheck -- WHY: importing js modules

/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (Base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import '../scss/App.scss'
import 'bootstrap'
import { Application } from 'stimulus'
import VideoUploadController from './StimulusControllers/VideoUploadController'
import MaterialUploadController from './StimulusControllers/MaterialUploadController'
import ReactController from './StimulusControllers/ReactController'
import ExercisePhaseController from './StimulusControllers/ExercisePhaseController'
import SolutionsController from './StimulusControllers/SolutionsController'
import SubtitleEditorController from 'StimulusControllers/SubtitleEditorController'
import VideoCodeFormController from 'StimulusControllers/VideoCodeFormController'
import DeleteEntityController from 'StimulusControllers/DeleteEntityController'

const application = Application.start()

application.register('videoUpload', VideoUploadController)
application.register('materialUpload', MaterialUploadController)
application.register('react', ReactController)
application.register('exercisePhase', ExercisePhaseController)
application.register('subtitleEditor', SubtitleEditorController)
application.register('solutions', SolutionsController)
application.register('videoCodeForm', VideoCodeFormController)
application.register('deleteEntity', DeleteEntityController)
