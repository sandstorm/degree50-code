import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { VideoCodeOverlayIds } from './VideoCodesMenu'
import VideoCodeListItem from 'Components/VideoEditor/Toolbar/VideoCodesContext/VideoCodeListItem'
import Overlay from '../OverlayContainer/Overlay'

const mapStateToProps = (state: VideoEditorState) => ({
    videoCodeIdsByStartTime: selectors.data.videoCodes.selectIdsSortedByStartTime(state),
})

const mapDispatchToProps = {
    closeOverlay: actions.overlay.unsetOverlay,
}

type OwnProps = {
    // TODO: make readonly property a redux state
    itemUpdateCondition: boolean
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const AllVideoCodesOverlay: FC<Props> = (props) => {
    const close = () => {
        props.closeOverlay(VideoCodeOverlayIds.all)
    }

    return (
        <Overlay closeCallback={close} title="Alle VideoCodes">
            {props.videoCodeIdsByStartTime.length > 0 ? (
                <ol className="video-editor__media-item-list-new">
                    {props.videoCodeIdsByStartTime.map((id) => (
                        <VideoCodeListItem key={id} videoCodeId={id} />
                    ))}
                </ol>
            ) : (
                <p tabIndex={0}>Keine VideoCodes vorhanden</p>
            )}
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(AllVideoCodesOverlay))
