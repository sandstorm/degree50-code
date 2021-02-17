import { FocusScope } from '@react-aria/focus'
import { OverlayContainer as AriaOverlayContainer } from '@react-aria/overlays'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { AppDispatch } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import { AnnotationOverlayIds } from '../../AnnotationsContext/AnnotationsMenu'
import { VideoCodeOverlayIds } from '../../VideoCodesContext/VideoCodesMenu'
import EditVideoCodePrototypeOverlay from '../../VideoCodesContext/Overlays/EditVideoCodePrototypeOverlay/EditVideoCodePrototypeOverlay'
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
import { CutOverlayIds } from 'Components/VideoEditor/CuttingContext/CuttingMenu'
import ActiveCutsOverlay from 'Components/VideoEditor/CuttingContext/Overlays/ActiveCutsOverlay'
import AllCutsOverlay from 'Components/VideoEditor/CuttingContext/Overlays/AllCutsOverlay'
import CreateCutOverlay from 'Components/VideoEditor/CuttingContext/Overlays/CreateCutOverlay'
import EditCutOverlay from 'Components/VideoEditor/CuttingContext/Overlays/EditCutOverlay'
import DeleteCutOverlay from 'Components/VideoEditor/CuttingContext/Overlays/DeleteCutOverlay'
import CutlistOverlay from 'Components/VideoEditor/CuttingContext/Overlays/CutlistOverlay'
import DeleteVideoCodePrototypeOverlay from 'Components/VideoEditor/VideoCodesContext/Overlays/EditVideoCodeOverlay/DeleteVideoCodePrototypeOverlay'
import CutPreviewOverlay from 'Components/VideoEditor/CuttingContext/Overlays/CutPreviewOverlay'
import TeamOverlay, { TEAM_OVERLAY_ID } from 'Components/VideoEditor/Team/TeamOverlay'
import AufgabeOverlay, { AUFGABE_OVERLAY_ID } from 'Components/VideoEditor/Aufgabe/AufgabeOverlay'

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
        case VideoCodeOverlayIds.editPrototype: {
            return <EditVideoCodePrototypeOverlay />
        }
        case VideoCodeOverlayIds.removePrototype: {
            return <DeleteVideoCodePrototypeOverlay />
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

        // Cuts
        case CutOverlayIds.active: {
            return <ActiveCutsOverlay itemUpdateCondition={true} />
        }
        case CutOverlayIds.create: {
            return <CreateCutOverlay />
        }
        case CutOverlayIds.all: {
            return <AllCutsOverlay itemUpdateCondition={true} />
        }
        case CutOverlayIds.allByCutOrder: {
            return <CutlistOverlay itemUpdateCondition={true} />
        }
        case CutOverlayIds.edit: {
            return <EditCutOverlay />
        }
        case CutOverlayIds.remove: {
            return <DeleteCutOverlay />
        }
        case CutOverlayIds.cutPreview: {
            return <CutPreviewOverlay />
        }

        // Others
        case TEAM_OVERLAY_ID: {
            return <TeamOverlay />
        }
        case AUFGABE_OVERLAY_ID: {
            return <AufgabeOverlay />
        }

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
