import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { AnnotationOverlayIds } from './AnnotationsMenu'
import AnnotationListItem from 'Components/VideoEditor/Editors/components/MediaItemList/AnnotationListItem'
import Overlay from '../OverlayContainer/Overlay'

const mapStateToProps = (state: VideoEditorState) => ({
    activeAnnotationIds: selectors.selectActiveAnnotationIds(state),
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
        <Overlay closeCallback={close}>
            <h3 className="video-editor__overlay__title">
                <span>Aktive Annotationen</span>
                <button
                    tabIndex={1}
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={close}
                    data-focus-id="close-button"
                >
                    <i className="fas fa-times" />
                </button>
            </h3>
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
