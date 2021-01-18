import React, { useRef } from 'react'
import Toolbar from './Components/Toolbar/Toolbar'
import VideoAnalysis from './Domain/ExercisePhases/VideoAnalysis'
import { ExercisePhaseTypesEnum } from './Store/ExercisePhaseTypesEnum'
import Overlay from './Components/Overlay/Overlay'
import { OverlayProvider } from '@react-aria/overlays'
import { watchModals } from '@react-aria/aria-modal-polyfill'
import { useDebouncedResizeObserver } from '../../Components/VideoEditor/Editors/utils/useDebouncedResizeObserver'
import VideoEditor from 'Components/VideoEditor'

const renderExercisePhase = (phase: ExercisePhaseTypesEnum, height: number) => {
    if (!height) {
        return null
    }

    // TODO I just extracted that code, but am unsure why it even exists
    // I assume that it's planned to add more types rendering something else then a <VideoAnalysis /> component?
    // If that should not be the case, we should remove this and simplify the code without switch statement.
    switch (phase) {
        case ExercisePhaseTypesEnum.VIDEO_ANALYSIS: {
            return <VideoAnalysis height={height} />
        }
        case ExercisePhaseTypesEnum.VIDEO_CUTTING: {
            return <VideoAnalysis height={height} />
        }
        default:
            return null
    }
}

type ExercisePhaseProps = {
    type: ExercisePhaseTypesEnum
    readOnly: boolean
}

export const ExercisePhaseApp: React.FC<ExercisePhaseProps> = ({ type, readOnly }) => {
    // react-aria-modal watches a container element for aria-modal nodes and
    // hides the rest of the dom from screen readers with aria-hidden when one is open.
    watchModals()

    return <VideoEditor />

    const ref: React.RefObject<HTMLDivElement> = useRef(null)

    const { height } = useDebouncedResizeObserver(ref, 500)

    const toolbar = readOnly ? null : <Toolbar />
    return (
        <OverlayProvider className="exercise-phase__inner js-video-editor-container">
            <div className={'exercise-phase__content'} ref={ref}>
                {renderExercisePhase(type, height)}
                <Overlay />
                {toolbar}
            </div>
        </OverlayProvider>
    )
}
