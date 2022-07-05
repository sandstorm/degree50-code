import { FC, memo } from 'react'
import ConnectedVideoJSPlayer from 'Components/VideoPlayer/ConnectedVideoJSPlayer'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import MediaLaneContainer from './components/MediaLaneContainer'
import OverlayContainer from 'Components/ToolbarItems/components/OverlayContainer'
import Toolbar from './components/Toolbar'
import { useShortCuts } from 'Components/ToolbarItems/ShortCutsContext/useShortCuts'

type Props = {
  videos: Array<Video>
}

const VideoEditor: FC<Props> = (props) => {
  const firstVideo = props.videos[0]

  useShortCuts()

  return (
    <div className="video-editor" data-test-id="videoEditor">
      <ConnectedVideoJSPlayer
        videoJsOptions={{
          autoplay: false,
          controls: true,
          fluid: false,
          // @ts-ignore
          fill: true,
        }}
        videoMap={firstVideo}
      />
      <Toolbar />
      <OverlayContainer />
      <MediaLaneContainer />
    </div>
  )
}

export default memo(VideoEditor)
