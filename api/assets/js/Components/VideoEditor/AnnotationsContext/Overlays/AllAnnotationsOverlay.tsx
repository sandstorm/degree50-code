import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { AnnotationOverlayIds } from '../AnnotationsMenu'
import AnnotationListItem from 'Components/VideoEditor/AnnotationsContext/Overlays/AnnotationListItem'
import Overlay from '../../components/Overlay'
import CloseButton from '../../components/OverlayContainer/CloseButton'

const mapStateToProps = (state: VideoEditorState) => ({
    annotationIdsByStartTime: selectors.data.annotations.selectIdsSortedByStartTime(state),
})

const mapDispatchToProps = {
    closeOverlay: actions.overlay.unsetOverlay,
}

type OwnProps = {
    // TODO: make readonly property a redux state
    itemUpdateCondition: boolean
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const AllAnnotationsOverlay: FC<Props> = (props) => {
    const close = () => {
        props.closeOverlay(AnnotationOverlayIds.all)
    }

    return (
        <Overlay closeCallback={close} title="Alle Annotationen">
            <ol className="video-editor__media-item-list-new">
                {props.annotationIdsByStartTime.map((id, index) => (
                    <AnnotationListItem key={id} annotationId={id} index={index} />
                ))}
            </ol>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(AllAnnotationsOverlay))
