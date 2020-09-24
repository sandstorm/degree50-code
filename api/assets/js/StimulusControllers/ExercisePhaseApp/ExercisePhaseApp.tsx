import React, { useRef } from 'react'
import Toolbar from './Components/Toolbar/Toolbar'
import VideoAnalysis from './Domain/ExercisePhases/VideoAnalysis'
import { ExercisePhaseTypesEnum } from './Store/ExercisePhaseTypesEnum'
import Overlay from './Components/Overlay/Overlay'
import { OverlayProvider } from '@react-aria/overlays'
import { watchModals } from '@react-aria/aria-modal-polyfill'
import { useDebouncedResizeObserver } from '../../Components/VideoEditor/Editors/utils/useDebouncedResizeObserver'

type ExercisePhaseProps = {
    type: ExercisePhaseTypesEnum
    readOnly: boolean
}

export const ExercisePhaseApp: React.FC<ExercisePhaseProps> = ({ type, readOnly }) => {
    // react-aria-modal watches a container element for aria-modal nodes and
    // hides the rest of the dom from screen readers with aria-hidden when one is open.
    watchModals()

    const ref: React.RefObject<HTMLDivElement> = useRef(null)

    let { height } = useDebouncedResizeObserver(ref, 500)
    // workaround to avoid height of 0 at intial render
    if (height === 0) {
        height = 400
    }

    let exercisePhase = null
    switch (type) {
        case ExercisePhaseTypesEnum.VIDEO_ANALYSIS:
            exercisePhase = <VideoAnalysis height={height} />
            break
        default:
    }

    const toolbar = readOnly ? null : <Toolbar />
    return (
        <OverlayProvider className="exercise-phase__inner js-video-editor-container">
            <div className={'exercise-phase__content'} ref={ref}>
                {exercisePhase}
                <Overlay />
                {toolbar}
            </div>
        </OverlayProvider>
    )
}
