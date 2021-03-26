import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { AnnotationOverlayIds } from '../AnnotationsMenu'
import AnnotationListItem from 'Components/VideoEditor/AnnotationsContext/Overlays/AnnotationListItem'
import Overlay from '../../components/Overlay'

const mapStateToProps = (state: VideoEditorState) => ({
    activeAnnotationIds: selectors.selectAllActiveAnnotationIdsAtCursor(state),
})

const mapDispatchToProps = {
    closeOverlay: actions.overlay.unsetOverlay,
}

type OwnProps = {
    // TODO: make readonly property a redux state
    itemUpdateCondition: boolean
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const ActiveAnnotationsOverlay: FC<Props> = (props) => {
    const close = () => {
        props.closeOverlay(AnnotationOverlayIds.active)
    }

    return (
        <Overlay closeCallback={close} title="Aktive Annotationen">
            {props.activeAnnotationIds.length > 0 ? (
                <ol className="video-editor__media-item-list-new">
                    {props.activeAnnotationIds.map((id, index) => (
                        <AnnotationListItem key={id} annotationId={id} index={index} />
                    ))}
                </ol>
            ) : (
                <p>Keine Annotationen aktiv</p>
            )}
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(ActiveAnnotationsOverlay))
