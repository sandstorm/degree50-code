import React, { FC, memo, useState } from 'react'
import { connect } from 'react-redux'
import AnnotationMedialane from '../AnnotationsContext/AnnotationMedialane'
import { selectors, VideoEditorState } from '../VideoEditorSlice'

const mapStateToProps = (state: VideoEditorState) => ({
    videos: selectors.config.selectVideos(state.videoEditor),
})

type Props = ReturnType<typeof mapStateToProps>

const MediaLaneContainer: FC<Props> = (props) => {
    const [showMediaLane, toggleShowMediaLane] = useState(false)
    const handleMediaLaneToggle = () => toggleShowMediaLane(!showMediaLane)

    const firstVideoDuration = props.videos[0].duration

    return (
        <div className="media-lane-container">
            <button className="btn btn-grey btn-sm media-lane-container__toggle" onClick={handleMediaLaneToggle}>
                <i className={showMediaLane ? 'fas fa-chevron-down' : 'fas fa-chevron-up'} />
            </button>

            {showMediaLane && (
                <>
                    <AnnotationMedialane videoDuration={firstVideoDuration} />
                </>
            )}
        </div>
    )
}

export default connect(mapStateToProps)(memo(MediaLaneContainer))
