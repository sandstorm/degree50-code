import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { VideoCodeOverlayIds } from '../VideoCodesMenu'
import VideoCodeListItem from 'Components/VideoEditor/VideoCodesContext/Overlays/VideoCodeListItem'
import Overlay from '../../components/Overlay'

const mapStateToProps = (state: VideoEditorState) => ({
    activeVideoCodeIds: selectors.selectVideoCodeIdsAtCursor(state),
})

const mapDispatchToProps = {
    closeOverlay: actions.overlay.unsetOverlay,
}

type OwnProps = {
    // TODO: make readonly property a redux state
    itemUpdateCondition: boolean
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const ActiveVideoCodesOverlay: FC<Props> = (props) => {
    const close = () => {
        props.closeOverlay(VideoCodeOverlayIds.active)
    }

    return (
        <Overlay closeCallback={close} title="Aktive VideoCodes">
            {props.activeVideoCodeIds.length > 0 ? (
                <ol className="video-editor__media-item-list-new">
                    {props.activeVideoCodeIds.map((id) => (
                        <VideoCodeListItem key={id} videoCodeId={id} />
                    ))}
                </ol>
            ) : (
                <p tabIndex={0}>Keine VideoCodes aktiv</p>
            )}
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(ActiveVideoCodesOverlay))
