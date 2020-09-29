import React from 'react'
import ArtPlayer from '../../../../Components/VideoEditor/Editors/components/ArtPlayer'
import { Video } from '../../../../Components/VideoPlayer/VideoPlayerWrapper'

type Props = {
    videoConfig?: Video
}

const VideoCutSolutionVideo: React.FC<Props> = (props) => {
    if (props.videoConfig === undefined) {
        return <p>No solution, yet!</p>
    }

    const artPlayerOptions = {
        videoUrl: props.videoConfig?.url?.mp4 || '',
        subtitleUrl: props.videoConfig?.url?.vtt || '',
        uploadDialog: false,
        translationLanguage: 'en',
    }

    return <ArtPlayer containerHeight={200} options={artPlayerOptions} />
}

export default React.memo(VideoCutSolutionVideo)
