import React from 'react'
import Toolbar from './Components/Toolbar/Toolbar'
import VideoAnalysis from './Domain/ExercisePhases/VideoAnalysis'
import { ExercisePhaseTypesEnum } from './Store/ExercisePhaseTypesEnum'
import Overlay from './Components/Overlay/Overlay'
import { OverlayProvider } from '@react-aria/overlays'
import { watchModals } from '@react-aria/aria-modal-polyfill'

type ExercisePhaseProps = {
    type: ExercisePhaseTypesEnum
    readOnly: boolean
}

export const ExercisePhaseApp: React.FC<ExercisePhaseProps> = ({ type, readOnly }) => {
    // react-aria-modal watches a container element for aria-modal nodes and
    // hides the rest of the dom from screen readers with aria-hidden when one is open.
    watchModals()

    let exercisePhase = null
    switch (type) {
        case ExercisePhaseTypesEnum.VIDEO_ANALYSIS:
            exercisePhase = <VideoAnalysis />
            break
        default:
    }

    const toolbar = readOnly ? null : <Toolbar />
    return (
        <OverlayProvider className="exercise-phase__inner js-video-editor-container">
            <div className={'exercise-phase__content'}>
                {exercisePhase}
                <Overlay />
                {toolbar}
            </div>
        </OverlayProvider>
    )
}
