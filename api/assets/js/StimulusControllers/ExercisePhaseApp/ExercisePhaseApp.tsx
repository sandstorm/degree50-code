import React from 'react'
import Modal from './Components/Modal/Modal'
import Toolbar from './Components/Toolbar/Toolbar'
import VideoAnalysis from './Domain/ExercisePhases/VideoAnalysis'
import { ExercisePhaseTypesEnum } from './Store/ExercisePhaseTypesEnum'
import Overlay from './Components/Overlay/Overlay'

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
            <div className={'exercise-phase__content'} aria-hidden="false">
                {exercisePhase}
                <Overlay />
                {toolbar}
            </div>
            <Modal />
        </div>
    )
}
