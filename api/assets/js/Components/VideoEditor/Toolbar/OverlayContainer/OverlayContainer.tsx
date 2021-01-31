import { FocusScope } from '@react-aria/focus'
import { OverlayContainer as AriaOverlayContainer } from '@react-aria/overlays'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { AppDispatch } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import { AnnotationOverlayIds } from '../../AnnotationsContext/AnnotationsMenu'
import { VideoCodeOverlayIds } from '../../VideoCodesContext/VideoCodesMenu'
import AllAnnotationsOverlay from '../../AnnotationsContext/Overlays/AllAnnotationsOverlay'
import CreateAnnotationOverlay from '../../AnnotationsContext/Overlays/CreateAnnotationOverlay'
import EditAnnotationOverlay from '../../AnnotationsContext/Overlays/EditAnnotationOverlay'
import DeleteAnnotationOverlay from '../../AnnotationsContext/Overlays/DeleteAnnotationOverlay'
import ActiveAnnotationsOverlay from '../../AnnotationsContext/Overlays/ActiveAnnotationsOverlay'
import ActiveVideoCodesOverlay from '../../VideoCodesContext/Overlays/ActiveVideoCodesOverlay'
import CreateVideoCodeOverlay from '../../VideoCodesContext/Overlays/CreateVideoCodeOverlay'
import AllVideoCodesOverlay from '../../VideoCodesContext/Overlays/AllVideoCodesOverlay'
import EditVideoCodeOverlay from '../../VideoCodesContext/Overlays/EditVideoCodeOverlay'
import DeleteVideoCodeOverlay from '../../VideoCodesContext/Overlays/DeleteVideoCodeOverlay'
import ListCodesOverlay from '../../VideoCodesContext/Overlays/ListCodesOverlay'

const mapOverlayIdToOverlayContent = (id?: string) => {
    switch (id) {
        // Annotations
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

        // VideoCodes
        case VideoCodeOverlayIds.list: {
            return <ListCodesOverlay />
        }
        case VideoCodeOverlayIds.active: {
            return <ActiveVideoCodesOverlay itemUpdateCondition={true} />
        }
        case VideoCodeOverlayIds.create:
            return <CreateVideoCodeOverlay />
        case VideoCodeOverlayIds.all:
            return <AllVideoCodesOverlay itemUpdateCondition={true} />
        case VideoCodeOverlayIds.edit:
            return <EditVideoCodeOverlay />
        case VideoCodeOverlayIds.remove:
            return <DeleteVideoCodeOverlay />
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
