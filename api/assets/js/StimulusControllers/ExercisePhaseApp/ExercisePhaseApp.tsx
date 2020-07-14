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
    const phaseTypeCssClass = 'exercise-phase--' + type

    let exercisePhase = null
    switch (type) {
        case ExercisePhaseTypesEnum.VIDEO_ANALYSIS:
            exercisePhase = <VideoAnalysis />
            break
        default:
    }

    return (
        <div>
            <div className={'exercise-phase ' + phaseTypeCssClass} aria-hidden="false">
                <div className={'exercise-phase__main'}>{exercisePhase}</div>
                <Overlay />
                <Toolbar />
                <Presence />
            </div>
            <Modal />
        </div>
    )
}
