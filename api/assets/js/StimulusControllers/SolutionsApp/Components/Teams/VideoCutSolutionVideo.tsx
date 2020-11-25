import React from 'react'
import { Video } from '../../../../Components/VideoPlayer/VideoPlayerWrapper'

type Props = {
    videoConfig?: Video
}

const VideoCutSolutionVideo: React.FC<Props> = (props) => {
    if (props.videoConfig === undefined) {
        return <p>No solution, yet!</p>
    }

    const videoUrl = props.videoConfig?.url?.mp4 || ''

    return videoUrl ? (
        <video controls height={300} src={videoUrl} />
    ) : (
        <p>Das geschnittene Video wird noch gespeichert</p>
    )
}

export default React.memo(VideoCutSolutionVideo)
