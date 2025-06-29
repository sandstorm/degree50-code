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
import SubtitlesUploadController from './StimulusControllers/SubtitlesUploadController'
import AudioDescriptionUploadController from './StimulusControllers/AudioDescriptionUploadController.js'
import AttachmentUploadController from './StimulusControllers/AttachmentUploadController'
import ReactController from './StimulusControllers/ReactController'
import ExercisePhaseController from './StimulusControllers/ExercisePhaseController'
import SolutionsController from './StimulusControllers/SolutionsController'
import VideoCodeFormController from 'StimulusControllers/VideoCodeFormController'
import VideosFormController from 'StimulusControllers/VideosFormController'
import DeleteEntityController from 'StimulusControllers/DeleteEntityController'
import SidebarController from 'StimulusControllers/SidebarController'
import { initColors, ORIGINAL_COLORS } from 'ntc-ts'
import CKEditorController from 'StimulusControllers/CkeditorController'
import SearchableSelectFieldController from 'StimulusControllers/SearchableSelectFieldController'
import OverviewItemDropdownController from 'StimulusControllers/OverviewItemDropdownController'

const application = Application.start()

// This is a workaround for safari to focus the button when it is clicked.
// Safari does not set focus on buttons when clicked by default.
document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', function () {
        button.focus()
    })
})

application.register('videoUpload', VideoUploadController)
application.register('subtitleUpload', SubtitlesUploadController)
application.register('audioDescriptionUpload', AudioDescriptionUploadController)
application.register('attachmentUpload', AttachmentUploadController)
application.register('react', ReactController)
application.register('ckeditor', CKEditorController)
application.register('exercisePhase', ExercisePhaseController)
application.register('solutions', SolutionsController)
application.register('videoCodeForm', VideoCodeFormController)
application.register('videosForm', VideosFormController)
application.register('deleteEntity', DeleteEntityController)
application.register('sidebar', SidebarController)
application.register('searchableSelectField', SearchableSelectFieldController)
application.register('overviewItemDropdown', OverviewItemDropdownController)

/**
 * Initialize color map for ntc (color hex -> color name conversion) with default colors (browser standard).
 * We only have to do this once.
 */
initColors(ORIGINAL_COLORS)
