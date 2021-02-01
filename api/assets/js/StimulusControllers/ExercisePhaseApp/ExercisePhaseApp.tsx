import React, { useRef } from 'react'
import VideoAnalysis from './Domain/ExercisePhases/VideoAnalysis'
import { watchModals } from '@react-aria/aria-modal-polyfill'
import { useDebouncedResizeObserver } from '../../Components/VideoEditor/utils/useDebouncedResizeObserver'
import { OverlayProvider } from '@react-aria/overlays'

export const ExercisePhaseApp: React.FC = () => {
    // react-aria-modal watches a container element for aria-modal nodes and
    // hides the rest of the dom from screen readers with aria-hidden when one is open.
    watchModals()

    const ref: React.RefObject<HTMLDivElement> = useRef(null)

    const { height } = useDebouncedResizeObserver(ref, 500)

    return (
        <OverlayProvider className={'exercise-phase__inner solutions-container'}>
            <div className={'exercise-phase__content'} ref={ref}>
                {height && <VideoAnalysis height={height} />}
            </div>
        </OverlayProvider>
    )
}
