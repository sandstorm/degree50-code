import VideoJSPlayer from 'Components/VideoPlayer/VideoJSPlayer'
import React from 'react'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'

type Props = {
  videoConfig?: Video
}

const VideoCutSolutionVideo: React.FC<Props> = (props) => {
  if (props.videoConfig === undefined) {
    return <p>No solution, yet!</p>
  }

  const videoUrl = props.videoConfig?.url?.hls || ''

  return videoUrl ? (
    <VideoJSPlayer
      videoJsOptions={{
        autoplay: false,
        controls: true,
        sources: [
          {
            src: videoUrl || '',
          },
        ],
      }}
    />
  ) : (
    <p>Das geschnittene Video wird noch gespeichert</p>
  )
}

export default React.memo(VideoCutSolutionVideo)
