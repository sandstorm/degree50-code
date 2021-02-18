import React, { useRef } from 'react'
import { watchModals } from '@react-aria/aria-modal-polyfill'
import { useDebouncedResizeObserver } from '../../Components/VideoEditor/utils/useDebouncedResizeObserver'
import { OverlayProvider } from '@react-aria/overlays'
import VideoAnalysis from 'StimulusControllers/ExercisePhaseApp/Domain/ExercisePhases/VideoAnalysis'
import { connect } from 'react-redux'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import { ExercisePhaseTypesEnum } from 'StimulusControllers/ExercisePhaseApp/Store/ExercisePhaseTypesEnum'
import CuttingSolutions from './CuttingSolutions'

const mapStateToProps = (state: ConfigStateSlice) => {
    const activePhaseType = configSelectors.selectPhaseType(state)
    const isCuttingPhase = activePhaseType === ExercisePhaseTypesEnum.VIDEO_CUTTING
    return {
        isCuttingPhase,
    }
}

const mapDispatchToProps = {}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const SolutionsApp = (props: Props) => {
    // react-aria-modal watches a container element for aria-modal nodes and
    // hides the rest of the dom from screen readers with aria-hidden when one is open.
    watchModals()

    const ref: React.RefObject<HTMLDivElement> = useRef(null)

    const { height } = useDebouncedResizeObserver(ref, 500)

    return (
        <OverlayProvider className={'exercise-phase__inner solutions-container'}>
            <div className={'exercise-phase__content'} ref={ref}>
                {props.isCuttingPhase ? <CuttingSolutions /> : height && <VideoAnalysis height={height} />}
            </div>
        </OverlayProvider>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(SolutionsApp))
