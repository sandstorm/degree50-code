import { FocusScope } from '@react-aria/focus'
import { OverlayContainer as AriaOverlayContainer } from '@react-aria/overlays'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { AppDispatch } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import { AnnotationOverlayIds } from '../AnnotationsContext/AnnotationsMenu'
import AllAnnotationsOverlay from '../AnnotationsContext/AllAnnotationsOverlay'
import CreateAnnotationOverlay from '../AnnotationsContext/CreateAnnotationOverlay'
import EditAnnotationOverlay from '../AnnotationsContext/EditAnnotationOverlay'
import DeleteAnnotationOverlay from '../AnnotationsContext/DeleteAnnotationOverlay'
import ActiveAnnotationsOverlay from '../AnnotationsContext/ActiveAnnotationsOverlay'

const mapOverlayIdToOverlayContent = (id?: string) => {
    switch (id) {
        case AnnotationOverlayIds.active: {
            return <ActiveAnnotationsOverlay itemUpdateCondition={true} />
        }
        case AnnotationOverlayIds.create:
            return <CreateAnnotationOverlay />
        case AnnotationOverlayIds.all:
            return <AllAnnotationsOverlay itemUpdateCondition={true} />
        case AnnotationOverlayIds.edit:
            return <EditAnnotationOverlay />
        case AnnotationOverlayIds.remove:
            return <DeleteAnnotationOverlay />
        default:
            return undefined
    }
}

const mapStateToProps = (state: VideoEditorState) => ({
    isVisible: selectors.overlay.isVisible(state),
    overlayIds: selectors.overlay.overlayIds(state),
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    show: () => dispatch(actions.overlay.show()),
})

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const OverlayContainer: FC<Props> = (props) => {
    const isOpen = props.isVisible && props.overlayIds.length > 0

    return (
        <AriaOverlayContainer
            style={{
                display: isOpen ? 'block' : 'none',
                position: 'absolute',
                top: 0,
                height: '100vh',
                width: '100vw',
            }}
        >
            {isOpen &&
                props.overlayIds.map((overlayId) => (
                    <FocusScope autoFocus contain restoreFocus key={overlayId}>
                        {mapOverlayIdToOverlayContent(overlayId)}
                    </FocusScope>
                ))}
        </AriaOverlayContainer>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(OverlayContainer))
