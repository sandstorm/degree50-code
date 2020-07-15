import React from 'react'
import Modal from './Components/Modal/Modal'
import Toolbar from './Components/Toolbar/Toolbar'
import VideoAnalysis from './Domain/ExercisePhases/VideoAnalysis'
import { ExercisePhaseTypesEnum } from './Store/ExercisePhaseTypesEnum'
import Overlay from './Components/Overlay/Overlay'
import Presence from './Components/Presence/Presence'

type ExercisePhaseProps = {
    type: ExercisePhaseTypesEnum
}

export const ExercisePhaseApp: React.FC<ExercisePhaseProps> = ({ type }) => {
    let exercisePhase = null
    switch (type) {
        case ExercisePhaseTypesEnum.VIDEO_ANALYSIS:
            exercisePhase = <VideoAnalysis />
            break
        default:
    }

    // TODO set aria-hidden="false" when modal is open
    return (
        <div className={'exercise-phase__inner'}>
            <div className={'exercise-phase__content'} aria-hidden="false">
                {exercisePhase}
                <Overlay />
                <Toolbar />
                <Presence />
            </div>
            <Modal />
        </div>
    )
}
