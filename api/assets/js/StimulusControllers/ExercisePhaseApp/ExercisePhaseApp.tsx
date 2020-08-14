import React from 'react'
import Toolbar from './Components/Toolbar/Toolbar'
import VideoAnalysis from './Domain/ExercisePhases/VideoAnalysis'
import { ExercisePhaseTypesEnum } from './Store/ExercisePhaseTypesEnum'
import Overlay from './Components/Overlay/Overlay'
import { OverlayProvider } from '@react-aria/overlays'

type ExercisePhaseProps = {
    type: ExercisePhaseTypesEnum
    readOnly: boolean
}

export const ExercisePhaseApp: React.FC<ExercisePhaseProps> = ({ type, readOnly }) => {
    let exercisePhase = null
    switch (type) {
        case ExercisePhaseTypesEnum.VIDEO_ANALYSIS:
            exercisePhase = <VideoAnalysis />
            break
        default:
    }

    const toolbar = readOnly ? null : <Toolbar />
    return (
        <div className={'exercise-phase__inner'}>
            <OverlayProvider>
                <div className={'exercise-phase__content'}>
                    {exercisePhase}
                    <Overlay />
                    {toolbar}
                </div>
                <div id="modal-root" />
            </OverlayProvider>
        </div>
    )
}
